export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMetaClients, getMetaClientSummary, getMetaClientCampaigns, getMetaClientAdSets, getMetaClientAds, getMetaClientCreatives, getMetaClientMonthly, timeAgo } from '@/lib/data'
import MetaClientDashboard from '@/components/meta/MetaClientDashboard'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MetaClientPage({ params }: Props) {
  const { id } = await params
  const clients = getMetaClients()
  const client = clients.find(c => c.id === id)
  if (!client) notFound()

  const summary = getMetaClientSummary(id)
  const campaigns = getMetaClientCampaigns(id)
  const adSets = getMetaClientAdSets(id)
  const ads = getMetaClientAds(id)
  const creatives = getMetaClientCreatives(id)
  const monthly = getMetaClientMonthly(id)

  const accountLabels = client.accounts.map(a => a.label ?? a.accountId).join(', ')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <Link href="/paid-social" style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', textDecoration: 'none', fontWeight: 500 }}>
          ← All clients
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--wp)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>Client dashboard</p>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{client.name}</h1>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {client.accounts.length} account{client.accounts.length > 1 ? 's' : ''}: {accountLabels}
              </p>
              {client.leads.length > 0 && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Lead{client.leads.length > 1 ? 's' : ''}: {client.leads.join(', ')}
                </p>
              )}
            </div>
            {summary && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0, marginTop: '4px' }}>
                Data as of {timeAgo(summary.lastUpdated)}
              </p>
            )}
          </div>
        </div>
      </div>

      <MetaClientDashboard type={client.type} summary={summary} campaigns={campaigns} adSets={adSets} ads={ads} creatives={creatives} monthly={monthly} />
    </div>
  )
}
