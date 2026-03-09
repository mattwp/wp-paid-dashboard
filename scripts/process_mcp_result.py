#!/usr/bin/env python3
"""
Process raw MCP Google Ads result (columnar format) and write to JSON.
Usage:
  python3 process_mcp_result.py <client_id> <type: adgroups|landingpages> <input_json>

  where input_json is either:
    - a file path (persisted result)
    - '-' to read from stdin
    - an inline JSON string
"""
import json, sys, os, math

def is_null_is(v):
    if v is None or v == '': return None
    try:
        f = float(v)
        return None if (math.isnan(f) or math.isinf(f)) else f
    except: return None

def rows_from_result(data):
    """Convert columnar MCP result to list of dicts"""
    # Handle the outer wrapper structure
    if isinstance(data, str):
        data = json.loads(data)

    # It could be wrapped in [{type: 'text', text: '...'}]
    if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict) and 'text' in data[0]:
        inner = json.loads(data[0]['text'])
        return rows_from_result(inner)

    # Standard MCP result format
    result = data.get('result', data)
    if isinstance(result, dict) and 'columns' in result and 'data' in result:
        cols = result['columns']
        rows = []
        for row_arr in result['data']:
            rows.append(dict(zip(cols, row_arr)))
        return rows

    # Already a list of objects
    if isinstance(result, list):
        return result

    return []

def transform_adgroup_row(row):
    name = row.get('adGroup.name', row.get('ad_group.name', ''))
    status = row.get('adGroup.status', row.get('ad_group.status', 'UNKNOWN'))
    campaign = row.get('campaign.name', '')

    clicks = int(row.get('metrics.clicks', 0) or 0)
    impressions = int(row.get('metrics.impressions', 0) or 0)
    cost = int(row.get('metrics.costMicros', row.get('metrics.cost_micros', 0)) or 0)
    conv = float(row.get('metrics.conversions', 0) or 0)

    ctr_raw = row.get('metrics.ctr', None)
    ctr = float(ctr_raw) if ctr_raw not in (None, '') else (
        clicks / impressions if impressions > 0 else None
    )

    avcpc_raw = row.get('metrics.averageCpc', row.get('metrics.average_cpc', 0)) or 0
    avg_cpc_val = float(avcpc_raw) if avcpc_raw not in ('', None) else 0
    avg_cpc = int(avg_cpc_val * 1_000_000) if avg_cpc_val > 0 else (
        int(cost / clicks) if clicks > 0 else None
    )

    sis = is_null_is(row.get('metrics.searchImpressionShare', row.get('metrics.search_impression_share')))
    tis = is_null_is(row.get('metrics.searchTopImpressionShare', row.get('metrics.search_top_impression_share')))
    atis = is_null_is(row.get('metrics.searchAbsoluteTopImpressionShare', row.get('metrics.search_absolute_top_impression_share')))

    return {
        'name': name,
        'campaign': campaign,
        'status': status,
        'clicks': clicks,
        'impressions': impressions,
        'costMicros': cost,
        'conversions': conv,
        'ctr': ctr,
        'averageCpc': avg_cpc,
        'searchImpressionShare': sis,
        'searchTopImpressionShare': tis,
        'searchAbsoluteTopImpressionShare': atis,
    }

def transform_lp_row(row):
    url = row.get('landingPageView.unexpandedFinalUrl',
                  row.get('landing_page_view.unexpanded_final_url', ''))
    clicks = int(row.get('metrics.clicks', 0) or 0)
    impressions = int(row.get('metrics.impressions', 0) or 0)
    cost = int(row.get('metrics.costMicros', row.get('metrics.cost_micros', 0)) or 0)
    conv = float(row.get('metrics.conversions', 0) or 0)

    ctr_raw = row.get('metrics.ctr', None)
    ctr = float(ctr_raw) if ctr_raw not in (None, '') else (
        clicks / impressions if impressions > 0 else None
    )

    avcpc_raw = row.get('metrics.averageCpc', row.get('metrics.average_cpc', 0)) or 0
    avg_cpc_val = float(avcpc_raw) if avcpc_raw not in ('', None) else 0
    avg_cpc = int(avg_cpc_val * 1_000_000) if avg_cpc_val > 0 else (
        int(cost / clicks) if clicks > 0 else None
    )

    return {
        'url': url,
        'clicks': clicks,
        'impressions': impressions,
        'costMicros': cost,
        'conversions': conv,
        'ctr': ctr,
        'averageCpc': avg_cpc,
    }

def process_file(filepath, data_type):
    with open(filepath) as f:
        raw = json.load(f)
    rows = rows_from_result(raw)
    if data_type == 'adgroups':
        return [transform_adgroup_row(r) for r in rows]
    else:
        return [transform_lp_row(r) for r in rows]

def aggregate_lp_by_url(rows):
    merged = {}
    for r in rows:
        url = r['url']
        if url not in merged:
            merged[url] = dict(r)
        else:
            e = merged[url]
            e['clicks'] += r['clicks']
            e['impressions'] += r['impressions']
            e['costMicros'] += r['costMicros']
            e['conversions'] += r['conversions']
    result = []
    for url, e in merged.items():
        e['ctr'] = e['clicks'] / e['impressions'] if e['impressions'] > 0 else None
        e['averageCpc'] = int(e['costMicros'] / e['clicks']) if e['clicks'] > 0 else None
        result.append(e)
    return result

if __name__ == '__main__':
    client_id = sys.argv[1]
    data_type = sys.argv[2]  # 'adgroups' or 'landingpages'

    # Collect all input files
    input_files = sys.argv[3:]

    all_rows = []
    for f in input_files:
        all_rows.extend(process_file(f, data_type))

    if data_type == 'landingpages' and len(input_files) > 1:
        all_rows = aggregate_lp_by_url(all_rows)

    all_rows.sort(key=lambda r: r.get('costMicros', 0), reverse=True)

    out_dir = os.path.join(os.path.dirname(__file__), '..', 'data', client_id)
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, f'{data_type}.json')

    with open(out_file, 'w') as fh:
        json.dump(all_rows, fh, indent=2)

    print(f"Wrote {len(all_rows)} {data_type} rows to {out_file}")
