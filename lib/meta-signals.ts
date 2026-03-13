import type { MetaClientConfig, MetaClientSummary, MetaCampaignRow, Alert, Opportunity } from './types'

type Summaries = Record<string, MetaClientSummary | null>
type CampaignsByClient = Record<string, MetaCampaignRow[]>

function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return (current - previous) / previous
}

function cpa(spend: number, conversions: number): number {
  if (conversions === 0) return 0
  return spend / conversions
}

function roas(revenue: number, spend: number): number {
  if (spend === 0) return 0
  return revenue / spend
}

function fmt$(v: number): string {
  return '$' + v.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtPct(v: number): string {
  return (v * 100).toFixed(0) + '%'
}

export function computeMetaAlerts(clients: MetaClientConfig[], summaries: Summaries): Alert[] {
  const alerts: Alert[] = []

  for (const client of clients) {
    const s = summaries[client.id]
    if (!s) continue

    const c7 = s.current7d
    const p7 = s.prev7d
    const c30 = s.current30d
    const p30 = s.prev30d

    // 1. Near-zero spend
    if (c7.spend < 10 && p7.spend > 100) {
      alerts.push({
        clientId: client.id, clientName: client.name, clientType: client.type,
        severity: 'critical', title: 'Near-zero spend',
        detail: `7d spend ${fmt$(c7.spend)} vs ${fmt$(p7.spend)} prior week`,
        metric: fmt$(c7.spend),
      })
    }

    // 2. Spend cliff
    if (p7.spend > 200 && pctChange(c7.spend, p7.spend) < -0.5) {
      const drop = Math.abs(pctChange(c7.spend, p7.spend))
      alerts.push({
        clientId: client.id, clientName: client.name, clientType: client.type,
        severity: 'critical', title: 'Spend cliff',
        detail: `7d spend down ${fmtPct(drop)} WoW (${fmt$(p7.spend)} to ${fmt$(c7.spend)})`,
        metric: fmtPct(drop),
      })
    }

    // 3. Zero conversions + spend
    if (c30.spend > 500 && c30.conversions === 0) {
      alerts.push({
        clientId: client.id, clientName: client.name, clientType: client.type,
        severity: 'critical', title: 'Zero conversions',
        detail: `${fmt$(c30.spend)} spent over 30d with 0 conversions`,
        metric: fmt$(c30.spend),
      })
    }

    // 4. Conversion drop
    if (p30.conversions > 5 && pctChange(c30.conversions, p30.conversions) < -0.3) {
      const drop = Math.abs(pctChange(c30.conversions, p30.conversions))
      alerts.push({
        clientId: client.id, clientName: client.name, clientType: client.type,
        severity: 'warning', title: 'Conversion drop',
        detail: `Conversions down ${fmtPct(drop)} MoM (${p30.conversions.toFixed(0)} to ${c30.conversions.toFixed(0)})`,
        metric: fmtPct(drop),
      })
    }

    // 5. CPA blowout
    const cpaCurr = cpa(c30.spend, c30.conversions)
    const cpaPrev = cpa(p30.spend, p30.conversions)
    if (c30.conversions > 0 && p30.conversions > 0 && pctChange(cpaCurr, cpaPrev) > 0.3) {
      const increase = pctChange(cpaCurr, cpaPrev)
      alerts.push({
        clientId: client.id, clientName: client.name, clientType: client.type,
        severity: 'warning', title: 'CPA blowout',
        detail: `CPA up ${fmtPct(increase)} MoM (${fmt$(cpaPrev)} to ${fmt$(cpaCurr)})`,
        metric: fmt$(cpaCurr),
      })
    }

    // 6. ROAS collapse (ecommerce only)
    if (client.type === 'ecommerce') {
      const roasCurr = roas(c30.revenue, c30.spend)
      const roasPrev = roas(p30.revenue, p30.spend)
      if (roasPrev > 0 && pctChange(roasCurr, roasPrev) < -0.3) {
        const drop = Math.abs(pctChange(roasCurr, roasPrev))
        alerts.push({
          clientId: client.id, clientName: client.name, clientType: client.type,
          severity: 'warning', title: 'ROAS collapse',
          detail: `ROAS down ${fmtPct(drop)} MoM (${roasPrev.toFixed(1)}x to ${roasCurr.toFixed(1)}x)`,
          metric: roasCurr.toFixed(1) + 'x',
        })
      }
    }

    // 7. Frequency fatigue (Meta-specific)
    if (c30.frequency > 4.0) {
      alerts.push({
        clientId: client.id, clientName: client.name, clientType: client.type,
        severity: 'warning', title: 'Frequency fatigue',
        detail: `30d frequency at ${c30.frequency.toFixed(1)} — audience may be oversaturated`,
        metric: c30.frequency.toFixed(1),
      })
    }
  }

  alerts.sort((a, b) => (a.severity === 'critical' ? 0 : 1) - (b.severity === 'critical' ? 0 : 1))
  return alerts
}

export function computeMetaOpportunities(
  clients: MetaClientConfig[],
  summaries: Summaries,
  campaignsByClient: CampaignsByClient,
): Opportunity[] {
  const opps: Opportunity[] = []

  for (const client of clients) {
    const s = summaries[client.id]
    if (!s) continue

    const c30 = s.current30d
    const p30 = s.prev30d
    const convChange = pctChange(c30.conversions, p30.conversions)
    const spendChange = pctChange(c30.spend, p30.spend)

    // 1. High ROAS + room to scale (ecommerce)
    if (client.type === 'ecommerce') {
      const roasCurr = roas(c30.revenue, c30.spend)
      if (roasCurr > 3) {
        opps.push({
          clientId: client.id, clientName: client.name, clientType: client.type,
          type: 'scale', title: 'High ROAS — room to scale',
          detail: `${roasCurr.toFixed(1)}x ROAS with room to increase spend`,
          metric: roasCurr.toFixed(1) + 'x',
        })
      }
    }

    // 2. Low CPA + declining (lead-gen)
    if (client.type === 'lead-gen') {
      const cpaCurr = cpa(c30.spend, c30.conversions)
      const cpaPrev = cpa(p30.spend, p30.conversions)
      if (c30.conversions > 0 && cpaPrev > 0 && pctChange(cpaCurr, cpaPrev) < -0.1) {
        opps.push({
          clientId: client.id, clientName: client.name, clientType: client.type,
          type: 'scale', title: 'CPA improving — scale opportunity',
          detail: `CPA down ${fmtPct(Math.abs(pctChange(cpaCurr, cpaPrev)))} MoM (${fmt$(cpaPrev)} to ${fmt$(cpaCurr)})`,
          metric: fmt$(cpaCurr),
        })
      }
    }

    // 3. Strong CTR
    if (c30.ctr > 0.02) {
      opps.push({
        clientId: client.id, clientName: client.name, clientType: client.type,
        type: 'scale', title: 'Strong CTR',
        detail: `${fmtPct(c30.ctr)} CTR — creative is resonating`,
        metric: fmtPct(c30.ctr) + ' CTR',
      })
    }

    // 4. Efficiency gain
    if (convChange > 0.3 && spendChange < 0.1) {
      opps.push({
        clientId: client.id, clientName: client.name, clientType: client.type,
        type: 'efficiency', title: 'Efficiency gain',
        detail: `Conversions up ${fmtPct(convChange)} while spend ${spendChange > 0 ? 'up only ' + fmtPct(spendChange) : 'down ' + fmtPct(Math.abs(spendChange))}`,
        metric: fmtPct(convChange),
      })
    }

    // 5. Revenue growth (ecommerce)
    if (client.type === 'ecommerce') {
      const revChange = pctChange(c30.revenue, p30.revenue)
      if (revChange > 0.2 && c30.revenue > 1000) {
        opps.push({
          clientId: client.id, clientName: client.name, clientType: client.type,
          type: 'momentum', title: 'Revenue growth',
          detail: `Revenue up ${fmtPct(revChange)} MoM`,
          metric: fmtPct(revChange),
        })
      }
    }

    // 6. CPM improvement
    if (p30.cpm > 0 && c30.cpm > 0 && pctChange(c30.cpm, p30.cpm) < -0.15) {
      const improvement = Math.abs(pctChange(c30.cpm, p30.cpm))
      opps.push({
        clientId: client.id, clientName: client.name, clientType: client.type,
        type: 'efficiency', title: 'CPM improvement',
        detail: `CPM down ${fmtPct(improvement)} MoM (${fmt$(p30.cpm)} to ${fmt$(c30.cpm)})`,
        metric: fmt$(c30.cpm),
      })
    }
  }

  return opps
}
