'use client'

import { formatCurrency, formatPercent } from '@/lib/format'
import type { CampaignRow, QualityRow } from '@/lib/types'

interface Props {
  campaigns: CampaignRow[]
  quality: QualityRow[]
}

interface Insight {
  severity: 'critical' | 'warning' | 'opportunity'
  title: string
  detail: string
  action: string
}

const SEVERITY_STYLES: Record<string, { border: string; bg: string; label: string; labelColor: string }> = {
  critical: { border: '#EA4648', bg: 'rgba(234,70,72,0.04)', label: 'Critical', labelColor: '#EA4648' },
  warning: { border: '#B45309', bg: 'rgba(180,83,9,0.04)', label: 'Warning', labelColor: '#B45309' },
  opportunity: { border: '#2563EB', bg: 'rgba(37,99,235,0.04)', label: 'Opportunity', labelColor: '#2563EB' },
}

export default function InsightsPanel({ campaigns, quality }: Props) {
  const insights: Insight[] = []

  const active = campaigns.filter(c => c.costMicros > 0)
  const totalConv = active.reduce((s, c) => s + c.conversions, 0)
  const totalSpend = active.reduce((s, c) => s + c.costMicros, 0)
  const accountCpl = totalConv > 0 ? totalSpend / totalConv : null

  // 1. Budget-capped campaigns
  const budgetCapped = active.filter(c =>
    c.searchBudgetLostImpressionShare !== null &&
    c.searchBudgetLostImpressionShare > 0.2
  )
  if (budgetCapped.length > 0) {
    const topCapped = budgetCapped.sort((a, b) =>
      (b.searchBudgetLostImpressionShare ?? 0) - (a.searchBudgetLostImpressionShare ?? 0)
    )
    const names = topCapped.slice(0, 2).map(c => `"${c.name}"`).join(', ')
    const extra = topCapped.length > 2 ? ` +${topCapped.length - 2} more` : ''
    insights.push({
      severity: 'warning',
      title: `${budgetCapped.length} campaign${budgetCapped.length > 1 ? 's' : ''} losing IS due to budget`,
      detail: `${names}${extra} ${topCapped.length === 1 ? 'is' : 'are'} budget-constrained — losing ${formatPercent(topCapped[0].searchBudgetLostImpressionShare)} of potential impressions.`,
      action: 'Increase daily budgets or restructure into portfolio bid strategies to unlock growth.',
    })
  }

  // 2. Rank-limited campaigns
  const rankLimited = active.filter(c =>
    c.searchRankLostImpressionShare !== null &&
    c.searchRankLostImpressionShare > 0.3
  )
  if (rankLimited.length > 0) {
    const topRank = rankLimited.sort((a, b) =>
      (b.searchRankLostImpressionShare ?? 0) - (a.searchRankLostImpressionShare ?? 0)
    )
    const names = topRank.slice(0, 2).map(c => `"${c.name}"`).join(', ')
    const extra = topRank.length > 2 ? ` +${topRank.length - 2} more` : ''
    insights.push({
      severity: 'warning',
      title: `${rankLimited.length} campaign${rankLimited.length > 1 ? 's' : ''} losing IS due to rank`,
      detail: `${names}${extra} — losing ${formatPercent(topRank[0].searchRankLostImpressionShare)} of potential impressions due to ad rank.`,
      action: 'Improve Quality Scores (ad relevance, landing page experience) or increase bids to compete more effectively.',
    })
  }

  // 3. Spending campaigns with zero conversions
  const SPEND_THRESHOLD = 500_000_000 // $500
  const zeroConv = active.filter(c => c.conversions === 0 && c.costMicros >= SPEND_THRESHOLD)
  if (zeroConv.length > 0) {
    const totalWaste = zeroConv.reduce((s, c) => s + c.costMicros, 0)
    const names = zeroConv.slice(0, 2).map(c => `"${c.name}"`).join(', ')
    const extra = zeroConv.length > 2 ? ` +${zeroConv.length - 2} more` : ''
    insights.push({
      severity: 'critical',
      title: `${formatCurrency(totalWaste)} spent with zero conversions`,
      detail: `${names}${extra} ${zeroConv.length === 1 ? 'is' : 'are'} spending without recording any conversions in the last 30 days.`,
      action: 'Check conversion tracking, review landing pages, audit targeting — or pause until root cause is identified.',
    })
  }

  // 4. High CPA outliers (vs account average, min $200 spend)
  if (accountCpl && active.length > 2) {
    const HIGH_CPA_THRESHOLD = accountCpl * 2
    const SPEND_MIN = 200_000_000
    const highCpa = active.filter(c => {
      if (c.conversions === 0 || c.costMicros < SPEND_MIN) return false
      const cpa = c.costMicros / c.conversions
      return cpa > HIGH_CPA_THRESHOLD
    })
    if (highCpa.length > 0) {
      const worst = highCpa.sort((a, b) => {
        const aCpa = a.costMicros / a.conversions
        const bCpa = b.costMicros / b.conversions
        return bCpa - aCpa
      })
      const worstCpa = worst[0].costMicros / worst[0].conversions
      insights.push({
        severity: 'opportunity',
        title: `${highCpa.length} campaign${highCpa.length > 1 ? 's' : ''} with CPA 2x+ account average`,
        detail: `Account avg CPL is ${formatCurrency(accountCpl)}. "${worst[0].name}" has a CPL of ${formatCurrency(worstCpa)}.`,
        action: 'Review ad copy, keyword match types, and audience targeting. Consider restructuring ad groups or reducing bids on poor-performing segments.',
      })
    }
  }

  // 5. Low IS across the account (not explained by budget/rank)
  const hasIS = active.filter(c => c.searchImpressionShare !== null)
  if (hasIS.length > 0) {
    const weightedIS = hasIS.reduce((s, c) => s + (c.searchImpressionShare ?? 0) * c.costMicros, 0) / hasIS.reduce((s, c) => s + c.costMicros, 0)
    if (weightedIS < 0.3 && budgetCapped.length === 0 && rankLimited.length < hasIS.length * 0.5) {
      insights.push({
        severity: 'opportunity',
        title: `Low overall impression share (${formatPercent(weightedIS)})`,
        detail: "The account is only capturing a small share of eligible searches and it's not primarily explained by budget or rank loss.",
        action: 'Review campaign targeting breadth, keyword coverage, and geo targeting. There may be significant untapped search volume.',
      })
    }
  }

  // 6. Quality score issues (if data available)
  const withScore = quality.filter(r => r.qualityScore !== null && r.qualityScore > 0)
  if (withScore.length > 0) {
    const avgQs = withScore.reduce((s, r) => s + (r.qualityScore ?? 0), 0) / withScore.length
    const poorKws = withScore.filter(r => (r.qualityScore ?? 0) <= 4)
    if (avgQs < 6) {
      insights.push({
        severity: 'warning',
        title: `Low average Quality Score (${avgQs.toFixed(1)}/10)`,
        detail: `${poorKws.length} keyword${poorKws.length !== 1 ? 's' : ''} score 4 or below. Poor QS inflates CPCs and reduces ad rank.`,
        action: 'Align ad copy more closely to keyword intent, improve landing page relevance, and consider splitting broad ad groups into tighter themes.',
      })
    }
  }

  if (insights.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', background: 'var(--bg-alt)' }}>
        No significant issues detected — account looks healthy based on available data.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{insights.length} insight{insights.length !== 1 ? 's' : ''} based on last 30 days data</p>
      {insights.map((ins, i) => {
        const s = SEVERITY_STYLES[ins.severity]
        return (
          <div key={i} style={{
            padding: '16px 20px',
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderLeft: `4px solid ${s.border}`,
            borderRadius: 'var(--r-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: s.labelColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</span>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{ins.title}</p>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ins.detail}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Suggested action: </span>
              {ins.action}
            </p>
          </div>
        )
      })}
    </div>
  )
}
