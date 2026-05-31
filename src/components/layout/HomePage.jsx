import React from 'react'
import {
  Clock, CalendarDays, FileText, AlertOctagon, Sparkles,
  ClipboardList, MessageSquare, CheckCircle2, Briefcase, Users2,
  ExternalLink, Smartphone
} from 'lucide-react'
import { ROLE_LABELS } from '../../lib/navigation'
import { APP_MODE, getOtherAppUrl } from '../../lib/appMode'

// ============================================================================
// HomePage — "La mia giornata"
// Mostra un summary contestuale in base ai ruoli dell'utente:
//   - Cards personali (timbrature aperte, prossime ferie, scadenze docs)
//   - Cards per ogni ruolo aggiuntivo (PM → richieste pendenti, HR → ricerche
//     attive, HSE → scadenze sicurezza, Acquisti → fatture da controllare)
//   - AI Copilot card (Gemini) per query in linguaggio naturale
// ============================================================================

export default function HomePage({ userRoles = [], userName, onNavigate, isDemo }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '1.6rem', fontWeight: 800,
          color: 'var(--text-primary, #1e293b)', margin: 0, letterSpacing: '-0.02em'
        }}>
          {greeting}{userName ? `, ${userName.split(' ')[0]}` : ''} 👋
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted, #64748b)', margin: '4px 0 0' }}>
          Ecco un riepilogo della tua giornata su Todos Hub.
          {isDemo && <span style={{ marginLeft: '8px', padding: '2px 8px', background: '#fef9c3', color: '#713f12', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>DEMO MODE</span>}
        </p>
      </div>

      {/* Banner accesso Personal app (per timbrare, ferie, buste paga) */}
      <a
        href={getOtherAppUrl(APP_MODE.HUB)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '12px', padding: '14px 18px', marginBottom: '20px',
          background: 'linear-gradient(135deg, var(--primary, #A82238) 0%, var(--primary-dark, #7d1a2a) 100%)',
          color: 'white', borderRadius: '12px', textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(168,34,56,0.25)',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Smartphone size={22} />
          <div>
            <div style={{ fontWeight: 800 }}>Vai alla tua area personale</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
              Timbra ore · Richiedi ferie · Buste paga · Documenti
            </div>
          </div>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
          noi.todos.it <ExternalLink size={14} />
        </span>
      </a>

      {/* Cards per PM/NetImpl */}
      {hasAny(userRoles, ['pm', 'netimpl', 'team_leader']) && (
        <Section title="Lavoro operativo">
          <CardGrid>
            <SummaryCard
              icon={ClipboardList}
              title="Richieste ferie da approvare"
              value="3"
              accent="warning"
              onClick={() => onNavigate({ id: 'ops-app-leave' })}
            />
            <SummaryCard
              icon={CheckCircle2}
              title="Ore da approvare"
              value="5"
              accent="primary"
              onClick={() => onNavigate({ id: 'ops-app-hours' })}
            />
            <SummaryCard
              icon={MessageSquare}
              title="Note non lette"
              value="2"
              accent="danger"
              onClick={() => onNavigate({ id: 'ops-app-notes' })}
            />
            <SummaryCard
              icon={Users2}
              title="Dipendenti senza cantiere"
              value="1"
              accent="warning"
              onClick={() => onNavigate({ id: 'ops-weekly' })}
            />
          </CardGrid>
        </Section>
      )}

      {/* Cards per HR */}
      {hasAny(userRoles, ['hr']) && (
        <Section title="HR">
          <CardGrid>
            <SummaryCard
              icon={Briefcase}
              title="Ricerche attive"
              value="2"
              accent="info"
              onClick={() => onNavigate({ id: 'hr-active' })}
            />
            <SummaryCard
              icon={CalendarDays}
              title="Appuntamenti settimana"
              value="3"
              accent="primary"
              onClick={() => onNavigate({ id: 'hr-appointments' })}
            />
          </CardGrid>
        </Section>
      )}

      {/* Scadenze (visibile a staff) */}
      {hasAny(userRoles, ['pm', 'netimpl', 'hr', 'hse', 'servizi_gen', 'it', 'acquisti', 'finance', 'admin', 'direzione']) && (
        <Section title="Centro Scadenze">
          <CardGrid>
            <SummaryCard
              icon={AlertOctagon}
              title="Scadenze entro 15 giorni"
              value="6"
              accent="warning"
              onClick={() => onNavigate({ id: 'ins-expiries' })}
            />
          </CardGrid>
        </Section>
      )}

      {/* AI Copilot teaser */}
      <Section title="Assistente AI">
        <div style={{
          background: 'linear-gradient(135deg, #fce4e8 0%, #f3e8ff 100%)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'var(--primary, #A82238)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>Chiedi a Todos AI</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)' }}>
                "Quanti operai ho oggi in Lombardia?" · "Marginalità cantiere Caravaggio?"
              </div>
            </div>
          </div>
          <button
            disabled
            title="Coming soon"
            style={{
              padding: '10px 18px',
              background: 'white',
              border: '1px solid var(--primary, #A82238)',
              borderRadius: '8px',
              color: 'var(--primary, #A82238)',
              fontWeight: 700,
              cursor: 'not-allowed',
              opacity: 0.6
            }}
          >
            Coming soon
          </button>
        </div>
      </Section>

      {/* Ruoli attivi */}
      <div style={{ marginTop: '32px', padding: '12px 16px', background: 'var(--bg-alt, #f1f5f9)', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', fontWeight: 700, marginBottom: '6px' }}>
          I tuoi ruoli attivi
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {userRoles.map(r => (
            <span key={r} style={{
              padding: '3px 10px',
              background: 'white',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 600
            }}>{ROLE_LABELS[r] || r}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------- helpers --------------------------------------------------------
const hasAny = (userRoles, needed) => needed.some(r => userRoles.includes(r))

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h2 style={{
        fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em',
        fontWeight: 800, color: 'var(--text-muted, #64748b)', margin: '0 0 10px'
      }}>{title}</h2>
      {children}
    </div>
  )
}

function CardGrid({ children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '12px'
    }}>{children}</div>
  )
}

function ActionCard({ icon: Icon, title, desc, cta, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'white', border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '12px', padding: '16px', textAlign: 'left',
      cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px',
      transition: 'all 0.15s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px',
        background: 'var(--primary-light, #fce4e8)', color: 'var(--primary, #A82238)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={18} />
      </div>
      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', flex: 1 }}>{desc}</div>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary, #A82238)' }}>{cta} →</div>
    </button>
  )
}

function SummaryCard({ icon: Icon, title, value, accent = 'primary', onClick }) {
  const colors = {
    primary: { bg: '#fce4e8', fg: '#A82238' },
    warning: { bg: '#fef9c3', fg: '#a16207' },
    danger:  { bg: '#fee2e2', fg: '#dc2626' },
    info:    { bg: '#dbeafe', fg: '#1e40af' },
    success: { bg: '#dcfce7', fg: '#16a34a' }
  }
  const c = colors[accent]
  return (
    <button onClick={onClick} style={{
      background: 'white', border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '12px', padding: '16px', textAlign: 'left',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px',
      transition: 'all 0.15s'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.fg }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)' }}
    >
      <div style={{
        width: '42px', height: '42px', borderRadius: '10px',
        background: c.bg, color: c.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: c.fg, lineHeight: 1 }}>{value}</div>
      </div>
    </button>
  )
}
