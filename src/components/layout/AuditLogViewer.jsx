import React, { useEffect, useMemo, useState } from 'react'
import { History, RefreshCw, Search, Filter } from 'lucide-react'
import AuditTrail from './AuditTrail'
import { fetchRecent, ACTION_META, ENTITY_LABELS } from '../../lib/audit'
import { MODULE_META } from '../../lib/notifications'

// ============================================================================
// AuditLogViewer — pagina/sezione "Storico modifiche" (admin/HR/direzione)
// ----------------------------------------------------------------------------
// Feed completo con filtri (modulo, azione, entità, testo libero) e
// raggruppamento per giorno. Click su entry espande il diff inline.
// ============================================================================

export default function AuditLogViewer() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterModule, setFilterModule] = useState('all')
  const [filterEntity, setFilterEntity] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchRecent({
        limit: 300,
        filters: {
          q: q || undefined,
          action: filterAction === 'all' ? undefined : filterAction,
          module: filterModule === 'all' ? undefined : filterModule,
          entityType: filterEntity === 'all' ? undefined : filterEntity
        }
      })
      setItems(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [q, filterAction, filterModule, filterEntity])

  const grouped = useMemo(() => {
    const map = new Map()
    items.forEach(e => {
      const day = new Date(e.created_at).toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
      if (!map.has(day)) map.set(day, [])
      map.get(day).push(e)
    })
    return Array.from(map.entries())
  }, [items])

  const uniqueEntities = useMemo(() => {
    return Array.from(new Set(items.map(e => e.entity_type))).sort()
  }, [items])

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
            <History size={22} color="var(--primary, #A82238)" />
            Storico modifiche (Audit log)
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0' }}>
            Tutte le modifiche critiche del sistema — immutabili, append-only.
          </p>
        </div>
        <button onClick={load} style={refreshBtn}>
          <RefreshCw size={12} /> Aggiorna
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white', border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '10px', padding: '12px', marginBottom: '14px',
        display: 'grid', gridTemplateColumns: 'minmax(200px,2fr) repeat(3, minmax(140px,1fr))', gap: '10px'
      }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94a3b8)' }} />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Cerca per nome, email, campo, nota..."
            style={{ ...inputStyle, paddingLeft: '30px' }}
          />
        </div>
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)} style={inputStyle}>
          <option value="all">Tutti i moduli</option>
          {Object.entries(MODULE_META).map(([k, m]) => (
            <option key={k} value={k}>{m.icon} {m.label}</option>
          ))}
        </select>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} style={inputStyle}>
          <option value="all">Tutte le azioni</option>
          {Object.entries(ACTION_META).map(([k, a]) => (
            <option key={k} value={k}>{a.icon} {a.label}</option>
          ))}
        </select>
        <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} style={inputStyle}>
          <option value="all">Tutte le entità</option>
          {uniqueEntities.map(et => (
            <option key={et} value={et}>{ENTITY_LABELS[et] || et}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', flexWrap: 'wrap' }}>
        <strong>{items.length}</strong> eventi
        {filterModule !== 'all' && <span>· modulo: <strong>{MODULE_META[filterModule]?.label || filterModule}</strong></span>}
        {filterAction !== 'all' && <span>· azione: <strong>{ACTION_META[filterAction]?.label || filterAction}</strong></span>}
        {filterEntity !== 'all' && <span>· entità: <strong>{ENTITY_LABELS[filterEntity] || filterEntity}</strong></span>}
        {q && <span>· filtro testo: "<strong>{q}</strong>"</span>}
      </div>

      {/* Feed raggruppato per giorno */}
      {loading && <div style={emptyStyle}>Caricamento...</div>}
      {!loading && items.length === 0 && (
        <div style={emptyStyle}>
          <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>📜</div>
          Nessun evento per questi filtri.
        </div>
      )}

      {grouped.map(([day, entries]) => (
        <div key={day} style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em',
            color: 'var(--text-muted, #94a3b8)', fontWeight: 800,
            paddingBottom: '6px', marginBottom: '8px',
            borderBottom: '1px solid var(--border-color, #e2e8f0)'
          }}>
            {day} <span style={{ marginLeft: '6px', color: 'var(--text-muted, #cbd5e1)', fontWeight: 600 }}>· {entries.length} eventi</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entries.map(e => <FeedRow key={e.id} e={e} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ----------------------------------------------------------------------------
function FeedRow({ e }) {
  const [open, setOpen] = useState(false)
  const meta = ACTION_META[e.action] || { label: e.action, color: '#64748b', bg: '#f1f5f9', icon: '•' }
  const mod = MODULE_META[e.source_module] || { label: e.source_module, color: '#64748b', icon: '•' }
  const time = new Date(e.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background: 'white', border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '8px', padding: '10px 12px', cursor: 'pointer',
        borderLeft: `3px solid ${meta.color}`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'ui-monospace,monospace', minWidth: '36px' }}>
          {time}
        </span>
        <span style={{
          fontSize: '0.58rem', padding: '1px 6px', borderRadius: '3px',
          background: mod.color + '20', color: mod.color, fontWeight: 800
        }}>{mod.icon} {mod.label}</span>
        <span style={{
          fontSize: '0.58rem', padding: '1px 6px', borderRadius: '3px',
          background: meta.bg, color: meta.color, fontWeight: 800, textTransform: 'uppercase'
        }}>{meta.label}</span>
        <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary, #0f172a)' }}>
          {ENTITY_LABELS[e.entity_type] || e.entity_type}
          {e.entity_label && <span style={{ color: 'var(--primary, #A82238)' }}> · {e.entity_label}</span>}
        </strong>
        {e.changed_fields?.length > 0 && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>
            ({e.changed_fields.join(', ')})
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)' }}>
          {e.actor_email || 'sistema'}
        </span>
      </div>

      {e.notes && !open && (
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary, #64748b)', fontStyle: 'italic', marginTop: '4px' }}>
          "{e.notes}"
        </div>
      )}

      {open && (
        <div style={{ marginTop: '8px', borderTop: '1px dashed var(--border-color, #e2e8f0)', paddingTop: '8px' }}>
          {e.changed_fields?.length > 0 && (
            <div style={{ fontSize: '0.74rem', fontFamily: 'ui-monospace,monospace' }}>
              {e.changed_fields.map(f => (
                <div key={f} style={{ marginBottom: '4px' }}>
                  <strong>{f}:</strong>{' '}
                  <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>
                    {JSON.stringify(e.payload_before?.[f]) ?? '∅'}
                  </span>{' '}→{' '}
                  <span style={{ color: '#16a34a' }}>
                    {JSON.stringify(e.payload_after?.[f]) ?? '∅'}
                  </span>
                </div>
              ))}
            </div>
          )}
          {!e.changed_fields?.length && e.payload_after && (
            <pre style={{ margin: 0, fontSize: '0.72rem', whiteSpace: 'pre-wrap',
              background: 'var(--bg-app, #f8fafc)', padding: '8px', borderRadius: '4px' }}>
              {JSON.stringify(e.payload_after, null, 2)}
            </pre>
          )}
          {e.notes && (
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary, #475569)', fontStyle: 'italic', marginTop: '6px' }}>
              📝 {e.notes}
            </div>
          )}
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted, #94a3b8)', marginTop: '6px' }}>
            ID: <code>{e.id}</code>{e.actor_roles?.length > 0 && <> · ruoli attore: {e.actor_roles.join(', ')}</>}
          </div>
        </div>
      )}
    </div>
  )
}

// styles
const inputStyle = {
  width: '100%', padding: '8px 10px',
  border: '1px solid var(--border-color, #e2e8f0)',
  borderRadius: '6px', fontSize: '0.82rem',
  background: 'white', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box'
}
const refreshBtn = {
  display: 'flex', alignItems: 'center', gap: '6px',
  background: 'white', border: '1px solid var(--border-color, #e2e8f0)',
  borderRadius: '6px', padding: '6px 12px', cursor: 'pointer',
  fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)'
}
const emptyStyle = {
  background: 'white', border: '1px solid var(--border-color, #e2e8f0)',
  borderRadius: '10px', padding: '40px 16px', textAlign: 'center',
  color: 'var(--text-muted, #94a3b8)'
}
