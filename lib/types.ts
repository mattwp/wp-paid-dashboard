export interface AccountRef {
  customerId: number
  loginCustomerId: number
  label?: string
}

export interface ClientConfig {
  id: string
  name: string
  type: 'lead-gen' | 'ecommerce'
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
  lastUpdated: string
}

export interface CampaignRow {
  name: string
  status: string
  clicks: number
  impressions: number
  costMicros: number
  conversions: number
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

export type SortDir = 'asc' | 'desc'
