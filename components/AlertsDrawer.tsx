'use client'

import { useState } from 'react'
import type { Alert, Opportunity } from '@/lib/types'

interface Props {
  alerts: Alert[]
  opportunities: Opportunity[]
  basePath?: string
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'var(--wp)',
  warning: 'var(--amber)',
}

const OPP_COLORS: Record<string, string> = {
  scale: 'var(--blue)',
  momentum: 'var(--green)',
  efficiency: 'var(--purple)',
}

type DrawerView = 'alerts' | 'opportunities' | null

export default function AlertsDrawer({ alerts, opportunities, basePath = '/client' }: Props) {
  const [view, setView] = useState<DrawerView>(null)

  const toggle = (v: DrawerView) => setView(prev => (prev === v ? null : v))

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em' }}>Click to view</span>
        <button
          onClick={() => toggle('alerts')}
          disabled={alerts.length === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--r-full)',
            fontSize: '12px',
            fontWeight: 700,
            border: '1px solid',
            cursor: alerts.length === 0 ? 'default' : 'pointer',
            transition: 'all 0.15s',
            ...(alerts.length === 0
              ? { background: 'var(--bg-alt)', color: 'var(--text-muted)', borderColor: 'var(--border)', opacity: 0.6 }
              : view === 'alerts'
                ? { background: 'rgba(234,70,72,0.1)', color: 'var(--wp)', borderColor: 'var(--wp)' }
                : { background: 'var(--bg-base)', color: 'var(--wp)', borderColor: 'rgba(234,70,72,0.3)' }),
          }}
        >
          <span style={{ fontSize: '13px' }}>!</span>
          {alerts.length} Urgent Issue{alerts.length !== 1 ? 's' : ''}
        </button>

        <button
          onClick={() => toggle('opportunities')}
          disabled={opportunities.length === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--r-full)',
            fontSize: '12px',
            fontWeight: 700,
            border: '1px solid',
            cursor: opportunities.length === 0 ? 'default' : 'pointer',
            transition: 'all 0.15s',
            ...(opportunities.length === 0
              ? { background: 'var(--bg-alt)', color: 'var(--text-muted)', borderColor: 'var(--border)', opacity: 0.6 }
              : view === 'opportunities'
                ? { background: 'rgba(37,99,235,0.1)', color: 'var(--blue)', borderColor: 'var(--blue)' }
                : { background: 'var(--bg-base)', color: 'var(--blue)', borderColor: 'rgba(37,99,235,0.3)' }),
          }}
        >
          <span style={{ fontSize: '13px' }}>^</span>
          {opportunities.length} High Impact Opp{opportunities.length !== 1 ? 's' : ''}
        </button>
      </div>

      {view && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setView(null)}
            style={{
              position: 'fixed',
              inset: 0,
              top: '58px',
              background: 'rgba(0,0,0,0.25)',
              zIndex: 90,
            }}
          />

          {/* Drawer */}
          <div
            style={{
              position: 'fixed',
              top: '58px',
              right: 0,
              bottom: 0,
              width: '420px',
              maxWidth: '100vw',
              background: 'var(--bg-base)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideIn 0.2s ease-out',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {view === 'alerts' ? 'Urgent Issues' : 'High Impact Opportunities'}
              </h2>
              <button
                onClick={() => setView(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: 'var(--text-muted)',
                  padding: '4px 8px',
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Card list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {view === 'alerts' && alerts.map((a, i) => (
                <AlertCard key={i} alert={a} basePath={basePath} />
              ))}
              {view === 'opportunities' && opportunities.map((o, i) => (
                <OppCard key={i} opp={o} basePath={basePath} />
              ))}
            </div>
          </div>

          <style>{`
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </>
  )
}

function AlertCard({ alert, basePath }: { alert: Alert; basePath: string }) {
  const color = SEVERITY_COLORS[alert.severity]
  return (
    <a
      href={`${basePath}/${alert.clientId}`}
      style={{
        display: 'block',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        borderLeft: `4px solid ${color}`,
        padding: '12px 14px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color,
          background: color + '14',
          padding: '2px 8px',
          borderRadius: 'var(--r-full)',
        }}>
          {alert.severity}
        </span>
        {alert.metric && (
          <span style={{ fontSize: '12px', fontWeight: 700, color }}>{alert.metric}</span>
        )}
      </div>
      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 2px' }}>{alert.clientName}</p>
      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 2px' }}>{alert.title}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{alert.detail}</p>
    </a>
  )
}

function OppCard({ opp, basePath }: { opp: Opportunity; basePath: string }) {
  const color = OPP_COLORS[opp.type]
  return (
    <a
      href={`${basePath}/${opp.clientId}`}
      style={{
        display: 'block',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        borderLeft: `4px solid ${color}`,
        padding: '12px 14px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color,
          background: color + '14',
          padding: '2px 8px',
          borderRadius: 'var(--r-full)',
        }}>
          {opp.type}
        </span>
        {opp.metric && (
          <span style={{ fontSize: '12px', fontWeight: 700, color }}>{opp.metric}</span>
        )}
      </div>
      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 2px' }}>{opp.clientName}</p>
      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 2px' }}>{opp.title}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{opp.detail}</p>
    </a>
  )
}
