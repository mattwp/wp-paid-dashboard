'use client'

import { useState } from 'react'
import { formatCurrency, formatNumber, formatPercent, formatCpc } from '@/lib/format'
import type { LandingPageRow, SortDir } from '@/lib/types'

interface Props {
  pages: LandingPageRow[]
}

type SortKey = keyof LandingPageRow | 'cpa' | 'cvr'

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span style={{ color: 'var(--border-med)', marginLeft: '4px' }}>↕</span>
  return <span style={{ color: 'var(--wp)', marginLeft: '4px' }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

function shortUrl(url: string): string {
  try {
    const u = new URL(url)
    const path = u.pathname === '/' ? u.hostname : u.hostname + u.pathname
    return path.replace(/\/$/, '')
  } catch {
    return url
  }
}

export default function LandingPageTable({ pages }: Props) {
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
    ? pages.filter(p => p.url.toLowerCase().includes(search.toLowerCase()))
    : pages

  const withCalc = filtered.map(p => ({
    ...p,
    cpa: p.conversions > 0 ? p.costMicros / p.conversions : null,
    cvr: p.clicks > 0 ? p.conversions / p.clicks : null,
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

  // CVR colour coding: >=5% green, >=2% amber, <2% red
  function cvrColor(cvr: number | null): string {
    if (cvr === null) return 'var(--text-muted)'
    if (cvr >= 0.05) return '#047857'
    if (cvr >= 0.02) return 'var(--amber)'
    return 'var(--wp)'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            placeholder="Search URLs..."
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
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{sorted.length} landing pages</p>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last 30 days</p>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <Th k="url" label="Landing page" />
              <Th k="impressions" label="Impr." right />
              <Th k="clicks" label="Clicks" right />
              <Th k="ctr" label="CTR" right />
              <Th k="costMicros" label="Spend" right />
              <Th k="conversions" label="Conv." right />
              <Th k="cvr" label="CVR" right />
              <Th k="cpa" label="CPA" right />
              <Th k="averageCpc" label="CPC" right />
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-alt)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '10px 12px', maxWidth: '280px' }}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={p.url}
                    style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--wp)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  >
                    {shortUrl(p.url)}
                  </a>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatNumber(p.impressions)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatNumber(p.clicks)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatPercent(p.ctr, 2)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(p.costMicros)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{p.conversions.toFixed(1)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: cvrColor(p.cvr) }}>{formatPercent(p.cvr, 1)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{p.cpa ? formatCurrency(p.cpa) : '—'}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{p.averageCpc ? formatCpc(p.averageCpc) : '—'}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No landing page data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          CVR colour: <span style={{ color: '#047857', fontWeight: 600 }}>green ≥5%</span> · <span style={{ color: 'var(--amber)', fontWeight: 600 }}>amber ≥2%</span> · <span style={{ color: 'var(--wp)', fontWeight: 600 }}>red &lt;2%</span>
        </p>
      )}
    </div>
  )
}
