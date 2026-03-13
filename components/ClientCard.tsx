'use client'

import Link from 'next/link'
import { formatCurrency, formatCpc, formatPercent, formatNumber, formatDelta, calcDelta } from '@/lib/format'
import type { ClientSummary } from '@/lib/types'

interface Props {
  id: string
  name: string
  type: 'lead-gen' | 'ecommerce'
  summary: ClientSummary | null
}

function DeltaBadge({ delta, higherIsBetter = true }: { delta: number | null; higherIsBetter?: boolean }) {
  if (delta === null) return <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
  const isPositive = higherIsBetter ? delta >= 0 : delta < 0
  const style = isPositive
    ? { background: 'rgba(4,120,87,0.07)', color: '#047857' }
    : { background: 'var(--wp-bg)', color: 'var(--wp)' }
  return (
    <span style={{ ...style, fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: 'var(--r-full)' }}>
      {formatDelta(delta)}
    </span>
  )
}

export default function ClientCard({ id, name, type, summary }: Props) {
  const s = summary?.current30d
  const p = summary?.prev30d

  const spendDelta = s && p ? calcDelta(s.costMicros, p.costMicros) : null
  const convDelta = s && p ? calcDelta(s.conversions, p.conversions) : null
  const cpaDelta = s && p && s.conversions && p.conversions
    ? calcDelta(s.costMicros / s.conversions, p.costMicros / p.conversions)
    : null
  const revDelta = s && p ? calcDelta(s.conversionValue, p.conversionValue) : null

  const roas = s && s.conversionValue > 0 && s.costMicros > 0
    ? (s.conversionValue / (s.costMicros / 1_000_000))
    : null
  const prevRoas = p && p.conversionValue > 0 && p.costMicros > 0
    ? (p.conversionValue / (p.costMicros / 1_000_000))
    : null
  const roasDelta = roas && prevRoas ? calcDelta(roas, prevRoas) : null

  return (
    <Link href={`/client/${id}`} style={{ display: 'block', height: '100%' }}>
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

        {summary ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Spend (30d)</p>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{formatCurrency(s!.costMicros)}</p>
              <DeltaBadge delta={spendDelta} />
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Conversions</p>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{s!.conversions.toFixed(0)}</p>
              <DeltaBadge delta={convDelta} />
            </div>
            {type === 'ecommerce' ? (
              <>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Revenue</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                    {s!.conversionValue > 0 ? formatCurrency(s!.conversionValue * 1_000_000) : '—'}
                  </p>
                  <DeltaBadge delta={revDelta} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>ROAS</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                    {roas !== null ? `${roas.toFixed(2)}x` : '—'}
                  </p>
                  <DeltaBadge delta={roasDelta} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Search IS</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{summary.weightedIS30d !== null ? formatPercent(summary.weightedIS30d) : '—'}</p>
                  <DeltaBadge delta={summary.weightedIS30d !== null && summary.weightedISPrev30d !== null ? calcDelta(summary.weightedIS30d, summary.weightedISPrev30d) : null} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>CPA</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                    {s!.conversions > 0 ? formatCpc(s!.costMicros / s!.conversions) : '—'}
                  </p>
                  <DeltaBadge delta={cpaDelta} higherIsBetter={false} />
                </div>
              </>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Refresh to load data</p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', color: 'var(--wp)', fontWeight: 600 }}>View dashboard →</span>
        </div>
      </div>
    </Link>
  )
}
