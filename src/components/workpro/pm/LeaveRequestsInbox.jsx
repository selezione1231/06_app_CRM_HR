import React, { useState, useMemo } from 'react'
import { ClipboardList, Check, X, Clock } from 'lucide-react'
import { WP_COLORS, wpButton, wpBadge, wpTableHeader } from '../shared/wpStyles'
import { WP_LEAVE_REQUESTS, WP_EMPLOYEES } from '../shared/wpSeed'

export default function LeaveRequestsInbox({ pmId }) {
  const [requests, setRequests] = useState(WP_LEAVE_REQUESTS)
  const teamIds = useMemo(() => WP_EMPLOYEES.filter(e => e.pm_id === pmId).map(e => e.id), [pmId])

  const mine = requests.filter(r => teamIds.includes(r.employee_id))

  const setStatus = (id, status) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const statusBadge = (s) => {
    if (s === 'Approved') return wpBadge(WP_COLORS.success)
    if (s === 'Rejected') return wpBadge(WP_COLORS.danger)
    return wpBadge(WP_COLORS.warning, '#713f12')
  }
  const statusLabel = (s) => s === 'Approved' ? 'APPROVATO' : s === 'Rejected' ? 'NON APPROVATO' : 'IN ATTESA'

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ClipboardList size={22} color={WP_COLORS.primary} />
        Richieste Permessi / Ferie
      </h2>
      <p style={{ fontSize: '0.82rem', color: WP_COLORS.textMuted, marginBottom: '16px' }}>
        {mine.filter(r => r.status === 'Pending').length} in attesa di approvazione
      </p>

      <div style={{ overflowX: 'auto', border: `1px solid ${WP_COLORS.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px', background: 'white' }}>
          <thead>
            <tr>
              <th style={wpTableHeader}>Dipendente</th>
              <th style={wpTableHeader}>Tipo</th>
              <th style={wpTableHeader}>Periodo</th>
              <th style={wpTableHeader}>Motivo</th>
              <th style={wpTableHeader}>Stato</th>
              <th style={wpTableHeader}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {mine.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: WP_COLORS.textMuted }}>Nessuna richiesta.</td></tr>
            )}
            {mine.map(r => {
              const emp = WP_EMPLOYEES.find(e => e.id === r.employee_id)
              return (
                <tr key={r.id} className="wp-row-strip">
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{emp?.name}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={wpBadge(r.type === 'Ferie' ? WP_COLORS.info : '#a855f7')}>{r.type}</span>
                    {r.reason_type && <div style={{ fontSize: '0.7rem', color: WP_COLORS.textMuted, marginTop: '2px' }}>{r.reason_type}</div>}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '0.85rem' }}>
                    {r.date_from === r.date_to
                      ? new Date(r.date_from).toLocaleDateString('it-IT')
                      : `${new Date(r.date_from).toLocaleDateString('it-IT')} → ${new Date(r.date_to).toLocaleDateString('it-IT')}`}
                    {!r.full_day && r.time_from && (
                      <div style={{ fontSize: '0.72rem', color: WP_COLORS.textMuted }}>
                        ore {r.time_from} → {r.time_to}
                      </div>
                    )}
                    {r.full_day && <div style={{ fontSize: '0.72rem', color: WP_COLORS.textMuted }}>Intera giornata</div>}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '0.82rem', maxWidth: '240px' }}>{r.motivation}</td>
                  <td style={{ padding: '10px 12px' }}><span style={statusBadge(r.status)}>{statusLabel(r.status)}</span></td>
                  <td style={{ padding: '10px 12px' }}>
                    {r.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setStatus(r.id, 'Approved')} style={{ ...wpButton('success', 'sm') }} title="Approva">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setStatus(r.id, 'Rejected')} style={{ ...wpButton('danger', 'sm') }} title="Rifiuta">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setStatus(r.id, 'Pending')} style={{ ...wpButton('ghost', 'sm') }} title="Riapri">
                        <Clock size={14} />
                      </button>
                    )}
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
