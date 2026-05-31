import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, X, Search } from 'lucide-react'
import { WP_COLORS, wpButton, wpInput, wpLabel, wpBadge } from '../shared/wpStyles'
import {
  WP_EMPLOYEES, WP_SITES, WP_VEHICLES, WP_CLIENTS,
  WP_ASSIGNMENTS, WP_LEAVE_REQUESTS, SPECIAL_LABELS
} from '../shared/wpSeed'

// ============================================================================
// WeeklyPlanner — pianificazione settimanale del P.M.
// Mostra dipendenti × giorni; cella assegnabile via menu/maschera
// Barra inferiore con riepilogo speciali per giornata
// ============================================================================

const WEEKDAY_LABELS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
const SPECIAL_TYPES = ['Ferie', 'Malattia', 'Infortunio', 'TD', 'TN', 'RD', 'RN', 'Permesso']

export default function WeeklyPlanner({ pmId }) {
  // Settimana corrente (lunedì)
  const [weekStart, setWeekStart] = useState(() => {
    const t = new Date()
    const d = t.getDay()
    const diff = t.getDate() - d + (d === 0 ? -6 : 1)
    const m = new Date(t.setDate(diff))
    m.setHours(0, 0, 0, 0)
    return m
  })

  const [assignments, setAssignments] = useState(WP_ASSIGNMENTS)
  const [modalCell, setModalCell] = useState(null) // { employeeId, date, assignment? }

  // 7 date settimana
  const weekDates = useMemo(() => {
    const arr = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      arr.push(d)
    }
    return arr
  }, [weekStart])
  const weekDatesStr = weekDates.map(d => d.toISOString().split('T')[0])

  // Dipendenti del P.M. loggato — caposquadra prima
  const teamEmployees = useMemo(() => {
    return WP_EMPLOYEES.filter(e => e.pm_id === pmId)
      .sort((a, b) => (b.is_leader === a.is_leader) ? 0 : (b.is_leader ? 1 : -1))
  }, [pmId])

  // Helper assegnazione singolo dipendente/giorno
  const getCell = (employeeId, dateStr) => {
    return assignments.find(a => a.employee_id === employeeId && a.date === dateStr)
  }

  // Riepilogo speciali per giorno (per la barra inferiore)
  const specialsByDay = useMemo(() => {
    return weekDatesStr.map(d => {
      const teamIds = teamEmployees.map(e => e.id)
      const dayAss = assignments.filter(a => a.date === d && teamIds.includes(a.employee_id))
      const counts = {}
      dayAss.forEach(a => {
        if (a.special) counts[a.special] = (counts[a.special] || 0) + 1
      })
      const sitesCount = dayAss.filter(a => a.site_id).length
      return { date: d, counts, sitesCount }
    })
  }, [assignments, weekDatesStr, teamEmployees])

  // Salva assegnazione (creazione o modifica)
  const handleSaveAssignment = (data) => {
    setAssignments(prev => {
      const existing = prev.find(a => a.employee_id === data.employee_id && a.date === data.date)
      if (existing) {
        return prev.map(a => a.id === existing.id ? { ...existing, ...data } : a)
      }
      return [...prev, { ...data, id: `a-new-${Date.now()}` }]
    })
    setModalCell(null)
  }

  const handleDeleteAssignment = (employeeId, date) => {
    setAssignments(prev => prev.filter(a => !(a.employee_id === employeeId && a.date === date)))
    setModalCell(null)
  }

  // Navigazione settimana
  const shiftWeek = (delta) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + delta * 7)
    setWeekStart(d)
  }
  const goToday = () => {
    const t = new Date()
    const d = t.getDay()
    const diff = t.getDate() - d + (d === 0 ? -6 : 1)
    const m = new Date(t.setDate(diff))
    m.setHours(0, 0, 0, 0)
    setWeekStart(m)
  }

  const formatRange = () => {
    const s = weekDates[0].toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
    const e = weekDates[6].toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
    return `${s} → ${e}`
  }

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalIcon size={22} color={WP_COLORS.primary} />
          Pianificazione Settimanale
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => shiftWeek(-1)} style={{ ...wpButton('primary', 'sm') }}><ChevronLeft size={14} /></button>
          <div style={{
            padding: '8px 14px', background: 'white', border: `1.5px solid ${WP_COLORS.primary}`,
            borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', color: WP_COLORS.primary
          }}>{formatRange()}</div>
          <button onClick={() => shiftWeek(1)} style={{ ...wpButton('primary', 'sm') }}><ChevronRight size={14} /></button>
          <button onClick={goToday} style={{ ...wpButton('secondary', 'sm') }}>Oggi</button>
        </div>
      </div>

      {/* GRIGLIA */}
      <div style={{ overflowX: 'auto', border: `1px solid ${WP_COLORS.border}`, borderRadius: '8px', background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: WP_COLORS.primary, color: 'white', padding: '10px 12px', textAlign: 'left', minWidth: '180px', zIndex: 2 }}>
                Dipendente
              </th>
              {weekDates.map((d, i) => (
                <th key={i} style={{ background: WP_COLORS.primary, color: 'white', padding: '8px 6px', textAlign: 'center', minWidth: '120px' }}>
                  <div style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>{WEEKDAY_LABELS[i]}</div>
                  <div style={{ fontWeight: 800 }}>{d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamEmployees.map(emp => (
              <tr key={emp.id} className="wp-row-strip">
                <td style={{
                  position: 'sticky', left: 0, background: emp.is_leader ? '#fef3c7' : 'white',
                  padding: '8px 12px', borderRight: `1px solid ${WP_COLORS.border}`,
                  fontWeight: 600, zIndex: 1
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {emp.is_leader && (
                      <span title="Caposquadra" style={{
                        background: WP_COLORS.info, color: 'white',
                        fontSize: '0.6rem', fontWeight: 900, padding: '2px 5px', borderRadius: '4px'
                      }}>CS</span>
                    )}
                    <span style={{ color: emp.is_leader ? WP_COLORS.info : WP_COLORS.text }}>{emp.name}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: WP_COLORS.textMuted }}>{emp.code}</div>
                </td>
                {weekDatesStr.map(d => {
                  const cell = getCell(emp.id, d)
                  return (
                    <td
                      key={d}
                      onClick={() => setModalCell({ employeeId: emp.id, date: d, assignment: cell })}
                      style={{
                        padding: '4px', borderLeft: `1px solid ${WP_COLORS.border}`,
                        cursor: 'pointer', verticalAlign: 'top', minHeight: '60px'
                      }}
                    >
                      <AssignmentCell cell={cell} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
          {/* BARRA SPECIALI */}
          <tfoot>
            <tr>
              <td style={{
                position: 'sticky', left: 0, background: '#f1f5f9', padding: '8px 12px',
                fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase',
                color: WP_COLORS.textMuted, borderTop: `2px solid ${WP_COLORS.primary}`, zIndex: 1
              }}>
                Riepilogo
              </td>
              {specialsByDay.map(s => (
                <td key={s.date} style={{
                  padding: '6px 4px', background: '#f1f5f9', borderTop: `2px solid ${WP_COLORS.primary}`,
                  borderLeft: `1px solid ${WP_COLORS.border}`, verticalAlign: 'top'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: WP_COLORS.text }}>
                    {s.sitesCount} cant.
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
                    {Object.entries(s.counts).map(([k, v]) => {
                      const cfg = SPECIAL_LABELS[k]
                      if (!cfg) return null
                      return (
                        <span key={k} style={wpBadge(cfg.bg, cfg.color)}>
                          {cfg.label} {v}
                        </span>
                      )
                    })}
                  </div>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* LEGENDA */}
      <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.72rem' }}>
        <strong style={{ color: WP_COLORS.textMuted }}>LEGENDA:</strong>
        {Object.entries(SPECIAL_LABELS).map(([k, c]) => (
          <span key={k} style={wpBadge(c.bg, c.color)}>{c.label}</span>
        ))}
      </div>

      {/* MODAL ASSEGNAZIONE */}
      {modalCell && (
        <AssignmentModal
          cell={modalCell}
          onSave={handleSaveAssignment}
          onDelete={() => handleDeleteAssignment(modalCell.employeeId, modalCell.date)}
          onClose={() => setModalCell(null)}
        />
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
// AssignmentCell — rendering di una cella della griglia
// ----------------------------------------------------------------------------
function AssignmentCell({ cell }) {
  if (!cell) {
    return (
      <div style={{
        minHeight: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: WP_COLORS.textMuted, fontSize: '0.78rem'
      }}>
        <Plus size={14} />
      </div>
    )
  }

  if (cell.special) {
    const cfg = SPECIAL_LABELS[cell.special]
    if (cfg) {
      return (
        <div style={{
          minHeight: '54px', padding: '6px',
          background: cfg.bg, color: cfg.color, borderRadius: '4px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.78rem'
        }}>
          <span style={{ fontSize: '1.05rem' }}>{cfg.icon}</span>
          <span>{cfg.label}</span>
        </div>
      )
    }
  }

  const site = WP_SITES.find(s => s.id === cell.site_id)
  const vehicle = WP_VEHICLES.find(v => v.id === cell.vehicle_id)
  return (
    <div style={{
      minHeight: '54px', padding: '4px 6px',
      background: WP_COLORS.primaryLight, borderRadius: '4px', borderLeft: `3px solid ${WP_COLORS.primary}`,
      fontSize: '0.72rem'
    }}>
      {site && (
        <div style={{
          fontWeight: 800,
          color: site.is_maintenance ? WP_COLORS.blueSite : WP_COLORS.primary
        }}>
          {site.code}
        </div>
      )}
      {site && <div style={{ fontSize: '0.68rem', color: WP_COLORS.text }}>{site.name}</div>}
      {vehicle && (
        <div style={{ fontSize: '0.66rem', color: WP_COLORS.textMuted, marginTop: '2px' }}>
          🚐 {vehicle.plate}
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
// AssignmentModal — maschera di assegnazione con filtri ricerca
// ----------------------------------------------------------------------------
function AssignmentModal({ cell, onSave, onDelete, onClose }) {
  const existing = cell.assignment
  const [mode, setMode] = useState(existing?.special ? 'special' : 'site')
  const [siteSearch, setSiteSearch] = useState('')
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [siteId, setSiteId] = useState(existing?.site_id || '')
  const [vehicleId, setVehicleId] = useState(existing?.vehicle_id || '')
  const [special, setSpecial] = useState(existing?.special || 'Ferie')
  const [notes, setNotes] = useState(existing?.notes || '')

  const filteredSites = WP_SITES.filter(s => {
    const q = siteSearch.toLowerCase()
    if (!q) return true
    const client = WP_CLIENTS.find(c => c.id === s.client_id)
    return s.code.toLowerCase().includes(q)
      || s.name.toLowerCase().includes(q)
      || s.address.toLowerCase().includes(q)
      || (client && client.name.toLowerCase().includes(q))
  })

  const filteredVehicles = WP_VEHICLES.filter(v => {
    const q = vehicleSearch.toLowerCase()
    if (!q) return true
    return v.plate.toLowerCase().includes(q) || v.model.toLowerCase().includes(q)
  })

  const employee = WP_EMPLOYEES.find(e => e.id === cell.employeeId)
  const cellDate = new Date(cell.date)

  const handleSubmit = () => {
    if (mode === 'special') {
      onSave({ employee_id: cell.employeeId, date: cell.date, site_id: null, vehicle_id: null, special, notes })
    } else {
      if (!siteId) { alert('Seleziona un cantiere'); return }
      onSave({ employee_id: cell.employeeId, date: cell.date, site_id: siteId, vehicle_id: vehicleId || null, special: null, notes })
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'white', maxWidth: '640px', width: '100%',
        borderRadius: '12px', padding: '24px', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Assegnazione</h3>
            <div style={{ fontSize: '0.85rem', color: WP_COLORS.textMuted, marginTop: '4px' }}>
              <strong>{employee?.name}</strong> · {cellDate.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long' })}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* SWITCH cantiere/speciale */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setMode('site')} style={{ ...wpButton(mode === 'site' ? 'primary' : 'ghost', 'sm') }}>Cantiere</button>
          <button onClick={() => setMode('special')} style={{ ...wpButton(mode === 'special' ? 'primary' : 'ghost', 'sm') }}>Speciale (ferie / TD / RD / ...)</button>
        </div>

        {mode === 'site' ? (
          <>
            {/* Cantiere */}
            <label style={wpLabel}>Cantiere</label>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: WP_COLORS.textMuted }} />
              <input
                type="text"
                placeholder="Cerca per codice, nome, cliente..."
                value={siteSearch}
                onChange={(e) => setSiteSearch(e.target.value)}
                style={{ ...wpInput, paddingLeft: '32px' }}
              />
            </div>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              style={{ ...wpInput, marginBottom: '16px' }}
            >
              <option value="">— Seleziona cantiere —</option>
              {filteredSites.map(s => {
                const cli = WP_CLIENTS.find(c => c.id === s.client_id)
                return (
                  <option key={s.id} value={s.id}>
                    {s.code} {s.is_maintenance ? '(MANUT.)' : ''} — {s.name} ({cli?.name})
                  </option>
                )
              })}
            </select>

            {/* Automezzo */}
            <label style={wpLabel}>Automezzo (opzionale)</label>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: WP_COLORS.textMuted }} />
              <input
                type="text"
                placeholder="Cerca per targa o modello..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                style={{ ...wpInput, paddingLeft: '32px' }}
              />
            </div>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              style={{ ...wpInput, marginBottom: '16px' }}
            >
              <option value="">— Nessuno —</option>
              {filteredVehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label style={wpLabel}>Tipo Speciale</label>
            <select value={special} onChange={e => setSpecial(e.target.value)} style={{ ...wpInput, marginBottom: '16px' }}>
              {SPECIAL_TYPES.map(s => <option key={s} value={s}>{SPECIAL_LABELS[s]?.label || s}</option>)}
            </select>
            <div style={{
              padding: '10px', background: WP_COLORS.warningLight, borderRadius: '6px',
              fontSize: '0.78rem', color: '#713f12', marginBottom: '16px'
            }}>
              ⚠️ Ferie/Malattia/Infortunio blocca la modifica per il dipendente in quel giorno.
            </div>
          </>
        )}

        <label style={wpLabel}>Note</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          style={{ ...wpInput, marginBottom: '20px', resize: 'vertical' }}
        />

        {/* AZIONI */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
          {existing && (
            <button onClick={onDelete} style={{ ...wpButton('danger', 'md') }}>
              Elimina
            </button>
          )}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button onClick={onClose} style={{ ...wpButton('ghost', 'md') }}>Annulla</button>
            <button onClick={handleSubmit} style={{ ...wpButton('primary', 'md') }}>
              Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
