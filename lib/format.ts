export function formatCurrency(micros: number): string {
  const dollars = micros / 1_000_000
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`
  return `$${dollars.toFixed(0)}`
}

export function formatDollars(dollars: number): string {
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`
  return `$${dollars.toFixed(0)}`
}

export function formatCurrencyFull(micros: number): string {
  const dollars = micros / 1_000_000
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(dollars)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-AU').format(Math.round(n))
}

export function formatPercent(n: number | null, decimals = 1): string {
  if (n === null || isNaN(n)) return '—'
  return `${(n * 100).toFixed(decimals)}%`
}

export function formatCpc(micros: number): string {
  if (!micros) return '—'
  return `$${(micros / 1_000_000).toFixed(2)}`
}

export function calcDelta(current: number, previous: number): number | null {
  if (!previous) return null
  return (current - previous) / previous
}

export function formatDelta(delta: number | null): string {
  if (delta === null) return '—'
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${(delta * 100).toFixed(1)}%`
}

export function deltaClass(delta: number | null, higherIsBetter = true): string {
  if (delta === null) return 'text-[#888888]'
  const positive = higherIsBetter ? delta > 0 : delta < 0
  const negative = higherIsBetter ? delta < 0 : delta > 0
  if (positive) return 'text-emerald-600'
  if (negative) return 'text-[#EA4648]'
  return 'text-[#888888]'
}

export function formatMetaSpend(dollars: number): string {
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`
  return `$${dollars.toFixed(0)}`
}

export function formatRoas(roas: number | null): string {
  if (roas === null || roas === 0) return '—'
  return `${roas.toFixed(2)}x`
}

export function formatFrequency(freq: number | null): string {
  if (freq === null || freq === 0) return '—'
  return freq.toFixed(1)
}

export function timeAgo(isoString: string | null): string {
  if (!isoString) return 'Never'
  const diff = Date.now() - new Date(isoString).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'Less than 1 hour ago'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
