'use client'

import { useState } from 'react'
import { formatMetaSpend, formatNumber, formatPercent } from '@/lib/format'
import type { MetaCampaignRow, SortDir } from '@/lib/types'

interface Props {
  campaigns: MetaCampaignRow[]
  clientType: 'lead-gen' | 'ecommerce'
}

type SortKey = keyof MetaCampaignRow

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span style={{ color: 'var(--border-med)', marginLeft: '4px' }}>↕</span>
  return <span style={{ color: 'var(--wp)', marginLeft: '4px' }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function MetaCampaignTable({ campaigns, clientType }: Props) {
  const isEcom = clientType === 'ecommerce'
  const [sortKey, setSortKey] = useState<SortKey>('spend')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showPaused, setShowPaused] = useState(false)

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = showPaused ? campaigns : campaigns.filter(c => c.spend > 0 || c.status === 'ACTIVE')

  const sorted = [...filtered].sort((a, b) => {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{sorted.length} campaigns</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showPaused} onChange={e => setShowPaused(e.target.checked)} style={{ accentColor: 'var(--wp)' }} />
          Show paused / zero-spend
        </label>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <Th k="name" label="Campaign" />
              <Th k="status" label="Status" />
              <Th k="objective" label="Objective" />
              <Th k="spend" label="Spend" right />
              <Th k="impressions" label="Impr." right />
              <Th k="clicks" label="Clicks" right />
              <Th k="conversions" label="Conv." right />
              {isEcom && <Th k="revenue" label="Revenue" right />}
              {isEcom ? <Th k="roas" label="ROAS" right /> : <Th k="cpa" label="CPA" right />}
              <Th k="cpm" label="CPM" right />
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-alt)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '10px 12px', color: 'var(--text-primary)', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: '10px 12px' }}>
                  <StatusBadge status={c.status} />
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '12px' }}>{c.objective}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{formatMetaSpend(c.spend)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatNumber(c.impressions)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatNumber(c.clicks)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{c.conversions.toFixed(0)}</td>
                {isEcom && <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{c.revenue > 0 ? formatMetaSpend(c.revenue) : '—'}</td>}
                {isEcom
                  ? <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.roas !== null ? `${c.roas.toFixed(2)}x` : '—'}</td>
                  : <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{c.cpa !== null ? formatMetaSpend(c.cpa) : '—'}</td>
                }
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatMetaSpend(c.cpm)}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={isEcom ? 10 : 9} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No campaigns</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'ACTIVE'
  return (
    <span style={{
      fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--r-full)',
      textTransform: 'uppercase', letterSpacing: '0.04em',
      background: isActive ? 'rgba(4,120,87,0.07)' : 'var(--bg-alt)',
      color: isActive ? '#047857' : 'var(--text-muted)',
      border: isActive ? '1px solid rgba(4,120,87,0.15)' : '1px solid var(--border)',
    }}>
      {status}
    </span>
  )
}
