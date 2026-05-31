import React, { useState } from 'react'
import { FileText, Plus, Calendar, Users, Crown, X, Upload } from 'lucide-react'
import { WP_COLORS, wpButton, wpCard, wpInput, wpLabel, wpBadge, wpTableHeader } from '../shared/wpStyles'
import { WP_DOCS, WP_EMPLOYEES } from '../shared/wpSeed'

export default function MyTodosDocs() {
  const [docs, setDocs] = useState(WP_DOCS)
  const [showAdd, setShowAdd] = useState(false)

  const handleAdd = (doc) => {
    setDocs(prev => [...prev, { ...doc, id: `doc-new-${Date.now()}`, created_at: new Date().toISOString() }])
    setShowAdd(false)
  }

  const visBadge = (v) => {
    if (v === 'leaders') return <span style={wpBadge('#7c3aed')}><Crown size={10} /> Solo CS</span>
    if (v === 'custom')  return <span style={wpBadge(WP_COLORS.info)}><Users size={10} /> Custom</span>
    return <span style={wpBadge(WP_COLORS.success)}>Tutti</span>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={22} color={WP_COLORS.primary} />
          My Todos — Documenti per APP
        </h2>
        <button onClick={() => setShowAdd(true)} style={{ ...wpButton('primary', 'md') }}>
          <Plus size={14} /> Aggiungi documento
        </button>
      </div>
      <p style={{ fontSize: '0.78rem', color: WP_COLORS.textMuted, marginBottom: '16px' }}>
        Documenti distribuiti via APP. Visibilità: tutti / solo caposquadra / persone specifiche · data scadenza opzionale.
      </p>

      <div style={{ overflowX: 'auto', border: `1px solid ${WP_COLORS.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', minWidth: '720px' }}>
          <thead>
            <tr>
              <th style={wpTableHeader}>Titolo</th>
              <th style={wpTableHeader}>Visibilità</th>
              <th style={wpTableHeader}>Scadenza</th>
              <th style={wpTableHeader}>Caricato</th>
            </tr>
          </thead>
          <tbody>
            {docs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(d => (
              <tr key={d.id} className="wp-row-strip">
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{d.title}</td>
                <td style={{ padding: '10px 12px' }}>{visBadge(d.visibility)}</td>
                <td style={{ padding: '10px 12px', fontSize: '0.82rem' }}>{d.expires_at ? new Date(d.expires_at).toLocaleDateString('it-IT') : <em style={{ color: WP_COLORS.textMuted }}>nessuna</em>}</td>
                <td style={{ padding: '10px 12px', fontSize: '0.78rem', color: WP_COLORS.textMuted }}>{new Date(d.created_at).toLocaleString('it-IT')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddDocModal onSave={handleAdd} onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function AddDocModal({ onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [visibility, setVisibility] = useState('all')
  const [expiresAt, setExpiresAt] = useState('')
  const [targets, setTargets] = useState([])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', maxWidth: '520px', width: '100%', borderRadius: '12px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>Nuovo documento</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <label style={wpLabel}>Titolo</label>
        <input value={title} onChange={e => setTitle(e.target.value)} style={{ ...wpInput, marginBottom: '12px' }} />
        <label style={wpLabel}>File</label>
        <div style={{
          border: `2px dashed ${WP_COLORS.border}`, borderRadius: '8px', padding: '20px',
          textAlign: 'center', color: WP_COLORS.textMuted, marginBottom: '12px', cursor: 'pointer'
        }}>
          <Upload size={20} /> <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>Clicca o trascina un file qui</div>
          <div style={{ fontSize: '0.72rem' }}>(in produzione: upload su Supabase Storage)</div>
        </div>
        <label style={wpLabel}>Visibilità</label>
        <select value={visibility} onChange={e => setVisibility(e.target.value)} style={{ ...wpInput, marginBottom: '12px' }}>
          <option value="all">Tutti i dipendenti</option>
          <option value="leaders">Solo caposquadra</option>
          <option value="custom">Persone specifiche</option>
        </select>
        {visibility === 'custom' && (
          <select multiple value={targets} onChange={(e) => setTargets(Array.from(e.target.selectedOptions, o => o.value))} style={{ ...wpInput, marginBottom: '12px', minHeight: '120px' }}>
            {WP_EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name} ({e.code})</option>)}
          </select>
        )}
        <label style={wpLabel}>Data scadenza (opz.)</label>
        <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} style={{ ...wpInput, marginBottom: '20px' }} />

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ ...wpButton('ghost', 'md') }}>Annulla</button>
          <button onClick={() => title && onSave({ title, visibility, target_employee_ids: targets, expires_at: expiresAt || null, file_url: '#' })} style={{ ...wpButton('primary', 'md') }}>
            Salva
          </button>
        </div>
      </div>
    </div>
  )
}
