import React, { useState } from 'react'
import { WP_COLORS } from '../shared/wpStyles'

const PERMISSION_REASONS = [
  'Assistenza parenti',
  'Corso di aggiornamento',
  'Maternità / Paternità',
  'Visita medica',
  'Permesso non retribuito',
  'Altro'
]

export default function EmpLeaveRequest() {
  const [type, setType] = useState('Permesso')
  const [singleDate, setSingleDate] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [fullDay, setFullDay] = useState(false)
  const [reason, setReason] = useState('')
  const [motivation, setMotivation] = useState('')

  const handleSend = () => {
    alert(`Richiesta inviata al P.M.\n\nTipo: ${type}\n${type === 'Ferie' ? `Dal ${dateFrom} al ${dateTo}` : `Data ${singleDate}${fullDay ? ' (intera giornata)' : ` ${timeFrom}-${timeTo}`}`}\n\nMotivazione: ${reason || motivation}`)
  }

  return (
    <div>
      <select value={type} onChange={e => setType(e.target.value)} style={{ ...inp, marginBottom: '20px', fontWeight: 700, fontSize: '1rem' }}>
        <option value="Permesso">Permesso</option>
        <option value="Ferie">Ferie</option>
      </select>

      {type === 'Ferie' ? (
        <>
          <label style={lbl}>Dal</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inp, marginBottom: '12px' }} />
          <label style={lbl}>Al</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inp, marginBottom: '12px' }} />

          <label style={lbl}>Motivo:</label>
          <textarea rows={4} value={motivation} onChange={e => setMotivation(e.target.value)} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', marginBottom: '20px' }} />
        </>
      ) : (
        <>
          <label style={lbl}>Data</label>
          <input type="date" value={singleDate} onChange={e => setSingleDate(e.target.value)} style={{ ...inp, marginBottom: '12px' }} />

          {!fullDay && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <div>
                <label style={lbl}>Dalle</label>
                <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>Alle</label>
                <input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} style={inp} />
              </div>
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px', justifyContent: 'center' }}>
            <input type="checkbox" checked={fullDay} onChange={e => setFullDay(e.target.checked)} />
            <span style={{ fontStyle: 'italic', color: WP_COLORS.primary }}>Intera Giornata</span>
          </label>

          <h4 style={{ color: WP_COLORS.primary, fontWeight: 700, fontSize: '0.9rem', margin: '0 0 8px 0' }}>Tipo Di Richiesta</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {PERMISSION_REASONS.map(r => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
                <span style={{ fontStyle: 'italic', fontWeight: 600 }}>{r}</span>
              </label>
            ))}
          </div>

          <label style={lbl}>Motivo:</label>
          <textarea rows={3} value={motivation} onChange={e => setMotivation(e.target.value)} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', marginBottom: '20px' }} />
        </>
      )}

      <button onClick={handleSend} style={{
        background: WP_COLORS.primary, color: 'white', border: 'none',
        padding: '16px', borderRadius: '8px', fontWeight: 900, fontSize: '1rem',
        cursor: 'pointer', width: '100%'
      }}>
        Invia Richiesta
      </button>
    </div>
  )
}

const lbl = {
  display: 'block', fontWeight: 800, fontSize: '0.95rem',
  color: WP_COLORS.primary, marginBottom: '4px'
}
const inp = {
  width: '100%', padding: '10px', boxSizing: 'border-box',
  border: `1.5px solid ${WP_COLORS.primary}`, borderRadius: '8px',
  fontSize: '0.9rem', background: 'white', outline: 'none'
}
