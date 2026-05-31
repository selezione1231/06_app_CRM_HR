// ============================================================================
// TODOS — App Mode resolver
// ----------------------------------------------------------------------------
// La stessa codebase serve due esperienze diverse in base al dominio:
//
//   noi.todos.it       →  APP PERSONALE (mobile-first, semplice)
//                         Ciascun dipendente (operaio o ufficio) entra qui
//                         per timbrare, chiedere ferie, vedere buste paga.
//
//   <vercel domain>    →  HUB AZIENDALE (desktop-first, multi-modulo)
//                         Solo dipendenti d'ufficio (HR, HSE, IT, PM, ...)
//                         accedono ai moduli del proprio reparto.
//
// In sviluppo (localhost) si parte dal HUB ma è possibile forzare la modalità
// via query param `?mode=personal|hub` o via localStorage.
// ============================================================================

export const APP_MODE = {
  PERSONAL: 'personal',
  HUB:      'hub'
}

const PERSONAL_HOSTNAMES = [
  'noi.todos.it',
  'noi.todos.it.',
  'personal.todos.it'
]

const LS_OVERRIDE_KEY = 'todos-app-mode-override'

/**
 * Decide la modalità app correntemente attiva.
 * Ordine di priorità:
 *   1. query param `?mode=...`
 *   2. localStorage override (per "switch app" via bottone)
 *   3. hostname matching
 *   4. default HUB
 */
export function resolveAppMode() {
  if (typeof window === 'undefined') return APP_MODE.HUB

  // 1) Query param ha sempre la precedenza (utile in dev)
  try {
    const params = new URLSearchParams(window.location.search)
    const q = (params.get('mode') || '').toLowerCase()
    if (q === APP_MODE.PERSONAL || q === APP_MODE.HUB) return q
  } catch { /* no-op */ }

  // 2) Override esplicito da localStorage (cleared on logout)
  try {
    const o = localStorage.getItem(LS_OVERRIDE_KEY)
    if (o === APP_MODE.PERSONAL || o === APP_MODE.HUB) return o
  } catch { /* no-op */ }

  // 3) Hostname
  const host = (window.location.hostname || '').toLowerCase()
  if (PERSONAL_HOSTNAMES.includes(host)) return APP_MODE.PERSONAL

  // 4) Default
  return APP_MODE.HUB
}

/**
 * Setta l'override di modalità (per pulsante "Vai al lavoro" / "Vai a personale").
 * Su localhost cambia solo lo stato dell'app; in produzione, dato che i due
 * hostname sono distinti, conviene aprire l'altro dominio.
 */
export function setAppModeOverride(mode) {
  try {
    localStorage.setItem(LS_OVERRIDE_KEY, mode)
  } catch { /* no-op */ }
}

export function clearAppModeOverride() {
  try { localStorage.removeItem(LS_OVERRIDE_KEY) } catch { /* no-op */ }
}

/**
 * Ritorna l'URL dell'altra app per il pulsante di switch.
 * In produzione apre il dominio dell'altra, in dev usa il query param.
 */
export function getOtherAppUrl(currentMode) {
  if (typeof window === 'undefined') return '/'
  const other = currentMode === APP_MODE.PERSONAL ? APP_MODE.HUB : APP_MODE.PERSONAL

  const host = (window.location.hostname || '').toLowerCase()
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')

  if (isLocalhost) {
    // In dev, riusiamo lo stesso host con query param
    const url = new URL(window.location.href)
    url.searchParams.set('mode', other)
    return url.toString()
  }

  // In prod: link al dominio dell'altra app
  if (other === APP_MODE.PERSONAL) return 'https://noi.todos.it/'
  // L'Hub: dominio Vercel/aziendale (TBD, per ora torna alla root del current)
  return `${window.location.protocol}//${window.location.host}/`
}

/**
 * Determina se l'utente ha accesso al HUB.
 * Regola: deve avere almeno un ruolo NON 'employee'.
 */
export function canAccessHub(userRoles = []) {
  return userRoles.some(r => r && r !== 'employee')
}
