'use client'

import { useState } from 'react'
import MetricTile from '@/components/MetricTile'
import MetaCampaignTable from './MetaCampaignTable'
import MetaAdSetTable from './MetaAdSetTable'
import MetaAdTable from './MetaAdTable'
import MetaCreativeCards from './MetaCreativeCards'
import MetaMonthlyChart from './MetaMonthlyChart'
import { formatMetaSpend, formatRoas, formatNumber, formatPercent, calcDelta } from '@/lib/format'
import type { MetaClientSummary, MetaCampaignRow, MetaAdSetRow, MetaAdRow, MetaCreativeRow, MetaMonthlyRow } from '@/lib/types'

interface Props {
  type: 'lead-gen' | 'ecommerce'
  summary: MetaClientSummary | null
  campaigns: MetaCampaignRow[]
  adSets: MetaAdSetRow[]
  ads: MetaAdRow[]
  creatives: MetaCreativeRow[]
  monthly: MetaMonthlyRow[]
}

type Period = '7d' | '30d'
type Tab = 'campaigns' | 'adsets' | 'ads' | 'creatives' | 'monthly'

export default function MetaClientDashboard({ type, summary, campaigns, adSets, ads, creatives, monthly }: Props) {
  const [period, setPeriod] = useState<Period>('30d')
  const [tab, setTab] = useState<Tab>('campaigns')

  const current = period === '7d' ? summary?.current7d : summary?.current30d
  const previous = period === '7d' ? summary?.prev7d : summary?.prev30d
  const yoy = summary?.yoy30d

  const roas = current && current.revenue > 0 && current.spend > 0 ? current.revenue / current.spend : null
  const prevRoas = previous && previous.revenue > 0 && previous.spend > 0 ? previous.revenue / previous.spend : null
  const yoyRoas = yoy && yoy.revenue > 0 && yoy.spend > 0 ? yoy.revenue / yoy.spend : null

  const cpa = current && current.conversions > 0 ? current.spend / current.conversions : null
  const prevCpa = previous && previous.conversions > 0 ? previous.spend / previous.conversions : null
  const yoyCpa = yoy && yoy.conversions > 0 ? yoy.spend / yoy.conversions : null

  const convRate = current && current.clicks > 0 ? current.conversions / current.clicks : null
  const prevConvRate = previous && previous.clicks > 0 ? previous.conversions / previous.clicks : null
  const yoyConvRate = yoy && yoy.clicks > 0 ? yoy.conversions / yoy.clicks : null

  const tabs = [
    { key: 'campaigns', label: `Campaigns (${campaigns.length})` },
    { key: 'adsets', label: `Ad Sets (${adSets.length})` },
    { key: 'ads', label: `Ads (${ads.length})` },
    { key: 'creatives', label: `Creatives (${creatives.filter(c => c.spend >= 2000).length})` },
    { key: 'monthly', label: 'Monthly Trend' },
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
            label="Spend"
            value={formatMetaSpend(current.spend)}
            momDelta={calcDelta(current.spend, previous.spend)}
            yoyDelta={period === '30d' ? calcDelta(current.spend, yoy?.spend ?? 0) : null}
          />
          {type === 'ecommerce' ? (
            <>
              <MetricTile
                label="Revenue"
                value={current.revenue > 0 ? formatMetaSpend(current.revenue) : '—'}
                momDelta={current.revenue && previous.revenue ? calcDelta(current.revenue, previous.revenue) : null}
                yoyDelta={period === '30d' && current.revenue && yoy?.revenue ? calcDelta(current.revenue, yoy.revenue) : null}
              />
              <MetricTile
                label="ROAS"
                value={formatRoas(roas)}
                momDelta={roas && prevRoas ? calcDelta(roas, prevRoas) : null}
                yoyDelta={period === '30d' && roas && yoyRoas ? calcDelta(roas, yoyRoas) : null}
              />
              <MetricTile
                label="Purchases"
                value={current.conversions.toFixed(0)}
                momDelta={calcDelta(current.conversions, previous.conversions)}
                yoyDelta={period === '30d' ? calcDelta(current.conversions, yoy?.conversions ?? 0) : null}
              />
            </>
          ) : (
            <>
              <MetricTile
                label="Conversions"
                value={current.conversions.toFixed(0)}
                momDelta={calcDelta(current.conversions, previous.conversions)}
                yoyDelta={period === '30d' ? calcDelta(current.conversions, yoy?.conversions ?? 0) : null}
              />
              <MetricTile
                label="CPL"
                value={cpa ? formatMetaSpend(cpa) : '—'}
                momDelta={cpa && prevCpa ? calcDelta(cpa, prevCpa) : null}
                yoyDelta={period === '30d' && cpa && yoyCpa ? calcDelta(cpa, yoyCpa) : null}
                higherIsBetter={false}
              />
              <MetricTile
                label="Conv Rate"
                value={convRate ? formatPercent(convRate, 2) : '—'}
                momDelta={convRate && prevConvRate ? calcDelta(convRate, prevConvRate) : null}
                yoyDelta={period === '30d' && convRate && yoyConvRate ? calcDelta(convRate, yoyConvRate) : null}
              />
            </>
          )}
          <MetricTile
            label="CPM"
            value={current.cpm > 0 ? formatMetaSpend(current.cpm) : '—'}
            momDelta={current.cpm && previous.cpm ? calcDelta(current.cpm, previous.cpm) : null}
            yoyDelta={period === '30d' && current.cpm && yoy?.cpm ? calcDelta(current.cpm, yoy.cpm) : null}
            higherIsBetter={false}
          />
          <MetricTile
            label="CTR"
            value={formatPercent(current.ctr, 2)}
            momDelta={calcDelta(current.ctr, previous.ctr)}
            yoyDelta={period === '30d' ? calcDelta(current.ctr, yoy?.ctr ?? 0) : null}
          />
        </div>
      )}

      {/* Monthly chart */}
      <div style={{ padding: '20px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          Monthly {type === 'ecommerce' ? 'revenue' : 'conversions'} — last 12 months
        </p>
        <MetaMonthlyChart data={monthly} clientType={type} />
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
        {tab === 'campaigns' && <MetaCampaignTable campaigns={campaigns} clientType={type} />}
        {tab === 'adsets' && <MetaAdSetTable adSets={adSets} clientType={type} />}
        {tab === 'ads' && <MetaAdTable ads={ads} clientType={type} />}
        {tab === 'creatives' && <MetaCreativeCards creatives={creatives} clientType={type} />}
        {tab === 'monthly' && <MetaMonthlyChart data={monthly} clientType={type} />}
      </div>
    </div>
  )
}
