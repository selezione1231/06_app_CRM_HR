import React, { useState, useMemo } from 'react'
import { Phone, Calendar as CalIcon, CheckCircle2, AlertCircle } from 'lucide-react'
import { WP_COLORS, wpButton, wpCard, wpBadge, wpTableHeader } from '../shared/wpStyles'
import { WP_ONCALL_SHIFTS, WP_EMPLOYEES, WP_HOLIDAYS, WP_ONCALL_TYPES } from '../shared/wpSeed'

export default function OnCallScheduler() {
  const [shifts, setShifts] = useState(WP_ONCALL_SHIFTS)
  const [area, setArea] = useState('CDZ')
  const [quad, setQuad] = useState(2)

  const filtered = shifts.filter(s => s.area === area && s.quadrimestre === quad)
                         .sort((a, b) => a.date.localeCompare(b.date))

  const toggleConfirm = (id) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, confirmed: !s.confirmed } : s))
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Phone size={22} color={WP_COLORS.primary} />
        Reperibilità
      </h2>
      <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginBottom: '16px' }}>
        Suddivisione per area (CDZ / Uffici / RADIO) e per quadrimestre. Verde = confermato, Giallo = in attesa di conferma.
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: WP_COLORS.textMuted, marginBottom: '4px' }}>Area</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {WP_ONCALL_TYPES.filter(t => t !== 'Nessuna').map(t => (
              <button key={t} onClick={() => setArea(t)} style={{ ...wpButton(area === t ? 'primary' : 'ghost', 'sm') }}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: WP_COLORS.textMuted, marginBottom: '4px' }}>Quadrimestre</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3].map(q => (
              <button key={q} onClick={() => setQuad(q)} style={{ ...wpButton(quad === q ? 'primary' : 'ghost', 'sm') }}>
                Q{q} {q === 1 ? '(Gen-Apr)' : q === 2 ? '(Mag-Ago)' : '(Set-Dic)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '16px' }}>
        {/* Calendario reperibilità */}
        <div style={{ overflowX: 'auto', border: `1px solid ${WP_COLORS.border}`, borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr>
                <th style={wpTableHeader}>Data</th>
                <th style={wpTableHeader}>Reperibile</th>
                <th style={wpTableHeader}>Stato</th>
                <th style={wpTableHeader}>Note</th>
                <th style={wpTableHeader}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: WP_COLORS.textMuted }}>Nessun turno in questo periodo.</td></tr>}
              {filtered.map(s => {
                const emp = WP_EMPLOYEES.find(e => e.id === s.employee_id)
                return (
                  <tr key={s.id} style={{ background: s.confirmed ? '#dcfce7' : '#fef9c3' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{new Date(s.date).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                    <td style={{ padding: '10px 12px' }}>{emp?.name}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {s.confirmed
                        ? <span style={wpBadge(WP_COLORS.success)}><CheckCircle2 size={10} /> Confermato</span>
                        : <span style={wpBadge(WP_COLORS.warning, '#713f12')}><AlertCircle size={10} /> In attesa</span>
                      }
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '0.82rem' }}>{s.notes || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <button onClick={() => toggleConfirm(s.id)} style={{ ...wpButton(s.confirmed ? 'ghost' : 'success', 'sm') }}>
                        {s.confirmed ? 'Riapri' : 'Conferma'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Giorni festivi (per calcolo RADIO) */}
        <div style={wpCard}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalIcon size={16} color={WP_COLORS.primary} /> Festivi {new Date().getFullYear()}
          </h3>
          <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginBottom: '12px' }}>
            Usati nel calcolo reperibilità RADIO.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {WP_HOLIDAYS.map(h => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span>{h.name}</span>
                <strong>{new Date(h.date).toLocaleDateString('it-IT')}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
