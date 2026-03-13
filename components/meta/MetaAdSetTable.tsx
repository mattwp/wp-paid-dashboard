'use client'

import { useState } from 'react'
import { formatMetaSpend, formatNumber, formatPercent } from '@/lib/format'
import type { MetaAdSetRow, SortDir } from '@/lib/types'

interface Props {
  adSets: MetaAdSetRow[]
  clientType: 'lead-gen' | 'ecommerce'
}

type SortKey = keyof MetaAdSetRow

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span style={{ color: 'var(--border-med)', marginLeft: '4px' }}>↕</span>
  return <span style={{ color: 'var(--wp)', marginLeft: '4px' }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function MetaAdSetTable({ adSets, clientType }: Props) {
  const isEcom = clientType === 'ecommerce'
  const [sortKey, setSortKey] = useState<SortKey>('spend')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...adSets].sort((a, b) => {
    const av = a[sortKey] ?? 0
    const bv = b[sortKey] ?? 0
    const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : ((av as number) ?? 0) - ((bv as number) ?? 0)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const thStyle = (right?: boolean): React.CSSProperties => ({
    padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', textTransform: 'uppercase',
    letterSpacing: '0.06em', textAlign: right ? 'right' : 'left',
  })

  const Th = ({ k, label, right }: { k: SortKey; label: string; right?: boolean }) => (
    <th style={thStyle(right)} onClick={() => handleSort(k)}>
      {label}<SortIcon active={sortKey === k} dir={sortDir} />
    </th>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{sorted.length} ad sets</p>

      <div style={{ overflowX: 'auto', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <Th k="name" label="Ad Set" />
              <Th k="campaign" label="Campaign" />
              <Th k="spend" label="Spend" right />
              <Th k="clicks" label="Clicks" right />
              <Th k="conversions" label="Conv." right />
              {isEcom && <Th k="revenue" label="Revenue" right />}
              {isEcom ? <Th k="roas" label="ROAS" right /> : <Th k="cpa" label="CPA" right />}
              <Th k="targeting" label="Targeting" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-alt)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>{row.campaign}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{formatMetaSpend(row.spend)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatNumber(row.clicks)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.conversions.toFixed(0)}</td>
                {isEcom && <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.revenue > 0 ? formatMetaSpend(row.revenue) : '—'}</td>}
                {isEcom
                  ? <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>{row.roas !== null ? `${row.roas.toFixed(2)}x` : '—'}</td>
                  : <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.cpa !== null ? formatMetaSpend(row.cpa) : '—'}</td>
                }
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '11px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.targeting}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={isEcom ? 8 : 7} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No ad sets</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
