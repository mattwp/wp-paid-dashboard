'use client'

import { useState } from 'react'
import { formatMetaSpend, formatNumber } from '@/lib/format'
import type { MetaAdRow, SortDir } from '@/lib/types'

interface Props {
  ads: MetaAdRow[]
  clientType: 'lead-gen' | 'ecommerce'
}

type SortKey = keyof MetaAdRow

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span style={{ color: 'var(--border-med)', marginLeft: '4px' }}>↕</span>
  return <span style={{ color: 'var(--wp)', marginLeft: '4px' }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

const TYPE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Image: { bg: 'rgba(37,99,235,0.07)', color: '#2563EB', border: 'rgba(37,99,235,0.15)' },
  Video: { bg: 'rgba(124,58,237,0.07)', color: '#7C3AED', border: 'rgba(124,58,237,0.15)' },
  Carousel: { bg: 'rgba(4,120,87,0.07)', color: '#047857', border: 'rgba(4,120,87,0.15)' },
  DPA: { bg: 'rgba(180,83,9,0.07)', color: '#B45309', border: 'rgba(180,83,9,0.15)' },
}

export default function MetaAdTable({ ads, clientType }: Props) {
  const isEcom = clientType === 'ecommerce'
  const [sortKey, setSortKey] = useState<SortKey>('spend')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...ads].sort((a, b) => {
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
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{sorted.length} ads</p>

      <div style={{ overflowX: 'auto', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <Th k="name" label="Ad" />
              <Th k="adSet" label="Ad Set" />
              <Th k="spend" label="Spend" right />
              <Th k="clicks" label="Clicks" right />
              <Th k="conversions" label="Conv." right />
              {isEcom && <Th k="revenue" label="Revenue" right />}
              {isEcom ? <Th k="roas" label="ROAS" right /> : <Th k="cpa" label="CPA" right />}
              <Th k="creativeType" label="Type" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const tc = TYPE_COLORS[row.creativeType] ?? TYPE_COLORS.Image
              return (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-alt)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>{row.adSet}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{formatMetaSpend(row.spend)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatNumber(row.clicks)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.conversions.toFixed(0)}</td>
                  {isEcom && <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.revenue > 0 ? formatMetaSpend(row.revenue) : '—'}</td>}
                  {isEcom
                    ? <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>{row.roas !== null ? `${row.roas.toFixed(2)}x` : '—'}</td>
                    : <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.cpa !== null ? formatMetaSpend(row.cpa) : '—'}</td>
                  }
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--r-full)',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                    }}>
                      {row.creativeType}
                    </span>
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={isEcom ? 8 : 7} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No ads</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
