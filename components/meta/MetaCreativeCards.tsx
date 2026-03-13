'use client'

import { useState } from 'react'
import { formatMetaSpend, formatPercent } from '@/lib/format'
import type { MetaCreativeRow } from '@/lib/types'

interface Props {
  creatives: MetaCreativeRow[]
  clientType: 'lead-gen' | 'ecommerce'
}

const TYPE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Image: { bg: 'rgba(37,99,235,0.07)', color: '#2563EB', border: 'rgba(37,99,235,0.15)' },
  Video: { bg: 'rgba(124,58,237,0.07)', color: '#7C3AED', border: 'rgba(124,58,237,0.15)' },
  Carousel: { bg: 'rgba(4,120,87,0.07)', color: '#047857', border: 'rgba(4,120,87,0.15)' },
  DPA: { bg: 'rgba(180,83,9,0.07)', color: '#B45309', border: 'rgba(180,83,9,0.15)' },
}

function formatCTA(cta: string): string {
  return cta.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function MetaCreativeCards({ creatives, clientType }: Props) {
  const [selected, setSelected] = useState<MetaCreativeRow | null>(null)
  const isEcom = clientType === 'ecommerce'

  const filtered = creatives
    .filter(c => c.spend >= 2000)
    .sort((a, b) => isEcom ? (b.revenue - a.revenue) : (b.conversions - a.conversions))

  if (filtered.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', background: 'var(--bg-alt)' }}>
        No creatives with $2K+ spend
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{filtered.length} creatives with $2K+ spend — ranked by {isEcom ? 'revenue' : 'conversions'}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => {
            const tc = TYPE_COLORS[c.type] ?? TYPE_COLORS.Image
            return (
              <div
                key={i}
                onClick={() => setSelected(c)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--text-muted)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  height: '160px',
                  background: 'var(--bg-alt)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid var(--border)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {c.thumbnailUrl ? (
                    <img
                      src={c.thumbnailUrl}
                      alt={c.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      {c.type}
                    </span>
                  )}
                  {/* Rank badge overlay */}
                  <span style={{
                    position: 'absolute', top: '8px', left: '8px',
                    background: 'rgba(0,0,0,0.65)', color: '#fff',
                    fontSize: '11px', fontWeight: 700,
                    padding: '2px 8px', borderRadius: '10px',
                  }}>#{i + 1}</span>
                  {/* Type badge overlay */}
                  <span style={{
                    position: 'absolute', top: '8px', right: '8px',
                    fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--r-full)',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                    backdropFilter: 'blur(4px)',
                  }}>
                    {c.type}
                  </span>
                </div>

                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {/* Headline */}
                  {c.headline && (
                    <p style={{
                      fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)',
                      lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {c.headline}
                    </p>
                  )}

                  {/* Body preview */}
                  {c.body && (
                    <p style={{
                      fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {c.body}
                    </p>
                  )}

                  {/* Fallback: show name if no headline/body */}
                  {!c.headline && !c.body && (
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </p>
                  )}

                  {/* CTA badge */}
                  {c.callToAction && (
                    <span style={{
                      alignSelf: 'flex-start',
                      fontSize: '10px', fontWeight: 600,
                      padding: '3px 8px', borderRadius: 'var(--r-full)',
                      background: 'rgba(37,99,235,0.08)', color: '#2563EB',
                      border: '1px solid rgba(37,99,235,0.15)',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {formatCTA(c.callToAction)}
                    </span>
                  )}

                  {/* Metrics grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Spend</p>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatMetaSpend(c.spend)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {isEcom ? 'Revenue' : 'Conv.'}
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {isEcom ? (c.revenue > 0 ? formatMetaSpend(c.revenue) : '—') : c.conversions.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {isEcom ? 'ROAS' : 'CPA'}
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {isEcom
                          ? (c.roas !== null ? `${c.roas.toFixed(2)}x` : '—')
                          : (c.cpa !== null ? formatMetaSpend(c.cpa) : '—')
                        }
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>CTR</p>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatPercent(c.ctr, 2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Preview Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--border)',
              maxWidth: '560px', width: '100%',
              maxHeight: 'calc(100vh - 48px)',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Modal thumbnail */}
            {selected.thumbnailUrl && (
              <div style={{
                background: 'var(--bg-alt)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                maxHeight: '320px', overflow: 'hidden',
              }}>
                <img
                  src={selected.thumbnailUrl}
                  alt={selected.name}
                  style={{ width: '100%', objectFit: 'contain', maxHeight: '320px' }}
                />
              </div>
            )}

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Header row: type badge + close */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {(() => {
                    const tc = TYPE_COLORS[selected.type] ?? TYPE_COLORS.Image
                    return (
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--r-full)',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                      }}>
                        {selected.type}
                      </span>
                    )
                  })()}
                  {selected.callToAction && (
                    <span style={{
                      fontSize: '10px', fontWeight: 600,
                      padding: '3px 8px', borderRadius: 'var(--r-full)',
                      background: 'rgba(37,99,235,0.08)', color: '#2563EB',
                      border: '1px solid rgba(37,99,235,0.15)',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {formatCTA(selected.callToAction)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '18px', color: 'var(--text-muted)', padding: '4px 8px',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Headline */}
              {selected.headline && (
                <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {selected.headline}
                </p>
              )}

              {/* Body copy */}
              {selected.body && (
                <div style={{
                  fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  background: 'var(--bg-alt)', borderRadius: 'var(--r-md)',
                  padding: '14px', border: '1px solid var(--border)',
                }}>
                  {selected.body}
                </div>
              )}

              {/* Action links */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selected.adId && (
                  <a
                    href={`https://www.facebook.com/ads/library/?id=${selected.adId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', fontWeight: 600, color: '#fff',
                      background: '#1877F2', padding: '7px 14px',
                      borderRadius: 'var(--r-md)', textDecoration: 'none',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    View in Ads Library
                  </a>
                )}
                {selected.linkUrl && (
                  <a
                    href={selected.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)',
                      background: 'var(--bg-alt)', padding: '7px 14px',
                      borderRadius: 'var(--r-md)', textDecoration: 'none',
                      border: '1px solid var(--border)',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--text-muted)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    Landing Page
                  </a>
                )}
              </div>

              {/* Metrics */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px', padding: '14px',
                background: 'var(--bg-alt)', borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)',
              }}>
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Spend</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatMetaSpend(selected.spend)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {isEcom ? 'Revenue' : 'Conversions'}
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {isEcom ? (selected.revenue > 0 ? formatMetaSpend(selected.revenue) : '—') : selected.conversions.toFixed(0)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {isEcom ? 'ROAS' : 'CPA'}
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {isEcom
                      ? (selected.roas !== null ? `${selected.roas.toFixed(2)}x` : '—')
                      : (selected.cpa !== null ? formatMetaSpend(selected.cpa) : '—')
                    }
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Impressions</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{selected.impressions.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clicks</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{selected.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>CTR</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatPercent(selected.ctr, 2)}</p>
                </div>
              </div>

              {/* Creative name (small, at bottom) */}
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                {selected.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
