// ============================================================================
// TODOS HUB — Navigation tree (single source of truth)
// ----------------------------------------------------------------------------
// Definisce la struttura della sidebar, i ruoli che possono accedere a
// ciascuna voce, e il mapping con i componenti React da renderizzare.
//
// Filosofia:
//   - 6 macro-aree + Home (rispecchia la mappa concordata)
//   - Ogni voce ha `roles: [...]` filtrato dal RBAC
//   - `comingSoon: true` per i moduli non ancora implementati → mostrati
//     in sidebar come "in costruzione" senza routing
//   - `legacy: true` per le voci che mappano sui vecchi tab del CRM HR
//     (da rifattorizzare nelle fasi successive ma già accessibili)
// ============================================================================

import {
  Home, Clock, CalendarDays, FileText, FilePlus, GraduationCap,
  MessageSquare, Calendar, Building2, Users2, Phone, ClipboardList,
  CheckCircle2, Briefcase, Layers, UserCircle2, Award, BookOpen,
  ShieldCheck, HeartPulse, HardHat, AlertTriangle, FolderArchive,
  Car, Fuel, Wrench, Package, Boxes, MonitorSmartphone, Wifi, KeyRound,
  Receipt, FileSpreadsheet, FileSearch, ShoppingCart, FileWarning,
  Wallet, BarChart3, LineChart, PieChart, Sparkles, Bot,
  Activity, AlertOctagon, Building, FolderArchive as ArchiveIcon,
  FileCode, Video
} from 'lucide-react'

// --- Roles -------------------------------------------------------------------
export const ROLES = {
  EMPLOYEE:    'employee',
  TEAM_LEADER: 'team_leader',
  PM:          'pm',
  NETIMPL:     'netimpl',
  HR:          'hr',
  HSE:         'hse',
  SERVIZI_GEN: 'servizi_gen',
  IT:          'it',
  ACQUISTI:    'acquisti',
  FINANCE:     'finance',
  SALES:       'sales',
  QUALITY:     'quality',
  DIREZIONE:   'direzione',
  ADMIN:       'admin'
}

export const ROLE_LABELS = {
  [ROLES.EMPLOYEE]:    'Dipendente',
  [ROLES.TEAM_LEADER]: 'Caposquadra',
  [ROLES.PM]:          'Project Manager',
  [ROLES.NETIMPL]:     'Network Implementation',
  [ROLES.HR]:          'HR',
  [ROLES.HSE]:         'HSE',
  [ROLES.SERVIZI_GEN]: 'Servizi Generali',
  [ROLES.IT]:          'IT',
  [ROLES.ACQUISTI]:    'Acquisti',
  [ROLES.FINANCE]:     'Amministrazione',
  [ROLES.SALES]:       'Commerciale',
  [ROLES.QUALITY]:     'Qualità',
  [ROLES.DIREZIONE]:   'Direzione',
  [ROLES.ADMIN]:       'Admin'
}

// Helper "tutti" per voci visibili a chiunque sia loggato
const ALL = Object.values(ROLES)
// Helper "staff" = chiunque non sia solo employee
const STAFF = ALL.filter(r => r !== ROLES.EMPLOYEE)

// --- Navigation tree ---------------------------------------------------------
// La struttura è:  area → groups → items
// L'area "Home" è speciale (singola voce, niente group)
//
// Ogni item:
//   { id, label, icon, roles, [comingSoon], [legacy], [tabId], [badge] }
//
//   - tabId  → mappa sui navTab esistenti in App.jsx (per voci legacy)
//   - badge  → funzione che riceve lo stato app e ritorna un numero/stringa
// ----------------------------------------------------------------------------
export const NAV_TREE = [
  // ============== HOME ==============
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    type: 'item',
    roles: ALL,
    tabId: 'home'
  },

  // ============== 🚧 OPERATIONS ==============
  {
    id: 'area-operations',
    label: 'Operations',
    icon: HardHat,
    type: 'area',
    roles: [ROLES.PM, ROLES.NETIMPL, ROLES.TEAM_LEADER, ROLES.HSE, ROLES.DIREZIONE, ROLES.ADMIN],
    groups: [
      {
        id: 'ops-planning',
        label: 'Pianificazione',
        items: [
          { id: 'ops-weekly',      label: 'Pianificazione settimanale', icon: Calendar,    roles: [ROLES.PM, ROLES.NETIMPL, ROLES.TEAM_LEADER, ROLES.ADMIN], tabId: 'wp2' },
          { id: 'ops-shifts',      label: 'Planner Turni',              icon: Clock,       roles: [ROLES.PM, ROLES.HR, ROLES.ADMIN], tabId: 'shifts', legacy: true },
          { id: 'ops-oncall',      label: 'Reperibilità',               icon: Phone,       roles: [ROLES.PM, ROLES.NETIMPL, ROLES.ADMIN], tabId: 'wp2-oncall' }
        ]
      },
      {
        id: 'ops-anagrafiche',
        label: 'Anagrafiche',
        items: [
          { id: 'ops-clients',     label: 'Clienti',          icon: Briefcase,   roles: [ROLES.PM, ROLES.NETIMPL, ROLES.SALES, ROLES.ADMIN], tabId: 'wp2-clients' },
          { id: 'ops-sites',       label: 'Cantieri',         icon: Building2,   roles: [ROLES.PM, ROLES.NETIMPL, ROLES.ADMIN], tabId: 'wp2-sites' },
          { id: 'ops-squads',      label: 'Squadre',          icon: Users2,      roles: [ROLES.PM, ROLES.NETIMPL, ROLES.HR, ROLES.ADMIN], comingSoon: true }
        ]
      },
      {
        id: 'ops-approvals',
        label: 'Approvazioni',
        items: [
          { id: 'ops-app-leave',   label: 'Richieste Ferie/Permessi', icon: ClipboardList, roles: [ROLES.PM, ROLES.HR, ROLES.ADMIN], tabId: 'wp2-leaves' },
          { id: 'ops-app-hours',   label: 'Approva Inserimenti ore', icon: CheckCircle2,  roles: [ROLES.PM, ROLES.ADMIN], tabId: 'wp2-time' },
          { id: 'ops-app-notes',   label: 'Note dai dipendenti',     icon: MessageSquare, roles: [ROLES.PM, ROLES.ADMIN], tabId: 'wp2-notes' }
        ]
      },
      {
        id: 'ops-commesse',
        label: 'Commesse & Costing',
        items: [
          { id: 'ops-job-costing', label: 'Job costing',      icon: LineChart,   roles: [ROLES.PM, ROLES.NETIMPL, ROLES.FINANCE, ROLES.DIREZIONE, ROLES.ADMIN], comingSoon: true }
        ]
      }
    ]
  },

  // ============== 👥 PEOPLE ==============
  {
    id: 'area-people',
    label: 'People',
    icon: Users2,
    type: 'area',
    roles: [ROLES.HR, ROLES.HSE, ROLES.DIREZIONE, ROLES.ADMIN],
    groups: [
      {
        id: 'people-hr',
        label: 'HR',
        items: [
          { id: 'hr-active',        label: 'Ricerche Attive',     icon: Briefcase,    roles: [ROLES.HR, ROLES.ADMIN], tabId: 'active', legacy: true },
          { id: 'hr-archived',      label: 'Archivio Ricerche',   icon: FolderArchive,roles: [ROLES.HR, ROLES.ADMIN], tabId: 'archived', legacy: true },
          { id: 'hr-templates',     label: 'Templates',           icon: FileCode,     roles: [ROLES.HR, ROLES.ADMIN], tabId: 'templates', legacy: true },
          { id: 'hr-appointments',  label: 'Appuntamenti',        icon: Calendar,     roles: [ROLES.HR, ROLES.ADMIN], tabId: 'appointments', legacy: true },
          { id: 'hr-employees',     label: 'Anagrafica Dipendenti', icon: Users2,     roles: [ROLES.HR, ROLES.SERVIZI_GEN, ROLES.PM, ROLES.ADMIN], tabId: 'employees', legacy: true },
          { id: 'hr-absences',      label: 'Presenze & Ferie',    icon: CalendarDays, roles: [ROLES.HR, ROLES.PM, ROLES.ADMIN], tabId: 'absences', legacy: true },
          { id: 'hr-org',           label: 'Organigramma',        icon: Building,     roles: [ROLES.HR, ROLES.DIREZIONE, ROLES.ADMIN], comingSoon: true },
          { id: 'hr-skills',        label: 'Skill matrix',        icon: Award,        roles: [ROLES.HR, ROLES.PM, ROLES.DIREZIONE, ROLES.ADMIN], comingSoon: true },
          { id: 'hr-lms',           label: 'Formazione (LMS)',    icon: BookOpen,     roles: [ROLES.HR, ROLES.HSE, ROLES.ADMIN], comingSoon: true },
          { id: 'hr-onboarding',    label: 'Onboarding/Offboarding', icon: GraduationCap, roles: [ROLES.HR, ROLES.IT, ROLES.SERVIZI_GEN, ROLES.HSE, ROLES.ADMIN], comingSoon: true }
        ]
      },
      {
        id: 'people-hse',
        label: 'HSE',
        items: [
          { id: 'hse-certs',         label: 'Certificazioni dipendenti', icon: ShieldCheck, roles: [ROLES.HSE, ROLES.HR, ROLES.ADMIN], comingSoon: true },
          { id: 'hse-sanitaria',     label: 'Sorveglianza sanitaria',    icon: HeartPulse, roles: [ROLES.HSE, ROLES.HR, ROLES.ADMIN], comingSoon: true },
          { id: 'hse-dpi',           label: 'DPI',                       icon: HardHat,    roles: [ROLES.HSE, ROLES.SERVIZI_GEN, ROLES.ADMIN], comingSoon: true },
          { id: 'hse-infortuni',     label: 'Near miss / Infortuni',     icon: AlertTriangle, roles: [ROLES.HSE, ROLES.HR, ROLES.DIREZIONE, ROLES.ADMIN], comingSoon: true },
          { id: 'hse-dvr',           label: 'DVR & procedure',           icon: FileText,   roles: [ROLES.HSE, ROLES.ADMIN], comingSoon: true }
        ]
      }
    ]
  },

  // ============== 🏢 ASSET ==============
  {
    id: 'area-asset',
    label: 'Asset',
    icon: Boxes,
    type: 'area',
    roles: [ROLES.SERVIZI_GEN, ROLES.IT, ROLES.HSE, ROLES.ADMIN],
    groups: [
      {
        id: 'asset-sg',
        label: 'Servizi Generali',
        items: [
          { id: 'asset-fleet',       label: 'Flotta mezzi',     icon: Car,     roles: [ROLES.SERVIZI_GEN, ROLES.PM, ROLES.ADMIN], tabId: 'mezzi', legacy: true },
          { id: 'asset-fleet-wp',    label: 'Automezzi (WP)',   icon: Car,     roles: [ROLES.SERVIZI_GEN, ROLES.PM, ROLES.ADMIN], tabId: 'wp2-vehicles' },
          { id: 'asset-fuel',        label: 'Consumi carburante', icon: Fuel,  roles: [ROLES.SERVIZI_GEN, ROLES.FINANCE, ROLES.ADMIN], comingSoon: true },
          { id: 'asset-sites',       label: 'Sedi & impianti',  icon: Building,roles: [ROLES.SERVIZI_GEN, ROLES.ADMIN], comingSoon: true },
          { id: 'asset-equipment',   label: 'Beni & attrezzature', icon: Wrench, roles: [ROLES.SERVIZI_GEN, ROLES.HSE, ROLES.ADMIN], comingSoon: true }
        ]
      },
      {
        id: 'asset-it',
        label: 'IT',
        items: [
          { id: 'it-devices',        label: 'PC, smartphone, SIM', icon: MonitorSmartphone, roles: [ROLES.IT, ROLES.ADMIN], comingSoon: true },
          { id: 'it-network',        label: 'Apparati di rete',  icon: Wifi,             roles: [ROLES.IT, ROLES.ADMIN], comingSoon: true },
          { id: 'it-licenses',       label: 'Licenze software',  icon: KeyRound,         roles: [ROLES.IT, ROLES.FINANCE, ROLES.ADMIN], comingSoon: true },
          { id: 'it-accounts',       label: 'Account aziendali', icon: UserCircle2,      roles: [ROLES.IT, ROLES.ADMIN], comingSoon: true },
          { id: 'it-helpdesk',       label: 'Help desk IT',      icon: MessageSquare,    roles: ALL, comingSoon: true }
        ]
      },
      {
        id: 'asset-mag',
        label: 'Magazzino',
        items: [
          { id: 'asset-warehouse',   label: 'Inventario',        icon: Package,          roles: [ROLES.SERVIZI_GEN, ROLES.IT, ROLES.PM, ROLES.ADMIN], comingSoon: true }
        ]
      }
    ]
  },

  // ============== 💼 BUYING ==============
  {
    id: 'area-buying',
    label: 'Buying',
    icon: ShoppingCart,
    type: 'area',
    roles: [ROLES.ACQUISTI, ROLES.FINANCE, ROLES.DIREZIONE, ROLES.ADMIN],
    groups: [
      {
        id: 'buying-suppliers',
        label: 'Fornitori',
        items: [
          { id: 'buy-suppliers',     label: 'Anagrafica fornitori', icon: Briefcase,    roles: [ROLES.ACQUISTI, ROLES.FINANCE, ROLES.ADMIN], comingSoon: true },
          { id: 'buy-listini',       label: 'Listini concordati',   icon: FileSpreadsheet, roles: [ROLES.ACQUISTI, ROLES.FINANCE, ROLES.ADMIN], comingSoon: true },
          { id: 'buy-accordi',       label: 'Accordi quadro',       icon: FileText,     roles: [ROLES.ACQUISTI, ROLES.FINANCE, ROLES.ADMIN], comingSoon: true }
        ]
      },
      {
        id: 'buying-ops',
        label: 'Operatività',
        items: [
          { id: 'buy-rda',           label: 'RDA — Richieste acquisto', icon: ClipboardList, roles: [ROLES.ACQUISTI, ROLES.PM, ROLES.SERVIZI_GEN, ROLES.IT, ROLES.HSE, ROLES.ADMIN], comingSoon: true },
          { id: 'buy-orders',        label: 'Ordini fornitori',         icon: ShoppingCart,  roles: [ROLES.ACQUISTI, ROLES.ADMIN], comingSoon: true },
          { id: 'buy-invoices',      label: 'Controllo fatture (AI)',   icon: FileSearch,    roles: [ROLES.ACQUISTI, ROLES.FINANCE, ROLES.ADMIN], comingSoon: true },
          { id: 'buy-expenses',      label: 'Note spese',               icon: Receipt,       roles: [ROLES.HR, ROLES.PM, ROLES.FINANCE, ROLES.ADMIN], tabId: 'expenses', legacy: true }
        ]
      }
    ]
  },

  // ============== 📊 INSIGHTS ==============
  {
    id: 'area-insights',
    label: 'Insights',
    icon: BarChart3,
    type: 'area',
    roles: [ROLES.HR, ROLES.PM, ROLES.HSE, ROLES.FINANCE, ROLES.ACQUISTI, ROLES.DIREZIONE, ROLES.ADMIN],
    groups: [
      {
        id: 'insights-dash',
        label: 'Dashboard',
        items: [
          { id: 'ins-hr',            label: 'HR Analytics',     icon: PieChart,  roles: [ROLES.HR, ROLES.DIREZIONE, ROLES.ADMIN], tabId: 'analytics', legacy: true },
          { id: 'ins-ops',           label: 'Operations',       icon: Activity,  roles: [ROLES.PM, ROLES.DIREZIONE, ROLES.ADMIN], comingSoon: true },
          { id: 'ins-cost',          label: 'Costi & margini',  icon: LineChart, roles: [ROLES.FINANCE, ROLES.DIREZIONE, ROLES.ADMIN], comingSoon: true },
          { id: 'ins-hse',           label: 'HSE',              icon: ShieldCheck, roles: [ROLES.HSE, ROLES.DIREZIONE, ROLES.ADMIN], comingSoon: true }
        ]
      },
      {
        id: 'insights-cross',
        label: 'Cross-functional',
        items: [
          { id: 'ins-expiries',      label: 'Centro Scadenze',  icon: AlertOctagon, roles: STAFF, tabId: 'wp2-expiries' },
          { id: 'ins-audit',         label: 'Storico modifiche', icon: Activity, roles: [ROLES.ADMIN, ROLES.HR, ROLES.DIREZIONE], tabId: 'audit-log' },
          { id: 'ins-exec',          label: 'Executive briefing', icon: Sparkles, roles: [ROLES.DIREZIONE, ROLES.ADMIN], comingSoon: true },
          { id: 'ins-ai',            label: 'AI Copilot',       icon: Bot,       roles: [ROLES.HR, ROLES.PM, ROLES.DIREZIONE, ROLES.ADMIN], comingSoon: true }
        ]
      }
    ]
  }
]

// --- Mobile bottom nav (Hub aziendale, voci essenziali per ruoli staff) ----
export const MOBILE_BOTTOM_NAV = [
  { id: 'home',              label: 'Home',     icon: Home,         roles: ALL },
  { id: 'ops-weekly',        label: 'Planner',  icon: Calendar,     roles: [ROLES.PM, ROLES.NETIMPL, ROLES.TEAM_LEADER, ROLES.ADMIN] },
  { id: 'ins-expiries',      label: 'Scadenze', icon: AlertOctagon, roles: STAFF },
  { id: 'hr-employees',      label: 'Persone',  icon: Users2,       roles: [ROLES.HR, ROLES.SERVIZI_GEN, ROLES.PM, ROLES.ADMIN] }
]

// --- Helpers ----------------------------------------------------------------

// Restituisce tutti gli items navigabili (foglie) accessibili per i ruoli passati.
export function getAccessibleItems(userRoles = []) {
  const items = []
  for (const node of NAV_TREE) {
    if (node.type === 'item') {
      if (node.roles.some(r => userRoles.includes(r))) items.push(node)
    } else if (node.type === 'area') {
      if (!node.roles.some(r => userRoles.includes(r))) continue
      for (const group of node.groups || []) {
        for (const item of group.items || []) {
          if (item.roles.some(r => userRoles.includes(r))) items.push(item)
        }
      }
    }
  }
  return items
}

// Trova un item per id
export function findItemById(id) {
  for (const node of NAV_TREE) {
    if (node.type === 'item' && node.id === id) return node
    if (node.type === 'area') {
      for (const group of node.groups || []) {
        const f = (group.items || []).find(i => i.id === id)
        if (f) return f
      }
    }
  }
  return null
}

// Filtra il tree per i soli items/groups/aree visibili ai ruoli passati
export function filterTreeByRoles(userRoles = []) {
  return NAV_TREE
    .filter(node => node.roles.some(r => userRoles.includes(r)))
    .map(node => {
      if (node.type === 'item') return node
      const groups = (node.groups || [])
        .map(group => {
          const items = (group.items || []).filter(i => i.roles.some(r => userRoles.includes(r)))
          return items.length ? { ...group, items } : null
        })
        .filter(Boolean)
      return { ...node, groups }
    })
    .filter(node => node.type === 'item' || (node.groups && node.groups.length > 0))
}
