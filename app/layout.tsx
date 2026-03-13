import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import MasterHeader from '@/components/MasterHeader'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Paid Performance - Master Hub',
  description: 'Paid media performance across all Webprofits clients',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="min-h-screen" style={{ background: 'var(--bg-alt)' }}>
        <MasterHeader />
        <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 28px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
