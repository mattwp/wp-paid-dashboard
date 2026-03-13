'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Paid Search', href: '/', badge: 'Google Ads' },
  { label: 'Paid Social', href: '/paid-social', badge: 'Meta Ads' },
] as const

export default function MasterHeader() {
  const pathname = usePathname()
  const isSocial = pathname.startsWith('/paid-social')
  const activeIdx = isSocial ? 1 : 0

  return (
    <header style={{
      background: 'var(--bg-base)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      height: '58px',
    }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 28px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: 800, fontSize: '17px', color: 'var(--wp)', letterSpacing: '-0.02em' }}>webprofits</span>
          <span style={{ color: 'var(--border-med)', fontSize: '14px' }}>|</span>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {tabs.map((tab, i) => {
              const isActive = i === activeIdx
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--r-full)',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    background: isActive ? 'rgba(234,70,72,0.08)' : 'transparent',
                    color: isActive ? 'var(--wp)' : 'var(--text-secondary)',
                  }}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <span style={{
          background: isSocial ? 'rgba(37,99,235,0.08)' : 'var(--wp-bg)',
          color: isSocial ? '#2563EB' : 'var(--wp)',
          border: isSocial ? '1px solid rgba(37,99,235,0.2)' : '1px solid rgba(234,70,72,0.2)',
          borderRadius: 'var(--r-full)',
          padding: '4px 14px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {tabs[activeIdx].badge}
        </span>
      </div>
    </header>
  )
}
