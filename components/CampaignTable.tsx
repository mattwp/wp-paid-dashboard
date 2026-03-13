'use client'

import { useState } from 'react'
import { formatCurrency, formatDollars, formatNumber, formatPercent, formatCpc } from '@/lib/format'
import type { CampaignRow, SortDir } from '@/lib/types'

interface Props {
  campaigns: CampaignRow[]
  clientType: 'lead-gen' | 'ecommerce'
}

type SortKey = keyof CampaignRow | 'cpa' | 'cvr' | 'roas'

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span style={{ color: 'var(--border-med)', marginLeft: '4px' }}>↕</span>
  return <span style={{ color: 'var(--wp)', marginLeft: '4px' }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function CampaignTable({ campaigns, clientType }: Props) {
  const isEcom = clientType === 'ecommerce'
  const [sortKey, setSortKey] = useState<SortKey>('costMicros')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showPaused, setShowPaused] = useState(false)

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = showPaused ? campaigns : campaigns.filter(c => c.costMicros > 0 || c.status === 'ENABLED')

  const withCalc = filtered.map(c => ({
    ...c,
    cpa: c.conversions > 0 ? c.costMicros / c.conversions : null,
    cvr: c.clicks > 0 ? c.conversions / c.clicks : null,
    roas: (c.conversionValue ?? 0) > 0 && c.costMicros > 0 ? (c.conversionValue!) / (c.costMicros / 1_000_000) : null,
  }))

  const sorted = [...withCalc].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortKey] ?? 0
    const bv = (b as Record<string, unknown>)[sortKey] ?? 0
    const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : ((av as number) ?? 0) - ((bv as number) ?? 0)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const thStyle = (right?: boolean): React.CSSProperties => ({
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    textAlign: right ? 'right' : 'left',
  })

  const Th = ({ k, label, right }: { k: SortKey; label: string; right?: boolean }) => (
    <th style={thStyle(right)} onClick={() => handleSort(k)}>
      {label}<SortIcon active={sortKey === k} dir={sortDir} />
    </th>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{sorted.length} campaigns</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showPaused}
            onChange={e => setShowPaused(e.target.checked)}
            style={{ accentColor: 'var(--wp)' }}
          />
          Show paused / zero-spend
        </label>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <Th k="name" label="Campaign" />
              <Th k="ctr" label="CTR" right />
              <Th k="costMicros" label="Spend" right />
              <Th k="conversions" label="Conv." right />
              {isEcom && <Th k="conversionValue" label="Conv. Value" right />}
              <Th k="cvr" label="CVR" right />
              {isEcom ? <Th k="roas" label="ROAS" right /> : <Th k="cpa" label="CPA" right />}
              <Th k="averageCpc" label="CPC" right />
              <Th k="searchImpressionShare" label="IS%" right />
              <Th k="searchTopImpressionShare" label="Top IS%" right />
              <Th k="searchBudgetLostImpressionShare" label="Lost (Budget)" right />
              <Th k="searchRankLostImpressionShare" label="Lost (Rank)" right />
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-alt)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '10px 12px', color: 'var(--text-primary)', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatPercent(c.ctr, 2)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(c.costMicros)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{c.conversions.toFixed(1)}</td>
                {isEcom && <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{(c.conversionValue ?? 0) > 0 ? formatDollars(c.conversionValue!) : '—'}</td>}
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatPercent(c.cvr, 1)}</td>
                {isEcom
                  ? <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.roas !== null ? `${c.roas.toFixed(2)}x` : '—'}</td>
                  : <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{c.cpa ? formatCurrency(c.cpa) : '—'}</td>
                }
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCpc(c.averageCpc)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <ISBar value={c.searchImpressionShare} />
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatPercent(c.searchTopImpressionShare)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--amber)' }}>{formatPercent(c.searchBudgetLostImpressionShare)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--wp)' }}>{formatPercent(c.searchRankLostImpressionShare)}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={isEcom ? 13 : 11} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No campaigns</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ISBar({ value }: { value: number | null }) {
  if (value === null || isNaN(value)) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const pct = Math.round(value * 100)
  const color = pct >= 60 ? '#047857' : pct >= 30 ? '#B45309' : '#EA4648'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
      <div style={{ width: '52px', background: 'var(--border)', borderRadius: '999px', height: '5px', overflow: 'hidden' }}>
        <div style={{ background: color, height: '5px', borderRadius: '999px', width: `${pct}%` }} />
      </div>
      <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontVariantNumeric: 'tabular-nums', width: '28px', textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}
