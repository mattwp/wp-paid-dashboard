#!/usr/bin/env python3
"""
Transform raw Google Ads landing_page_view query results into landingpages.json format.
Usage: echo '<json>' | python3 write_landingpages.py <client_id>
   or: python3 write_landingpages.py <client_id> < results.json

For multi-account clients:
   python3 write_landingpages.py <client_id> file1.json file2.json ...
"""
import json, sys, os

def transform_row(row):
    lp = row.get('landingPageView', row.get('landing_page_view', {}))
    m = row.get('metrics', {})

    url = lp.get('unexpandedFinalUrl', lp.get('unexpanded_final_url', ''))
    clicks = int(m.get('clicks', 0) or 0)
    impressions = int(m.get('impressions', 0) or 0)
    cost = int(m.get('costMicros', m.get('cost_micros', 0)) or 0)
    conv = float(m.get('conversions', 0) or 0)

    ctr_raw = m.get('ctr', None)
    ctr = float(ctr_raw) if ctr_raw is not None else (clicks / impressions if impressions > 0 else None)

    avcpc_raw = m.get('averageCpc', m.get('average_cpc', 0)) or 0
    avg_cpc = int(float(avcpc_raw) * 1_000_000) if float(avcpc_raw) > 0 else (
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

def process_results(raw):
    if isinstance(raw, list):
        return [transform_row(r) for r in raw]
    if isinstance(raw, dict):
        for key in ('results', 'data', 'rows'):
            if key in raw:
                return [transform_row(r) for r in raw[key]]
    return []

def aggregate_by_url(rows):
    """Merge rows with the same URL (for multi-account)"""
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

    # Recompute CTR and averageCpc after aggregation
    result = []
    for url, e in merged.items():
        e['ctr'] = e['clicks'] / e['impressions'] if e['impressions'] > 0 else None
        e['averageCpc'] = int(e['costMicros'] / e['clicks']) if e['clicks'] > 0 else None
        result.append(e)
    return result

client_id = sys.argv[1]
out_dir = os.path.join(os.path.dirname(__file__), '..', 'data', client_id)
os.makedirs(out_dir, exist_ok=True)

if len(sys.argv) > 2:
    all_rows = []
    for f in sys.argv[2:]:
        with open(f) as fh:
            all_rows.extend(process_results(json.load(fh)))
    all_rows = aggregate_by_url(all_rows)
else:
    raw = json.load(sys.stdin)
    all_rows = process_results(raw)

# Sort by costMicros desc
all_rows.sort(key=lambda r: r['costMicros'], reverse=True)

out_file = os.path.join(out_dir, 'landingpages.json')
with open(out_file, 'w') as fh:
    json.dump(all_rows, fh, indent=2)

print(f"Wrote {len(all_rows)} landing pages to {out_file}")
