'use client'

import { useState } from 'react'
import MetricTile from './MetricTile'
import CampaignTable from './CampaignTable'
import AdGroupTable from './AdGroupTable'
import KeywordTable from './KeywordTable'
import ImpressionSharePanel from './ImpressionSharePanel'
import LandingPageTable from './LandingPageTable'
import MonthlyChart from './MonthlyChart'
import QualityScorePanel from './QualityScorePanel'
import InsightsPanel from './InsightsPanel'
import { formatCurrency, formatNumber, formatPercent, calcDelta } from '@/lib/format'
import type { ClientSummary, CampaignRow, KeywordRow, AdGroupRow, LandingPageRow, MonthlyRow, QualityRow } from '@/lib/types'

interface Props {
  type: 'lead-gen' | 'ecommerce'
  summary: ClientSummary | null
  campaigns: CampaignRow[]
  adGroups: AdGroupRow[]
  keywords: KeywordRow[]
  landingPages: LandingPageRow[]
  monthly: MonthlyRow[]
  quality: QualityRow[]
}

type Period = '7d' | '30d'
type Tab = 'campaigns' | 'adgroups' | 'keywords' | 'quality' | 'landing-pages' | 'impression-share' | 'insights'

export default function ClientDashboard({ type, summary, campaigns, adGroups, keywords, landingPages, monthly, quality }: Props) {
  const [period, setPeriod] = useState<Period>('30d')
  const [tab, setTab] = useState<Tab>('campaigns')

  const current = period === '7d' ? summary?.current7d : summary?.current30d
  const previous = period === '7d' ? summary?.prev7d : summary?.prev30d
  const yoy = summary?.yoy30d

  const cpa = current && current.conversions > 0 ? current.costMicros / current.conversions : null
  const prevCpa = previous && previous.conversions > 0 ? previous.costMicros / previous.conversions : null
  const yoyCpa = yoy && yoy.conversions > 0 ? yoy.costMicros / yoy.conversions : null

  const roas = current && current.conversionValue > 0 && current.costMicros > 0
    ? current.conversionValue / (current.costMicros / 1_000_000)
    : null
  const prevRoas = previous && previous.conversionValue > 0 && previous.costMicros > 0
    ? previous.conversionValue / (previous.costMicros / 1_000_000)
    : null
  const yoyRoas = yoy && yoy.conversionValue > 0 && yoy.costMicros > 0
    ? yoy.conversionValue / (yoy.costMicros / 1_000_000)
    : null

  const tabs = [
    { key: 'campaigns', label: `Campaigns (${campaigns.filter(c => c.costMicros > 0).length})` },
    { key: 'adgroups', label: `Ad groups (${adGroups.filter(ag => ag.costMicros > 0).length})` },
    { key: 'keywords', label: `Keywords (${keywords.length})` },
    { key: 'quality', label: 'Quality score' },
    { key: 'landing-pages', label: `Landing pages (${landingPages.filter(p => p.costMicros > 0).length})` },
    { key: 'impression-share', label: 'Impression share' },
    { key: 'insights', label: 'Insights' },
  ] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Period toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {(['7d', '30d'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '6px 18px',
              borderRadius: 'var(--r-full)',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              background: period === p ? 'var(--wp)' : 'var(--bg-base)',
              color: period === p ? '#fff' : 'var(--text-secondary)',
              boxShadow: period === p ? '0 2px 8px var(--wp-glow)' : 'none',
              outline: '1px solid',
              outlineColor: period === p ? 'transparent' : 'var(--border)',
            }}
          >
            Last {p === '7d' ? '7 days' : '30 days'}
          </button>
        ))}
        {!summary && (
          <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No data — run a refresh</span>
        )}
      </div>

      {/* KPI tiles */}
      {summary && current && previous && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricTile
            label="Impressions"
            value={formatNumber(current.impressions)}
            momDelta={calcDelta(current.impressions, previous.impressions)}
            yoyDelta={period === '30d' ? calcDelta(current.impressions, yoy?.impressions ?? 0) : null}
          />
          <MetricTile
            label="Clicks"
            value={formatNumber(current.clicks)}
            momDelta={calcDelta(current.clicks, previous.clicks)}
            yoyDelta={period === '30d' ? calcDelta(current.clicks, yoy?.clicks ?? 0) : null}
          />
          <MetricTile
            label="CTR"
            value={formatPercent(current.ctr, 2)}
            momDelta={calcDelta(current.ctr, previous.ctr)}
            yoyDelta={period === '30d' ? calcDelta(current.ctr, yoy?.ctr ?? 0) : null}
          />
          <MetricTile
            label="Spend"
            value={formatCurrency(current.costMicros)}
            momDelta={calcDelta(current.costMicros, previous.costMicros)}
            yoyDelta={period === '30d' ? calcDelta(current.costMicros, yoy?.costMicros ?? 0) : null}
          />
          <MetricTile
            label="Conversions"
            value={current.conversions.toFixed(1)}
            momDelta={calcDelta(current.conversions, previous.conversions)}
            yoyDelta={period === '30d' ? calcDelta(current.conversions, yoy?.conversions ?? 0) : null}
          />
          {type === 'ecommerce' ? (
            <MetricTile
              label="ROAS"
              value={roas !== null ? `${roas.toFixed(2)}x` : '—'}
              momDelta={roas && prevRoas ? calcDelta(roas, prevRoas) : null}
              yoyDelta={period === '30d' && roas && yoyRoas ? calcDelta(roas, yoyRoas) : null}
            />
          ) : (
            <MetricTile
              label="CPA"
              value={cpa ? formatCurrency(cpa) : '—'}
              momDelta={cpa && prevCpa ? calcDelta(cpa, prevCpa) : null}
              yoyDelta={period === '30d' && cpa && yoyCpa ? calcDelta(cpa, yoyCpa) : null}
              higherIsBetter={false}
            />
          )}
        </div>
      )}

      {/* Monthly conversions chart */}
      <div style={{ padding: '20px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Monthly conversions — last 12 months</p>
        <MonthlyChart data={monthly} />
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '-1px',
                color: tab === t.key ? 'var(--wp)' : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                borderBottom: tab === t.key ? '2px solid var(--wp)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {tab === 'campaigns' && <CampaignTable campaigns={campaigns} />}
        {tab === 'adgroups' && <AdGroupTable adGroups={adGroups} />}
        {tab === 'keywords' && <KeywordTable keywords={keywords} />}
        {tab === 'quality' && <QualityScorePanel quality={quality} />}
        {tab === 'landing-pages' && <LandingPageTable pages={landingPages} />}
        {tab === 'impression-share' && <ImpressionSharePanel campaigns={campaigns} />}
        {tab === 'insights' && <InsightsPanel campaigns={campaigns} quality={quality} />}
      </div>
    </div>
  )
}
