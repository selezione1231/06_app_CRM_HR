import React from 'react'
import { AlertOctagon, AlertTriangle, HelpCircle, Clock } from 'lucide-react'
import { WP_COLORS, wpCard, wpBadge, wpTableHeader } from '../shared/wpStyles'
import { getUpcomingExpiries } from '../shared/wpSeed'

export default function ExpiriesPanel() {
  const items = getUpcomingExpiries(15)
  const overdue = items.filter(i => i.status === 'overdue')
  const soon = items.filter(i => i.status === 'soon')
  const missing = items.filter(i => i.status === 'missing')

  const statusBadge = (s) => {
    if (s === 'overdue') return <span style={wpBadge(WP_COLORS.danger)}><AlertTriangle size={10} /> SCADUTO</span>
    if (s === 'soon')    return <span style={wpBadge(WP_COLORS.warning, '#713f12')}><Clock size={10} /> &lt; 15 GIORNI</span>
    return <span style={wpBadge(WP_COLORS.textMuted)}><HelpCircle size={10} /> DATA ASSENTE</span>
  }

  const kindIcon = (k) => {
    if (k === 'mezzo') return '🚐'
    if (k === 'fuel') return '⛽'
    if (k === 'telepass') return '🛣️'
    return '📄'
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertOctagon size={22} color={WP_COLORS.primary} className={items.length > 0 ? 'wp-blink' : ''} />
        Vedi Scadenze
      </h2>
      <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginBottom: '16px' }}>
        Mezzi e tessere con scadenza entro 15 giorni o senza data indicata.
      </p>

      {/* Riepilogo a tile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ ...wpCard, borderTop: `4px solid ${WP_COLORS.danger}` }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: WP_COLORS.textMuted, fontWeight: 700 }}>Scaduti</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: WP_COLORS.danger }}>{overdue.length}</div>
        </div>
        <div style={{ ...wpCard, borderTop: `4px solid ${WP_COLORS.warning}` }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: WP_COLORS.textMuted, fontWeight: 700 }}>In scadenza (≤15 gg)</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: WP_COLORS.warning }}>{soon.length}</div>
        </div>
        <div style={{ ...wpCard, borderTop: `4px solid ${WP_COLORS.textMuted}` }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: WP_COLORS.textMuted, fontWeight: 700 }}>Data assente</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: WP_COLORS.textMuted }}>{missing.length}</div>
        </div>
      </div>

      {/* Tabella */}
      <div style={{ overflowX: 'auto', border: `1px solid ${WP_COLORS.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr>
              <th style={wpTableHeader}>Tipo</th>
              <th style={wpTableHeader}>Voce</th>
              <th style={wpTableHeader}>Scadenza</th>
              <th style={wpTableHeader}>Stato</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: WP_COLORS.success }}>✅ Tutto in regola.</td></tr>}
            {items.map((it, i) => (
              <tr key={i} className="wp-row-strip">
                <td style={{ padding: '10px 12px' }}>{kindIcon(it.kind)} {it.kind}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{it.label}</td>
                <td style={{ padding: '10px 12px' }}>{it.due_date ? new Date(it.due_date).toLocaleDateString('it-IT') : '—'}</td>
                <td style={{ padding: '10px 12px' }}>{statusBadge(it.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
