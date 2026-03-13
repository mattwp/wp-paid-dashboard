'use client'

import { formatDelta } from '@/lib/format'

interface Props {
  delta: number | null
  higherIsBetter?: boolean
}

export default function DeltaBadge({ delta, higherIsBetter = true }: Props) {
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
