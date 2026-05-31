import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { WP_COLORS } from '../shared/wpStyles'
import { WP_ASSIGNMENTS, WP_SITES, WP_VEHICLES, SPECIAL_LABELS } from '../shared/wpSeed'

const WEEK_LABELS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

export default function EmpPersonalPlanning({ employeeId }) {
  const [weekStart, setWeekStart] = useState(() => {
    const t = new Date()
    const d = t.getDay()
    const diff = t.getDate() - d + (d === 0 ? -6 : 1)
    const m = new Date(t.setDate(diff))
    m.setHours(0, 0, 0, 0)
    return m
  })

  const dates = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  }), [weekStart])

  const shift = (delta) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + delta * 7)
    setWeekStart(d)
  }

  const myAssignments = WP_ASSIGNMENTS.filter(a => a.employee_id === employeeId)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <button onClick={() => shift(-1)} style={navBtn}><ChevronLeft size={16} /></button>
        <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>
          {dates[0].toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })} → {dates[6].toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
        </div>
        <button onClick={() => shift(1)} style={navBtn}><ChevronRight size={16} /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
        {dates.map((d, i) => {
          const dStr = d.toISOString().split('T')[0]
          const a = myAssignments.find(x => x.date === dStr)
          const site = a?.site_id ? WP_SITES.find(s => s.id === a.site_id) : null
          const veh = a?.vehicle_id ? WP_VEHICLES.find(v => v.id === a.vehicle_id) : null
          const special = a?.special ? SPECIAL_LABELS[a.special] : null

          return (
            <div key={dStr} style={{
              display: 'flex', alignItems: 'stretch',
              border: `1px solid ${WP_COLORS.border}`, borderRadius: '6px', overflow: 'hidden', background: 'white'
            }}>
              <div style={{
                width: '64px', background: WP_COLORS.primary, color: 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, padding: '6px 4px'
              }}>
                <div style={{ fontSize: '0.65rem', opacity: 0.85 }}>{WEEK_LABELS[i].substring(0, 3).toUpperCase()}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900 }}>{d.getDate()}</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.85 }}>{d.toLocaleDateString('it-IT', { month: 'short' })}</div>
              </div>
              <div style={{ flex: 1, padding: '10px 12px', minHeight: '70px' }}>
                {!a && <div style={{ color: WP_COLORS.textMuted, fontSize: '0.78rem', fontStyle: 'italic' }}>Nessuna attività</div>}
                {special && (
                  <div style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: '4px',
                    background: special.bg, color: special.color, fontWeight: 800, fontSize: '0.82rem'
                  }}>
                    {special.icon} {special.label}
                  </div>
                )}
                {site && (
                  <>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: site.is_maintenance ? WP_COLORS.blueSite : WP_COLORS.primary }}>
                      {site.code}
                    </div>
                    <div style={{ fontSize: '0.78rem' }}>{site.name}</div>
                  </>
                )}
                {veh && (
                  <div style={{ fontSize: '0.7rem', color: WP_COLORS.textMuted, marginTop: '4px' }}>
                    🚐 {veh.plate} · {veh.model}
                  </div>
                )}
                {a?.notes && <div style={{ fontSize: '0.72rem', color: WP_COLORS.textMuted, marginTop: '4px', fontStyle: 'italic' }}>"{a.notes}"</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const navBtn = {
  background: WP_COLORS.primary, color: 'white', border: 'none',
  width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}
