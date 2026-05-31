import React from 'react'
import { UserCircle2 } from 'lucide-react'
import { WP_COLORS, wpTableHeader, wpBadge } from '../shared/wpStyles'
import { WP_PM, WP_SQUADS, WP_EMPLOYEES } from '../shared/wpSeed'

export default function ProjectManagersTable() {
  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <UserCircle2 size={22} color={WP_COLORS.primary} />
        Project Managers
      </h2>
      <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginBottom: '16px' }}>
        Tutti i P.M. registrati nel sistema, con squadre e team dimensione.
      </p>

      <div style={{ overflowX: 'auto', border: `1px solid ${WP_COLORS.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', minWidth: '720px' }}>
          <thead>
            <tr>
              <th style={wpTableHeader}>P.M.</th>
              <th style={wpTableHeader}>Codice</th>
              <th style={wpTableHeader}>Area</th>
              <th style={wpTableHeader}>Email</th>
              <th style={wpTableHeader}>Squadre</th>
              <th style={wpTableHeader}>Dipendenti</th>
            </tr>
          </thead>
          <tbody>
            {WP_PM.map(p => {
              const squads = WP_SQUADS.filter(s => s.pm_id === p.id)
              const emps = WP_EMPLOYEES.filter(e => e.pm_id === p.id)
              return (
                <tr key={p.id} className="wp-row-strip">
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.82rem' }}>{p.code}</td>
                  <td style={{ padding: '10px 12px', fontSize: '0.85rem' }}>{p.area}</td>
                  <td style={{ padding: '10px 12px', fontSize: '0.82rem', color: WP_COLORS.textMuted }}>{p.email}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {squads.map(s => <span key={s.id} style={wpBadge(WP_COLORS.primary)}>{s.name}</span>)}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <strong>{emps.length}</strong>
                    <span style={{ fontSize: '0.75rem', color: WP_COLORS.textMuted, marginLeft: '6px' }}>
                      ({emps.filter(e => e.is_leader).length} CS)
                    </span>
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
