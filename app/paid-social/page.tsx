import { getMetaClients, getMetaClientSummary, getMetaClientCampaigns, getMetaLastUpdated, timeAgo } from '@/lib/data'
import MetaClientsGrid from '@/components/meta/MetaClientsGrid'
import AlertsDrawer from '@/components/AlertsDrawer'
import { computeMetaAlerts, computeMetaOpportunities } from '@/lib/meta-signals'
import type { MetaClientSummary, MetaCampaignRow } from '@/lib/types'

export default function PaidSocialHome() {
  const clients = getMetaClients()
  const lastUpdated = getMetaLastUpdated()

  const summaries: Record<string, MetaClientSummary | null> = {}
  const campaignsByClient: Record<string, MetaCampaignRow[]> = {}
  for (const c of clients) {
    summaries[c.id] = getMetaClientSummary(c.id)
    campaignsByClient[c.id] = getMetaClientCampaigns(c.id)
  }

  const alerts = computeMetaAlerts(clients, summaries)
  const opportunities = computeMetaOpportunities(clients, summaries, campaignsByClient)
  const withData = Object.values(summaries).filter(Boolean).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--wp)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Client overview</p>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15 }}>Paid Social Performance — Master Hub</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Last 30 days — MoM comparison</p>
          <AlertsDrawer alerts={alerts} opportunities={opportunities} basePath="/paid-social/client" />
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Last refreshed</p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>{timeAgo(lastUpdated)}</p>
          {withData < clients.length && (
            <p style={{ fontSize: '12px', color: 'var(--amber)', marginTop: '2px' }}>{clients.length - withData} clients without data</p>
          )}
        </div>
      </div>

      <MetaClientsGrid clients={clients} summaries={summaries} />
    </div>
  )
}
