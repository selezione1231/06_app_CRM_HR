import React, { useState, useEffect } from 'react'
import { History, ChevronDown, ChevronRight, User } from 'lucide-react'
import { fetchEntityAudit, ACTION_META, ENTITY_LABELS } from '../../lib/audit'

// ============================================================================
// AuditTrail — Timeline storica per una singola entità
// ----------------------------------------------------------------------------
// Embeddable in qualunque vista dettaglio (scheda dipendente, cantiere,
// mezzo, ecc.). Mostra azioni recenti con autore + diff espandibile.
// ============================================================================

export default function AuditTrail({
  entityType,
  entityId,
  title = 'Storico modifiche',
  compact = false,
  limit = 50
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    if (!entityType || !entityId) return
    setLoading(true)
    fetchEntityAudit(entityType, entityId, limit)
      .then(setItems)
      .finally(() => setLoading(false))
  }, [entityType, entityId, limit])

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '10px',
      padding: compact ? '12px' : '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <History size={16} color="var(--primary, #A82238)" />
        <strong style={{ fontSize: compact ? '0.85rem' : '0.95rem' }}>{title}</strong>
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)' }}>
          {items.length} eventi
        </span>
      </div>

      {loading && <div style={emptyStyle}>Caricamento...</div>}
      {!loading && items.length === 0 && (
        <div style={emptyStyle}>Nessuna modifica registrata.</div>
      )}

      {!loading && items.length > 0 && (
        <div style={{ position: 'relative', paddingLeft: '20px' }}>
          {/* Timeline vertical line */}
          <div style={{
            position: 'absolute', left: '7px', top: '4px', bottom: '4px',
            width: '2px', background: 'var(--border-color, #e2e8f0)'
          }} />

          {items.map((e, i) => (
            <Entry
              key={e.id}
              e={e}
              isLast={i === items.length - 1}
              expanded={!!expanded[e.id]}
              onToggle={() => setExpanded(p => ({ ...p, [e.id]: !p[e.id] }))}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
function Entry({ e, isLast, expanded, onToggle, compact }) {
  const meta = ACTION_META[e.action] || { label: e.action, color: '#64748b', bg: '#f1f5f9', icon: '•' }
  const hasDetails = e.changed_fields?.length > 0 || e.payload_before || e.notes
  const date = new Date(e.created_at)

  return (
    <div style={{ position: 'relative', paddingBottom: isLast ? 0 : '14px' }}>
      {/* Dot */}
      <div style={{
        position: 'absolute', left: '-20px', top: '4px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: meta.bg, border: `2px solid ${meta.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.55rem'
      }}>
        {meta.icon}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', gap: '8px',
        alignItems: 'flex-start', flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.6rem', padding: '1px 6px',
              background: meta.bg, color: meta.color,
              borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase'
            }}>{meta.label}</span>
            {e.entity_label && (
              <span style={{ fontWeight: 700, fontSize: compact ? '0.8rem' : '0.85rem', color: 'var(--text-primary, #0f172a)' }}>
                {e.entity_label}
              </span>
            )}
            {e.changed_fields?.length > 0 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>
                {e.changed_fields.length === 1 ? 'campo ' : 'campi '}
                <strong>{e.changed_fields.join(', ')}</strong>
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px', fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)' }}>
            <User size={10} /> {e.actor_email || 'sistema'}
            <span>· {date.toLocaleString('it-IT')}</span>
          </div>
          {e.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #475569)', marginTop: '4px', fontStyle: 'italic' }}>"{e.notes}"</div>}
        </div>
        {hasDetails && (
          <button onClick={onToggle} style={toggleBtn}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span style={{ fontSize: '0.68rem' }}>{expanded ? 'Riduci' : 'Dettagli'}</span>
          </button>
        )}
      </div>

      {/* Diff espanso */}
      {expanded && (
        <div style={{
          marginTop: '8px', padding: '10px 12px',
          background: 'var(--bg-app, #f8fafc)', borderRadius: '6px',
          fontSize: '0.74rem', fontFamily: 'ui-monospace,monospace'
        }}>
          {e.changed_fields?.length > 0 && (
            <div>
              {e.changed_fields.map(f => (
                <div key={f} style={{ marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{f}:</strong>{' '}
                  <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>
                    {JSON.stringify(e.payload_before?.[f]) ?? '∅'}
                  </span>{' '}
                  →{' '}
                  <span style={{ color: '#16a34a' }}>
                    {JSON.stringify(e.payload_after?.[f]) ?? '∅'}
                  </span>
                </div>
              ))}
            </div>
          )}
          {!e.changed_fields?.length && e.payload_after && (
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(e.payload_after, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

const emptyStyle = {
  padding: '24px 8px', textAlign: 'center',
  color: 'var(--text-muted, #94a3b8)', fontSize: '0.82rem'
}
const toggleBtn = {
  display: 'flex', alignItems: 'center', gap: '2px',
  background: 'transparent', border: '1px solid var(--border-color, #e2e8f0)',
  borderRadius: '4px', padding: '2px 6px', cursor: 'pointer',
  color: 'var(--text-muted, #64748b)', fontWeight: 700
}
