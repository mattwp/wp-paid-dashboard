'use client'

import { formatPercent, formatCurrency } from '@/lib/format'
import type { CampaignRow } from '@/lib/types'

interface Props {
  campaigns: CampaignRow[]
}

export default function ImpressionSharePanel({ campaigns }: Props) {
  const active = campaigns
    .filter(c => c.searchImpressionShare !== null && c.costMicros > 0)
    .sort((a, b) => b.costMicros - a.costMicros)

  if (active.length === 0) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '32px 0', textAlign: 'center' }}>No impression share data available</p>
  }

  const avgIS = weightedAvg(active, 'searchImpressionShare', 'impressions')
  const avgTopIS = weightedAvg(active, 'searchTopImpressionShare', 'impressions')
  const avgAbsTopIS = weightedAvg(active, 'searchAbsoluteTopImpressionShare', 'impressions')
  const avgLostBudget = weightedAvg(active, 'searchBudgetLostImpressionShare', 'impressions')
  const avgLostRank = weightedAvg(active, 'searchRankLostImpressionShare', 'impressions')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <ISTile label="Avg IS" value={avgIS} color="#047857" />
        <ISTile label="Top IS" value={avgTopIS} color="var(--text-primary)" />
        <ISTile label="Abs Top IS" value={avgAbsTopIS} color="var(--text-secondary)" />
        <ISTile label="Lost (Budget)" value={avgLostBudget} color="var(--amber)" />
        <ISTile label="Lost (Rank)" value={avgLostRank} color="var(--wp)" />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
        <LegendItem color="#047857" label="Won" />
        <LegendItem color="#B45309" label="Lost — Budget" />
        <LegendItem color="#EA4648" label="Lost — Rank" />
        <LegendItem color="var(--border)" label="Unknown" />
      </div>

      {/* Per-campaign bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {active.map((c, i) => {
          const won = c.searchImpressionShare ?? 0
          const lostBudget = c.searchBudgetLostImpressionShare ?? 0
          const lostRank = c.searchRankLostImpressionShare ?? 0
          const unknown = Math.max(0, 1 - won - lostBudget - lostRank)

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{formatCurrency(c.costMicros)}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatPercent(c.searchImpressionShare)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', height: '8px', borderRadius: '999px', overflow: 'hidden', background: 'var(--border)' }}>
                <div style={{ background: '#047857', height: '100%', width: `${won * 100}%` }} title={`Won: ${formatPercent(c.searchImpressionShare)}`} />
                <div style={{ background: '#B45309', height: '100%', width: `${lostBudget * 100}%` }} title={`Lost Budget: ${formatPercent(c.searchBudgetLostImpressionShare)}`} />
                <div style={{ background: '#EA4648', height: '100%', width: `${lostRank * 100}%` }} title={`Lost Rank: ${formatPercent(c.searchRankLostImpressionShare)}`} />
                <div style={{ background: 'var(--border)', height: '100%', width: `${unknown * 100}%` }} title="Unknown" />
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span><span style={{ color: '#047857', fontWeight: 600 }}>{formatPercent(c.searchImpressionShare)}</span> won</span>
                {lostBudget > 0 && <span><span style={{ color: 'var(--amber)', fontWeight: 600 }}>{formatPercent(c.searchBudgetLostImpressionShare)}</span> lost budget</span>}
                {lostRank > 0 && <span><span style={{ color: 'var(--wp)', fontWeight: 600 }}>{formatPercent(c.searchRankLostImpressionShare)}</span> lost rank</span>}
                {c.searchTopImpressionShare !== null && <span><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{formatPercent(c.searchTopImpressionShare)}</span> top IS</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ISTile({ label, value, color }: { label: string; value: number | null; color: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '12px', textAlign: 'center' }}>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: '20px', fontWeight: 800, color }}>{formatPercent(value)}</p>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color }} />
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  )
}

function weightedAvg(rows: CampaignRow[], metric: keyof CampaignRow, weight: keyof CampaignRow): number | null {
  let totalWeight = 0
  let weightedSum = 0
  for (const r of rows) {
    const v = r[metric] as number | null
    const w = r[weight] as number
    if (v === null || isNaN(v) || !w) continue
    totalWeight += w
    weightedSum += v * w
  }
  if (!totalWeight) return null
  return weightedSum / totalWeight
}
