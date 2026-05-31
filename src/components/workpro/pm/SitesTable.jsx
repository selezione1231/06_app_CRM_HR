import React, { useState } from 'react'
import { Building2, Search, Wrench } from 'lucide-react'
import { WP_COLORS, wpInput, wpBadge, wpTableHeader } from '../shared/wpStyles'
import { WP_SITES, WP_CLIENTS } from '../shared/wpSeed'

export default function SitesTable() {
  const [q, setQ] = useState('')
  const [maintOnly, setMaintOnly] = useState(false)

  const filtered = WP_SITES.filter(s => {
    const t = q.toLowerCase()
    if (maintOnly && !s.is_maintenance) return false
    if (!t) return true
    const cli = WP_CLIENTS.find(c => c.id === s.client_id)
    return s.code.toLowerCase().includes(t) || s.name.toLowerCase().includes(t) || s.address.toLowerCase().includes(t) || (cli && cli.name.toLowerCase().includes(t))
  })

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Building2 size={22} color={WP_COLORS.primary} />
        Cantieri
      </h2>
      <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginBottom: '16px' }}>
        I cantieri di <strong style={{ color: WP_COLORS.blueSite }}>manutenzione</strong> sono evidenziati in blu.
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: WP_COLORS.textMuted }} />
          <input style={{ ...wpInput, paddingLeft: '32px' }} placeholder="Cerca per codice, nome, cliente, città..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <input type="checkbox" checked={maintOnly} onChange={e => setMaintOnly(e.target.checked)} /> Solo manutenzione
        </label>
      </div>

      <div style={{ overflowX: 'auto', border: `1px solid ${WP_COLORS.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', minWidth: '760px' }}>
          <thead>
            <tr>
              <th style={wpTableHeader}>Codice</th>
              <th style={wpTableHeader}>Nome</th>
              <th style={wpTableHeader}>Cliente</th>
              <th style={wpTableHeader}>Indirizzo</th>
              <th style={wpTableHeader}>Apertura</th>
              <th style={wpTableHeader}>Chiusura</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const cli = WP_CLIENTS.find(c => c.id === s.client_id)
              return (
                <tr key={s.id} className="wp-row-strip">
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 800, color: s.is_maintenance ? WP_COLORS.blueSite : WP_COLORS.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {s.is_maintenance && <Wrench size={12} />}
                    {s.code}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '10px 12px', fontSize: '0.85rem' }}>{cli?.name}</td>
                  <td style={{ padding: '10px 12px', fontSize: '0.85rem' }}>{s.address}</td>
                  <td style={{ padding: '10px 12px', fontSize: '0.82rem' }}>{s.start_date ? new Date(s.start_date).toLocaleDateString('it-IT') : '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: '0.82rem' }}>{s.end_date ? new Date(s.end_date).toLocaleDateString('it-IT') : <em style={{ color: WP_COLORS.textMuted }}>aperto</em>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
