# wp-paid-dashboard — Claude Refresh Instructions

This file instructs Claude (when run via `claude -p`) how to refresh the dashboard data.

## Project
Webprofits Paid Search Dashboard — fetches Google Ads data for all clients via MCP and writes JSON files.

## When to Refresh
Run this file's instructions when asked to "refresh dashboard data" or via the launchd daily job.

## How to Refresh

1. Read `data/clients.json` to get all client accounts.

2. Calculate date ranges relative to today (YYYY-MM-DD format):
   - `current_7d`: today-7 to today-1
   - `prev_7d`: today-14 to today-8
   - `current_30d`: today-30 to today-1
   - `prev_30d`: today-60 to today-31
   - `yoy_30d`: today-395 to today-366 (same 30-day window last year)

3. For each client in clients.json, for each of their accounts, run these GAQL queries via the Google Ads MCP:

   **Summary query** (run once per account per date range — 5 total):
   ```
   SELECT metrics.clicks, metrics.impressions, metrics.cost_micros,
     metrics.conversions, metrics.conversions_value, metrics.ctr, metrics.average_cpc
   FROM customer
   WHERE segments.date BETWEEN 'START' AND 'END'
   ```

   **Campaign query** (run once per account, last 30 days):
   ```
   SELECT campaign.name, campaign.status,
     metrics.clicks, metrics.impressions, metrics.cost_micros,
     metrics.conversions, metrics.ctr, metrics.average_cpc,
     metrics.search_impression_share, metrics.search_top_impression_share,
     metrics.search_absolute_top_impression_share,
     metrics.search_budget_lost_impression_share,
     metrics.search_rank_lost_impression_share
   FROM campaign
   WHERE segments.date DURING LAST_30_DAYS
     AND campaign.status != 'REMOVED'
   ORDER BY metrics.cost_micros DESC
   ```

   **Keyword query** (run once per account, last 30 days):
   ```
   SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
     campaign.name, ad_group.name,
     metrics.clicks, metrics.impressions, metrics.cost_micros,
     metrics.conversions, metrics.average_cpc, metrics.search_impression_share
   FROM keyword_view
   WHERE segments.date DURING LAST_30_DAYS
     AND ad_group_criterion.status != 'REMOVED'
   ORDER BY metrics.cost_micros DESC
   LIMIT 100
   ```

   **Monthly query** (run once per account, 12 full calendar months):
   - Start date: first day of the month 12 months before today (e.g., if today is 2026-03-09, start = 2025-03-01)
   - End date: last day of the previous month (e.g., 2026-02-28)
   ```
   SELECT segments.month, metrics.conversions, metrics.cost_micros
   FROM customer
   WHERE segments.date BETWEEN 'START' AND 'END'
   ```
   Returns one row per calendar month. Aggregate across accounts for multi-account clients.

   **Quality score query** (run once per account, no date range — QS is a static attribute):
   ```
   SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
     ad_group_criterion.quality_info.quality_score,
     ad_group_criterion.quality_info.creative_quality_score,
     ad_group_criterion.quality_info.post_click_quality_score,
     ad_group_criterion.quality_info.search_predicted_ctr,
     campaign.name, ad_group.name
   FROM ad_group_criterion
   WHERE ad_group_criterion.type = 'KEYWORD'
     AND ad_group_criterion.status != 'REMOVED'
     AND campaign.status != 'REMOVED'
     AND ad_group_criterion.quality_info.quality_score > 0
   ORDER BY ad_group_criterion.quality_info.quality_score ASC
   LIMIT 500
   ```

4. For each client, aggregate data across all accounts and write to:
   - `data/[client-id]/summary.json` — PeriodMetrics for each of the 5 date ranges
   - `data/[client-id]/campaigns.json` — array of CampaignRow objects
   - `data/[client-id]/keywords.json` — array of KeywordRow objects, sorted by costMicros desc, top 100 overall
   - `data/[client-id]/monthly.json` — array of MonthlyRow objects (one per calendar month, sorted asc)
   - `data/[client-id]/quality.json` — array of QualityRow objects (sorted by qualityScore asc, top 500)

5. Write `data/last_updated.json` with `{ "timestamp": "ISO-8601 timestamp" }`

## Data Types

### summary.json
**IMPORTANT:** Period keys must be camelCase at the top level — no `periods` wrapper, no underscores. Use `current7d` not `current_7d`, and do NOT nest under a `periods` key.

```json
{
  "clientId": "artilux",
  "clientName": "Artilux",
  "current7d": { "clicks": 0, "impressions": 0, "costMicros": 0, "conversions": 0, "conversionValue": 0, "ctr": 0, "averageCpc": 0 },
  "prev7d": { "clicks": 0, "impressions": 0, "costMicros": 0, "conversions": 0, "conversionValue": 0, "ctr": 0, "averageCpc": 0 },
  "current30d": { "clicks": 0, "impressions": 0, "costMicros": 0, "conversions": 0, "conversionValue": 0, "ctr": 0, "averageCpc": 0 },
  "prev30d": { "clicks": 0, "impressions": 0, "costMicros": 0, "conversions": 0, "conversionValue": 0, "ctr": 0, "averageCpc": 0 },
  "yoy30d": { "clicks": 0, "impressions": 0, "costMicros": 0, "conversions": 0, "conversionValue": 0, "ctr": 0, "averageCpc": 0 },
  "lastUpdated": "2026-03-09T06:00:00.000Z"
}
```

Note: `averageCpc` should be computed as `costMicros / clicks` (not the raw average_cpc from Google Ads, which doesn't aggregate correctly). If clicks = 0, set averageCpc = 0.

Note: `conversionValue` is the raw dollar value from `metrics.conversions_value` (e.g., 15000.5 means $15,000.50). Used to compute ROAS = conversionValue / (costMicros / 1,000,000). For lead-gen clients this will typically be 0.

### campaigns.json
```json
[
  {
    "name": "Campaign Name",
    "status": "ENABLED",
    "clicks": 123,
    "impressions": 4567,
    "costMicros": 5000000,
    "conversions": 12.5,
    "ctr": 0.027,
    "averageCpc": 4065040,
    "searchImpressionShare": 0.45,
    "searchTopImpressionShare": 0.32,
    "searchAbsoluteTopImpressionShare": 0.18,
    "searchBudgetLostImpressionShare": 0.12,
    "searchRankLostImpressionShare": 0.43
  }
]
```

All IS values: null if empty string from API (paused/no data campaigns).
`averageCpc` stored as micros (costMicros / clicks * 1,000,000 — or directly from API value × 1,000,000 if non-zero).

### keywords.json
```json
[
  {
    "keyword": "retractable fly screen",
    "matchType": "EXACT",
    "campaign": "Campaign Name",
    "adGroup": "Ad Group Name",
    "clicks": 50,
    "impressions": 410,
    "costMicros": 161718446,
    "conversions": 2,
    "averageCpc": 3234369,
    "searchImpressionShare": 0.65
  }
]
```

### monthly.json
```json
[
  { "month": "2025-03", "conversions": 45.5, "costMicros": 12500000000 },
  { "month": "2025-04", "conversions": 52.0, "costMicros": 13200000000 }
]
```
Sorted ascending by month. One entry per calendar month. `segments.month` from the API returns "YYYY-MM-01" — store as "YYYY-MM" (drop the day).

### quality.json
```json
[
  {
    "keyword": "retractable fly screen",
    "matchType": "EXACT",
    "campaign": "Campaign Name",
    "adGroup": "Ad Group Name",
    "qualityScore": 8,
    "creativeQualityScore": "ABOVE_AVERAGE",
    "postClickQualityScore": "AVERAGE",
    "searchPredictedCtr": "ABOVE_AVERAGE"
  }
]
```
`creativeQualityScore`, `postClickQualityScore`, `searchPredictedCtr`: store as "ABOVE_AVERAGE", "AVERAGE", or "BELOW_AVERAGE". null if not available. Sorted by qualityScore ascending (worst first). Skip keywords where qualityScore = 0 or null.

## Multi-account Clients
For clients with multiple accounts (Milton & King, SharkNinja, Vinta, Storage Plus/Megabox):
- Sum numeric metrics across all accounts for summary.json
- Concatenate campaign and keyword rows across accounts (add account label as prefix to campaign name if helpful)
- For aggregated CTR: compute as total_clicks / total_impressions
- For aggregated averageCpc: compute as total_costMicros / total_clicks

## Error Handling
- If an account returns an error, log it and skip that account (don't fail the whole client)
- If a client has no data at all, skip writing their files (old data will remain)

## Important Notes
- All monetary values stored as micros (original unit from Google Ads)
- IS values stored as decimals (0.45 = 45%) — null if not available
- costMicros: use `metrics.cost_micros` raw value from API response (already in micros)
- averageCpc: compute as `costMicros / clicks` (gives micros per click). Do NOT multiply by 1,000,000 — costMicros is already in micros.
