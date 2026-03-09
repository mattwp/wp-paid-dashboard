import { readFileSync, existsSync } from 'fs'
import path from 'path'
import type { ClientConfig, ClientSummary, CampaignRow, KeywordRow, AdGroupRow, LandingPageRow, MonthlyRow, QualityRow } from './types'

export { formatCurrency, formatCurrencyFull, formatNumber, formatPercent, formatCpc, calcDelta, formatDelta, deltaClass, timeAgo } from './format'

const DATA_DIR = path.join(process.cwd(), 'data')

export function getClients(): ClientConfig[] {
  const file = path.join(DATA_DIR, 'clients.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getClientSummary(clientId: string): ClientSummary | null {
  const file = path.join(DATA_DIR, clientId, 'summary.json')
  if (!existsSync(file)) return null
  const data = JSON.parse(readFileSync(file, 'utf-8'))
  // Backfill conversionValue = 0 for existing summaries that predate this field
  for (const key of ['current7d', 'prev7d', 'current30d', 'prev30d', 'yoy30d'] as const) {
    if (data[key] && data[key].conversionValue === undefined) {
      data[key].conversionValue = 0
    }
  }
  return data
}

export function getClientCampaigns(clientId: string): CampaignRow[] {
  const file = path.join(DATA_DIR, clientId, 'campaigns.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getClientKeywords(clientId: string): KeywordRow[] {
  const file = path.join(DATA_DIR, clientId, 'keywords.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getClientAdGroups(clientId: string): AdGroupRow[] {
  const file = path.join(DATA_DIR, clientId, 'adgroups.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getClientLandingPages(clientId: string): LandingPageRow[] {
  const file = path.join(DATA_DIR, clientId, 'landingpages.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getClientMonthly(clientId: string): MonthlyRow[] {
  const file = path.join(DATA_DIR, clientId, 'monthly.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getClientQuality(clientId: string): QualityRow[] {
  const file = path.join(DATA_DIR, clientId, 'quality.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getLastUpdated(): string | null {
  const file = path.join(DATA_DIR, 'last_updated.json')
  if (!existsSync(file)) return null
  const d = JSON.parse(readFileSync(file, 'utf-8'))
  return d.timestamp ?? null
}
