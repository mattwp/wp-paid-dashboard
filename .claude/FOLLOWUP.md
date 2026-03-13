## 2026-03-09

### Done this session
- Updated ecommerce ClientCard tiles: Spend / Conversions / Revenue / ROAS (with delta badges on all 4)
- Split Lifecykel (AU/UK/US) and SharkNinja (Shark AU, Ninja AU, Shark NZ, Ninja NZ) into separate client entries — each is its own tile and dashboard
- Removed SharkBeauty AU account
- Added InvestmentMarkets (lead-gen, customerId 3796315529) — data confirmed populated
- Fetched all 7 data files for all 7 new accounts via parallel background agents
- Fixed summary.json format inconsistency (some agents wrote `periods` wrapper / underscore keys) — normalized all to flat camelCase; updated CLAUDE.md with format warning
- Deleted old combined data/lifecykel/ and data/sharkninja/ directories

### Next steps
- Consider adding Milton & King accounts as separate entries (currently combined: Main + AU + UK) — Matt hasn't asked but same pattern
- Lifecykel AU quality.json capped at 500 rows (QS 1–8 only); same for Lifecykel UK (100 rows). Could improve if Bash available in agents
- adgroups.json and landingpages.json are empty [] for all 7 new accounts — may want to add those queries
- Consider a data freshness indicator per client (some accounts may get stale between refreshes)
- Dashboard auto-refresh / launchd daily job not yet set up

### Open questions / blockers
- Milton & King: should Main + AU + UK be split into separate tiles like Lifecykel/SharkNinja?
- Vinta Investment Group has 3 accounts (Coolangatta Hotel, Marketplace, The Strand) — split or keep combined?
- Storage Plus / Megabox has 2 accounts — keep combined or split?

## 2026-03-10

### Done this session
- Built dashboard alerts feature — Urgent Issues + High Impact Opportunities
- Created `lib/signals.ts` with 12 signal rules (6 alerts, 6 opportunities) computed at render time from existing data
- Created `components/AlertsDrawer.tsx` — right-side sliding drawer (420px), pill trigger buttons with counts, colour-coded cards linking to client dashboards
- Added Alert/Opportunity types to `lib/types.ts`, `--blue` and `--purple` CSS vars to `globals.css`
- Wired signals into `app/page.tsx` (loads campaigns per client, computes signals, passes to drawer)
- Updated MetricTile: MoM and YoY now on separate lines (all dashboards)
- Updated client dashboard KPI tiles:
  - Ecommerce: CTR / Spend / Conversions / Conv. Value / ROAS / Search IS
  - Lead-gen: CTR / Spend / Conversions / Conv. Rate / CPA / Search IS
- Fixed npm cache corruption (`sudo rm -rf ~/.npm/_cacache`)
- Deployed all changes to Vercel

### Next steps
- Review alert/opportunity thresholds against live data — tune if too noisy or too quiet
- Consider adding alert history or snooze/dismiss functionality
- adgroups.json and landingpages.json still empty for newer accounts
- Dashboard auto-refresh / launchd daily job not yet set up

### Open questions / blockers
- None

## 2026-03-12

### Done this session
- Added `lead` field to all 37 clients in `data/clients.json` with account lead assignments
- Added `lead?: string` to `ClientConfig` type in `lib/types.ts`
- Added "Account lead" dropdown filter to `ClientsGrid.tsx` (search + type + lead all work together)
- Reassigned accounts: Lifecykel AU/UK/US, CollagenX, Rippl, Waterdrop → Alex Cleanthous; Shark AU/NZ, Ninja AU/NZ, Milton & King → Rob Sanders
- Removed Sam Singha from all accounts
- Deployed to Vercel preview for review, then deployed to GitHub Pages (webprofits.ai/matt-s/wp-paid-dashboard/)

### Next steps
- Review alert/opportunity thresholds against live data
- adgroups.json and landingpages.json still empty for newer accounts
- Dashboard auto-refresh / launchd daily job not yet set up

### Open questions / blockers
- None

## 2026-03-12 (session 2)

### Done this session
- Added Maraboon Motor Inn Emerald (533-172-6872) as new lead-gen client under Brendan Browning
- Added The Beauty Chef US (424-396-5888) as new ecommerce client under Brendan Browning
- Renamed existing "The Beauty Chef" to "The Beauty Chef AU" for consistency (like Lifecykel pattern)
- Pulled full data refresh for both new clients via Google Ads MCP (summary, campaigns, keywords, monthly, quality)
- Maraboon only has 3 months history (Dec 2025-Feb 2026) — relatively new account, no YoY data
- Beauty Chef US has full 12 months of data, 2 active campaigns (PMax + Search Brand)
- Built static export and deployed to GitHub Pages with password protection
- Dashboard now at 39 clients total

### Next steps
- Review alert/opportunity thresholds — Beauty Chef US is down significantly MoM (100 to 47 convs, $14.1k to $6.8k value)
- adgroups.json and landingpages.json still empty for newer accounts
- Dashboard auto-refresh / launchd daily job not yet set up

### Open questions / blockers
- None
