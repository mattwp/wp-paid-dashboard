'use client'

import { formatCurrency } from '@/lib/format'
import type { MonthlyRow } from '@/lib/types'

interface Props {
  data: MonthlyRow[]
}

function formatMonth(m: string): string {
  const [year, month] = m.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(month) - 1]} '${year.slice(2)}`
}

function fillGaps(rows: MonthlyRow[]): MonthlyRow[] {
  if (rows.length < 2) return rows
  const byMonth = new Map(rows.map(r => [r.month, r]))
  const [startY, startM] = rows[0].month.split('-').map(Number)
  const [endY, endM] = rows[rows.length - 1].month.split('-').map(Number)
  const filled: MonthlyRow[] = []
  let y = startY, m = startM
  while (y < endY || (y === endY && m <= endM)) {
    const key = `${y}-${String(m).padStart(2, '0')}`
    filled.push(byMonth.get(key) ?? { month: key, conversions: 0, costMicros: 0 })
    m++
    if (m > 12) { m = 1; y++ }
  }
  return filled
}

export default function MonthlyChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', background: 'var(--bg-alt)' }}>
        No monthly data — run a refresh to populate
      </div>
    )
  }

  const filled = fillGaps(data)
  const maxConv = Math.max(...filled.map(d => d.conversions), 1)
  const CHART_H = 140

  const totalConv = filled.reduce((s, d) => s + d.conversions, 0)
  const totalSpend = filled.reduce((s, d) => s + d.costMicros, 0)
  const avgCpl = totalConv > 0 ? totalSpend / totalConv : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary row */}
      <div style={{ display: 'flex', gap: '24px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>12-month conversions</p>
          <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{Math.round(totalConv).toLocaleString('en-AU')}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Avg CPL</p>
          <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{avgCpl ? formatCurrency(avgCpl) : '—'}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>12-month spend</p>
          <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(totalSpend)}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ display: 'flex', gap: '4px', height: `${CHART_H}px`, alignItems: 'stretch' }}>
        {filled.map(row => {
          const barH = Math.max(Math.round((row.conversions / maxConv) * (CHART_H - 24)), 2)
          return (
            <div key={row.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {row.conversions > 0 ? Math.round(row.conversions) : ''}
              </span>
              <div style={{
                width: '100%',
                height: `${barH}px`,
                background: row.conversions > 0 ? 'var(--wp)' : 'var(--border)',
                borderRadius: '3px 3px 0 0',
              }} />
            </div>
          )
        })}
      </div>

      {/* X-axis: month labels + CPL */}
      <div style={{ display: 'flex', gap: '4px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
        {filled.map(row => {
          const cpl = row.conversions > 0 ? row.costMicros / row.conversions : null
          return (
            <div key={row.month} style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2px' }}>{formatMonth(row.month)}</p>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{cpl ? formatCurrency(cpl) : '—'}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
