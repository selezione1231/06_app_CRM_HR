// ============================================================================
// TODOS HUB — Sync timbrature offline-first
// ----------------------------------------------------------------------------
// Il dispositivo salva SEMPRE prima in localStorage (funziona senza rete).
// Quando c'è connessione, le timbrature chiuse e non ancora sincronizzate
// vengono spedite a Supabase con upsert su local_id (idempotente: se la
// sync riparte a metà non crea duplicati).
// ============================================================================

import { supabase, isSupabaseConfigured } from '../supabaseClient'

const TABLE = '06app_Noi_timbrature'

export function isSharedMode() {
  if (!isSupabaseConfigured) return false
  try { return !localStorage.getItem('demo-user') } catch { return true }
}

export function countPending(entries) {
  return entries.filter(e => e.out_at && !e.synced).length
}

/**
 * Sincronizza le timbrature chiuse non ancora inviate.
 * Ritorna { entries, synced }: l'array aggiornato con i flag `synced`
 * e quante righe sono state inviate in questo giro.
 */
export async function syncPendingEntries(employeeId, employeeName, entries) {
  if (!isSharedMode()) return { entries, synced: 0 }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { entries, synced: 0 }

  const pending = entries.filter(e => e.out_at && !e.synced)
  if (pending.length === 0) return { entries, synced: 0 }

  const rows = pending.map(e => ({
    local_id: e.id,
    employee_id: employeeId,
    employee_name: employeeName || null,
    in_at: e.in_at,
    out_at: e.out_at,
    in_note: e.in_note || null,
    out_note: e.out_note || null,
    geo_in: e.geo_in || null,
    geo_out: e.geo_out || null,
    duration_minutes: e.duration_minutes || 0
  }))

  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'local_id' })
  if (error) {
    console.warn('Sync timbrature fallita (riproverò):', error.message)
    return { entries, synced: 0 }
  }
  const sent = new Set(pending.map(e => e.id))
  return {
    entries: entries.map(e => sent.has(e.id) ? { ...e, synced: true } : e),
    synced: sent.size
  }
}
