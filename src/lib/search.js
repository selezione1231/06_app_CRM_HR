// ============================================================================
// TODOS HUB — Global Search client
// ----------------------------------------------------------------------------
// Ricerca trasversale su tutte le entità: dipendenti, clienti, cantieri,
// mezzi, P.M., squadre, documenti, voci di navigazione.
//
// In demo: scoring lato client con normalizzazione e fuzzy matching.
// In produzione: RPC Postgres `search_global` (con pg_trgm).
// ============================================================================

import { supabase, isSupabaseConfigured } from '../supabaseClient'
import {
  WP_EMPLOYEES, WP_CLIENTS, WP_SITES, WP_VEHICLES, WP_PM, WP_SQUADS, WP_DOCS
} from '../components/workpro/shared/wpSeed'
import { NAV_TREE, ROLES } from './navigation'

const LS_RECENT = 'todos-hub-recent-searches'

// --- Entity metadata --------------------------------------------------------
export const ENTITY_META = {
  employee:  { label: 'Dipendente',     icon: '👤', color: '#6366f1', priority: 1 },
  client:    { label: 'Cliente',        icon: '💼', color: '#0ea5e9', priority: 2 },
  supplier:  { label: 'Fornitore',      icon: '🤝', color: '#a855f7', priority: 2 },
  site:      { label: 'Cantiere',       icon: '🏗️', color: '#A82238', priority: 1 },
  vehicle:   { label: 'Mezzo',          icon: '🚐', color: '#0891b2', priority: 3 },
  pm:        { label: 'Project Manager',icon: '👔', color: '#7c3aed', priority: 2 },
  squad:     { label: 'Squadra',        icon: '👷‍♂️', color: '#0f766e', priority: 3 },
  document:  { label: 'Documento',      icon: '📄', color: '#64748b', priority: 4 },
  nav:       { label: 'Vai a',          icon: '→',  color: '#94a3b8', priority: 5 }
}

// --- Normalizzazione + scoring ---------------------------------------------
const normalize = (s) => (s || '').toString().toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '') // rimuove accenti

function score(text, query) {
  const t = normalize(text)
  const q = normalize(query)
  if (!q) return 0
  if (t === q) return 1000
  if (t.startsWith(q)) return 500 - t.length
  const idx = t.indexOf(q)
  if (idx >= 0) return 200 - idx
  // Word-prefix match
  const words = t.split(/[\s\-_./]/)
  for (const w of words) {
    if (w.startsWith(q)) return 100
  }
  // Tutti i caratteri presenti in ordine? (fuzzy soft)
  let ti = 0, qi = 0
  while (ti < t.length && qi < q.length) {
    if (t[ti] === q[qi]) qi++
    ti++
  }
  if (qi === q.length) return 30
  return 0
}

// --- Funzione di ricerca centrale ------------------------------------------
/**
 * @param {string}   query
 * @param {object}   opts  { userRoles, limit }
 * @returns {Array} risultati ordinati per score
 */
export async function search(query, { userRoles = [], limit = 30 } = {}) {
  if (!query || !query.trim()) return []

  // Path produzione (placeholder per quando avremo l'RPC)
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('search_global', { p_query: query, p_limit: limit })
      if (!error && Array.isArray(data) && data.length > 0) return data
    } catch { /* fallback demo */ }
  }

  const results = []
  const addResult = (entity, item) => {
    if (item.score > 0) results.push({ ...item, entity })
  }

  // --- Dipendenti ---------------------------------------------------------
  for (const e of WP_EMPLOYEES) {
    const s = Math.max(
      score(e.name, query) + 10,
      score(e.code, query) + 5,
      score(e.phone || '', query)
    )
    if (s > 0) {
      const sq = WP_SQUADS.find(x => x.id === e.squad_id)
      const pm = WP_PM.find(x => x.id === e.pm_id)
      addResult('employee', {
        id: e.id, score: s,
        title: e.name + (e.is_leader ? ' (CS)' : ''),
        subtitle: `${e.code}${sq ? ' · ' + sq.name : ''}${pm ? ' · ' + pm.name : ''}`,
        action: { navId: 'hr-employees', entityId: e.id }
      })
    }
  }

  // --- Clienti / Fornitori ------------------------------------------------
  for (const c of WP_CLIENTS) {
    const s = Math.max(
      score(c.name, query) + 8,
      score(c.arca_code, query) + 4,
      score(c.piva || '', query),
      score(c.address || '', query) - 5
    )
    if (s > 0) {
      const entity = c.type === 'Fornitore' ? 'supplier' : 'client'
      addResult(entity, {
        id: c.id, score: s,
        title: c.name,
        subtitle: `${c.arca_code} · ${c.address}${c.piva ? ' · P.IVA ' + c.piva : ''}`,
        action: {
          navId: c.type === 'Fornitore' ? 'buy-suppliers' : 'ops-clients',
          entityId: c.id
        }
      })
    }
  }

  // --- Cantieri ------------------------------------------------------------
  for (const st of WP_SITES) {
    const cli = WP_CLIENTS.find(c => c.id === st.client_id)
    const s = Math.max(
      score(st.code, query) + 10,
      score(st.name, query) + 6,
      score(st.address || '', query),
      score(cli?.name || '', query) + 2
    )
    if (s > 0) {
      addResult('site', {
        id: st.id, score: s,
        title: st.code + (st.is_maintenance ? ' (manut.)' : ''),
        subtitle: `${st.name}${cli ? ' · ' + cli.name : ''} · ${st.address || ''}`,
        action: { navId: 'ops-sites', entityId: st.id }
      })
    }
  }

  // --- Mezzi --------------------------------------------------------------
  for (const v of WP_VEHICLES) {
    const s = Math.max(
      score(v.plate, query) + 10,
      score(v.model, query) + 5,
      score(v.fuel || '', query)
    )
    if (s > 0) {
      addResult('vehicle', {
        id: v.id, score: s,
        title: v.plate,
        subtitle: `${v.model} · ${v.fuel || ''}${v.ownership === 'Noleggio' ? ' · noleggio' : ''}`,
        action: { navId: 'asset-fleet-wp', entityId: v.id }
      })
    }
  }

  // --- P.M. ---------------------------------------------------------------
  for (const pm of WP_PM) {
    const s = Math.max(
      score(pm.name, query) + 8,
      score(pm.code, query) + 4,
      score(pm.area || '', query),
      score(pm.email || '', query)
    )
    if (s > 0) {
      addResult('pm', {
        id: pm.id, score: s,
        title: pm.name,
        subtitle: `${pm.code} · ${pm.area}`,
        action: { navId: 'ops-app-leave', entityId: pm.id }
      })
    }
  }

  // --- Squadre ------------------------------------------------------------
  for (const sq of WP_SQUADS) {
    const s = score(sq.name, query) + 5
    if (s > 0) {
      const pm = WP_PM.find(p => p.id === sq.pm_id)
      addResult('squad', {
        id: sq.id, score: s,
        title: sq.name,
        subtitle: pm ? `P.M. ${pm.name}` : '',
        action: { navId: 'ops-squads', entityId: sq.id }
      })
    }
  }

  // --- Documenti ----------------------------------------------------------
  for (const d of WP_DOCS) {
    const s = score(d.title, query) + 3
    if (s > 0) {
      addResult('document', {
        id: d.id, score: s,
        title: d.title,
        subtitle: `Visibilità: ${d.visibility}${d.expires_at ? ' · scade ' + new Date(d.expires_at).toLocaleDateString('it-IT') : ''}`,
        action: { navId: 'docs', entityId: d.id }
      })
    }
  }

  // --- Voci di navigazione (Vai a...) -------------------------------------
  for (const node of NAV_TREE) {
    if (node.type === 'item') {
      if (!node.roles?.some(r => userRoles.includes(r))) continue
      const s = score(node.label, query) - 10
      if (s > 0) addResult('nav', {
        id: node.id, score: s,
        title: node.label,
        subtitle: 'Naviga →',
        action: { navId: node.id }
      })
    } else if (node.type === 'area') {
      for (const g of node.groups || []) {
        for (const item of g.items || []) {
          if (!item.roles?.some(r => userRoles.includes(r))) continue
          const s = Math.max(
            score(item.label, query) - 5,
            score(node.label, query) - 20,
            score(g.label || '', query) - 30
          )
          if (s > 0) addResult('nav', {
            id: item.id, score: s,
            title: item.label,
            subtitle: `${node.label} · ${g.label || ''}`,
            action: { navId: item.id }
          })
        }
      }
    }
  }

  // Ordina per score desc, poi per priorità entità
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return (ENTITY_META[a.entity]?.priority || 9) - (ENTITY_META[b.entity]?.priority || 9)
  })

  return results.slice(0, limit)
}

// --- Recent searches (localStorage) ----------------------------------------
export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(LS_RECENT)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function pushRecentSearch(query) {
  if (!query?.trim()) return
  try {
    const existing = getRecentSearches().filter(q => q !== query)
    const next = [query, ...existing].slice(0, 8)
    localStorage.setItem(LS_RECENT, JSON.stringify(next))
  } catch { /* no-op */ }
}

export function clearRecentSearches() {
  try { localStorage.removeItem(LS_RECENT) } catch { /* no-op */ }
}
