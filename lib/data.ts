import { readFileSync, existsSync } from 'fs'
import path from 'path'
import type { ClientConfig, ClientSummary, CampaignRow, KeywordRow, AdGroupRow, LandingPageRow, MonthlyRow, QualityRow, MetaClientConfig, MetaClientSummary, MetaCampaignRow, MetaAdSetRow, MetaAdRow, MetaCreativeRow, MetaMonthlyRow } from './types'

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
  // Backfill weighted IS fields for existing summaries
  if (data.weightedIS30d === undefined) data.weightedIS30d = null
  if (data.weightedISPrev30d === undefined) data.weightedISPrev30d = null
  return data
}

export function getClientCampaigns(clientId: string): CampaignRow[] {
  const file = path.join(DATA_DIR, clientId, 'campaigns.json')
  if (!existsSync(file)) return []
  const raw = JSON.parse(readFileSync(file, 'utf-8'))
  return Array.isArray(raw) ? raw : raw.campaigns ?? []
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

// --- Meta Ads data loaders ---

const META_DIR = path.join(process.cwd(), 'data', 'meta')

export function getMetaClients(): MetaClientConfig[] {
  const file = path.join(META_DIR, 'clients.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getMetaClientSummary(clientId: string): MetaClientSummary | null {
  const file = path.join(META_DIR, clientId, 'summary.json')
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getMetaClientCampaigns(clientId: string): MetaCampaignRow[] {
  const file = path.join(META_DIR, clientId, 'campaigns.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getMetaClientAdSets(clientId: string): MetaAdSetRow[] {
  const file = path.join(META_DIR, clientId, 'adsets.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getMetaClientAds(clientId: string): MetaAdRow[] {
  const file = path.join(META_DIR, clientId, 'ads.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getMetaClientCreatives(clientId: string): MetaCreativeRow[] {
  const file = path.join(META_DIR, clientId, 'creatives.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getMetaClientMonthly(clientId: string): MetaMonthlyRow[] {
  const file = path.join(META_DIR, clientId, 'monthly.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function getMetaLastUpdated(): string | null {
  const file = path.join(META_DIR, 'last_updated.json')
  if (!existsSync(file)) return null
  const d = JSON.parse(readFileSync(file, 'utf-8'))
  return d.timestamp ?? null
}
