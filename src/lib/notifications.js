// ============================================================================
// TODOS HUB — Notification client (DB + demo fallback)
// ----------------------------------------------------------------------------
// API unificata per leggere/scrivere notifiche da QUALSIASI modulo.
// In produzione usa Supabase Realtime per push live; in demo opera su
// localStorage con un seed iniziale ricco.
// ============================================================================

import { supabase, isSupabaseConfigured } from '../supabaseClient'

const LS_KEY = 'todos-hub-demo-notifications'

// --- Demo store -------------------------------------------------------------
function loadDemo() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function saveDemo(arr) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(arr)) } catch { /* no-op */ }
}

// --- Seed iniziale demo (popolato la prima volta) ---------------------------
function seedDemo(userRoles = []) {
  const now = Date.now()
  const m = (off) => new Date(now - off).toISOString()
  const isPM = userRoles.includes('pm')
  const isHR = userRoles.includes('hr')
  const isHSE = userRoles.includes('hse')
  const isSG = userRoles.includes('servizi_gen')
  const isIT = userRoles.includes('it')
  const isACQ = userRoles.includes('acquisti')
  const isEmp = true

  const out = []

  if (isPM) {
    out.push({
      id: 'n-1', source_module: 'wp', type: 'leave_request', priority: 'high',
      title: 'Nuova richiesta Permesso',
      description: 'Fabio Rossi ha inviato una richiesta Permesso dal 03/06/2026',
      action_label: 'Vai alle approvazioni', action_url: 'ops-app-leave',
      is_read: false, created_at: m(15 * 60 * 1000)
    })
    out.push({
      id: 'n-2', source_module: 'wp', type: 'time_approval', priority: 'normal',
      title: '5 timbrature da approvare',
      description: 'Mario Bettoni, Gianni Corleto, Luca Testa hanno inserito ore questa settimana',
      action_label: 'Vai alle approvazioni ore', action_url: 'ops-app-hours',
      is_read: false, created_at: m(45 * 60 * 1000)
    })
    out.push({
      id: 'n-3', source_module: 'wp', type: 'employee_note', priority: 'urgent',
      title: '⚠️ Nota urgente da Marco Bettoni',
      description: 'Ducato cassonato GT408ML perde olio: serve controllo officina.',
      action_label: 'Vedi le note', action_url: 'ops-app-notes',
      is_read: false, created_at: m(2 * 60 * 60 * 1000)
    })
    out.push({
      id: 'n-4', source_module: 'wp', type: 'alert', priority: 'high',
      title: 'Dipendenti senza cantiere',
      description: '1 dipendente della tua area non ha cantieri assegnati per questa settimana',
      action_label: 'Apri pianificazione', action_url: 'ops-weekly',
      is_read: false, created_at: m(4 * 60 * 60 * 1000)
    })
  }

  if (isHR) {
    out.push({
      id: 'n-5', source_module: 'hr', type: 'task', priority: 'normal',
      title: 'Onboarding Valerio Verdi al 50%',
      description: '3 task ancora aperti (sicurezza, GitHub, UNILAV)',
      action_label: 'Apri scheda', action_url: 'hr-employees',
      is_read: false, created_at: m(60 * 60 * 1000)
    })
    out.push({
      id: 'n-6', source_module: 'hr', type: 'expiry', priority: 'high',
      title: 'Periodo di prova in scadenza',
      description: 'Sofia Gialli (Amministrazione) — prova fino al 01/11/2025',
      action_label: 'Vedi dipendenti', action_url: 'hr-employees',
      is_read: false, created_at: m(6 * 60 * 60 * 1000)
    })
  }

  if (isHSE) {
    out.push({
      id: 'n-7', source_module: 'hse', type: 'expiry', priority: 'urgent',
      title: '3 certificazioni in scadenza',
      description: 'Corso sicurezza Laura Bianchi (10/05), idoneità sanitaria Valerio Verdi (02/06)',
      action_label: 'Apri certificazioni', action_url: 'hse-certs',
      is_read: false, created_at: m(30 * 60 * 1000)
    })
    out.push({
      id: 'n-8', source_module: 'hse', type: 'document', priority: 'normal',
      title: 'DVR aggiornato',
      description: 'Nuova versione 2026.1 da distribuire ai dipendenti',
      action_label: 'Apri documenti HSE', action_url: 'hse-dvr',
      is_read: true, created_at: m(2 * 24 * 60 * 60 * 1000)
    })
  }

  if (isSG) {
    out.push({
      id: 'n-9', source_module: 'servizi_gen', type: 'expiry', priority: 'urgent',
      title: 'Scadenza bollo GT408ML',
      description: 'Bollo Fiat Ducato GT408ML scade il 08/06/2026 (entro 7 giorni)',
      action_label: 'Apri flotta', action_url: 'asset-fleet-wp',
      is_read: false, created_at: m(20 * 60 * 1000)
    })
    out.push({
      id: 'n-10', source_module: 'servizi_gen', type: 'task', priority: 'normal',
      title: 'Manutenzione FTV sede Bergamo',
      description: 'Prossima pulizia pannelli prevista 15/06/2026',
      action_label: 'Apri sedi', action_url: 'asset-sites',
      is_read: false, created_at: m(8 * 60 * 60 * 1000)
    })
  }

  if (isIT) {
    out.push({
      id: 'n-11', source_module: 'it', type: 'task', priority: 'high',
      title: 'Nuovo dipendente da configurare',
      description: 'Valerio Verdi — laptop, email, account VPN da preparare',
      action_label: 'Apri IT asset', action_url: 'it-devices',
      is_read: false, created_at: m(50 * 60 * 1000)
    })
    out.push({
      id: 'n-12', source_module: 'it', type: 'expiry', priority: 'normal',
      title: 'Licenza M365 in rinnovo',
      description: '12 utenze Microsoft 365 in scadenza tra 30 giorni',
      action_label: 'Apri licenze', action_url: 'it-licenses',
      is_read: false, created_at: m(5 * 60 * 60 * 1000)
    })
  }

  if (isACQ) {
    out.push({
      id: 'n-13', source_module: 'acquisti', type: 'rda', priority: 'normal',
      title: '2 RDA in attesa di approvazione',
      description: 'Materiali Edili Lupi - €1.240, NolMezzi Italia - €890',
      action_label: 'Apri RDA', action_url: 'buy-rda',
      is_read: false, created_at: m(3 * 60 * 60 * 1000)
    })
    out.push({
      id: 'n-14', source_module: 'acquisti', type: 'alert', priority: 'high',
      title: 'Fattura fuori listino rilevata',
      description: 'Fattura 4G Italia 2026/0042 — riga 3 supera del 12% il listino',
      action_label: 'Apri controllo fatture', action_url: 'buy-invoices',
      is_read: false, created_at: m(1 * 60 * 60 * 1000)
    })
  }

  if (isEmp) {
    out.push({
      id: 'n-15', source_module: 'wp', type: 'leave_decision', priority: 'normal',
      title: 'Richiesta Ferie approvata ✅',
      description: 'Periodo: 03/06/2026 → 07/06/2026',
      action_label: 'Vedi le mie richieste', action_url: 'mie-richieste',
      is_read: false, created_at: m(15 * 60 * 60 * 1000)
    })
  }

  saveDemo(out)
  return out
}

// --- API pubblica -----------------------------------------------------------

/** Carica le notifiche per l'utente corrente. */
export async function fetchNotifications({ userRoles = [], onlyUnread = false } = {}) {
  if (isSupabaseConfigured) {
    try {
      let q = supabase.from('v_my_notifications').select('*').eq('dismissed', false).limit(100)
      if (onlyUnread) q = q.eq('is_read', false)
      const { data, error } = await q
      if (!error && Array.isArray(data)) return data
    } catch { /* fallback */ }
  }
  // Demo
  let store = loadDemo()
  if (!store) store = seedDemo(userRoles)
  return store
    .filter(n => !n.dismissed)
    .filter(n => onlyUnread ? !n.is_read : true)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function markAsRead(id) {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.rpc('notif_mark_read', { notif_id: id })
      if (data) return true
    } catch { /* no-op */ }
  }
  const store = loadDemo() || []
  saveDemo(store.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
  return true
}

export async function markAllAsRead() {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.rpc('notif_mark_all_read')
      return data || 0
    } catch { /* no-op */ }
  }
  const store = loadDemo() || []
  const updated = store.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
  saveDemo(updated)
  return updated.length
}

export async function dismissNotification(id) {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.rpc('notif_dismiss', { notif_id: id })
      return data
    } catch { /* no-op */ }
  }
  const store = loadDemo() || []
  saveDemo(store.map(n => n.id === id ? { ...n, dismissed: true, dismissed_at: new Date().toISOString() } : n))
  return true
}

export async function clearAll() {
  if (isSupabaseConfigured) {
    // No bulk dismiss RPC: in produzione, dismiss singolo
    const list = await fetchNotifications()
    await Promise.all(list.map(n => dismissNotification(n.id)))
    return
  }
  saveDemo([])
}

/** Reset demo store (utile al cambio ruoli per ri-seed) */
export function resetDemoStore() {
  try { localStorage.removeItem(LS_KEY) } catch { /* no-op */ }
}

/** Iscrizione realtime ai nuovi inserimenti (Supabase Postgres changes) */
export function subscribeToNotifications(callback) {
  if (!isSupabaseConfigured) return () => {}
  try {
    const ch = supabase
      .channel('notifications-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        callback?.(payload)
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  } catch {
    return () => {}
  }
}

// --- Metadati per UI --------------------------------------------------------
export const MODULE_META = {
  wp:           { label: 'Work-Pro',   color: '#A82238', icon: '🛠️' },
  hr:           { label: 'HR',         color: '#6366f1', icon: '👥' },
  hse:          { label: 'HSE',        color: '#16a34a', icon: '🛡️' },
  it:           { label: 'IT',         color: '#0ea5e9', icon: '💻' },
  servizi_gen:  { label: 'Servizi Gen.', color: '#a855f7', icon: '🚗' },
  acquisti:     { label: 'Acquisti',   color: '#eab308', icon: '🛒' },
  finance:      { label: 'Amministr.', color: '#0f766e', icon: '💰' },
  sales:        { label: 'Commerciale',color: '#ec4899', icon: '🤝' },
  quality:      { label: 'Qualità',    color: '#0891b2', icon: '⭐' },
  system:       { label: 'Sistema',    color: '#64748b', icon: '⚙️' }
}

export const PRIORITY_META = {
  low:    { label: 'bassa',    color: '#64748b', bg: '#f1f5f9' },
  normal: { label: 'normale',  color: '#3730a3', bg: '#e0e7ff' },
  high:   { label: 'alta',     color: '#a16207', bg: '#fef9c3' },
  urgent: { label: 'urgente',  color: '#dc2626', bg: '#fee2e2' }
}
