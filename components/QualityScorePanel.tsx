'use client'

import { useState } from 'react'
import type { QualityRow, SortDir } from '@/lib/types'

interface Props {
  quality: QualityRow[]
}

const MATCH_STYLES: Record<string, React.CSSProperties> = {
  EXACT: { background: 'rgba(4,120,87,0.07)', color: '#047857' },
  PHRASE: { background: 'var(--amber-bg)', color: 'var(--amber)' },
  BROAD: { background: 'var(--bg-alt)', color: 'var(--text-secondary)' },
}

const SUB_LABELS: Record<string, string> = {
  ABOVE_AVERAGE: 'Above avg',
  AVERAGE: 'Average',
  BELOW_AVERAGE: 'Below avg',
}

function qsColor(qs: number): string {
  if (qs >= 8) return '#047857'
  if (qs >= 6) return '#B45309'
  return '#EA4648'
}

function QsBar({ score }: { score: number | null }) {
  if (!score) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const pct = (score / 10) * 100
  const color = qsColor(score)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
      <div style={{ width: '60px', background: 'var(--border)', borderRadius: '999px', height: '5px', overflow: 'hidden' }}>
        <div style={{ background: color, height: '5px', borderRadius: '999px', width: `${pct}%` }} />
      </div>
      <span style={{ color, fontWeight: 700, fontSize: '13px', width: '16px', textAlign: 'right' }}>{score}</span>
    </div>
  )
}

function SubScore({ val }: { val: string | null }) {
  if (!val) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const color = val === 'ABOVE_AVERAGE' ? '#047857' : val === 'AVERAGE' ? '#B45309' : '#EA4648'
  return <span style={{ fontSize: '11px', color, fontWeight: 600 }}>{SUB_LABELS[val] ?? val}</span>
}

type SortKey = 'qualityScore' | 'keyword' | 'campaign' | 'adGroup' | 'searchPredictedCtr' | 'creativeQualityScore' | 'postClickQualityScore'

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span style={{ color: 'var(--border-med)', marginLeft: '4px' }}>↕</span>
  return <span style={{ color: 'var(--wp)', marginLeft: '4px' }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function QualityScorePanel({ quality }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('qualityScore')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [search, setSearch] = useState('')

  if (quality.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', background: 'var(--bg-alt)' }}>
        No quality score data — run a refresh to populate
      </div>
    )
  }

  const withScore = quality.filter(r => r.qualityScore !== null && r.qualityScore > 0)
  const avgQs = withScore.length > 0
    ? withScore.reduce((s, r) => s + (r.qualityScore ?? 0), 0) / withScore.length
    : null

  const good = withScore.filter(r => (r.qualityScore ?? 0) >= 8).length
  const avg = withScore.filter(r => (r.qualityScore ?? 0) >= 6 && (r.qualityScore ?? 0) < 8).length
  const poor = withScore.filter(r => (r.qualityScore ?? 0) < 6).length
  const total = withScore.length

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'qualityScore' ? 'asc' : 'asc') }
  }

  const filtered = search
    ? quality.filter(r =>
        r.keyword.toLowerCase().includes(search.toLowerCase()) ||
        r.campaign.toLowerCase().includes(search.toLowerCase()) ||
        r.adGroup.toLowerCase().includes(search.toLowerCase())
      )
    : quality

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Summary */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {/* Avg QS tile */}
        <div style={{ padding: '16px 20px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', minWidth: '140px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Avg quality score</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: avgQs ? qsColor(Math.round(avgQs)) : 'var(--text-muted)', lineHeight: 1 }}>
              {avgQs ? avgQs.toFixed(1) : '—'}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/10</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{total} keywords</p>
        </div>

        {/* Distribution */}
        <div style={{ padding: '16px 20px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', flex: 1, minWidth: '240px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Score distribution</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Good (8–10)', count: good, color: '#047857' },
              { label: 'Average (6–7)', count: avg, color: '#B45309' },
              { label: 'Poor (1–5)', count: poor, color: '#EA4648' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: row.color, fontWeight: 600, width: '100px', flexShrink: 0 }}>{row.label}</span>
                <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '6px', borderRadius: '999px', background: row.color, width: total > 0 ? `${(row.count / total) * 100}%` : '0%' }} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '24px', textAlign: 'right' }}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input
          type="text"
          placeholder="Search keywords, campaigns or ad groups..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: '8px 14px',
            fontSize: '13px',
            width: '300px',
            outline: 'none',
            background: 'var(--bg-base)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--wp)'; e.target.style.boxShadow = '0 0 0 3px var(--wp-bg)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{sorted.length} keywords</p>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <Th k="keyword" label="Keyword" />
              <th style={{ ...thStyle(), cursor: 'default' }}>Match</th>
              <Th k="campaign" label="Campaign" />
              <Th k="adGroup" label="Ad group" />
              <Th k="qualityScore" label="QS" right />
              <Th k="searchPredictedCtr" label="Exp. CTR" right />
              <Th k="creativeQualityScore" label="Ad relevance" right />
              <Th k="postClickQualityScore" label="Landing page" right />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-alt)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.keyword}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ ...(MATCH_STYLES[r.matchType] ?? { background: 'var(--bg-alt)', color: 'var(--text-muted)' }), fontSize: '11px', padding: '2px 7px', borderRadius: 'var(--r-sm)', fontWeight: 600 }}>
                    {r.matchType.charAt(0) + r.matchType.slice(1).toLowerCase()}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '12px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.campaign}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '12px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.adGroup}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}><QsBar score={r.qualityScore} /></td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}><SubScore val={r.searchPredictedCtr} /></td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}><SubScore val={r.creativeQualityScore} /></td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}><SubScore val={r.postClickQualityScore} /></td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No keywords found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
