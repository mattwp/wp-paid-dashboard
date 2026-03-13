'use client'

import { formatMetaSpend } from '@/lib/format'
import type { MetaMonthlyRow } from '@/lib/types'

interface Props {
  data: MetaMonthlyRow[]
  clientType: 'lead-gen' | 'ecommerce'
}

function formatMonth(m: string): string {
  const [year, month] = m.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(month) - 1]} '${year.slice(2)}`
}

function fillGaps(rows: MetaMonthlyRow[]): MetaMonthlyRow[] {
  if (rows.length < 2) return rows
  const byMonth = new Map(rows.map(r => [r.month, r]))
  const [startY, startM] = rows[0].month.split('-').map(Number)
  const [endY, endM] = rows[rows.length - 1].month.split('-').map(Number)
  const filled: MetaMonthlyRow[] = []
  let y = startY, m = startM
  while (y < endY || (y === endY && m <= endM)) {
    const key = `${y}-${String(m).padStart(2, '0')}`
    filled.push(byMonth.get(key) ?? { month: key, spend: 0, conversions: 0, revenue: 0 })
    m++
    if (m > 12) { m = 1; y++ }
  }
  return filled
}

export default function MetaMonthlyChart({ data, clientType }: Props) {
  const isEcom = clientType === 'ecommerce'

  if (data.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', background: 'var(--bg-alt)' }}>
        No monthly data — run a refresh to populate
      </div>
    )
  }

  const filled = fillGaps(data)
  const primaryValues = filled.map(d => isEcom ? d.revenue : d.conversions)
  const maxVal = Math.max(...primaryValues, 1)
  const CHART_H = 140

  const totalPrimary = primaryValues.reduce((s, v) => s + v, 0)
  const totalSpend = filled.reduce((s, d) => s + d.spend, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary row */}
      <div style={{ display: 'flex', gap: '24px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
            12-month {isEcom ? 'revenue' : 'conversions'}
          </p>
          <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {isEcom ? formatMetaSpend(totalPrimary) : Math.round(totalPrimary).toLocaleString('en-AU')}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
            {isEcom ? 'Avg ROAS' : 'Avg CPL'}
          </p>
          <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {isEcom
              ? (totalSpend > 0 ? `${(totalPrimary / totalSpend).toFixed(2)}x` : '—')
              : (totalPrimary > 0 ? formatMetaSpend(totalSpend / totalPrimary) : '—')
            }
          </p>
        </div>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>12-month spend</p>
          <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{formatMetaSpend(totalSpend)}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ display: 'flex', gap: '4px', height: `${CHART_H}px`, alignItems: 'stretch' }}>
        {filled.map((row, idx) => {
          const val = primaryValues[idx]
          const barH = Math.max(Math.round((val / maxVal) * (CHART_H - 24)), 2)
          return (
            <div key={row.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {val > 0 ? (isEcom ? formatMetaSpend(val) : Math.round(val)) : ''}
              </span>
              <div style={{
                width: '100%',
                height: `${barH}px`,
                background: val > 0 ? 'var(--wp)' : 'var(--border)',
                borderRadius: '3px 3px 0 0',
              }} />
            </div>
          )
        })}
      </div>

      {/* X-axis: month labels + ROAS/CPA */}
      <div style={{ display: 'flex', gap: '4px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
        {filled.map((row, idx) => {
          const val = primaryValues[idx]
          const secondaryLabel = isEcom
            ? (row.spend > 0 && row.revenue > 0 ? `${(row.revenue / row.spend).toFixed(1)}x` : '—')
            : (val > 0 ? formatMetaSpend(row.spend / val) : '—')
          return (
            <div key={row.month} style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2px' }}>{formatMonth(row.month)}</p>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{secondaryLabel}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
