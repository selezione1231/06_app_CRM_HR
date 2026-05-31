import React, { useState, useMemo, useEffect } from 'react'
import { Monitor, Smartphone, LogIn, AlertTriangle, X } from 'lucide-react'
import { WP_COLORS, wpButton, wpCard, WP_GLOBAL_CSS } from './shared/wpStyles'
import { WP_PM, WP_EMPLOYEES, WP_ASSIGNMENTS, getCurrentWeekDates } from './shared/wpSeed'
import PMConsole from './pm/PMConsole'
import EmployeeApp from './employee/EmployeeApp'

// ============================================================================
// WP2Module — entry point del modulo Work-Pro Todos
// Switch tra:
//   - Console P.M. (uso da ufficio) — replica del .docx "Work-Pro Todos"
//   - APP Dipendente (uso mobile)   — replica del portale noi.todos.it:4443
// ============================================================================

export default function WP2Module() {
  const [view, setView] = useState('pm')           // 'pm' | 'employee'
  const [pmId, setPmId] = useState(null)            // P.M. loggato
  const [showLoginAlert, setShowLoginAlert] = useState(false)
  const [unassignedCount, setUnassignedCount] = useState(0)

  // Inject CSS globale una volta sola
  useEffect(() => {
    const id = 'wp2-global-css'
    if (!document.getElementById(id)) {
      const s = document.createElement('style')
      s.id = id
      s.textContent = WP_GLOBAL_CSS
      document.head.appendChild(s)
    }
  }, [])

  // Calcola dipendenti senza assegnazione per la settimana corrente
  const checkUnassigned = (selectedPmId) => {
    const week = getCurrentWeekDates()
    const teamEmployees = WP_EMPLOYEES.filter(e => e.pm_id === selectedPmId)
    const unassigned = teamEmployees.filter(emp => {
      const hasAnyAssignment = WP_ASSIGNMENTS.some(a =>
        a.employee_id === emp.id && week.includes(a.date)
      )
      return !hasAnyAssignment
    })
    return unassigned
  }

  const handlePMLogin = (selectedPmId) => {
    setPmId(selectedPmId)
    const unassigned = checkUnassigned(selectedPmId)
    setUnassignedCount(unassigned.length)
    if (unassigned.length > 0) setShowLoginAlert(true)
  }

  // --- RENDER -----------------------------------------------------------
  return (
    <div style={{ background: WP_COLORS.bgAlt, minHeight: 'calc(100vh - 120px)', padding: '20px' }}>

      {/* TOP BAR — switch tra console PM e app dipendente */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '16px', flexWrap: 'wrap', gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: WP_COLORS.primary, margin: 0 }}>
            🛠️ Work-Pro Todos
          </h1>
          <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, margin: '2px 0 0 0' }}>
            Gestione cantieri · squadre · automezzi · reperibilità
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '4px', borderRadius: '10px', border: `1px solid ${WP_COLORS.border}` }}>
          <button
            onClick={() => setView('pm')}
            style={{
              ...wpButton(view === 'pm' ? 'primary' : 'ghost', 'sm'),
              padding: '8px 14px'
            }}
          >
            <Monitor size={14} /> Console P.M.
          </button>
          <button
            onClick={() => setView('employee')}
            style={{
              ...wpButton(view === 'employee' ? 'primary' : 'ghost', 'sm'),
              padding: '8px 14px'
            }}
          >
            <Smartphone size={14} /> APP Dipendente
          </button>
        </div>
      </div>

      {/* CONSOLE P.M. */}
      {view === 'pm' && (
        !pmId ? (
          <PMLogin onLogin={handlePMLogin} />
        ) : (
          <PMConsole pmId={pmId} onLogout={() => { setPmId(null); setShowLoginAlert(false); }} />
        )
      )}

      {/* APP DIPENDENTE — preview responsive */}
      {view === 'employee' && <EmployeeApp />}

      {/* MODAL ALERT post-login: dipendenti senza cantiere */}
      {showLoginAlert && (
        <UnassignedAlert
          count={unassignedCount}
          pmId={pmId}
          onClose={() => setShowLoginAlert(false)}
        />
      )}
    </div>
  )
}

// ============================================================================
// PMLogin — schermata di selezione P.M.
// ============================================================================
function PMLogin({ onLogin }) {
  const [selected, setSelected] = useState('')

  return (
    <div style={{
      maxWidth: '480px', margin: '60px auto', ...wpCard, textAlign: 'center'
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: WP_COLORS.primaryLight, color: WP_COLORS.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', fontSize: '2.5rem'
      }}>👔</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: WP_COLORS.text, marginBottom: '8px' }}>
        Accesso Console P.M.
      </h2>
      <p style={{ fontSize: '0.85rem', color: WP_COLORS.textMuted, marginBottom: '24px' }}>
        Seleziona il Project Manager con cui accedere.<br/>
        Vedrai solo le squadre e i cantieri di tua competenza.
      </p>
      <label style={{ display: 'block', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: WP_COLORS.primary }}>
        Project Manager
      </label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{
          width: '100%', padding: '12px', border: `1.5px solid ${WP_COLORS.primary}`,
          borderRadius: '8px', fontSize: '1rem', marginBottom: '20px', background: 'white'
        }}
      >
        <option value="">— Seleziona P.M. —</option>
        {WP_PM.map(pm => (
          <option key={pm.id} value={pm.id}>{pm.name} ({pm.area})</option>
        ))}
      </select>
      <button
        onClick={() => selected && onLogin(selected)}
        disabled={!selected}
        style={{
          ...wpButton(selected ? 'primary' : 'ghost', 'lg'),
          width: '100%',
          opacity: selected ? 1 : 0.5,
          cursor: selected ? 'pointer' : 'not-allowed'
        }}
      >
        <LogIn size={16} /> Accedi
      </button>
    </div>
  )
}

// ============================================================================
// UnassignedAlert — modal post-login se ci sono dipendenti senza cantiere
// ============================================================================
function UnassignedAlert({ count, pmId, onClose }) {
  const pm = WP_PM.find(p => p.id === pmId)
  const week = getCurrentWeekDates()
  const unassigned = WP_EMPLOYEES.filter(e => e.pm_id === pmId).filter(emp => {
    return !WP_ASSIGNMENTS.some(a => a.employee_id === emp.id && week.includes(a.date))
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        ...wpCard, maxWidth: '480px', width: '100%', position: 'relative',
        borderTop: `5px solid ${WP_COLORS.warning}`
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: WP_COLORS.textMuted }}
        >
          <X size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <AlertTriangle size={28} color={WP_COLORS.warning} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Attenzione, {pm?.name}!</h3>
        </div>
        <p style={{ fontSize: '0.92rem', color: WP_COLORS.text, marginBottom: '16px' }}>
          Ci sono <strong style={{ color: WP_COLORS.danger }}>{count} dipendenti</strong> della tua area senza alcun cantiere assegnato per la settimana corrente.
        </p>
        <div style={{
          background: WP_COLORS.warningLight, padding: '12px', borderRadius: '8px',
          maxHeight: '200px', overflowY: 'auto', marginBottom: '16px'
        }}>
          {unassigned.map(emp => (
            <div key={emp.id} style={{ padding: '4px 0', fontSize: '0.85rem', color: WP_COLORS.text }}>
              • <strong>{emp.name}</strong> {emp.is_leader && <span style={{ color: WP_COLORS.info, fontWeight: 700 }}>(CS)</span>} — {emp.code}
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ ...wpButton('primary', 'md'), width: '100%' }}>
          Chiudi e vai alla Console
        </button>
      </div>
    </div>
  )
}
