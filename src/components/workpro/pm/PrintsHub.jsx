import React, { useState } from 'react'
import { Printer, FileText, Users, Building2 } from 'lucide-react'
import { WP_COLORS, wpButton, wpCard, wpInput, wpLabel } from '../shared/wpStyles'

export default function PrintsHub() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [type, setType] = useState('sites')

  const handleGenerate = () => {
    alert(`Stampa "${type}" per ${month} — in produzione genererà un PDF via Supabase Edge Function`)
  }

  const cards = [
    { id: 'sites',     label: 'Riepilogo Cantieri',    icon: <Building2 size={24} />, desc: 'Ore lavorate per cantiere, costo classe, totale mese' },
    { id: 'employees', label: 'Riepilogo Dipendenti',  icon: <Users size={24} />,     desc: 'Ore lavorate, ferie, malattie, trasferte per dipendente' },
    { id: 'entries',   label: 'Riepilogo Inserimenti', icon: <FileText size={24} />,  desc: 'Dettaglio timbrature, spese, extra per dipendente' }
  ]

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Printer size={22} color={WP_COLORS.primary} />
        Stampe Mensili
      </h2>
      <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginBottom: '20px' }}>
        Genera riepiloghi PDF da inviare a contabilità o all'HR.
      </p>

      <div style={{ ...wpCard, marginBottom: '20px', maxWidth: '420px' }}>
        <label style={wpLabel}>Mese di riferimento</label>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={wpInput} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        {cards.map(c => (
          <div key={c.id} style={{ ...wpCard }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: WP_COLORS.primary }}>
              {c.icon}
              <strong style={{ fontSize: '0.95rem' }}>{c.label}</strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: WP_COLORS.textMuted, margin: '0 0 14px 0', lineHeight: 1.5 }}>{c.desc}</p>
            <button onClick={() => { setType(c.id); handleGenerate(); }} style={{ ...wpButton('primary', 'md'), width: '100%' }}>
              <Printer size={14} /> Genera PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
