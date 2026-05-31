import React, { useState } from 'react'
import { Search, Plus, FileText } from 'lucide-react'
import { WP_COLORS, wpButton } from '../shared/wpStyles'
import { WP_DOCS, WP_EMPLOYEES } from '../shared/wpSeed'

export default function EmpMyTodos({ employeeId }) {
  const employee = WP_EMPLOYEES.find(e => e.id === employeeId)
  const visibleDocs = WP_DOCS.filter(d => {
    if (d.visibility === 'all') return true
    if (d.visibility === 'leaders') return employee?.is_leader
    if (d.visibility === 'custom') return (d.target_employee_ids || []).includes(employeeId)
    return false
  })

  const [showNote, setShowNote] = useState(false)
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [priority, setPriority] = useState('normal')

  return (
    <div>
      <h2 style={{ fontStyle: 'italic', fontWeight: 800, fontSize: '1.05rem', marginBottom: '12px' }}>Elenco Documenti Utili</h2>
      <div style={{ background: 'white', border: `1px solid ${WP_COLORS.border}`, borderRadius: '6px', maxHeight: '280px', overflowY: 'auto' }}>
        {visibleDocs.map(d => (
          <div key={d.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
            padding: '8px 10px', borderBottom: `1px solid ${WP_COLORS.border}`, fontSize: '0.82rem'
          }} className="wp-row-strip">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
              <Search size={12} style={{ color: WP_COLORS.textMuted, flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: WP_COLORS.textMuted, whiteSpace: 'nowrap' }}>
              {new Date(d.created_at).toLocaleDateString('it-IT')}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
        <button onClick={() => setShowNote(true)} style={{
          background: WP_COLORS.primary, color: 'white', border: 'none',
          padding: '14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.92rem',
          cursor: 'pointer'
        }}>
          <Plus size={14} style={{ marginRight: '6px' }} /> Inserisci Nota
        </button>
        <button onClick={() => alert(`${notes.length} note inviate al P.M.`)} style={{
          background: WP_COLORS.primary, color: 'white', border: 'none',
          padding: '14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.92rem',
          cursor: 'pointer'
        }}>
          <FileText size={14} style={{ marginRight: '6px' }} /> Le Mie Note ({notes.length})
        </button>
      </div>

      {showNote && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '360px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Nuova nota</h3>
            <textarea
              value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder="Scrivi la tua nota al P.M..." rows={4}
              style={{
                width: '100%', padding: '10px', border: `1.5px solid ${WP_COLORS.primary}`,
                borderRadius: '6px', fontFamily: 'inherit', resize: 'vertical', marginBottom: '10px', boxSizing: 'border-box'
              }} />
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
              <input type="checkbox" checked={priority === 'high'} onChange={e => setPriority(e.target.checked ? 'high' : 'normal')} />
              Alta priorità (segnalata in rosso al P.M.)
            </label>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNote(false)} style={{ ...wpButton('ghost', 'sm') }}>Annulla</button>
              <button onClick={() => {
                if (noteText) { setNotes([...notes, { text: noteText, priority }]); setNoteText(''); setShowNote(false); }
              }} style={{ ...wpButton('primary', 'sm') }}>Invia</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
