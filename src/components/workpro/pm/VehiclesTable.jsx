import React, { useState } from 'react'
import { Car, Search, AlertTriangle } from 'lucide-react'
import { WP_COLORS, wpInput, wpBadge, wpTableHeader } from '../shared/wpStyles'
import { WP_VEHICLES, WP_VEHICLE_EXPIRIES, WP_FUEL_CARDS, WP_TELEPASS, WP_TIRES_STORAGE, WP_CLIENTS } from '../shared/wpSeed'

const today = new Date()
const inDays = (d) => {
  if (!d) return null
  const due = new Date(d)
  return Math.floor((due - today) / (1000 * 60 * 60 * 24))
}

export default function VehiclesTable() {
  const [q, setQ] = useState('')
  const filtered = WP_VEHICLES.filter(v => {
    if (!q) return true
    const t = q.toLowerCase()
    return v.plate.toLowerCase().includes(t) || v.model.toLowerCase().includes(t)
  })

  const expByVehicle = (vid) => WP_VEHICLE_EXPIRIES.filter(e => e.vehicle_id === vid)
  const fuelByVehicle = (vid) => WP_FUEL_CARDS.filter(c => c.vehicle_id === vid)
  const telepassByVehicle = (vid) => WP_TELEPASS.filter(t => t.vehicle_id === vid)
  const tiresByVehicle = (vid) => WP_TIRES_STORAGE.filter(t => t.vehicle_id === vid)

  const expChip = (date) => {
    if (!date) return <span style={wpBadge(WP_COLORS.warning, '#713f12')}>?</span>
    const days = inDays(date)
    const bg = days < 0 ? WP_COLORS.danger : days <= 15 ? WP_COLORS.warning : WP_COLORS.success
    const color = days <= 15 ? '#713f12' : 'white'
    return <span style={wpBadge(bg, days <= 15 && days >= 0 ? color : 'white')}>{new Date(date).toLocaleDateString('it-IT')}</span>
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Car size={22} color={WP_COLORS.primary} />
        Automezzi
      </h2>
      <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginBottom: '16px' }}>
        Bollo / assicurazione / revisione · Tessere carburante · Telepass · Pneumatici in deposito · Stato noleggio
      </p>

      <div style={{ position: 'relative', marginBottom: '12px', maxWidth: '420px' }}>
        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: WP_COLORS.textMuted }} />
        <input style={{ ...wpInput, paddingLeft: '32px' }} placeholder="Cerca per targa o modello..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(v => {
          const exps = expByVehicle(v.id)
          const fcs = fuelByVehicle(v.id)
          const tps = telepassByVehicle(v.id)
          const tires = tiresByVehicle(v.id)
          const supplier = v.supplier_id ? WP_CLIENTS.find(c => c.id === v.supplier_id) : null
          const isDecommissioned = v.decommission_from && v.decommission_to
            && new Date(v.decommission_from) <= today && today <= new Date(v.decommission_to)
          return (
            <div key={v.id} style={{
              background: 'white', border: `1px solid ${WP_COLORS.border}`, borderRadius: '8px',
              padding: '14px', opacity: isDecommissioned ? 0.6 : 1
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '1rem', fontFamily: 'monospace', color: WP_COLORS.primary }}>{v.plate}</strong>
                    <span>{v.model}</span>
                    <span style={wpBadge(v.ownership === 'Noleggio' ? '#7c3aed' : WP_COLORS.info)}>{v.ownership}</span>
                    {v.fuel && <span style={wpBadge(WP_COLORS.textMuted)}>{v.fuel}</span>}
                  </div>
                  {supplier && <div style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginTop: '4px' }}>Fornitore: {supplier.name}</div>}
                  {isDecommissioned && <div style={{ fontSize: '0.78rem', color: WP_COLORS.danger, fontWeight: 700, marginTop: '4px' }}>
                    ⛔ Dismesso dal {new Date(v.decommission_from).toLocaleDateString('it-IT')} al {new Date(v.decommission_to).toLocaleDateString('it-IT')}
                  </div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.82rem' }}>
                {/* Scadenze */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', color: WP_COLORS.textMuted, marginBottom: '6px' }}>Scadenze mezzo</div>
                  {exps.length === 0 ? <div style={{ color: WP_COLORS.textMuted }}>—</div> : exps.map(e => (
                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span>{e.type}</span>
                      {expChip(e.due_date)}
                    </div>
                  ))}
                </div>

                {/* Tessere carburante */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', color: WP_COLORS.textMuted, marginBottom: '6px' }}>Tessere carburante</div>
                  {fcs.length === 0 ? <div style={{ color: WP_COLORS.textMuted }}>—</div> : fcs.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span>{c.supplier} {c.number}</span>
                      {expChip(c.expires_at)}
                    </div>
                  ))}
                </div>

                {/* Telepass */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', color: WP_COLORS.textMuted, marginBottom: '6px' }}>Telepass</div>
                  {tps.length === 0 ? <div style={{ color: WP_COLORS.textMuted }}>—</div> : tps.map(t => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span>{t.number}</span>
                      {expChip(t.expires_at)}
                    </div>
                  ))}
                </div>

                {/* Pneumatici */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', color: WP_COLORS.textMuted, marginBottom: '6px' }}>Pneumatici in deposito</div>
                  {tires.length === 0 ? <div style={{ color: WP_COLORS.textMuted }}>—</div> : tires.map(t => (
                    <div key={t.id} style={{ marginBottom: '4px' }}>
                      <span style={wpBadge(t.season === 'Invernali' ? WP_COLORS.info : WP_COLORS.warning, t.season === 'Invernali' ? 'white' : '#713f12')}>{t.season}</span>
                      <div style={{ fontSize: '0.72rem', color: WP_COLORS.textMuted, marginTop: '2px' }}>{t.location}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
