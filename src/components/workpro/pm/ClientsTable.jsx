import React, { useState, useEffect } from 'react'
import { Briefcase, Search } from 'lucide-react'
import { WP_COLORS, wpInput, wpBadge, wpTableHeader } from '../shared/wpStyles'
import { WP_CLIENTS } from '../shared/wpSeed'
import { fetchContacts, isLegacyDataAvailable } from '../../../lib/legacyData'

// ============================================================================
// ClientsTable — anagrafica clienti/fornitori
// Con login reale legge l'anagrafica importata dal gestionale (contacts,
// 12k record, ricerca lato server). In demo usa i seed come prima.
// ============================================================================

const TIPI = ['Tutti', 'Clienti', 'Fornitori']

export default function ClientsTable() {
  const live = isLegacyDataAvailable()
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('Tutti')
  const [includeUnused, setIncludeUnused] = useState(false)
  const [rows, setRows] = useState(null)     // null = seed/demo
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(live)

  // Ricerca lato server con debounce
  useEffect(() => {
    if (!live) return
    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      const res = await fetchContacts({ q, tipo, includeUnused })
      if (cancelled) return
      if (res) { setRows(res.rows); setTotal(res.total) }
      setLoading(false)
    }, q ? 300 : 0)
    return () => { cancelled = true; clearTimeout(t) }
  }, [live, q, tipo, includeUnused])

  // Demo: filtro client-side sui seed (comportamento originale)
  const demoFiltered = WP_CLIENTS.filter(c => {
    const s = q.toLowerCase()
    return !s || c.name.toLowerCase().includes(s) || c.arca_code.toLowerCase().includes(s) || c.address.toLowerCase().includes(s)
  })

  const list = live && rows ? rows : demoFiltered

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Briefcase size={22} color={WP_COLORS.primary} />
        Clienti / Fornitori
      </h2>
      <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginBottom: '16px' }}>
        {live
          ? 'Anagrafica importata dal gestionale — il codice ARCA è la chiave di sincronizzazione'
          : 'Anagrafica condivisa con ARCA — codice ARCA è la chiave di sincronizzazione'}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ position: 'relative', maxWidth: '420px', flex: '1 1 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: WP_COLORS.textMuted }} />
          <input style={{ ...wpInput, paddingLeft: '32px' }} placeholder="Cerca per nome, codice ARCA, città, P.IVA..." value={q} onChange={e => setQ(e.target.value)} />
        </div>

        {live && TIPI.map(t => (
          <button key={t} onClick={() => setTipo(t)} style={{
            padding: '6px 12px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer',
            border: `1.5px solid ${tipo === t ? WP_COLORS.primary : WP_COLORS.border}`,
            background: tipo === t ? WP_COLORS.primaryLight : 'white',
            color: tipo === t ? WP_COLORS.primary : WP_COLORS.textMuted
          }}>{t}</button>
        ))}

        {live && (
          <label style={{ fontSize: '0.72rem', color: WP_COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input type="checkbox" checked={includeUnused} onChange={e => setIncludeUnused(e.target.checked)} />
            mostra anche inutilizzati
          </label>
        )}

        {live && (
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: WP_COLORS.textMuted, fontWeight: 600 }}>
            {loading ? 'Carico…' : `${list.length < total ? `primi ${list.length} di ` : ''}${total.toLocaleString('it-IT')} anagrafiche`}
          </span>
        )}
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
            {list.length === 0 && !loading && (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: WP_COLORS.textMuted, fontSize: '0.8rem' }}>Nessuna anagrafica trovata.</td></tr>
            )}
            {list.map(c => (
              <tr key={c.id} className="wp-row-strip" style={c.unused ? { opacity: 0.5 } : undefined}>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: WP_COLORS.primary }}>{c.arca_code}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: '10px 12px', fontSize: '0.82rem', fontFamily: 'monospace' }}>{c.piva}</td>
                <td style={{ padding: '10px 12px', fontSize: '0.85rem' }}>{c.address}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={wpBadge(c.type === 'Cliente' ? WP_COLORS.info : c.type === 'Fornitore' ? '#a855f7' : '#64748b')}>{c.type}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
