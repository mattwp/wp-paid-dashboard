import type { ClientConfig, ClientSummary, CampaignRow, Alert, Opportunity } from './types'

type Summaries = Record<string, ClientSummary | null>
type CampaignsByClient = Record<string, CampaignRow[]>

function costDollars(micros: number): number {
  return micros / 1_000_000
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return (current - previous) / previous
}

function cpa(costMicros: number, conversions: number): number {
  if (conversions === 0) return 0
  return costDollars(costMicros) / conversions
}

function roas(conversionValue: number, costMicros: number): number {
  const cost = costDollars(costMicros)
  if (cost === 0) return 0
  return conversionValue / cost
}

function fmt$(v: number): string {
  return '$' + v.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtPct(v: number): string {
  return (v * 100).toFixed(0) + '%'
}

export function computeAlerts(clients: ClientConfig[], summaries: Summaries): Alert[] {
  const alerts: Alert[] = []

  for (const client of clients) {
    const s = summaries[client.id]
    if (!s) continue

    const c7 = s.current7d
    const p7 = s.prev7d
    const c30 = s.current30d
    const p30 = s.prev30d
    const spend7d = costDollars(c7.costMicros)
    const prevSpend7d = costDollars(p7.costMicros)
    const spend30d = costDollars(c30.costMicros)

    // 1. Near-zero spend
    if (spend7d < 10 && prevSpend7d > 100) {
      alerts.push({
        clientId: client.id,
        clientName: client.name,
        clientType: client.type,
        severity: 'critical',
        title: 'Near-zero spend',
        detail: `7d spend ${fmt$(spend7d)} vs ${fmt$(prevSpend7d)} prior week`,
        metric: fmt$(spend7d),
      })
    }

    // 2. Spend cliff
    if (prevSpend7d > 200 && pctChange(spend7d, prevSpend7d) < -0.5) {
      alerts.push({
        clientId: client.id,
        clientName: client.name,
        clientType: client.type,
        severity: 'critical',
        title: 'Spend cliff',
        detail: `7d spend down ${fmtPct(Math.abs(pctChange(spend7d, prevSpend7d)))} WoW (${fmt$(prevSpend7d)} to ${fmt$(spend7d)})`,
        metric: fmtPct(Math.abs(pctChange(spend7d, prevSpend7d))),
      })
    }

    // 3. Zero conversions + spend
    if (spend30d > 500 && c30.conversions === 0) {
      alerts.push({
        clientId: client.id,
        clientName: client.name,
        clientType: client.type,
        severity: 'critical',
        title: 'Zero conversions',
        detail: `${fmt$(spend30d)} spent over 30d with 0 conversions`,
        metric: fmt$(spend30d),
      })
    }

    // 4. Conversion drop
    if (p30.conversions > 5 && pctChange(c30.conversions, p30.conversions) < -0.3) {
      const drop = Math.abs(pctChange(c30.conversions, p30.conversions))
      alerts.push({
        clientId: client.id,
        clientName: client.name,
        clientType: client.type,
        severity: 'warning',
        title: 'Conversion drop',
        detail: `Conversions down ${fmtPct(drop)} MoM (${p30.conversions.toFixed(0)} to ${c30.conversions.toFixed(0)})`,
        metric: fmtPct(drop),
      })
    }

    // 5. CPA blowout
    const cpaCurr = cpa(c30.costMicros, c30.conversions)
    const cpaPrev = cpa(p30.costMicros, p30.conversions)
    if (c30.conversions > 0 && p30.conversions > 0 && pctChange(cpaCurr, cpaPrev) > 0.3) {
      const increase = pctChange(cpaCurr, cpaPrev)
      alerts.push({
        clientId: client.id,
        clientName: client.name,
        clientType: client.type,
        severity: 'warning',
        title: 'CPA blowout',
        detail: `CPA up ${fmtPct(increase)} MoM (${fmt$(cpaPrev)} to ${fmt$(cpaCurr)})`,
        metric: fmt$(cpaCurr),
      })
    }

    // 6. ROAS collapse (ecommerce only)
    if (client.type === 'ecommerce') {
      const roasCurr = roas(c30.conversionValue, c30.costMicros)
      const roasPrev = roas(p30.conversionValue, p30.costMicros)
      if (roasPrev > 0 && pctChange(roasCurr, roasPrev) < -0.3) {
        const drop = Math.abs(pctChange(roasCurr, roasPrev))
        alerts.push({
          clientId: client.id,
          clientName: client.name,
          clientType: client.type,
          severity: 'warning',
          title: 'ROAS collapse',
          detail: `ROAS down ${fmtPct(drop)} MoM (${roasPrev.toFixed(1)}x to ${roasCurr.toFixed(1)}x)`,
          metric: roasCurr.toFixed(1) + 'x',
        })
      }
    }
  }

  // Sort: critical first, then warning
  alerts.sort((a, b) => (a.severity === 'critical' ? 0 : 1) - (b.severity === 'critical' ? 0 : 1))
  return alerts
}

export function computeOpportunities(
  clients: ClientConfig[],
  summaries: Summaries,
  campaignsByClient: CampaignsByClient,
): Opportunity[] {
  const opps: Opportunity[] = []

  for (const client of clients) {
    const s = summaries[client.id]
    if (!s) continue

    const c30 = s.current30d
    const p30 = s.prev30d
    const campaigns = campaignsByClient[client.id] ?? []
    const maxBudgetLostIS = Math.max(0, ...campaigns.map(c => c.searchBudgetLostImpressionShare ?? 0))
    const convChange = pctChange(c30.conversions, p30.conversions)
    const spendChange = pctChange(costDollars(c30.costMicros), costDollars(p30.costMicros))

    // 1. Conv growth + budget headroom
    if (convChange > 0.2 && maxBudgetLostIS > 0.15) {
      opps.push({
        clientId: client.id,
        clientName: client.name,
        clientType: client.type,
        type: 'scale',
        title: 'Conv growth + budget headroom',
        detail: `Conversions up ${fmtPct(convChange)} MoM with ${fmtPct(maxBudgetLostIS)} budget lost IS`,
        metric: fmtPct(convChange),
      })
    }

    // 2. High ROAS + budget constrained (ecommerce)
    if (client.type === 'ecommerce') {
      const roasCurr = roas(c30.conversionValue, c30.costMicros)
      if (roasCurr > 3 && maxBudgetLostIS > 0.15) {
        opps.push({
          clientId: client.id,
          clientName: client.name,
          clientType: client.type,
          type: 'scale',
          title: 'High ROAS + budget constrained',
          detail: `${roasCurr.toFixed(1)}x ROAS with ${fmtPct(maxBudgetLostIS)} budget lost IS`,
          metric: roasCurr.toFixed(1) + 'x',
        })
      }
    }

    // 3. Low CPA + low IS (lead-gen)
    if (client.type === 'lead-gen') {
      const cpaCurr = cpa(c30.costMicros, c30.conversions)
      const cpaPrev = cpa(p30.costMicros, p30.conversions)
      const cpaChange = cpaPrev > 0 ? pctChange(cpaCurr, cpaPrev) : 0
      if (c30.conversions > 0 && cpaChange <= 0 && s.weightedIS30d !== null && s.weightedIS30d < 0.4) {
        opps.push({
          clientId: client.id,
          clientName: client.name,
          clientType: client.type,
          type: 'scale',
          title: 'Low CPA + low impression share',
          detail: `CPA ${cpaChange === 0 ? 'flat' : 'down ' + fmtPct(Math.abs(cpaChange))} MoM with ${fmtPct(s.weightedIS30d)} IS`,
          metric: fmtPct(s.weightedIS30d) + ' IS',
        })
      }
    }

    // 4. IS improvement trend
    if (s.weightedIS30d !== null && s.weightedISPrev30d !== null) {
      const isChange = s.weightedIS30d - s.weightedISPrev30d
      if (isChange > 0.05 && s.weightedIS30d < 0.6) {
        opps.push({
          clientId: client.id,
          clientName: client.name,
          clientType: client.type,
          type: 'momentum',
          title: 'IS improvement trend',
          detail: `IS up ${(isChange * 100).toFixed(0)}pp MoM (${fmtPct(s.weightedISPrev30d)} to ${fmtPct(s.weightedIS30d)})`,
          metric: '+' + (isChange * 100).toFixed(0) + 'pp',
        })
      }
    }

    // 5. Strong CTR + low IS
    if (c30.ctr > 0.03 && s.weightedIS30d !== null && s.weightedIS30d < 0.5) {
      opps.push({
        clientId: client.id,
        clientName: client.name,
        clientType: client.type,
        type: 'scale',
        title: 'Strong CTR + low IS',
        detail: `${fmtPct(c30.ctr)} CTR with only ${fmtPct(s.weightedIS30d)} IS — room to grow`,
        metric: fmtPct(c30.ctr) + ' CTR',
      })
    }

    // 6. Efficiency gain
    if (convChange > 0.3 && spendChange < 0.1) {
      opps.push({
        clientId: client.id,
        clientName: client.name,
        clientType: client.type,
        type: 'efficiency',
        title: 'Efficiency gain',
        detail: `Conversions up ${fmtPct(convChange)} while spend ${spendChange > 0 ? 'up only ' + fmtPct(spendChange) : 'down ' + fmtPct(Math.abs(spendChange))}`,
        metric: fmtPct(convChange),
      })
    }
  }

  return opps
}
