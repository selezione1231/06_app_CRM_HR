import React, { useState } from 'react'
import { Clock, Smartphone, PenLine, Check, Info, Users, ToggleLeft, ToggleRight } from 'lucide-react'
import { WP_EMPLOYEES } from '../shared/wpSeed'

// ============================================================================
// TimbratureAdmin — pannello admin per configurare la modalità timbratura
// per ciascun dipendente Work-Pro.
//
// Modalità disponibili:
//   'manual'   → il dipendente inserisce le ore manualmente (sistema preesistente)
//   'realtime' → l'app mostra un clock-in/clock-out in tempo reale con timestamp
//
// L'admin può cambiare la modalità persona per persona.
// La configurazione è salvata in localStorage (in prod: tabella employee_settings).
// ============================================================================

const LS_CLOCKIN_MODES = 'todos-clockin-modes'

function loadModes() {
  try {
    const raw = localStorage.getItem(LS_CLOCKIN_MODES)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveModes(modes) {
  try { localStorage.setItem(LS_CLOCKIN_MODES, JSON.stringify(modes)) } catch { /* no-op */ }
}

export function getEmployeeClockinMode(employeeId) {
  const modes = loadModes()
  return modes[employeeId] || 'manual'
}

export function setEmployeeClockinMode(employeeId, mode) {
  const modes = loadModes()
  modes[employeeId] = mode
  saveModes(modes)
}

const MODE_LABELS = {
  manual:   { label: 'Manuale', desc: 'Inserimento ore a fine giornata/settimana', icon: PenLine,    color: '#64748b' },
  realtime: { label: 'Real-time', desc: 'Clock-in / Clock-out con timestamp preciso', icon: Smartphone, color: '#059669' }
}

export default function TimbratureAdmin() {
  const [modes, setModes] = useState(loadModes)
  const [saved, setSaved] = useState(null)

  const getMode = (empId) => modes[empId] || 'manual'

  const toggle = (empId) => {
    const current = getMode(empId)
    const next = current === 'manual' ? 'realtime' : 'manual'
    const updated = { ...modes, [empId]: next }
    setModes(updated)
    saveModes(updated)
    setSaved(empId)
    setTimeout(() => setSaved(null), 1500)
  }

  const realtimeCount = WP_EMPLOYEES.filter(e => getMode(e.id) === 'realtime').length

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid var(--border-color, #e2e8f0)' }}>
        <Clock size={30} style={{ color: 'var(--primary, #A82238)', marginTop: 2 }} />
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary, #1e293b)', margin: 0 }}>
            Configurazione Timbrature
          </h1>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.84rem', margin: '4px 0 0' }}>
            Scegli per ciascun dipendente la modalità di rilevazione presenze. La modifica è immediata.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px',
        padding: '12px 16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start'
      }}>
        <Info size={16} style={{ color: '#3b82f6', marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: '#1e40af' }}>
          <strong>Modalità Manuale:</strong> il dipendente inserisce le ore nel portale a fine giornata (sistema attuale).{' '}
          <strong>Modalità Real-time:</strong> il dipendente timbra entrata/uscita dall'app con timestamp preciso e geolocalizzazione opzionale.
          Attualmente <strong>{realtimeCount}/{WP_EMPLOYEES.length}</strong> dipendenti in modalità real-time.
        </div>
      </div>

      {/* Statistiche veloci */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {Object.entries(MODE_LABELS).map(([mode, cfg]) => {
          const count = WP_EMPLOYEES.filter(e => getMode(e.id) === mode).length
          const Icon = cfg.icon
          return (
            <div key={mode} style={{
              background: 'white', border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{ width: 38, height: 38, borderRadius: '8px', background: cfg.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} style={{ color: cfg.color }} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary, #1e293b)', lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Modalità {cfg.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabella dipendenti */}
      <div style={{ background: 'white', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={15} style={{ color: 'var(--text-muted, #64748b)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Dipendenti Noi Todos.it ({WP_EMPLOYEES.length})
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Dipendente', 'Ruolo', 'Squadra', 'Modalità corrente', 'Cambia'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WP_EMPLOYEES.map((emp, idx) => {
              const mode = getMode(emp.id)
              const cfg = MODE_LABELS[mode]
              const Icon = cfg.icon
              const isSaved = saved === emp.id
              return (
                <tr key={emp.id} style={{ borderBottom: idx < WP_EMPLOYEES.length - 1 ? '1px solid #f1f5f9' : 'none', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary, #1e293b)' }}>
                      {emp.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)' }}>{emp.code}</div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-secondary, #475569)' }}>
                    {emp.is_leader ? 'Caposquadra' : 'Operatore'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-secondary, #475569)' }}>
                    {emp.squad_id.replace('sq-', 'SQ-')}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                      background: cfg.color + '15', color: cfg.color, border: `1px solid ${cfg.color}30`
                    }}>
                      <Icon size={11} />
                      {cfg.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => toggle(emp.id)}
                      title={`Passa a modalità ${mode === 'manual' ? 'Real-time' : 'Manuale'}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
                        border: '1px solid', cursor: 'pointer',
                        background: isSaved ? '#f0fdf4' : 'white',
                        borderColor: isSaved ? '#86efac' : 'var(--border-color, #e2e8f0)',
                        color: isSaved ? '#16a34a' : 'var(--text-primary, #1e293b)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isSaved
                        ? <><Check size={13} /> Salvato</>
                        : mode === 'manual'
                          ? <><ToggleLeft size={15} style={{ color: '#64748b' }} /> → Real-time</>
                          : <><ToggleRight size={15} style={{ color: '#059669' }} /> → Manuale</>
                      }
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
