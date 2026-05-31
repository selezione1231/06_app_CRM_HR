import React, { useState, useMemo } from 'react'
import { CheckCircle2, Check, X, Edit3, Save } from 'lucide-react'
import { WP_COLORS, wpButton, wpBadge, wpTableHeader, wpInput } from '../shared/wpStyles'
import { WP_TIME_ENTRIES, WP_EMPLOYEES, WP_SITES, WP_CLIENTS, WP_VEHICLES } from '../shared/wpSeed'

export default function TimeEntriesApproval({ pmId }) {
  const [entries, setEntries] = useState(WP_TIME_ENTRIES)
  const [editId, setEditId] = useState(null)
  const [editHours, setEditHours] = useState(0)
  const teamIds = useMemo(() => WP_EMPLOYEES.filter(e => e.pm_id === pmId).map(e => e.id), [pmId])
  const mine = entries.filter(e => teamIds.includes(e.employee_id))

  const updateStatus = (id, status, newHours) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status, hours: newHours ?? e.hours } : e))
    setEditId(null)
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CheckCircle2 size={22} color={WP_COLORS.primary} />
        Approva Inserimenti Ore
      </h2>
      <p style={{ fontSize: '0.82rem', color: WP_COLORS.textMuted, marginBottom: '16px' }}>
        {mine.filter(e => e.status === 'Pending').length} timbrature in attesa · click sulle ore per modificare prima di approvare
      </p>

      <div style={{ overflowX: 'auto', border: `1px solid ${WP_COLORS.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px', background: 'white' }}>
          <thead>
            <tr>
              <th style={wpTableHeader}>Dipendente</th>
              <th style={wpTableHeader}>Data</th>
              <th style={wpTableHeader}>Cliente / Cantiere</th>
              <th style={wpTableHeader}>Mezzo</th>
              <th style={wpTableHeader}>Ore</th>
              <th style={wpTableHeader}>Extra</th>
              <th style={wpTableHeader}>Spese</th>
              <th style={wpTableHeader}>Stato / Azioni</th>
            </tr>
          </thead>
          <tbody>
            {mine.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: WP_COLORS.textMuted }}>Nessuna timbratura.</td></tr>
            )}
            {mine.map(e => {
              const emp = WP_EMPLOYEES.find(x => x.id === e.employee_id)
              const site = WP_SITES.find(s => s.id === e.site_id)
              const cli = WP_CLIENTS.find(c => c.id === e.client_id)
              const veh = WP_VEHICLES.find(v => v.id === e.vehicle_id)
              const totalExp = (e.expenses || []).reduce((s, x) => s + x.amount, 0)
              return (
                <tr key={e.id} className="wp-row-strip">
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{emp?.name}</td>
                  <td style={{ padding: '10px 12px', fontSize: '0.85rem' }}>{new Date(e.date).toLocaleDateString('it-IT')}</td>
                  <td style={{ padding: '10px 12px', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 700 }}>{cli?.name}</div>
                    {site && <div style={{ color: site.is_maintenance ? WP_COLORS.blueSite : WP_COLORS.primary, fontWeight: 700 }}>{site.code}</div>}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '0.82rem' }}>{veh ? veh.plate : '—'}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 800 }}>
                    {editId === e.id ? (
                      <input
                        type="number"
                        value={editHours}
                        onChange={(ev) => setEditHours(parseFloat(ev.target.value))}
                        style={{ ...wpInput, width: '70px', padding: '4px 6px' }}
                      />
                    ) : (
                      <span>{e.hours}h</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {e.trasferta && <span style={wpBadge(WP_COLORS.warning, '#713f12')}>TR</span>}
                      {e.pernottamento && <span style={wpBadge('#7c3aed')}>PR</span>}
                      {e.notturno && <span style={wpBadge('#1e293b')}>NT</span>}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '0.82rem' }}>
                    {totalExp > 0 ? <strong>€ {totalExp.toFixed(2)}</strong> : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {e.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {editId === e.id ? (
                          <button onClick={() => updateStatus(e.id, 'Approved', editHours)} style={{ ...wpButton('success', 'sm') }} title="Salva e approva">
                            <Save size={14} />
                          </button>
                        ) : (
                          <>
                            <button onClick={() => updateStatus(e.id, 'Approved')} style={{ ...wpButton('success', 'sm') }} title="Approva">
                              <Check size={14} />
                            </button>
                            <button onClick={() => { setEditId(e.id); setEditHours(e.hours); }} style={{ ...wpButton('secondary', 'sm') }} title="Modifica ore">
                              <Edit3 size={14} />
                            </button>
                          </>
                        )}
                        <button onClick={() => updateStatus(e.id, 'Rejected')} style={{ ...wpButton('danger', 'sm') }} title="Rifiuta">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span style={wpBadge(e.status === 'Approved' ? WP_COLORS.success : WP_COLORS.danger)}>
                        {e.status === 'Approved' ? 'APPROVATA' : 'RIFIUTATA'}
                      </span>
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
