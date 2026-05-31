import React, { useState, useEffect, useRef } from 'react'
import {
  Bell, BellRing, CheckCheck, Trash2, X, AlertTriangle,
  Clock, FileText, ClipboardList, MessageSquare, Receipt, Inbox
} from 'lucide-react'
import {
  fetchNotifications, markAsRead, markAllAsRead, dismissNotification,
  clearAll, subscribeToNotifications, MODULE_META, PRIORITY_META
} from '../../lib/notifications'

// ============================================================================
// NotificationCenter — Bell + dropdown unificato per tutte le notifiche
// ----------------------------------------------------------------------------
// Visibile in entrambi Hub e PersonalApp. Aggrega notifiche da tutti i
// moduli (HR, HSE, IT, PM, Acquisti, ...) e permette filtri e azioni rapide.
// ============================================================================

export default function NotificationCenter({
  userRoles = [],
  onNavigate,        // (actionUrl) → naviga al modulo dell'azione
  variant = 'hub'    // 'hub' | 'personal' — varia leggermente l'aspetto
}) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | 'urgent'
  const [moduleFilter, setModuleFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  // --- Load + realtime subscribe ----------------------------------------
  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchNotifications({ userRoles })
      setItems(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [JSON.stringify(userRoles)])

  // Realtime subscription (no-op in demo)
  useEffect(() => {
    const unsub = subscribeToNotifications(() => { load() })
    return () => unsub()
  }, [])

  // Refresh ogni 60s come fallback se realtime non è attivo
  useEffect(() => {
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  // Chiusura on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // --- Filters ----------------------------------------------------------
  const filtered = items.filter(n => {
    if (filter === 'unread' && n.is_read) return false
    if (filter === 'urgent' && n.priority !== 'urgent' && n.priority !== 'high') return false
    if (moduleFilter !== 'all' && n.source_module !== moduleFilter) return false
    return true
  })

  const unreadCount = items.filter(n => !n.is_read).length
  const urgentCount = items.filter(n => !n.is_read && (n.priority === 'urgent' || n.priority === 'high')).length
  const moduleCounts = items.reduce((acc, n) => {
    acc[n.source_module] = (acc[n.source_module] || 0) + (n.is_read ? 0 : 1)
    return acc
  }, {})

  // --- Actions ----------------------------------------------------------
  const handleClick = async (n) => {
    if (!n.is_read) await markAsRead(n.id)
    if (n.action_url) {
      onNavigate?.({ id: n.action_url })
      setOpen(false)
    }
    load()
  }
  const handleDismiss = async (e, id) => {
    e.stopPropagation()
    await dismissNotification(id)
    load()
  }
  const handleMarkAll = async () => { await markAllAsRead(); load() }
  const handleClearAll = async () => { await clearAll(); load() }

  const isHub = variant === 'hub'

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Notifiche"
        style={{
          background: 'transparent',
          border: isHub ? '1px solid var(--border-color)' : `1px solid #e2e8f0`,
          color: isHub ? 'var(--text-primary)' : '#1e293b',
          width: isHub ? '30px' : '32px',
          height: isHub ? '30px' : '32px',
          borderRadius: isHub ? 'var(--radius-md)' : '6px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative'
        }}
      >
        {unreadCount > 0 ? (
          <BellRing size={isHub ? 14 : 16} style={{ animation: 'bell-bounce 1s infinite alternate' }} />
        ) : (
          <Bell size={isHub ? 14 : 16} />
        )}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: urgentCount > 0 ? '#dc2626' : (isHub ? 'var(--primary)' : '#A82238'),
            color: 'white',
            fontSize: '0.62rem', fontWeight: 900,
            minWidth: '16px', height: '16px',
            padding: '0 4px', borderRadius: '999px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 6px rgba(220,38,38,0.5)'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '40px', right: 0,
          width: '400px', maxWidth: '92vw',
          maxHeight: '560px',
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          zIndex: 1000,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.9rem' }}>
                <Inbox size={16} color="#A82238" /> Notifiche
                {unreadCount > 0 && <span style={{
                  background: '#fee2e2', color: '#dc2626', fontSize: '0.7rem', padding: '1px 6px',
                  borderRadius: '999px', fontWeight: 800
                }}>{unreadCount} nuove</span>}
              </div>
              <button onClick={() => setOpen(false)} style={iconBtn}>
                <X size={14} />
              </button>
            </div>

            {/* Quick filters */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <FilterPill active={filter === 'all'}    onClick={() => setFilter('all')} label="Tutte" count={items.length} />
              <FilterPill active={filter === 'unread'} onClick={() => setFilter('unread')} label="Non lette" count={unreadCount} />
              <FilterPill active={filter === 'urgent'} onClick={() => setFilter('urgent')} label="⚠ Urgenti" count={urgentCount} />
            </div>

            {/* Module filter chips */}
            {Object.keys(moduleCounts).length > 1 && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                <ChipBtn active={moduleFilter === 'all'} onClick={() => setModuleFilter('all')}>Tutti i moduli</ChipBtn>
                {Object.entries(moduleCounts).map(([mod, count]) => {
                  if (!count) return null
                  const meta = MODULE_META[mod] || { label: mod, icon: '•' }
                  return (
                    <ChipBtn
                      key={mod}
                      active={moduleFilter === mod}
                      onClick={() => setModuleFilter(mod)}
                      color={meta.color}
                    >
                      {meta.icon} {meta.label} {count > 0 && <strong>({count})</strong>}
                    </ChipBtn>
                  )
                })}
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px' }}>
            {loading && <div style={empty}>Caricamento...</div>}
            {!loading && filtered.length === 0 && (
              <div style={empty}>
                <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🎉</div>
                <strong style={{ color: '#1e293b' }}>Tutto in ordine!</strong>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  {filter === 'all' ? 'Nessuna notifica.' : 'Nessuna notifica per questo filtro.'}
                </div>
              </div>
            )}

            {filtered.map(n => <NotifRow key={n.id} n={n} onClick={() => handleClick(n)} onDismiss={(e) => handleDismiss(e, n.id)} />)}
          </div>

          {/* Footer actions */}
          {items.length > 0 && (
            <div style={{
              borderTop: '1px solid #e2e8f0', padding: '8px 12px',
              display: 'flex', justifyContent: 'space-between', gap: '8px'
            }}>
              <button onClick={handleMarkAll} style={footerBtn}>
                <CheckCheck size={12} /> Segna tutte lette
              </button>
              <button onClick={handleClearAll} style={{ ...footerBtn, color: '#dc2626' }}>
                <Trash2 size={12} /> Svuota
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
function NotifRow({ n, onClick, onDismiss }) {
  const meta = MODULE_META[n.source_module] || { label: n.source_module, color: '#64748b', icon: '•' }
  const prio = PRIORITY_META[n.priority] || PRIORITY_META.normal
  const isUrgent = n.priority === 'urgent'

  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 12px', borderRadius: '8px',
        background: n.is_read ? 'transparent' : (isUrgent ? '#fef2f2' : '#fafafa'),
        borderLeft: `3px solid ${n.is_read ? '#cbd5e1' : meta.color}`,
        margin: '4px 4px 4px 0',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex', gap: '10px',
        opacity: n.is_read ? 0.72 : 1,
        transition: 'background 0.1s'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = n.is_read ? 'transparent' : (isUrgent ? '#fef2f2' : '#fafafa') }}
    >
      <div style={{
        width: '28px', height: '28px', borderRadius: '6px',
        background: meta.color + '20', color: meta.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.95rem', flexShrink: 0
      }}>{meta.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', alignItems: 'flex-start' }}>
          <div style={{
            fontSize: '0.84rem', fontWeight: n.is_read ? 600 : 800,
            color: isUrgent && !n.is_read ? '#dc2626' : '#1e293b',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>{n.title}</div>
          <button onClick={onDismiss} style={dismissBtn} title="Rimuovi">
            <X size={12} />
          </button>
        </div>
        {n.description && (
          <div style={{
            fontSize: '0.74rem', color: '#475569', marginTop: '2px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>{n.description}</div>
        )}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' }}>
          <span style={{
            fontSize: '0.6rem', padding: '1px 6px',
            background: meta.color + '15', color: meta.color,
            borderRadius: '999px', fontWeight: 700
          }}>{meta.label}</span>
          {isUrgent && <span style={{
            fontSize: '0.6rem', padding: '1px 6px',
            background: prio.bg, color: prio.color,
            borderRadius: '999px', fontWeight: 800
          }}>URGENTE</span>}
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginLeft: 'auto' }}>
            {timeAgo(n.created_at)}
          </span>
        </div>
        {n.action_label && (
          <div style={{
            fontSize: '0.72rem', fontWeight: 700, color: meta.color, marginTop: '4px'
          }}>
            {n.action_label} →
          </div>
        )}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
function FilterPill({ active, label, count, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 10px', borderRadius: '999px',
      background: active ? '#A82238' : '#f1f5f9',
      color: active ? 'white' : '#475569',
      border: 'none', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '4px'
    }}>
      {label}
      {count !== undefined && (
        <span style={{
          fontSize: '0.62rem', padding: '0 5px',
          background: active ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
          borderRadius: '999px', minWidth: '14px', textAlign: 'center'
        }}>{count}</span>
      )}
    </button>
  )
}

function ChipBtn({ active, onClick, children, color = '#64748b' }) {
  return (
    <button onClick={onClick} style={{
      padding: '2px 7px', borderRadius: '999px',
      background: active ? color : 'white',
      color: active ? 'white' : color,
      border: `1px solid ${color}40`,
      fontWeight: 700, fontSize: '0.65rem', cursor: 'pointer'
    }}>{children}</button>
  )
}

// ----------------------------------------------------------------------------
function timeAgo(iso) {
  const now = Date.now()
  const diff = now - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ora'
  if (m < 60) return `${m}m fa`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h fa`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}g fa`
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
}

// styles
const iconBtn = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }
const dismissBtn = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', flexShrink: 0 }
const empty = { padding: '40px 16px', textAlign: 'center', color: '#94a3b8' }
const footerBtn = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontSize: '0.74rem', fontWeight: 700, color: '#1e293b',
  display: 'flex', alignItems: 'center', gap: '4px'
}
