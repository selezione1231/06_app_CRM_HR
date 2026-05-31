import React, { useState } from 'react'
import { Briefcase, Search } from 'lucide-react'
import { WP_COLORS, wpInput, wpBadge, wpTableHeader } from '../shared/wpStyles'
import { WP_CLIENTS } from '../shared/wpSeed'

export default function ClientsTable() {
  const [q, setQ] = useState('')
  const filtered = WP_CLIENTS.filter(c => {
    const s = q.toLowerCase()
    return !s || c.name.toLowerCase().includes(s) || c.arca_code.toLowerCase().includes(s) || c.address.toLowerCase().includes(s)
  })

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Briefcase size={22} color={WP_COLORS.primary} />
        Clienti / Fornitori
      </h2>
      <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginBottom: '16px' }}>
        Anagrafica condivisa con ARCA — codice ARCA è la chiave di sincronizzazione
      </p>

      <div style={{ position: 'relative', marginBottom: '12px', maxWidth: '420px' }}>
        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: WP_COLORS.textMuted }} />
        <input style={{ ...wpInput, paddingLeft: '32px' }} placeholder="Cerca per nome, codice ARCA, città..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div style={{ overflowX: 'auto', border: `1px solid ${WP_COLORS.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', minWidth: '700px' }}>
          <thead>
            <tr>
              <th style={wpTableHeader}>Cod. ARCA</th>
              <th style={wpTableHeader}>Ragione Sociale</th>
              <th style={wpTableHeader}>P.IVA</th>
              <th style={wpTableHeader}>Indirizzo</th>
              <th style={wpTableHeader}>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="wp-row-strip">
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: WP_COLORS.primary }}>{c.arca_code}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: '10px 12px', fontSize: '0.82rem', fontFamily: 'monospace' }}>{c.piva}</td>
                <td style={{ padding: '10px 12px', fontSize: '0.85rem' }}>{c.address}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={wpBadge(c.type === 'Cliente' ? WP_COLORS.info : '#a855f7')}>{c.type}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
