import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Paid Search Performance - Master Hub',
  description: 'Paid search performance across all Webprofits clients',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="min-h-screen" style={{ background: 'var(--bg-alt)' }}>
        <header style={{
          background: 'var(--bg-base)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          height: '58px',
        }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 28px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 800, fontSize: '17px', color: 'var(--wp)', letterSpacing: '-0.02em' }}>webprofits</span>
              <span style={{ color: 'var(--border-med)', fontSize: '14px' }}>|</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Paid Search Performance — Master Hub</span>
            </div>
            <span style={{
              background: 'var(--wp-bg)',
              color: 'var(--wp)',
              border: '1px solid rgba(234,70,72,0.2)',
              borderRadius: 'var(--r-full)',
              padding: '4px 14px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Google Ads
            </span>
          </div>
        </header>
        <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 28px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
