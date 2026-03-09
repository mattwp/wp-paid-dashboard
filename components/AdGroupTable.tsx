'use client'

import { useState } from 'react'
import { formatCurrency, formatNumber, formatPercent, formatCpc } from '@/lib/format'
import type { AdGroupRow, SortDir } from '@/lib/types'

interface Props {
  adGroups: AdGroupRow[]
}

type SortKey = keyof AdGroupRow | 'cpa' | 'cvr'

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span style={{ color: 'var(--border-med)', marginLeft: '4px' }}>↕</span>
  return <span style={{ color: 'var(--wp)', marginLeft: '4px' }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function AdGroupTable({ adGroups }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('costMicros')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showPaused, setShowPaused] = useState(false)
  const [search, setSearch] = useState('')

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = adGroups
    .filter(ag => showPaused ? true : ag.costMicros > 0 || ag.status === 'ENABLED')
    .filter(ag => search
      ? ag.name.toLowerCase().includes(search.toLowerCase()) || ag.campaign.toLowerCase().includes(search.toLowerCase())
      : true
    )

  const withCalc = filtered.map(ag => ({
    ...ag,
    cpa: ag.conversions > 0 ? ag.costMicros / ag.conversions : null,
    cvr: ag.clicks > 0 ? ag.conversions / ag.clicks : null,
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            placeholder="Search ad groups or campaigns..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              padding: '8px 14px',
              fontSize: '13px',
              width: '260px',
              outline: 'none',
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--wp)'
              e.target.style.boxShadow = '0 0 0 3px var(--wp-bg)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border)'
              e.target.style.boxShadow = 'none'
            }}
          />
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{sorted.length} ad groups</p>
        </div>
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
              <Th k="name" label="Ad group" />
              <Th k="campaign" label="Campaign" />
              <Th k="ctr" label="CTR" right />
              <Th k="costMicros" label="Spend" right />
              <Th k="conversions" label="Conv." right />
              <Th k="cvr" label="CVR" right />
              <Th k="cpa" label="CPA" right />
              <Th k="averageCpc" label="CPC" right />
              <Th k="searchImpressionShare" label="IS%" right />
              <Th k="searchTopImpressionShare" label="Top IS%" right />
              <Th k="searchAbsoluteTopImpressionShare" label="Abs Top IS%" right />
            </tr>
          </thead>
          <tbody>
            {sorted.map((ag, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-alt)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ag.name}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ag.campaign}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatPercent(ag.ctr, 2)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(ag.costMicros)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{ag.conversions.toFixed(1)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatPercent(ag.cvr, 1)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{ag.cpa ? formatCurrency(ag.cpa) : '—'}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{ag.averageCpc ? formatCpc(ag.averageCpc) : '—'}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}><ISBar value={ag.searchImpressionShare} /></td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatPercent(ag.searchTopImpressionShare)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatPercent(ag.searchAbsoluteTopImpressionShare)}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={11} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No ad groups</td>
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
