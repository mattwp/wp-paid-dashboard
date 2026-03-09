#!/usr/bin/env python3
"""
Transform raw Google Ads ad_group query results into adgroups.json format.
Usage: echo '<json>' | python3 write_adgroups.py <client_id>
   or: python3 write_adgroups.py <client_id> < results.json

For multi-account clients, run with multiple files:
   python3 write_adgroups.py <client_id> file1.json file2.json ...
"""
import json, sys, os, math

def is_null_is(v):
    """Return None if IS value is missing/NaN, else return float"""
    if v is None: return None
    if isinstance(v, str): return None
    try:
        f = float(v)
        return None if (math.isnan(f) or math.isinf(f)) else f
    except: return None

def transform_row(row):
    ag = row.get('adGroup', row.get('ad_group', {}))
    camp = row.get('campaign', {})
    m = row.get('metrics', {})

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

    sis_raw = m.get('searchImpressionShare', m.get('search_impression_share', None))
    tis_raw = m.get('searchTopImpressionShare', m.get('search_top_impression_share', None))
    atis_raw = m.get('searchAbsoluteTopImpressionShare', m.get('search_absolute_top_impression_share', None))

    return {
        'name': ag.get('name', ''),
        'campaign': camp.get('name', ''),
        'status': ag.get('status', 'UNKNOWN'),
        'clicks': clicks,
        'impressions': impressions,
        'costMicros': cost,
        'conversions': conv,
        'ctr': ctr,
        'averageCpc': avg_cpc,
        'searchImpressionShare': is_null_is(sis_raw),
        'searchTopImpressionShare': is_null_is(tis_raw),
        'searchAbsoluteTopImpressionShare': is_null_is(atis_raw),
    }

def process_results(raw):
    if isinstance(raw, list):
        return [transform_row(r) for r in raw]
    if isinstance(raw, dict):
        # Could be wrapped in results key
        for key in ('results', 'data', 'rows'):
            if key in raw:
                return [transform_row(r) for r in raw[key]]
    return []

client_id = sys.argv[1]
out_dir = os.path.join(os.path.dirname(__file__), '..', 'data', client_id)
os.makedirs(out_dir, exist_ok=True)

if len(sys.argv) > 2:
    # Multiple files for multi-account
    all_rows = []
    for f in sys.argv[2:]:
        with open(f) as fh:
            all_rows.extend(process_results(json.load(fh)))
else:
    raw = json.load(sys.stdin)
    all_rows = process_results(raw)

# Sort by costMicros desc
all_rows.sort(key=lambda r: r['costMicros'], reverse=True)

out_file = os.path.join(out_dir, 'adgroups.json')
with open(out_file, 'w') as fh:
    json.dump(all_rows, fh, indent=2)

print(f"Wrote {len(all_rows)} ad groups to {out_file}")
