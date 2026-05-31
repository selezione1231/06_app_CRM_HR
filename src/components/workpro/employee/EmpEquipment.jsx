import React from 'react'
import { WP_COLORS } from '../shared/wpStyles'
import { WP_EQUIPMENT } from '../shared/wpSeed'

export default function EmpEquipment({ employeeId }) {
  const items = WP_EQUIPMENT.filter(e => e.employee_id === employeeId)

  return (
    <div>
      <h3 style={{ fontStyle: 'italic', fontWeight: 800, fontSize: '1rem', marginBottom: '12px' }}>Elenco Attrezzature In Dotazione</h3>
      {items.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: WP_COLORS.textMuted, fontSize: '0.85rem' }}>
          Nessuna attrezzatura assegnata.
        </div>
      ) : (
        <div style={{ background: 'white', border: `1px solid ${WP_COLORS.border}`, borderRadius: '6px' }}>
          {items.map((eq, i) => (
            <div key={eq.id} style={{
              padding: '12px', borderBottom: i < items.length - 1 ? `1px solid ${WP_COLORS.border}` : 'none',
              fontSize: '0.85rem'
            }} className="wp-row-strip">
              <div style={{ fontWeight: 700 }}>{eq.type}</div>
              <div style={{ fontSize: '0.72rem', color: WP_COLORS.textMuted, fontFamily: 'monospace', marginTop: '2px' }}>
                S/N: {eq.serial}
              </div>
              <div style={{ fontSize: '0.72rem', color: WP_COLORS.textMuted }}>
                Assegnato il {new Date(eq.assigned_at).toLocaleDateString('it-IT')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
