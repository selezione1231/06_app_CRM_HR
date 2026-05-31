import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check, ShieldCheck } from 'lucide-react'
import { ROLES, ROLE_LABELS } from '../../lib/navigation'

// ============================================================================
// RoleSwitcher — selettore di ruoli multi-select (header)
// ----------------------------------------------------------------------------
// In modalità demo permette di simulare un utente con N ruoli simultanei.
// In produzione i ruoli verranno dal DB (employee_roles) e il selettore
// servirà solo se l'utente ha più ruoli (es. "agisci come HR" / "agisci come PM").
// ============================================================================

const ROLE_GROUPS = [
  {
    title: 'Operativi',
    items: [ROLES.EMPLOYEE, ROLES.TEAM_LEADER, ROLES.PM, ROLES.NETIMPL]
  },
  {
    title: 'Staff',
    items: [ROLES.HR, ROLES.HSE, ROLES.SERVIZI_GEN, ROLES.IT, ROLES.ACQUISTI, ROLES.FINANCE, ROLES.SALES, ROLES.QUALITY, ROLES.DIREZIONE]
  },
  {
    title: 'Sistema',
    items: [ROLES.ADMIN]
  }
]

export default function RoleSwitcher({ selectedRoles = [], onChange, disabled = false, isDemo = true }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const toggle = (role) => {
    if (selectedRoles.includes(role)) {
      onChange(selectedRoles.filter(r => r !== role))
    } else {
      onChange([...selectedRoles, role])
    }
  }

  // Label di sintesi
  const label = selectedRoles.length === 0
    ? 'Nessun ruolo'
    : selectedRoles.length === 1
      ? ROLE_LABELS[selectedRoles[0]]
      : `${selectedRoles.length} ruoli`

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        title="Cambia ruoli attivi"
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px', height: '30px', boxSizing: 'border-box',
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)', fontSize: '0.72rem', fontWeight: 700,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1
        }}
      >
        <ShieldCheck size={12} color="var(--primary)" />
        <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          {isDemo ? 'Ruoli (demo):' : 'Ruoli:'}
        </span>
        <span>{label}</span>
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '36px', right: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          padding: '8px', width: '260px', zIndex: 1000,
          maxHeight: '420px', overflowY: 'auto'
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '4px 8px 8px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
            {isDemo ? 'Modalità demo: seleziona i ruoli per simulare l\'utente' : 'I tuoi ruoli attivi'}
          </div>

          {ROLE_GROUPS.map(group => (
            <div key={group.title} style={{ marginBottom: '6px' }}>
              <div style={{
                fontSize: '0.6rem', textTransform: 'uppercase',
                color: 'var(--text-muted)', fontWeight: 800,
                padding: '6px 8px 2px', letterSpacing: '0.06em'
              }}>{group.title}</div>
              {group.items.map(r => {
                const active = selectedRoles.includes(r)
                return (
                  <button
                    key={r}
                    onClick={() => toggle(r)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      width: '100%', padding: '6px 8px',
                      background: active ? 'var(--primary-light)' : 'transparent',
                      border: 'none', borderRadius: '4px',
                      color: active ? 'var(--primary)' : 'var(--text-primary)',
                      fontWeight: active ? 700 : 500, fontSize: '0.78rem',
                      cursor: 'pointer', textAlign: 'left'
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-app)' }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{
                      width: '14px', height: '14px', borderRadius: '3px',
                      border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border-color)'}`,
                      background: active ? 'var(--primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {active && <Check size={10} color="white" />}
                    </span>
                    <span style={{ flex: 1 }}>{ROLE_LABELS[r]}</span>
                  </button>
                )
              })}
            </div>
          ))}

          {/* Quick presets */}
          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '4px', padding: '8px 4px 0', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button onClick={() => onChange(Object.values(ROLES))} style={presetBtn}>Tutti</button>
            <button onClick={() => onChange([ROLES.EMPLOYEE])} style={presetBtn}>Solo dipendente</button>
            <button onClick={() => onChange([ROLES.PM, ROLES.EMPLOYEE])} style={presetBtn}>PM</button>
            <button onClick={() => onChange([ROLES.HR, ROLES.EMPLOYEE])} style={presetBtn}>HR</button>
            <button onClick={() => onChange([])} style={{ ...presetBtn, color: 'var(--danger)' }}>Reset</button>
          </div>
        </div>
      )}
    </div>
  )
}

const presetBtn = {
  background: 'var(--bg-app)', border: '1px solid var(--border-color)',
  borderRadius: '4px', padding: '3px 8px',
  fontSize: '0.65rem', fontWeight: 700,
  color: 'var(--text-secondary)',
  cursor: 'pointer'
}
