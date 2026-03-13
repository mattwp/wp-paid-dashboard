export interface AccountRef {
  customerId: number
  loginCustomerId: number
  label?: string
}

export interface ClientConfig {
  id: string
  name: string
  type: 'lead-gen' | 'ecommerce'
  lead?: string
  accounts: AccountRef[]
}

export interface PeriodMetrics {
  clicks: number
  impressions: number
  costMicros: number
  conversions: number
  conversionValue: number
  ctr: number
  averageCpc: number
}

export interface ClientSummary {
  clientId: string
  clientName: string
  current7d: PeriodMetrics
  prev7d: PeriodMetrics
  current30d: PeriodMetrics
  prev30d: PeriodMetrics
  yoy30d: PeriodMetrics
  weightedIS30d: number | null
  weightedISPrev30d: number | null
  lastUpdated: string
}

export interface CampaignRow {
  name: string
  status: string
  clicks: number
  impressions: number
  costMicros: number
  conversions: number
  conversionValue?: number
  ctr: number
  averageCpc: number
  searchImpressionShare: number | null
  searchTopImpressionShare: number | null
  searchAbsoluteTopImpressionShare: number | null
  searchBudgetLostImpressionShare: number | null
  searchRankLostImpressionShare: number | null
}

export interface KeywordRow {
  keyword: string
  matchType: string
  campaign: string
  adGroup: string
  clicks: number
  impressions: number
  costMicros: number
  conversions: number
  conversionValue?: number
  averageCpc: number
  searchImpressionShare: number | null
}

export interface AdGroupRow {
  name: string
  campaign: string
  status: string
  clicks: number
  impressions: number
  costMicros: number
  conversions: number
  ctr: number | null
  averageCpc: number | null
  searchImpressionShare: number | null
  searchTopImpressionShare: number | null
  searchAbsoluteTopImpressionShare: number | null
}

export interface LandingPageRow {
  url: string
  clicks: number
  impressions: number
  costMicros: number
  conversions: number
  ctr: number | null
  averageCpc: number | null
}

export interface MonthlyRow {
  month: string  // "2025-03"
  conversions: number
  costMicros: number
}

export interface QualityRow {
  keyword: string
  matchType: string
  campaign: string
  adGroup: string
  qualityScore: number | null
  creativeQualityScore: string | null
  postClickQualityScore: string | null
  searchPredictedCtr: string | null
}

// --- Meta Ads types ---

export interface MetaAccountRef {
  accountId: string
  label?: string
}

export interface MetaClientConfig {
  id: string
  name: string
  type: 'lead-gen' | 'ecommerce'
  leads: string[]
  accounts: MetaAccountRef[]
}

export interface MetaPeriodMetrics {
  spend: number
  impressions: number
  reach: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  cpm: number
  cpc: number
  frequency: number
}

export interface MetaClientSummary {
  clientId: string
  clientName: string
  current7d: MetaPeriodMetrics
  prev7d: MetaPeriodMetrics
  current30d: MetaPeriodMetrics
  prev30d: MetaPeriodMetrics
  yoy30d: MetaPeriodMetrics
  lastUpdated: string
}

export interface MetaCampaignRow {
  name: string
  status: string
  objective: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  cpm: number
  roas: number | null
  cpa: number | null
}

export interface MetaAdSetRow {
  name: string
  campaign: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  roas: number | null
  cpa: number | null
  targeting: string
}

export interface MetaAdRow {
  name: string
  adSet: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  roas: number | null
  cpa: number | null
  creativeType: string
  adId?: string
  thumbnailUrl?: string
  body?: string
  headline?: string
  linkUrl?: string
  callToAction?: string
}

export interface MetaCreativeRow {
  name: string
  type: 'Image' | 'Video' | 'Carousel' | 'DPA'
  adId?: string
  thumbnailUrl?: string
  body?: string
  headline?: string
  linkUrl?: string
  callToAction?: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  roas: number | null
  cpa: number | null
}

export interface MetaMonthlyRow {
  month: string
  spend: number
  conversions: number
  revenue: number
}

// --- Shared types ---

export type SortDir = 'asc' | 'desc'

export type AlertSeverity = 'critical' | 'warning'
export type OpportunityType = 'scale' | 'momentum' | 'efficiency'

export interface Alert {
  clientId: string
  clientName: string
  clientType: 'lead-gen' | 'ecommerce'
  severity: AlertSeverity
  title: string
  detail: string
  metric?: string
}

export interface Opportunity {
  clientId: string
  clientName: string
  clientType: 'lead-gen' | 'ecommerce'
  type: OpportunityType
  title: string
  detail: string
  metric?: string
}
