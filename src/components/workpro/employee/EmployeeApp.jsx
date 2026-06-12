import React, { useState } from 'react'
import { ChevronLeft, LogIn, Mic, Smartphone } from 'lucide-react'
import { WP_COLORS, wpButton, wpCard } from '../shared/wpStyles'
import { WP_EMPLOYEES } from '../shared/wpSeed'

import EmpHome from './EmpHome'
import EmpMyTodos from './EmpMyTodos'
import EmpPersonalPlanning from './EmpPersonalPlanning'
import EmpTeamDestinations from './EmpTeamDestinations'
import EmpHoursEntry from './EmpHoursEntry'
import EmpLeaveRequest from './EmpLeaveRequest'
import EmpLeaveStatus from './EmpLeaveStatus'
import EmpEquipment from './EmpEquipment'
import EmpPayslips from './EmpPayslips'

// ============================================================================
// EmployeeApp — preview responsive dell'APP Dipendente noi.todos.it:4443
// Frame fisso "telefono" su desktop, full-width su mobile
// ============================================================================

export default function EmployeeApp() {
  const [employeeId, setEmployeeId] = useState(null)
  const [view, setView] = useState('home') // home | mytodos | planning | teams | hours | leave_req | leave_status | equipment | payslips

  if (!employeeId) {
    return <EmployeeLogin onLogin={setEmployeeId} />
  }

  const renderView = () => {
    switch (view) {
      case 'home':         return <EmpHome employeeId={employeeId} onGo={setView} />
      case 'mytodos':      return <EmpMyTodos employeeId={employeeId} />
      case 'planning':     return <EmpPersonalPlanning employeeId={employeeId} />
      case 'teams':        return <EmpTeamDestinations employeeId={employeeId} />
      case 'hours':        return <EmpHoursEntry employeeId={employeeId} />
      case 'leave_req':    return <EmpLeaveRequest employeeId={employeeId} />
      case 'leave_status': return <EmpLeaveStatus employeeId={employeeId} />
      case 'equipment':    return <EmpEquipment employeeId={employeeId} />
      case 'payslips':     return <EmpPayslips employeeId={employeeId} />
      default:             return null
    }
  }

  const employee = WP_EMPLOYEES.find(e => e.id === employeeId)

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      gap: '20px', flexWrap: 'wrap', padding: '10px 0'
    }}>
      {/* Side panel info */}
      <div style={{ ...wpCard, maxWidth: '320px', flex: '1 1 280px', position: 'sticky', top: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Smartphone size={18} color={WP_COLORS.primary} />
          <strong style={{ fontSize: '0.95rem' }}>Preview APP Dipendente</strong>
        </div>
        <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginBottom: '12px', lineHeight: 1.5 }}>
          Anteprima dell'app mobile usata dai dipendenti per timbrare ore, richiedere permessi, vedere la pianificazione e i documenti.
        </p>
        <div style={{ background: WP_COLORS.bgAlt, padding: '8px 10px', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '12px' }}>
          <strong>Sessione:</strong> {employee?.name}<br />
          <strong>Codice:</strong> {employee?.code}<br />
          {employee?.is_leader && <span style={{ color: WP_COLORS.info, fontWeight: 700 }}>Caposquadra (CS)</span>}
        </div>
        <button onClick={() => { setEmployeeId(null); setView('home'); }} style={{ ...wpButton('ghost', 'sm'), width: '100%' }}>
          ← Cambia utente
        </button>
        <div style={{
          marginTop: '12px', padding: '10px', background: '#fef9c3', borderRadius: '6px',
          fontSize: '0.72rem', color: '#713f12'
        }}>
          🎙️ <strong>Roadmap:</strong> input ore via messaggio vocale WhatsApp.
        </div>
      </div>

      {/* Mobile frame */}
      <div style={{
        width: '100%', maxWidth: '420px', minHeight: '720px',
        background: 'white', borderRadius: '32px',
        border: `12px solid #111`, boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '120px', height: '20px', background: '#111',
          borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', zIndex: 100
        }} />

        {/* Header app (back) */}
        <div style={{
          padding: '24px 16px 8px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'white'
        }}>
          {view !== 'home' ? (
            <button onClick={() => setView('home')} style={{
              background: WP_COLORS.primary, color: 'white', border: 'none',
              width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ChevronLeft size={20} />
            </button>
          ) : <div />}
          <div style={{ fontSize: '0.72rem', color: WP_COLORS.textMuted }}>noi.todos.it</div>
        </div>

        {/* Content scrollabile */}
        <div style={{
          padding: '8px 16px 80px',
          maxHeight: '680px', overflowY: 'auto'
        }}>
          {renderView()}
        </div>

        {/* FAB vocale WhatsApp (solo su pagina Inserisci Ore) */}
        {view === 'hours' && (
          <button style={{
            position: 'absolute', bottom: '20px', right: '20px',
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#25D366', color: 'white', border: 'none',
            cursor: 'pointer', boxShadow: '0 6px 20px rgba(37,211,102,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
          }}
          onClick={() => alert('🎙️ Registrazione vocale WhatsApp\n\nLa nota verrà inviata al bot Noi Todos.it che la trascriverà e precompilerà il form ore (Whisper + LLM).')}
          title="Compila con messaggio vocale WhatsApp">
            <Mic size={24} />
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// EmployeeLogin
// ============================================================================
function EmployeeLogin({ onLogin }) {
  const [sel, setSel] = useState('')

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto' }}>
      <div style={{ ...wpCard, textAlign: 'center' }}>
        <img src="/todos-logo.png" alt="Todos" onError={(e) => { e.target.style.display = 'none' }}
          style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>noi.todos.it</h2>
        <p style={{ fontSize: '0.8rem', color: WP_COLORS.textMuted, marginBottom: '20px' }}>
          Accesso portale dipendenti
        </p>
        <select value={sel} onChange={e => setSel(e.target.value)} style={{
          width: '100%', padding: '12px', border: `1.5px solid ${WP_COLORS.primary}`,
          borderRadius: '8px', fontSize: '0.95rem', marginBottom: '16px'
        }}>
          <option value="">— Seleziona dipendente (demo) —</option>
          {WP_EMPLOYEES.map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.code}){e.is_leader ? ' — CS' : ''}</option>
          ))}
        </select>
        <button onClick={() => sel && onLogin(sel)} disabled={!sel} style={{
          ...wpButton(sel ? 'primary' : 'ghost', 'lg'), width: '100%',
          opacity: sel ? 1 : 0.5
        }}>
          <LogIn size={16} /> Accedi
        </button>
      </div>
    </div>
  )
}
