// ============================================================================
// TODOS HUB — Frontend RBAC client
// ----------------------------------------------------------------------------
// Astrazione lato app per leggere/scrivere i ruoli dei dipendenti.
//   - In modalità Supabase reale → chiama le RPC del DB
//   - In demo / no-supabase → opera su localStorage
//
// I componenti dovrebbero usare SEMPRE queste funzioni e MAI conoscere
// direttamente i dettagli di persistenza.
// ============================================================================

import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { ROLES } from './navigation'

const LS_DEMO_ROLES = 'todos-hub-demo-employee-roles'

// --- Demo store -------------------------------------------------------------
function loadDemoStore() {
  try {
    const raw = localStorage.getItem(LS_DEMO_ROLES)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function saveDemoStore(store) {
  try { localStorage.setItem(LS_DEMO_ROLES, JSON.stringify(store)) } catch { /* no-op */ }
}

// --- Ruoli effettivi dell'utente corrente -----------------------------------
/**
 * Risolve i ruoli ATTIVI dell'utente loggato.
 * Ordine di priorità:
 *   1. Supabase RPC current_user_roles()  (produzione)
 *   2. Demo store (localStorage, per testing UI senza backend)
 *   3. fallback legacy (currentRole singolo → array)
 */
export async function getCurrentUserRoles({ legacyRole, userId } = {}) {
  // 1) Produzione: RPC
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('current_user_roles')
      if (!error && Array.isArray(data) && data.length > 0) return data
    } catch { /* no-op */ }
  }

  // 2) Demo store per l'utente
  if (userId) {
    const store = loadDemoStore()
    const list = store[userId]
    if (Array.isArray(list) && list.length > 0) return list
  }

  // 3) Fallback legacy
  return legacyToArray(legacyRole)
}

/**
 * Mapping del vecchio singolo currentRole (admin/hr/pm/servizi_generali/employee)
 * in array di nuovi ruoli Hub. Utile finché non saremo migrati completamente.
 */
export function legacyToArray(legacyRole) {
  switch (legacyRole) {
    case 'admin':
      return Object.values(ROLES)
    case 'hr':            return [ROLES.HR, ROLES.EMPLOYEE]
    case 'pm':            return [ROLES.PM, ROLES.NETIMPL, ROLES.TEAM_LEADER, ROLES.EMPLOYEE]
    case 'servizi_generali': return [ROLES.SERVIZI_GEN, ROLES.IT, ROLES.EMPLOYEE]
    case 'employee':      return [ROLES.EMPLOYEE]
    default:              return [ROLES.EMPLOYEE]
  }
}

// --- Mutazioni ruoli (admin/HR) ---------------------------------------------
export async function grantRole(employeeId, roleCode, notes) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.rpc('grant_role', {
      p_employee_id: employeeId, p_role_code: roleCode, p_notes: notes || null
    })
    if (error) throw error
    return data
  }
  // Demo: scrive in localStorage
  const store = loadDemoStore()
  store[employeeId] = Array.from(new Set([...(store[employeeId] || []), roleCode]))
  saveDemoStore(store)
  return store[employeeId]
}

export async function revokeRole(employeeId, roleCode) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.rpc('revoke_role', {
      p_employee_id: employeeId, p_role_code: roleCode
    })
    if (error) throw error
    return data
  }
  const store = loadDemoStore()
  store[employeeId] = (store[employeeId] || []).filter(r => r !== roleCode)
  saveDemoStore(store)
  return true
}

// --- Demo helpers per UI di test (header selector multi) --------------------
/**
 * Setta direttamente l'array di ruoli demo per l'utente corrente — usato
 * dal multi-selector nell'header in modalità demo.
 */
export function setDemoUserRoles(userId, roles) {
  if (!userId) return
  const store = loadDemoStore()
  store[userId] = Array.isArray(roles) ? roles : []
  saveDemoStore(store)
}

export function getDemoUserRoles(userId) {
  if (!userId) return null
  const store = loadDemoStore()
  return store[userId] || null
}

// --- Predicates utili --------------------------------------------------------
export const hasRole = (userRoles, ...needed) =>
  Array.isArray(userRoles) && needed.some(r => userRoles.includes(r))
export const hasAllRoles = (userRoles, ...needed) =>
  Array.isArray(userRoles) && needed.every(r => userRoles.includes(r))
