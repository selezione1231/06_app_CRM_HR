// ============================================================================
// TODOS HUB — Audit log client (DB + demo fallback)
// ----------------------------------------------------------------------------
// API:
//   - fetchEntityAudit(type, id)  → storico di una entità
//   - fetchMyActions()            → le mie azioni recenti
//   - fetchRecent({filters})      → feed completo (admin/hr/direzione)
//   - writeAudit(...)             → scrive una entry (per moduli senza trigger DB)
// ============================================================================

import { supabase, isSupabaseConfigured } from '../supabaseClient'

const LS_KEY = 'todos-hub-demo-audit-log'

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

// --- Seed demo --------------------------------------------------------------
function seedDemo() {
  const now = Date.now()
  const m = (off) => new Date(now - off).toISOString()
  const out = [
    {
      id: 'a-1', entity_type: 'wp_leave_requests', entity_id: 'lr-2', entity_label: 'Permesso',
      action: 'update', source_module: 'wp',
      actor_email: 'c.fall@todos.it', actor_roles: ['pm'],
      changed_fields: ['status','approved_at'],
      payload_before: { status: 'Pending' }, payload_after: { status: 'Approved' },
      created_at: m(5 * 60 * 1000)
    },
    {
      id: 'a-2', entity_type: 'wp_time_entries', entity_id: 'te-2', entity_label: null,
      action: 'update', source_module: 'wp',
      actor_email: 'c.fall@todos.it', actor_roles: ['pm'],
      changed_fields: ['status','hours_approved'],
      payload_before: { hours: 9, status: 'Pending' }, payload_after: { hours: 9, hours_approved: 8, status: 'Approved' },
      notes: 'Ore corrette: il dipendente aveva incluso una pausa pranzo',
      created_at: m(20 * 60 * 1000)
    },
    {
      id: 'a-3', entity_type: 'employee_roles', entity_id: 'er-new', entity_label: 'hse',
      action: 'insert', source_module: 'hr',
      actor_email: 'a.degani@todos.it', actor_roles: ['admin','hr'],
      changed_fields: [],
      payload_after: { employee_id: 'demo-emp-3', role_code: 'hse' },
      notes: 'Alessandro Neri abilitato come HSE',
      created_at: m(2 * 60 * 60 * 1000)
    },
    {
      id: 'a-4', entity_type: 'wp_vehicles', entity_id: 'veh-1', entity_label: 'HA412YN',
      action: 'update', source_module: 'servizi_gen',
      actor_email: 'admin@todos.it', actor_roles: ['admin','servizi_gen'],
      changed_fields: ['has_winter_tires'],
      payload_before: { has_winter_tires: false }, payload_after: { has_winter_tires: true },
      created_at: m(4 * 60 * 60 * 1000)
    },
    {
      id: 'a-5', entity_type: 'wp_sites', entity_id: 'site-6', entity_label: 'BG25080',
      action: 'insert', source_module: 'wp',
      actor_email: 'p.locatelli@todos.it', actor_roles: ['pm','admin'],
      payload_after: { code: 'BG25080', name: 'Cassa di Risparmio Bergamo', client_id: 'cli-2' },
      created_at: m(8 * 60 * 60 * 1000)
    },
    {
      id: 'a-6', entity_type: 'employees', entity_id: 'demo-emp-5', entity_label: 'Valerio Verdi',
      action: 'update', source_module: 'hr',
      actor_email: 'a.neri@todos.it', actor_roles: ['hr'],
      changed_fields: ['safety_course_expiry'],
      payload_before: { safety_course_expiry: '2026-05-28' }, payload_after: { safety_course_expiry: '2027-05-28' },
      notes: 'Aggiornata scadenza corso sicurezza',
      created_at: m(12 * 60 * 60 * 1000)
    },
    {
      id: 'a-7', entity_type: 'wp_assignments', entity_id: 'a-23', entity_label: null,
      action: 'update', source_module: 'wp',
      actor_email: 'a.degani@todos.it', actor_roles: ['pm'],
      changed_fields: ['special'],
      payload_before: { site_id: 'site-3' }, payload_after: { site_id: null, special: 'Malattia' },
      created_at: m(20 * 60 * 60 * 1000)
    },
    {
      id: 'a-8', entity_type: 'wp_docs', entity_id: 'doc-1', entity_label: 'Attestato formazione specifica',
      action: 'insert', source_module: 'hr',
      actor_email: 'a.neri@todos.it', actor_roles: ['hr','hse'],
      payload_after: { title: 'Attestato formazione specifica', visibility: 'all' },
      created_at: m(2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'a-9', entity_type: 'wp_fuel_cards', entity_id: 'fc-2', entity_label: 'ENI-4422',
      action: 'update', source_module: 'servizi_gen',
      actor_email: 'admin@todos.it', actor_roles: ['admin','servizi_gen'],
      changed_fields: ['expires_at'],
      payload_before: { expires_at: '2026-06-10' }, payload_after: { expires_at: '2027-06-10' },
      notes: 'Rinnovo tessera carburante Eni',
      created_at: m(3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'a-10', entity_type: 'employee_roles', entity_id: 'er-revoke', entity_label: 'sales',
      action: 'update', source_module: 'hr',
      actor_email: 'a.degani@todos.it', actor_roles: ['admin','hr'],
      changed_fields: ['revoked_at'],
      payload_before: { revoked_at: null }, payload_after: { revoked_at: m(4 * 24 * 60 * 60 * 1000) },
      notes: 'Cessazione ruolo commerciale',
      created_at: m(4 * 24 * 60 * 60 * 1000)
    }
  ]
  saveDemo(out)
  return out
}

// --- API pubblica -----------------------------------------------------------

export async function fetchRecent({ limit = 100, filters = {} } = {}) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('audit_recent', { p_limit: limit })
      if (!error && Array.isArray(data)) return applyClientFilters(data, filters)
    } catch { /* fallback */ }
  }
  let store = loadDemo()
  if (!store) store = seedDemo()
  return applyClientFilters(store, filters).slice(0, limit)
}

export async function fetchEntityAudit(entityType, entityId, limit = 50) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('audit_entity', {
        p_entity_type: entityType, p_entity_id: entityId, p_limit: limit
      })
      if (!error && Array.isArray(data)) return data
    } catch { /* fallback */ }
  }
  let store = loadDemo() || seedDemo()
  return store
    .filter(e => e.entity_type === entityType && e.entity_id === entityId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit)
}

export async function fetchMyActions(limit = 100) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('audit_my_actions', { p_limit: limit })
      if (!error && Array.isArray(data)) return data
    } catch { /* fallback */ }
  }
  return []
}

/** Scrive una entry (per moduli che agiscono via API, non solo via DB trigger) */
export async function writeAudit(payload) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('audit_write', {
        p_entity_type:    payload.entity_type,
        p_entity_id:      payload.entity_id,
        p_action:         payload.action,
        p_source_module:  payload.source_module || 'system',
        p_entity_label:   payload.entity_label || null,
        p_payload_before: payload.payload_before || null,
        p_payload_after:  payload.payload_after || null,
        p_notes:          payload.notes || null
      })
      if (!error) return data
    } catch { /* fallback */ }
  }
  // Demo: append a localStorage
  const store = loadDemo() || []
  const entry = {
    id: `a-${Date.now()}`,
    ...payload,
    created_at: new Date().toISOString()
  }
  saveDemo([entry, ...store])
  return entry.id
}

export function resetDemoStore() {
  try { localStorage.removeItem(LS_KEY) } catch { /* no-op */ }
}

// --- Helpers ---------------------------------------------------------------
function applyClientFilters(list, filters = {}) {
  return list.filter(e => {
    if (filters.action && e.action !== filters.action) return false
    if (filters.module && e.source_module !== filters.module) return false
    if (filters.entityType && e.entity_type !== filters.entityType) return false
    if (filters.q) {
      const q = filters.q.toLowerCase()
      const blob = [e.entity_label, e.actor_email, e.notes, e.entity_type, ...(e.changed_fields || [])]
        .filter(Boolean).join(' ').toLowerCase()
      if (!blob.includes(q)) return false
    }
    return true
  })
}

// --- Metadata per UI -------------------------------------------------------
export const ACTION_META = {
  insert:       { label: 'creato',      color: '#16a34a', bg: '#dcfce7', icon: '➕' },
  update:       { label: 'modificato',  color: '#0ea5e9', bg: '#e0f2fe', icon: '✏️' },
  delete:       { label: 'eliminato',   color: '#dc2626', bg: '#fee2e2', icon: '🗑' },
  approve:      { label: 'approvato',   color: '#16a34a', bg: '#dcfce7', icon: '✅' },
  reject:       { label: 'rifiutato',   color: '#dc2626', bg: '#fee2e2', icon: '❌' },
  login:        { label: 'login',       color: '#64748b', bg: '#f1f5f9', icon: '🔑' },
  grant_role:   { label: 'ruolo concesso', color: '#a855f7', bg: '#f3e8ff', icon: '🛡️' },
  revoke_role:  { label: 'ruolo revocato', color: '#dc2626', bg: '#fee2e2', icon: '🚫' },
  dismiss:      { label: 'archiviato',  color: '#64748b', bg: '#f1f5f9', icon: '📦' },
  restore:      { label: 'ripristinato',color: '#0ea5e9', bg: '#e0f2fe', icon: '♻️' }
}

export const ENTITY_LABELS = {
  employees:           'Dipendente',
  employee_roles:      'Ruolo',
  wp_assignments:      'Assegnazione',
  wp_leave_requests:   'Richiesta ferie/permesso',
  wp_time_entries:     'Timbratura',
  wp_clients:          'Cliente / Fornitore',
  wp_sites:            'Cantiere',
  wp_vehicles:         'Mezzo',
  wp_vehicle_expiries: 'Scadenza mezzo',
  wp_fuel_cards:       'Tessera carburante',
  wp_telepass:         'Telepass',
  wp_docs:             'Documento',
  notifications:       'Notifica'
}
