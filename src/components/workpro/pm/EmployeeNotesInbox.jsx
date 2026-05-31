import React, { useState, useMemo } from 'react'
import { MessageSquare, Eye, AlertTriangle } from 'lucide-react'
import { WP_COLORS, wpButton, wpBadge, wpTableHeader } from '../shared/wpStyles'
import { WP_EMPLOYEE_NOTES, WP_EMPLOYEES } from '../shared/wpSeed'

export default function EmployeeNotesInbox({ pmId }) {
  const [notes, setNotes] = useState(WP_EMPLOYEE_NOTES)
  const teamIds = useMemo(() => WP_EMPLOYEES.filter(e => e.pm_id === pmId).map(e => e.id), [pmId])
  const mine = notes.filter(n => teamIds.includes(n.employee_id))

  const markSeen = (id) => setNotes(prev => prev.map(n => n.id === id ? { ...n, seen: true } : n))

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={22} color={WP_COLORS.primary} />
        Note Inserite dai Dipendenti
      </h2>
      <p style={{ fontSize: '0.82rem', color: WP_COLORS.textMuted, marginBottom: '16px' }}>
        {mine.filter(n => !n.seen).length} non viste · {mine.filter(n => !n.seen && n.priority === 'high').length} con alta priorità
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {mine.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: WP_COLORS.textMuted, background: 'white', borderRadius: '8px' }}>Nessuna nota.</div>
        )}
        {mine.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(n => {
          const emp = WP_EMPLOYEES.find(e => e.id === n.employee_id)
          const high = n.priority === 'high'
          return (
            <div key={n.id} style={{
              background: n.seen ? '#fafafa' : 'white',
              border: `1px solid ${high && !n.seen ? WP_COLORS.danger : WP_COLORS.border}`,
              borderLeft: `4px solid ${high && !n.seen ? WP_COLORS.danger : n.seen ? WP_COLORS.textMuted : WP_COLORS.primary}`,
              borderRadius: '8px', padding: '12px 16px',
              opacity: n.seen ? 0.7 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '0.92rem' }}>{emp?.name}</strong>
                  {high && <span style={wpBadge(WP_COLORS.danger)}><AlertTriangle size={10} /> ALTA</span>}
                </div>
                <div style={{ fontSize: '0.72rem', color: WP_COLORS.textMuted }}>
                  {new Date(n.created_at).toLocaleString('it-IT')}
                </div>
              </div>
              <div style={{
                fontSize: '0.88rem',
                color: high && !n.seen ? WP_COLORS.danger : WP_COLORS.text,
                fontWeight: high && !n.seen ? 600 : 400,
                marginBottom: '8px'
              }}>
                {n.text}
              </div>
              {!n.seen && (
                <button onClick={() => markSeen(n.id)} style={{ ...wpButton('ghost', 'sm') }}>
                  <Eye size={12} /> Segna come vista
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
