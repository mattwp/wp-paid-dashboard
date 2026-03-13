'use client'

import { formatDelta, deltaClass } from '@/lib/format'

interface Props {
  label: string
  value: string
  momDelta: number | null
  yoyDelta: number | null
  higherIsBetter?: boolean
}

export default function MetricTile({ label, value, momDelta, yoyDelta, higherIsBetter = true }: Props) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
      <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>MoM</span>
          <span className={`font-semibold ${deltaClass(momDelta, higherIsBetter)}`}>
            {formatDelta(momDelta)}
          </span>
        </span>
        <span style={{ fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>YoY</span>
          <span className={`font-semibold ${deltaClass(yoyDelta, higherIsBetter)}`}>
            {formatDelta(yoyDelta)}
          </span>
        </span>
      </div>
    </div>
  )
}
