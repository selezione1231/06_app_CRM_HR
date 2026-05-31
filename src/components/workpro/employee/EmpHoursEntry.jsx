import React, { useState, useMemo } from 'react'
import { Plus, Minus, Save, Search } from 'lucide-react'
import { WP_COLORS, wpButton } from '../shared/wpStyles'
import { WP_CLIENTS, WP_SITES, WP_VEHICLES, WP_ASSIGNMENTS, WP_EMPLOYEES } from '../shared/wpSeed'

// Replica fedele del form "INSERISCI ORE" visto nel video
export default function EmpHoursEntry({ employeeId }) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [entryNum, setEntryNum] = useState(1)
  const [company, setCompany] = useState('TODOS')
  const [clientSearch, setClientSearch] = useState('')
  const [clientId, setClientId] = useState('')
  const [siteSearch, setSiteSearch] = useState('')
  const [siteId, setSiteId] = useState('')
  const [hours, setHours] = useState('')
  const [trasferta, setTrasferta] = useState(false)
  const [pernottamento, setPernottamento] = useState(false)
  const [notturno, setNotturno] = useState(false)
  const [vehicleId, setVehicleId] = useState('')
  const [expenses, setExpenses] = useState([{ desc: '', amount: '' }, { desc: '', amount: '' }, { desc: '', amount: '' }, { desc: '', amount: '' }])
  const [notes, setNotes] = useState('')

  // Pre-popola da assegnazione del giorno
  useMemo(() => {
    const a = WP_ASSIGNMENTS.find(x => x.employee_id === employeeId && x.date === date)
    if (a) {
      if (a.site_id) {
        setSiteId(a.site_id)
        const site = WP_SITES.find(s => s.id === a.site_id)
        if (site) setClientId(site.client_id)
      }
      if (a.vehicle_id) setVehicleId(a.vehicle_id)
    }
  }, [employeeId, date])

  const filteredClients = WP_CLIENTS.filter(c => {
    if (c.type !== 'Cliente') return false
    const t = clientSearch.toLowerCase()
    return !t || c.name.toLowerCase().includes(t)
  })
  const filteredSites = WP_SITES.filter(s => {
    if (clientId && s.client_id !== clientId) return false
    const t = siteSearch.toLowerCase()
    return !t || s.code.toLowerCase().includes(t) || s.name.toLowerCase().includes(t)
  })

  const updateExpense = (i, field, value) => {
    setExpenses(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }

  const handleSave = () => {
    alert(`Timbratura inviata al P.M.\n\n${hours}h · ${notturno ? 'NOTTURNO ' : ''}${trasferta ? 'TRASFERTA ' : ''}${pernottamento ? 'PERN.' : ''}\n\nIn attesa di approvazione.`)
  }

  return (
    <div>
      {/* Data + Nr Inserimento */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Data</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
        </div>
        <div>
          <label style={lbl}>Nr. Inserimento</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input type="number" value={entryNum} onChange={e => setEntryNum(parseInt(e.target.value) || 1)} style={{ ...inp, width: '60px', textAlign: 'center' }} />
            <button onClick={() => setEntryNum(n => n + 1)} style={squareBtn}><Plus size={12} /></button>
            <button onClick={() => setEntryNum(n => Math.max(1, n - 1))} style={squareBtn}><Minus size={12} /></button>
          </div>
        </div>
      </div>

      {/* Azienda */}
      <label style={lbl}>Azienda</label>
      <select value={company} onChange={e => setCompany(e.target.value)} style={{ ...inp, marginBottom: '14px' }}>
        <option value="TODOS">TODOS</option>
      </select>

      {/* Cliente */}
      <label style={lbl}>Cliente</label>
      <div style={{ position: 'relative', marginBottom: '6px' }}>
        <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: WP_COLORS.textMuted }} />
        <input placeholder="Inserisci il testo di ricerca" value={clientSearch} onChange={e => setClientSearch(e.target.value)} style={{ ...inp, paddingLeft: '28px' }} />
      </div>
      <select value={clientId} onChange={e => { setClientId(e.target.value); setSiteId(''); }} style={{ ...inp, marginBottom: '14px' }}>
        <option value="">— Seleziona —</option>
        {filteredClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {/* Cantiere */}
      <label style={lbl}>Cantiere</label>
      <div style={{ position: 'relative', marginBottom: '6px' }}>
        <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: WP_COLORS.textMuted }} />
        <input placeholder="Inserisci il testo di ricerca" value={siteSearch} onChange={e => setSiteSearch(e.target.value)} style={{ ...inp, paddingLeft: '28px' }} />
      </div>
      <select value={siteId} onChange={e => setSiteId(e.target.value)} style={{ ...inp, marginBottom: '14px' }}>
        <option value="">— Seleziona —</option>
        {filteredSites.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
      </select>

      {/* Extra (ore + checkbox) */}
      <label style={lbl}>Extra</label>
      <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 1fr', gap: '6px', alignItems: 'center', marginBottom: '14px' }}>
        <input type="number" placeholder="Ore" value={hours} onChange={e => setHours(e.target.value)} style={{ ...inp, padding: '8px', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }} />
        <CheckBox label="Trasferta" checked={trasferta} onChange={setTrasferta} />
        <CheckBox label="Pernottam." checked={pernottamento} onChange={setPernottamento} />
        <CheckBox label="Notturno" checked={notturno} onChange={setNotturno} color="#1d4ed8" />
      </div>

      {/* Mezzo */}
      <label style={lbl}>Mezzo</label>
      <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} style={{ ...inp, marginBottom: '14px' }}>
        <option value="">—</option>
        {WP_VEHICLES.map(v => <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>)}
      </select>

      {/* Spese */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        <div>
          <label style={lbl}>Spesa</label>
          {expenses.map((e, i) => (
            <input key={i} placeholder={`Voce ${i + 1}`} value={e.desc} onChange={ev => updateExpense(i, 'desc', ev.target.value)} style={{ ...inp, marginBottom: '4px', padding: '8px' }} />
          ))}
        </div>
        <div>
          <label style={lbl}>Importo</label>
          {expenses.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <input type="number" placeholder="0,00" value={e.amount} onChange={ev => updateExpense(i, 'amount', ev.target.value)} style={{ ...inp, padding: '8px' }} />
              <span style={{ color: WP_COLORS.primary, fontWeight: 800 }}>€</span>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <label style={lbl}>Note</label>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
        style={{ ...inp, marginBottom: '14px', resize: 'vertical', fontFamily: 'inherit' }} />

      <button onClick={handleSave} style={{
        background: WP_COLORS.primary, color: 'white', border: 'none',
        padding: '16px', borderRadius: '8px', fontWeight: 900, fontSize: '1.1rem',
        cursor: 'pointer', width: '100%', letterSpacing: '0.05em'
      }}>
        Salva
      </button>
    </div>
  )
}

function CheckBox({ label, checked, onChange, color }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
      <span style={{
        width: '22px', height: '22px', borderRadius: '4px',
        border: `1.5px solid ${WP_COLORS.primary}`,
        background: checked ? (color || WP_COLORS.primary) : 'white',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.9rem', fontWeight: 900
      }} onClick={() => onChange(!checked)}>{checked ? '✓' : ''}</span>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: color || WP_COLORS.primary }}>{label}</span>
    </label>
  )
}

const lbl = {
  display: 'block', fontWeight: 700, fontSize: '0.85rem',
  color: WP_COLORS.primary, marginBottom: '4px'
}
const inp = {
  width: '100%', padding: '10px', boxSizing: 'border-box',
  border: `1.5px solid ${WP_COLORS.primary}`, borderRadius: '8px',
  fontSize: '0.88rem', background: 'white', outline: 'none'
}
const squareBtn = {
  background: WP_COLORS.primary, color: 'white', border: 'none',
  width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}
