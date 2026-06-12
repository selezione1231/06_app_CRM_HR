// ============================================================================
// TODOS HUB — Accesso ai dati importati dal gestionale WORK_PRO_TODOS
// ----------------------------------------------------------------------------
// Strato di lettura per le tabelle di atterraggio (contacts, projects, ...).
// I moduli mantengono la loro UI: qui si fa solo query + mappatura.
// In demo mode (o senza Supabase) le funzioni ritornano null e i moduli
// usano i loro dati seed come prima.
// ============================================================================

import { supabase, isSupabaseConfigured } from '../supabaseClient'

export function isLegacyDataAvailable() {
  if (!isSupabaseConfigured) return false
  try { return !localStorage.getItem('demo-user') } catch { return true }
}

/**
 * Anagrafica clienti/fornitori (tabella contacts, ex TB_ANAGRAFE).
 * Ricerca e filtri lato server: l'anagrafica completa ha 12k record.
 * @returns { rows, total } — rows mappate per la UI, total = conteggio filtrato
 */
export async function fetchContacts({ q = '', tipo = 'Tutti', includeUnused = false, limit = 300 } = {}) {
  if (!isLegacyDataAvailable()) return null
  let query = supabase
    .from('contacts')
    .select('legacy_id,name,internal_code,vat_number,fiscal_code,address,zip,city,province,is_customer,is_supplier,is_public_body,unused,email,phone1,mobile1', { count: 'exact' })

  if (!includeUnused) query = query.eq('unused', false)
  if (tipo === 'Clienti') query = query.eq('is_customer', true)
  else if (tipo === 'Fornitori') query = query.eq('is_supplier', true)

  const s = q.trim().replace(/[%,()]/g, ' ')
  if (s) query = query.or(`name.ilike.%${s}%,internal_code.ilike.%${s}%,city.ilike.%${s}%,vat_number.ilike.%${s}%`)

  const { data, error, count } = await query.order('name').limit(limit)
  if (error) {
    console.warn('fetchContacts:', error.message)
    return null
  }
  const rows = (data || []).map(c => ({
    id: c.legacy_id,
    arca_code: c.internal_code || '—',
    name: c.name,
    piva: c.vat_number || c.fiscal_code || '',
    address: [c.address, [c.zip, c.city].filter(Boolean).join(' '), c.province ? `(${c.province})` : null].filter(Boolean).join(', '),
    email: c.email,
    phone: c.mobile1 || c.phone1,
    unused: c.unused,
    type: c.is_customer && c.is_supplier ? 'Cliente+Forn.'
      : c.is_customer ? 'Cliente'
      : c.is_supplier ? 'Fornitore'
      : c.is_public_body ? 'Ente pubblico' : 'Contatto'
  }))
  return { rows, total: count ?? rows.length }
}
