'use client'

import { useState } from 'react'
import { formatCurrency, formatNumber, formatPercent, formatCpc } from '@/lib/format'
import type { KeywordRow, SortDir } from '@/lib/types'

interface Props {
  keywords: KeywordRow[]
}

type SortKey = keyof KeywordRow

const MATCH_STYLES: Record<string, React.CSSProperties> = {
  EXACT: { background: 'rgba(4,120,87,0.07)', color: '#047857' },
  PHRASE: { background: 'var(--amber-bg)', color: 'var(--amber)' },
  BROAD: { background: 'var(--bg-alt)', color: 'var(--text-secondary)' },
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span style={{ color: 'var(--border-med)', marginLeft: '4px' }}>↕</span>
  return <span style={{ color: 'var(--wp)', marginLeft: '4px' }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function KeywordTable({ keywords }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('costMicros')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [search, setSearch] = useState('')

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = search
    ? keywords.filter(k => k.keyword.toLowerCase().includes(search.toLowerCase()) || k.campaign.toLowerCase().includes(search.toLowerCase()) || k.adGroup.toLowerCase().includes(search.toLowerCase()))
    : keywords

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] ?? 0
    const bv = b[sortKey] ?? 0
    const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <input
          type="text"
          placeholder="Search keywords or campaigns..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: '8px 14px',
            fontSize: '13px',
            width: '280px',
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
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{sorted.length} keywords</p>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <Th k="keyword" label="Keyword" />
              <th style={{ ...thStyle(), cursor: 'default' }}>Match</th>
              <Th k="campaign" label="Campaign" />
              <Th k="adGroup" label="Ad group" />
              <Th k="impressions" label="Impr." right />
              <Th k="clicks" label="Clicks" right />
              <Th k="costMicros" label="Spend" right />
              <Th k="conversions" label="Conv." right />
              <Th k="averageCpc" label="CPC" right />
              <Th k="searchImpressionShare" label="IS%" right />
            </tr>
          </thead>
          <tbody>
            {sorted.map((k, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-alt)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '220px' }}>{k.keyword}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ ...MATCH_STYLES[k.matchType] ?? { background: 'var(--bg-alt)', color: 'var(--text-muted)' }, fontSize: '11px', padding: '2px 7px', borderRadius: 'var(--r-sm)', fontWeight: 600 }}>
                    {k.matchType.charAt(0) + k.matchType.slice(1).toLowerCase()}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '12px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.campaign}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '12px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.adGroup}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatNumber(k.impressions)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatNumber(k.clicks)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(k.costMicros)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{k.conversions.toFixed(1)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCpc(k.averageCpc)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatPercent(k.searchImpressionShare)}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No keywords found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
