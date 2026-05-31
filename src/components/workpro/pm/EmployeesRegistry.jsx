import React, { useState, useMemo } from 'react'
import { Users, Search } from 'lucide-react'
import { WP_COLORS, wpInput, wpBadge, wpTableHeader } from '../shared/wpStyles'
import { WP_EMPLOYEES, WP_SQUADS, WP_PM, WP_COST_CLASSES, WP_VEHICLES } from '../shared/wpSeed'

export default function EmployeesRegistry({ pmId }) {
  const [q, setQ] = useState('')
  const [showAll, setShowAll] = useState(false)

  const list = useMemo(() => {
    let arr = WP_EMPLOYEES
    if (!showAll && pmId) arr = arr.filter(e => e.pm_id === pmId)
    if (q) {
      const t = q.toLowerCase()
      arr = arr.filter(e => e.name.toLowerCase().includes(t) || e.code.toLowerCase().includes(t))
    }
    return arr.sort((a, b) => (b.is_leader ? 1 : 0) - (a.is_leader ? 1 : 0))
  }, [q, showAll, pmId])

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Users size={22} color={WP_COLORS.primary} />
        Dipendenti
      </h2>
      <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginBottom: '16px' }}>
        Caposquadra (CS) sono evidenziati in blu. Ogni dipendente appartiene a una squadra → P.M.
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: WP_COLORS.textMuted }} />
          <input style={{ ...wpInput, paddingLeft: '32px' }} placeholder="Cerca per nome o codice..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} /> Mostra tutti (cross-PM)
        </label>
      </div>

      <div style={{ overflowX: 'auto', border: `1px solid ${WP_COLORS.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', minWidth: '900px' }}>
          <thead>
            <tr>
              <th style={wpTableHeader}>CS</th>
              <th style={wpTableHeader}>Nome</th>
              <th style={wpTableHeader}>Codice</th>
              <th style={wpTableHeader}>Squadra</th>
              <th style={wpTableHeader}>P.M.</th>
              <th style={wpTableHeader}>Classe Costo</th>
              <th style={wpTableHeader}>Mezzo</th>
              <th style={wpTableHeader}>Reperibilità</th>
              <th style={wpTableHeader}>Telefono</th>
            </tr>
          </thead>
          <tbody>
            {list.map(e => {
              const sq = WP_SQUADS.find(s => s.id === e.squad_id)
              const pm = WP_PM.find(p => p.id === e.pm_id)
              const cc = WP_COST_CLASSES.find(c => c.id === e.cost_class_id)
              const v = WP_VEHICLES.find(x => x.id === e.vehicle_id)
              return (
                <tr key={e.id} className="wp-row-strip">
                  <td style={{ padding: '8px 12px' }}>
                    {e.is_leader && <span style={wpBadge(WP_COLORS.info)}>CS</span>}
                  </td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: e.is_leader ? WP_COLORS.info : WP_COLORS.text }}>{e.name}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '0.82rem' }}>{e.code}</td>
                  <td style={{ padding: '8px 12px', fontSize: '0.82rem', color: e.is_leader ? WP_COLORS.info : WP_COLORS.text, fontWeight: e.is_leader ? 700 : 400 }}>
                    {sq?.name}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '0.82rem' }}>{pm?.name}</td>
                  <td style={{ padding: '8px 12px', fontSize: '0.82rem' }}>{cc?.code} ({cc?.label})</td>
                  <td style={{ padding: '8px 12px', fontSize: '0.82rem' }}>{v ? v.plate : '—'}</td>
                  <td style={{ padding: '8px 12px' }}>
                    {e.oncall !== 'Nessuna' && <span style={wpBadge('#7c3aed')}>{e.oncall}</span>}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '0.82rem', fontFamily: 'monospace' }}>{e.phone}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
