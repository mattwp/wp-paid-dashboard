'use client'

import { useState } from 'react'
import ClientCard from './ClientCard'
import type { ClientConfig, ClientSummary } from '@/lib/types'

interface Props {
  clients: ClientConfig[]
  summaries: Record<string, ClientSummary | null>
}

type Filter = 'all' | 'ecommerce' | 'lead-gen'

const FILTER_STYLES: Record<Filter, { active: React.CSSProperties; inactive: React.CSSProperties }> = {
  all: {
    active: { background: 'var(--text-primary)', color: '#fff', borderColor: 'var(--text-primary)' },
    inactive: { background: 'var(--bg-base)', color: 'var(--text-secondary)', borderColor: 'var(--border)' },
  },
  ecommerce: {
    active: { background: 'rgba(29,78,216,0.1)', color: '#1D4ED8', borderColor: 'rgba(29,78,216,0.3)' },
    inactive: { background: 'var(--bg-base)', color: 'var(--text-secondary)', borderColor: 'var(--border)' },
  },
  'lead-gen': {
    active: { background: 'rgba(124,58,237,0.1)', color: '#7C3AED', borderColor: 'rgba(124,58,237,0.3)' },
    inactive: { background: 'var(--bg-base)', color: 'var(--text-secondary)', borderColor: 'var(--border)' },
  },
}

export default function ClientsGrid({ clients, summaries }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = clients.filter(c => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || c.type === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: '8px 14px',
            fontSize: '14px',
            width: '240px',
            outline: 'none',
            background: 'var(--bg-base)',
            color: 'var(--text-primary)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--wp)'
            e.target.style.boxShadow = '0 0 0 3px var(--wp-bg)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.boxShadow = 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'ecommerce', 'lead-gen'] as Filter[]).map(f => {
            const styles = FILTER_STYLES[f]
            const isActive = filter === f
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  letterSpacing: '0.03em',
                  ...(isActive ? styles.active : styles.inactive),
                }}
              >
                {f === 'all' ? 'All' : f === 'ecommerce' ? 'eCommerce' : 'Lead gen'}
              </button>
            )
          })}
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{filtered.length} client{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(c => (
          <ClientCard key={c.id} id={c.id} name={c.name} type={c.type} summary={summaries[c.id] ?? null} />
        ))}
      </div>
    </div>
  )
}
