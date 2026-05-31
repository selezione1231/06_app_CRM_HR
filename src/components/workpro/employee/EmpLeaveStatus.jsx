import React from 'react'
import { WP_COLORS } from '../shared/wpStyles'
import { WP_LEAVE_REQUESTS } from '../shared/wpSeed'

const STATUS_COLOR = { Pending: '#fbbf24', Approved: '#22c55e', Rejected: '#ef4444' }
const STATUS_LABEL = { Pending: 'In Attesa', Approved: 'Approvato', Rejected: 'Non Approvato' }

export default function EmpLeaveStatus({ employeeId }) {
  const requests = WP_LEAVE_REQUESTS.filter(r => r.employee_id === employeeId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div>
      <h3 style={{ fontStyle: 'italic', fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>Elenco Permessi Richiesti</h3>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', fontSize: '0.78rem', flexWrap: 'wrap' }}>
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: STATUS_COLOR[k] }} />
            <span style={{ fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {requests.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: WP_COLORS.textMuted, fontSize: '0.85rem' }}>
            Nessuna richiesta inviata.
          </div>
        )}
        {requests.map(r => (
          <div key={r.id} style={{
            background: 'white', border: `1px solid ${WP_COLORS.border}`,
            borderLeft: `5px solid ${STATUS_COLOR[r.status]}`,
            borderRadius: '6px', padding: '10px 12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <strong style={{ fontSize: '0.88rem' }}>{r.type}</strong>
              <span style={{ background: STATUS_COLOR[r.status], color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '3px', fontWeight: 800, textTransform: 'uppercase' }}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: WP_COLORS.text }}>
              {r.date_from === r.date_to ? new Date(r.date_from).toLocaleDateString('it-IT') : `${new Date(r.date_from).toLocaleDateString('it-IT')} → ${new Date(r.date_to).toLocaleDateString('it-IT')}`}
              {!r.full_day && r.time_from && ` (${r.time_from}-${r.time_to})`}
              {r.full_day && ' (intera giornata)'}
            </div>
            <div style={{ fontSize: '0.72rem', color: WP_COLORS.textMuted, marginTop: '4px', fontStyle: 'italic' }}>
              {r.reason_type && <>📌 {r.reason_type} · </>}{r.motivation}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
