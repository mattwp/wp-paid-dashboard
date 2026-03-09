export const dynamic = 'force-dynamic'

import { getClients, getClientSummary, getLastUpdated, timeAgo } from '@/lib/data'
import ClientsGrid from '@/components/ClientsGrid'
import type { ClientSummary } from '@/lib/types'

export default function Home() {
  const clients = getClients()
  const lastUpdated = getLastUpdated()

  const summaries: Record<string, ClientSummary | null> = {}
  for (const c of clients) {
    summaries[c.id] = getClientSummary(c.id)
  }

  const withData = Object.values(summaries).filter(Boolean).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--wp)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Client overview</p>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15 }}>Paid Search Performance — Master Hub</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Last 30 days — MoM comparison</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Last refreshed</p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>{timeAgo(lastUpdated)}</p>
          {withData < clients.length && (
            <p style={{ fontSize: '12px', color: 'var(--amber)', marginTop: '2px' }}>{clients.length - withData} clients without data</p>
          )}
        </div>
      </div>

      <ClientsGrid clients={clients} summaries={summaries} />
    </div>
  )
}
