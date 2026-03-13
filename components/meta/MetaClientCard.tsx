'use client'

import Link from 'next/link'
import DeltaBadge from '@/components/DeltaBadge'
import { formatMetaSpend, formatRoas, formatNumber, formatPercent, calcDelta } from '@/lib/format'
import type { MetaClientSummary } from '@/lib/types'

interface Props {
  id: string
  name: string
  type: 'lead-gen' | 'ecommerce'
  leads: string[]
  summary: MetaClientSummary | null
}

export default function MetaClientCard({ id, name, type, leads, summary }: Props) {
  const s = summary?.current30d
  const p = summary?.prev30d

  const spendDelta = s && p ? calcDelta(s.spend, p.spend) : null
  const convDelta = s && p ? calcDelta(s.conversions, p.conversions) : null

  const revDelta = s && p ? calcDelta(s.revenue, p.revenue) : null
  const roas = s && s.revenue > 0 && s.spend > 0 ? s.revenue / s.spend : null
  const prevRoas = p && p.revenue > 0 && p.spend > 0 ? p.revenue / p.spend : null
  const roasDelta = roas && prevRoas ? calcDelta(roas, prevRoas) : null

  const purchases = s ? s.conversions : 0
  const purchasesDelta = convDelta

  const cpl = s && s.conversions > 0 ? s.spend / s.conversions : null
  const prevCpl = p && p.conversions > 0 ? p.spend / p.conversions : null
  const cplDelta = cpl && prevCpl ? calcDelta(cpl, prevCpl) : null

  const ctrDelta = s && p ? calcDelta(s.ctr, p.ctr) : null

  return (
    <Link href={`/paid-social/client/${id}`} style={{ display: 'block', height: '100%' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'var(--wp)'
          el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'
          el.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'var(--border)'
          el.style.boxShadow = 'none'
          el.style.transform = 'translateY(0)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.3 }}>{name}</h2>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--r-full)',
              letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
              ...(type === 'ecommerce'
                ? { background: 'rgba(29,78,216,0.07)', color: '#1D4ED8', border: '1px solid rgba(29,78,216,0.15)' }
                : { background: 'rgba(124,58,237,0.07)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.15)' })
            }}>
              {type === 'ecommerce' ? 'eCommerce' : 'Lead gen'}
            </span>
          </div>
          {!summary && (
            <span style={{ fontSize: '11px', background: 'var(--bg-alt)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>No data</span>
          )}
        </div>

        {summary && s ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Spend (30d)</p>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{formatMetaSpend(s.spend)}</p>
              <DeltaBadge delta={spendDelta} />
            </div>
            {type === 'ecommerce' ? (
              <>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Revenue</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                    {s.revenue > 0 ? formatMetaSpend(s.revenue) : '—'}
                  </p>
                  <DeltaBadge delta={revDelta} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>ROAS</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                    {roas !== null ? formatRoas(roas) : '—'}
                  </p>
                  <DeltaBadge delta={roasDelta} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Purchases</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{purchases.toFixed(0)}</p>
                  <DeltaBadge delta={purchasesDelta} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Conversions</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{s.conversions.toFixed(0)}</p>
                  <DeltaBadge delta={convDelta} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>CPL</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                    {cpl ? formatMetaSpend(cpl) : '—'}
                  </p>
                  <DeltaBadge delta={cplDelta} higherIsBetter={false} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>CTR</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{formatPercent(s.ctr, 2)}</p>
                  <DeltaBadge delta={ctrDelta} />
                </div>
              </>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Refresh to load data</p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--wp)', fontWeight: 600 }}>View dashboard →</span>
            {leads.length > 0 && (
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{leads.join(', ')}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
