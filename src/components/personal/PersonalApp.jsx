import React, { useState, useEffect } from 'react'
import { ChevronLeft, LogOut, ExternalLink, Mic, Bell, User, ShieldCheck } from 'lucide-react'

import EmpHome from '../workpro/employee/EmpHome'
import EmpMyTodos from '../workpro/employee/EmpMyTodos'
import EmpPersonalPlanning from '../workpro/employee/EmpPersonalPlanning'
import EmpTeamDestinations from '../workpro/employee/EmpTeamDestinations'
import EmpHoursEntry from '../workpro/employee/EmpHoursEntry'
import EmpClockIn from '../workpro/employee/EmpClockIn'
import EmpLeaveRequest from '../workpro/employee/EmpLeaveRequest'
import EmpLeaveStatus from '../workpro/employee/EmpLeaveStatus'
import EmpEquipment from '../workpro/employee/EmpEquipment'
import EmpPayslips from '../workpro/employee/EmpPayslips'
import { WP_EMPLOYEES } from '../workpro/shared/wpSeed'
import { WP_COLORS, WP_GLOBAL_CSS } from '../workpro/shared/wpStyles'
import { canAccessHub, getOtherAppUrl, APP_MODE } from '../../lib/appMode'
import NotificationCenter from '../layout/NotificationCenter'

// ============================================================================
// PersonalApp — APP PERSONALE (noi.todos.it)
// ----------------------------------------------------------------------------
// Layout responsive vero (non più "preview con cornice telefono"):
//   - Mobile: a tutto schermo
//   - Tablet/desktop: contenitore centrato max 480px (look "app")
//
// Per chi ha ruoli ufficio, bottone "Vai al lavoro ↗" porta a Hub.
// ============================================================================

const VIEW_TITLES = {
  home:         'noi.todos.it',
  clockin:      'Timbratura',
  mytodos:      'My Todos',
  planning:     'Pianificazione personale',
  teams:        'Pianificazione squadre',
  hours:        'Inserisci Ore',
  leave_req:    'Richiedi Permessi',
  leave_status: 'Ferie / Permessi richiesti',
  equipment:    'Dotazioni',
  payslips:     'Buste Paga'
}

export default function PersonalApp({
  user,                 // sessione utente
  userRoles = [],       // array di ruoli Hub
  onLogout,
  onDemoBackToAdmin,    // demo: torna admin (visibile solo in modalità demo)
  isDemo
}) {
  const [employeeId, setEmployeeId] = useState(null)
  const [view, setView] = useState('home')

  // Inject CSS globale WP (riusato dai sub-componenti)
  useEffect(() => {
    const id = 'wp-global-css'
    if (!document.getElementById(id)) {
      const s = document.createElement('style')
      s.id = id
      s.textContent = WP_GLOBAL_CSS
      document.head.appendChild(s)
    }
  }, [])

  // Login automatico: se l'utente è loggato, in demo mappiamo al primo
  // dipendente disponibile. In produzione qui ci sarà la lookup
  // employees.auth_user_id = auth.uid()
  useEffect(() => {
    if (user && !employeeId) {
      // Match per email (best-effort)
      const emp = WP_EMPLOYEES.find(e =>
        (user.email || '').toLowerCase().startsWith((e.code || '').toLowerCase())
      ) || WP_EMPLOYEES[0]
      if (emp) setEmployeeId(emp.id)
    }
  }, [user, employeeId])

  const employee = WP_EMPLOYEES.find(e => e.id === employeeId)
  const showHubLink = canAccessHub(userRoles)

  // --- Render sub-view ----------------------------------------------------
  const renderView = () => {
    if (!employee) return null
    switch (view) {
      case 'home':         return <EmpHome employeeId={employee.id} onGo={setView} />
      case 'clockin':      return <EmpClockIn employeeId={employee.id} employeeName={employee.name} />
      case 'mytodos':      return <EmpMyTodos employeeId={employee.id} />
      case 'planning':     return <EmpPersonalPlanning employeeId={employee.id} />
      case 'teams':        return <EmpTeamDestinations employeeId={employee.id} />
      case 'hours':        return <EmpHoursEntry employeeId={employee.id} />
      case 'leave_req':    return <EmpLeaveRequest employeeId={employee.id} />
      case 'leave_status': return <EmpLeaveStatus employeeId={employee.id} />
      case 'equipment':    return <EmpEquipment employeeId={employee.id} />
      case 'payslips':     return <EmpPayslips employeeId={employee.id} />
      default: return null
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: WP_COLORS.bgAlt,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Contenitore app responsive */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100vh',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 30px rgba(0,0,0,0.05)'
      }}>

        {/* Header app */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 16px',
          background: 'white',
          borderBottom: `1px solid ${WP_COLORS.border}`,
          position: 'sticky', top: 0, zIndex: 10
        }}>
          {view !== 'home' ? (
            <button onClick={() => setView('home')} style={backBtn}>
              <ChevronLeft size={20} />
            </button>
          ) : (
            <img src="/todos-logo.png" alt="Todos"
              onError={(e) => { e.target.style.display = 'none' }}
              style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 800, fontSize: '0.95rem',
              color: WP_COLORS.primary,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {VIEW_TITLES[view] || 'noi.todos.it'}
            </div>
            {employee && view === 'home' && (
              <div style={{ fontSize: '0.7rem', color: WP_COLORS.textMuted }}>
                {employee.name}{employee.is_leader && ' · CS'}
              </div>
            )}
          </div>

          {showHubLink && (
            <a
              href={getOtherAppUrl(APP_MODE.PERSONAL)}
              title="Vai all'Hub aziendale"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 10px', height: '32px', boxSizing: 'border-box',
                background: '#1e293b', color: 'white', borderRadius: '6px',
                fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <span>Lavoro</span>
              <ExternalLink size={10} />
            </a>
          )}
          <NotificationCenter
            userRoles={userRoles}
            onNavigate={(item) => {
              // Mapping action_url → view interna app personale
              const map = {
                'mie-richieste':  'leave_status',
                'mie-buste-paga': 'payslips',
                'mie-timbrature': 'hours',
                'mio-giorno':     'home'
              }
              if (map[item.id]) setView(map[item.id])
            }}
            variant="personal"
          />
          <button title="Profilo" onClick={() => alert(`Utente: ${employee?.name}\nCodice: ${employee?.code}\nEmail: ${user?.email || '—'}`)} style={iconBtn}>
            <User size={18} />
          </button>
          {isDemo && onDemoBackToAdmin && (
            <button
              onClick={onDemoBackToAdmin}
              title="Demo: ripristina ruolo admin e torna all'Hub"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.62rem', padding: '4px 8px', borderRadius: '4px',
                background: '#fef9c3', color: '#713f12', fontWeight: 800,
                border: '1px solid #fde047', cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <ShieldCheck size={10} />
              DEMO: torna admin
            </button>
          )}
          {isDemo && !onDemoBackToAdmin && (
            <span style={{
              fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px',
              background: '#fef9c3', color: '#713f12', fontWeight: 800
            }}>DEMO</span>
          )}
        </header>

        {/* Contenuto */}
        <main style={{ flex: 1, padding: '16px', position: 'relative' }}>
          {!employee && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: WP_COLORS.textMuted }}>
              Caricamento profilo dipendente...
            </div>
          )}
          {employee && renderView()}

          {/* FAB WhatsApp (solo su Inserisci Ore) */}
          {view === 'hours' && (
            <button
              onClick={() => alert('🎙️ Registrazione vocale WhatsApp\n\nLa nota verrà inviata al bot Noi Todos.it che la trascriverà e precompilerà il form (Whisper + LLM).')}
              title="Compila con messaggio vocale WhatsApp"
              style={{
                position: 'fixed', bottom: '80px',
                left: '50%', transform: 'translateX(calc(240px - 36px))',
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#25D366', color: 'white', border: 'none',
                cursor: 'pointer', boxShadow: '0 6px 20px rgba(37,211,102,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
              }}
            >
              <Mic size={24} />
            </button>
          )}
        </main>

        {/* Footer logout */}
        {view === 'home' && (
          <footer style={{ padding: '12px 16px', borderTop: `1px solid ${WP_COLORS.border}` }}>
            <button onClick={onLogout} style={{
              width: '100%', padding: '12px',
              background: 'white', border: `1px solid ${WP_COLORS.danger}`,
              color: WP_COLORS.danger, borderRadius: '8px',
              fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
              <LogOut size={14} /> Esci
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}

const backBtn = {
  background: WP_COLORS.primary, color: 'white', border: 'none',
  width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}
const iconBtn = {
  background: 'transparent', border: `1px solid ${WP_COLORS.border}`,
  width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer',
  color: WP_COLORS.text,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}
