import React, { useState, useEffect, useCallback, useRef } from 'react'
import { LogIn, LogOut, Clock, MapPin, AlertCircle, CheckCircle2, History, Calendar, CloudUpload, CloudOff } from 'lucide-react'
import { isSharedMode, syncPendingEntries, countPending } from '../../../lib/timbrature'

// ============================================================================
// EmpClockIn — timbratura geolocalizzata OFFLINE-FIRST
// Salva sempre prima in localStorage (funziona senza segnale); quando torna
// la rete sincronizza su Supabase (tabella 06app_Noi_timbrature) con upsert
// idempotente su local_id.
// ============================================================================

const LS_ENTRIES_PREFIX = 'todos-clockin-entries-'
const LS_SESSION_PREFIX = 'todos-clockin-session-'

function getEntries(employeeId) {
  try {
    const raw = localStorage.getItem(LS_ENTRIES_PREFIX + employeeId)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveEntries(employeeId, entries) {
  try { localStorage.setItem(LS_ENTRIES_PREFIX + employeeId, JSON.stringify(entries)) } catch { /* no-op */ }
}

function getOpenSession(employeeId) {
  try {
    const raw = localStorage.getItem(LS_SESSION_PREFIX + employeeId)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveOpenSession(employeeId, session) {
  try {
    if (session) {
      localStorage.setItem(LS_SESSION_PREFIX + employeeId, JSON.stringify(session))
    } else {
      localStorage.removeItem(LS_SESSION_PREFIX + employeeId)
    }
  } catch { /* no-op */ }
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' })
}

export default function EmpClockIn({ employeeId = 'wp-emp-1', employeeName = 'Dipendente' }) {
  const [openSession, setOpenSession] = useState(() => getOpenSession(employeeId))
  const [entries, setEntries] = useState(() => getEntries(employeeId))
  const [elapsed, setElapsed] = useState(0)
  const [geoStatus, setGeoStatus] = useState('idle') // idle | loading | ok | denied
  const [geoPos, setGeoPos] = useState(null)
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(null) // { type, msg }
  const shared = useRef(isSharedMode()).current
  const [syncState, setSyncState] = useState('idle') // idle | syncing | offline
  const entriesRef = useRef(entries)
  entriesRef.current = entries

  // Timer
  useEffect(() => {
    if (!openSession) { setElapsed(0); return }
    const tick = () => setElapsed(Date.now() - new Date(openSession.in_at).getTime())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [openSession])

  // ── SYNC OFFLINE-FIRST ──────────────────────────────────────────────────
  // Spedisce a Supabase le timbrature chiuse non ancora inviate.
  const trySync = useCallback(async () => {
    if (!shared) return
    if (navigator.onLine === false) { setSyncState('offline'); return }
    setSyncState('syncing')
    const { entries: updated, synced } = await syncPendingEntries(employeeId, employeeName, entriesRef.current)
    if (synced > 0) {
      setEntries(updated)
      saveEntries(employeeId, updated)
    }
    setSyncState(countPending(updated) > 0 ? 'offline' : 'idle')
  }, [employeeId, employeeName, shared])

  // Al mount, quando torna la rete, e ogni 2 minuti come rete di sicurezza
  useEffect(() => {
    if (!shared) return
    trySync()
    const onOnline = () => trySync()
    window.addEventListener('online', onOnline)
    const id = setInterval(trySync, 120000)
    return () => { window.removeEventListener('online', onOnline); clearInterval(id) }
  }, [trySync, shared])

  const requestGeo = useCallback(() => {
    if (!navigator.geolocation) { setGeoStatus('denied'); return }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoPos({ lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) })
        setGeoStatus('ok')
      },
      () => setGeoStatus('denied')
    )
  }, [])

  // Rileva la posizione in automatico all'apertura (se il permesso è dato,
  // entrata/uscita risultano già geolocalizzate senza tap aggiuntivi)
  useEffect(() => { requestGeo() }, [requestGeo])

  const handleClockIn = () => {
    const session = {
      id: 'ci-' + Date.now(),
      in_at: new Date().toISOString(),
      in_note: note,
      geo_in: geoPos,
    }
    setOpenSession(session)
    saveOpenSession(employeeId, session)
    setNote('')
    setFlash({ type: 'in', msg: `Entrata registrata alle ${formatTime(session.in_at)}` })
    setTimeout(() => setFlash(null), 3000)
  }

  const handleClockOut = () => {
    if (!openSession) return
    const outAt = new Date().toISOString()
    const durationMs = new Date(outAt) - new Date(openSession.in_at)
    const entry = {
      ...openSession,
      out_at: outAt,
      out_note: note,
      geo_out: geoPos,
      duration_minutes: Math.round(durationMs / 60000)
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    saveEntries(employeeId, updated)
    setOpenSession(null)
    saveOpenSession(employeeId, null)
    setNote('')
    setFlash({ type: 'out', msg: `Uscita registrata — ${formatDuration(durationMs)} ore lavorate` })
    setTimeout(() => setFlash(null), 4000)
    // Prova subito a spedire al cloud (se offline resterà in coda)
    setTimeout(trySync, 100)
  }

  const isIn = !!openSession
  const todayEntries = entries.filter(e => {
    const today = new Date().toISOString().slice(0, 10)
    return e.in_at.slice(0, 10) === today
  })
  const totalTodayMin = todayEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0) +
    (isIn ? Math.round(elapsed / 60000) : 0)

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px' }}>

      {/* Titolo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Clock size={26} style={{ color: 'var(--primary, #A82238)' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary, #1e293b)' }}>
            Timbratura Real-time
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
            {employeeName} · {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
        </div>
        {shared && (
          <span style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '0.7rem', fontWeight: 700, padding: '5px 10px', borderRadius: '20px',
            background: syncState === 'offline' ? '#fffbeb' : '#f0fdf4',
            color: syncState === 'offline' ? '#d97706' : '#16a34a',
            border: `1px solid ${syncState === 'offline' ? '#fde68a' : '#bbf7d0'}`
          }}>
            {syncState === 'offline'
              ? <><CloudOff size={12} /> {countPending(entries)} da sincronizzare</>
              : syncState === 'syncing'
                ? <><CloudUpload size={12} /> Sincronizzo…</>
                : <><CheckCircle2 size={12} /> Cloud OK</>}
          </span>
        )}
      </div>

      {/* Flash message */}
      {flash && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '10px',
          marginBottom: '16px',
          background: flash.type === 'in' ? '#f0fdf4' : '#eff6ff',
          border: `1px solid ${flash.type === 'in' ? '#86efac' : '#bfdbfe'}`,
          color: flash.type === 'in' ? '#16a34a' : '#1d4ed8',
          fontSize: '0.85rem', fontWeight: 600
        }}>
          <CheckCircle2 size={16} />
          {flash.msg}
        </div>
      )}

      {/* Stato attuale */}
      <div style={{
        background: isIn ? '#f0fdf4' : '#f8fafc',
        border: `2px solid ${isIn ? '#86efac' : '#e2e8f0'}`,
        borderRadius: '16px', padding: '28px', marginBottom: '20px', textAlign: 'center'
      }}>
        {isIn ? (
          <>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              In lavoro
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#15803d', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '6px' }}>
              {formatDuration(elapsed)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#16a34a' }}>
              Entrata alle {formatTime(openSession.in_at)}
              {openSession.geo_in && ` · ${openSession.geo_in.lat}, ${openSession.geo_in.lng}`}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Non in lavoro
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-muted, #cbd5e1)', lineHeight: 1, marginBottom: '6px' }}>
              {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              Oggi totale: {Math.floor(totalTodayMin / 60)}h {totalTodayMin % 60}min
            </div>
          </>
        )}
      </div>

      {/* Geolocalizzazione */}
      <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={requestGeo}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px',
            border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', background: 'white',
            fontSize: '0.78rem', cursor: 'pointer', color: geoStatus === 'ok' ? '#16a34a' : geoStatus === 'denied' ? '#ef4444' : 'var(--text-secondary, #475569)'
          }}
        >
          <MapPin size={13} />
          {geoStatus === 'idle' && 'Rileva posizione (opzionale)'}
          {geoStatus === 'loading' && 'Rilevamento...'}
          {geoStatus === 'ok' && `Posizione OK (${geoPos?.lat})`}
          {geoStatus === 'denied' && 'Posizione non disponibile'}
        </button>
        {geoStatus === 'denied' && (
          <span style={{ fontSize: '0.72rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} /> Abilita geolocalizzazione nelle impostazioni
          </span>
        )}
      </div>

      {/* Nota */}
      <div style={{ marginBottom: '16px' }}>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={isIn ? 'Nota uscita (es. cantiere, lavoro svolto)...' : 'Nota entrata (es. cantiere di destinazione)...'}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '10px 14px',
            border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '9px',
            fontSize: '0.85rem', outline: 'none', color: 'var(--text-primary, #1e293b)'
          }}
        />
      </div>

      {/* Bottone principale */}
      <button
        onClick={isIn ? handleClockOut : handleClockIn}
        style={{
          width: '100%', padding: '16px', borderRadius: '12px', fontSize: '1rem', fontWeight: 800,
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          background: isIn ? '#ef4444' : '#16a34a', color: 'white',
          boxShadow: `0 4px 16px ${isIn ? '#ef444440' : '#16a34a40'}`,
          transition: 'transform 0.1s, box-shadow 0.1s'
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isIn ? <><LogOut size={20} /> TIMBRA USCITA</> : <><LogIn size={20} /> TIMBRA ENTRATA</>}
      </button>

      {/* Storico giornata */}
      {(todayEntries.length > 0 || isIn) && (
        <div style={{ marginTop: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <History size={15} style={{ color: 'var(--text-muted, #64748b)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Storico di oggi
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isIn && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 600 }}>
                  In corso — entrata {formatTime(openSession.in_at)}
                </span>
                {openSession.in_note && <span style={{ fontSize: '0.75rem', color: '#16a34a', marginLeft: 'auto' }}>{openSession.in_note}</span>}
              </div>
            )}
            {todayEntries.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <Calendar size={14} style={{ color: 'var(--text-muted, #94a3b8)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-primary, #1e293b)', fontWeight: 600 }}>
                  {formatTime(e.in_at)} → {formatTime(e.out_at)}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', marginLeft: 'auto' }}>
                  {Math.floor(e.duration_minutes / 60)}h {e.duration_minutes % 60}min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storico settimana */}
      {entries.filter(e => e.in_at.slice(0, 10) !== new Date().toISOString().slice(0, 10)).slice(0, 5).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            Giorni precedenti
          </div>
          {entries
            .filter(e => e.in_at.slice(0, 10) !== new Date().toISOString().slice(0, 10))
            .slice(0, 5)
            .map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.8rem', color: 'var(--text-secondary, #475569)' }}>
                <span style={{ minWidth: 70, color: 'var(--text-muted, #94a3b8)' }}>{formatDate(e.in_at)}</span>
                <span>{formatTime(e.in_at)} → {formatTime(e.out_at)}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{Math.floor(e.duration_minutes / 60)}h {e.duration_minutes % 60}min</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
