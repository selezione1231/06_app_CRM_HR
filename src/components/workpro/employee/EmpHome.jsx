import React from 'react'
import { WP_COLORS } from '../shared/wpStyles'

// Home APP Dipendente — tile rossi grandi come da video
export default function EmpHome({ employeeId, onGo }) {
  const tiles = [
    { id: 'mytodos',      label: 'MY TODOS' },
    { id: 'planning',     label: 'PIANIFICAZIONE PERSONALE' },
    { id: 'teams',        label: 'PIANIFICAZIONE SQUADRE' },
    { id: 'hours',        label: 'INSERISCI ORE' },
    { id: 'leave_req',    label: 'RICHIEDI PERMESSI' },
    { id: 'leave_status', label: 'FERIE/PERMESSI RICHIESTI' },
    { id: 'equipment',    label: 'DOTAZIONI' },
    { id: 'payslips',     label: 'BUSTE PAGA' }
  ]

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: WP_COLORS.primary, textAlign: 'center', margin: '8px 0 18px' }}>
        Benvenuto
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tiles.map(t => (
          <button key={t.id} onClick={() => onGo(t.id)} style={{
            background: WP_COLORS.primary, color: 'white',
            border: 'none', borderRadius: '10px',
            padding: '24px 14px', fontSize: '1.05rem', fontWeight: 800,
            letterSpacing: '0.04em', cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(168,34,56,0.25)'
          }}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
