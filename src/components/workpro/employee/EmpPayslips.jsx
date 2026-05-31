import React, { useState } from 'react'
import { Lock, Download } from 'lucide-react'
import { WP_COLORS, wpButton } from '../shared/wpStyles'
import { WP_PAYSLIPS } from '../shared/wpSeed'

export default function EmpPayslips({ employeeId }) {
  const items = WP_PAYSLIPS.filter(p => p.employee_id === employeeId)
    .sort((a, b) => b.period.localeCompare(a.period))
  const [pwModal, setPwModal] = useState(null)
  const [pw, setPw] = useState('')

  return (
    <div>
      <h3 style={{ fontStyle: 'italic', fontWeight: 800, fontSize: '1rem', marginBottom: '12px' }}>Elenco Buste Paga</h3>
      {items.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: WP_COLORS.textMuted, fontSize: '0.85rem' }}>
          Nessuna busta paga disponibile.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map(p => {
            const [y, m] = p.period.split('-')
            const label = new Date(`${y}-${m}-01`).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
            return (
              <div key={p.id} style={{
                background: 'white', border: `1px solid ${WP_COLORS.border}`, borderRadius: '6px',
                padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: WP_COLORS.textMuted }}>
                    Caricata il {new Date(p.uploaded_at).toLocaleDateString('it-IT')}
                  </div>
                </div>
                <button onClick={() => setPwModal(p.id)} style={{ ...wpButton('primary', 'sm') }}>
                  <Lock size={12} /> Apri
                </button>
              </div>
            )
          })}
        </div>
      )}

      {pwModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '320px' }}>
            <h3 style={{ margin: '0 0 6px 0' }}>Password busta paga</h3>
            <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, margin: '0 0 14px 0' }}>
              Inserisci la password comunicata dall'HR.
            </p>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" autoFocus
              style={{ width: '100%', padding: '10px', border: `1.5px solid ${WP_COLORS.primary}`, borderRadius: '6px', marginBottom: '14px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setPwModal(null); setPw(''); }} style={{ ...wpButton('ghost', 'sm') }}>Annulla</button>
              <button onClick={() => { alert('PDF aperto (demo).'); setPwModal(null); setPw(''); }} style={{ ...wpButton('primary', 'sm') }}>
                <Download size={12} /> Apri
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
