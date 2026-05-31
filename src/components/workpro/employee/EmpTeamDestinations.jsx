import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { WP_COLORS } from '../shared/wpStyles'
import { WP_ASSIGNMENTS, WP_EMPLOYEES, WP_SITES, WP_VEHICLES, SPECIAL_LABELS } from '../shared/wpSeed'

export default function EmpTeamDestinations({ employeeId }) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const me = WP_EMPLOYEES.find(e => e.id === employeeId)

  const teammates = WP_EMPLOYEES.filter(e => e.pm_id === me?.pm_id)
  const dayAss = WP_ASSIGNMENTS.filter(a => a.date === date && teammates.some(t => t.id === a.employee_id))

  const shift = (delta) => {
    const d = new Date(date)
    d.setDate(d.getDate() + delta)
    setDate(d.toISOString().split('T')[0])
  }

  return (
    <div>
      <h3 style={{ fontStyle: 'italic', fontWeight: 800, fontSize: '1rem', marginBottom: '10px' }}>Elenco Destinazione Squadre</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <button onClick={() => shift(-1)} style={navBtn}><ChevronLeft size={14} /></button>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{
          flex: 1, padding: '8px 10px', border: `1.5px solid ${WP_COLORS.primary}`,
          borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 700, color: WP_COLORS.primary
        }} />
        <button onClick={() => shift(1)} style={navBtn}><ChevronRight size={14} /></button>
      </div>

      <div style={{ background: 'white', border: `1px solid ${WP_COLORS.border}`, borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 80px', background: WP_COLORS.primary, color: 'white', fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase' }}>
          <div style={{ padding: '8px' }}>Squadra</div>
          <div style={{ padding: '8px' }}>Cantiere</div>
          <div style={{ padding: '8px' }}>Mezzo</div>
        </div>
        {dayAss.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: WP_COLORS.textMuted, fontSize: '0.85rem' }}>
            Nessuna assegnazione per questo giorno.
          </div>
        )}
        {dayAss.map(a => {
          const emp = WP_EMPLOYEES.find(e => e.id === a.employee_id)
          const site = a.site_id ? WP_SITES.find(s => s.id === a.site_id) : null
          const veh = a.vehicle_id ? WP_VEHICLES.find(v => v.id === a.vehicle_id) : null
          const special = a.special ? SPECIAL_LABELS[a.special] : null
          return (
            <div key={a.id} style={{
              display: 'grid', gridTemplateColumns: '70px 1fr 80px',
              borderBottom: `1px solid ${WP_COLORS.border}`, fontSize: '0.72rem'
            }} className="wp-row-strip">
              <div style={{ padding: '8px', fontWeight: 700, color: emp?.is_leader ? WP_COLORS.info : WP_COLORS.text }}>
                {emp?.code}
              </div>
              <div style={{ padding: '8px' }}>
                {site ? (
                  <>
                    <div style={{ fontWeight: 700, color: site.is_maintenance ? WP_COLORS.blueSite : WP_COLORS.primary }}>{site.code}</div>
                    <div style={{ fontSize: '0.68rem' }}>{site.name}</div>
                  </>
                ) : special ? (
                  <span style={{ background: special.bg, color: special.color, padding: '2px 6px', borderRadius: '3px', fontWeight: 700, fontSize: '0.65rem' }}>
                    {special.label}
                  </span>
                ) : (
                  <em style={{ color: WP_COLORS.textMuted }}>—</em>
                )}
              </div>
              <div style={{ padding: '8px', fontSize: '0.7rem' }}>{veh?.plate || '—'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const navBtn = {
  background: WP_COLORS.primary, color: 'white', border: 'none',
  width: '34px', height: '34px', borderRadius: '8px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
}
