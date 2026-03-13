import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getClients, getClientSummary, getClientCampaigns, getClientKeywords, getClientAdGroups, getClientLandingPages, getClientMonthly, getClientQuality, timeAgo } from '@/lib/data'
import ClientDashboard from '@/components/ClientDashboard'

export function generateStaticParams() {
  return getClients().map(c => ({ id: c.id }))
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientPage({ params }: Props) {
  const { id } = await params
  const clients = getClients()
  const client = clients.find(c => c.id === id)
  if (!client) notFound()

  const summary = getClientSummary(id)
  const campaigns = getClientCampaigns(id)
  const adGroups = getClientAdGroups(id)
  const keywords = getClientKeywords(id)
  const landingPages = getClientLandingPages(id)
  const monthly = getClientMonthly(id)
  const quality = getClientQuality(id)

  const accountLabels = client.accounts.map(a => a.label ?? `${a.customerId}`).join(', ')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', textDecoration: 'none', fontWeight: 500 }}>
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
            </div>
            {summary && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0, marginTop: '4px' }}>
                Data as of {timeAgo(summary.lastUpdated)}
              </p>
            )}
          </div>
        </div>
      </div>

      <ClientDashboard type={client.type} summary={summary} campaigns={campaigns} adGroups={adGroups} keywords={keywords} landingPages={landingPages} monthly={monthly} quality={quality} />
    </div>
  )
}
