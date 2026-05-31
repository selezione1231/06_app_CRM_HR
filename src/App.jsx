import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import KanbanBoard from './components/KanbanBoard'
import JobModal from './components/JobModal'
import CandidateModal from './components/CandidateModal'
import CreateSearch from './components/CreateSearch'
import EmployeesTab from './components/EmployeesTab'
import AbsencesTab from './components/AbsencesTab'
import ExpensesTab from './components/ExpensesTab'
import EmployeePortalTab from './components/EmployeePortalTab'
import AnalyticsTab from './components/AnalyticsTab'
import ShiftPlannerTab from './components/ShiftPlannerTab'
import MezziTab from './components/MezziTab'
import WP2Module from './components/workpro/WP2Module'
import AppShell from './components/layout/AppShell'
import HomePage from './components/layout/HomePage'
import PersonalApp from './components/personal/PersonalApp'
import { findItemById, ROLES } from './lib/navigation'
import { APP_MODE, resolveAppMode, canAccessHub } from './lib/appMode'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import { Calendar, Users, Briefcase, Video, Trash2, ExternalLink, ShieldAlert, FolderArchive, FileCode, Receipt, BarChart3, Clock, CalendarDays, Car, HardHat } from 'lucide-react'

// ----------------------------------------------------------------------------
// Mapping role legacy → array di ruoli Hub
// (Ruolo legacy del CRM HR vs nuovo RBAC multi-ruolo di Todos Hub)
// ----------------------------------------------------------------------------
function mapLegacyRoleToHubRoles(legacyRole) {
  switch (legacyRole) {
    case 'admin':
      // Admin vede tutto
      return Object.values(ROLES)
    case 'hr':
      return [ROLES.HR, ROLES.EMPLOYEE]
    case 'pm':
      return [ROLES.PM, ROLES.NETIMPL, ROLES.TEAM_LEADER, ROLES.EMPLOYEE]
    case 'servizi_generali':
      return [ROLES.SERVIZI_GEN, ROLES.IT, ROLES.EMPLOYEE]
    case 'employee':
      return [ROLES.EMPLOYEE]
    default:
      return [ROLES.EMPLOYEE]
  }
}

// --- SEED DATI DEMO DI FALLBACK ---
const DEFAULT_JOBS = [
  {
    id: 'demo-job-1',
    title: 'Senior Frontend Developer (React)',
    department: 'Tech',
    status: 'Open',
    description: 'Siamo alla ricerca di un Senior React Developer per guidare lo sviluppo delle interfacce del nostro portale di gestione HR SaaS. Cerchiamo una risorsa autonoma in grado di scrivere codice pulito, scalabile e performante, lavorando in team con designer e backend engineers.',
    requirements: 'Requisiti chiave:\n- 4+ anni di esperienza nello sviluppo frontend con React\n- Conoscenza avanzata di TypeScript e JavaScript (ES6+)\n- Gestione stato globale tramite Zustand o Redux\n- CSS Variables avanzate, Layout fluidi, HTML semantico',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-job-2',
    title: 'Sales Account Executive B2B',
    department: 'Commerciale',
    status: 'Open',
    description: 'Ricerchiamo una risorsa commerciale per accelerare la penetrazione del nostro software CRM HR nel mercato corporate italiano. Ti occuperai di lead generation, presentazioni e demo commerciali a direttori HR, e gestione delle trattative fino alla firma del contratto.',
    requirements: 'Requisiti chiave:\n- 3+ anni vendite B2B di soluzioni software/SaaS\n- Ottima dialettica e spiccate capacità negoziali\n- Dimestichezza nell\'uso di CRM (es. Salesforce, HubSpot)',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-job-3',
    title: 'Addetto Junior Customer Care',
    department: 'Supporto',
    status: 'Closed', // Inizialmente archiviato!
    description: 'Ricerchiamo addetti all\'assistenza clienti junior per gestire ticket ed e-mail di supporto dei nostri utenti. Gradita esperienza di un anno in call center o ruoli a contatto con il pubblico.',
    requirements: 'Requisiti:\n- Ottimo italiano scritto e parlato\n- Pazienza, attitudine al problem solving\n- Conoscenza pacchetto Office',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const DEFAULT_CANDIDATES = [
  {
    id: 'demo-cand-1',
    job_id: 'demo-job-1',
    name: 'Elena Bianchi',
    email: 'elena.bianchi@esempio.it',
    phone: '+39 333 987 6543',
    stage: 'Colloquio',
    cv_text: 'Curriculum Vitae Elena Bianchi. Sviluppatrice Frontend con 5 anni di esperienza in React e TypeScript...',
    competenze: ['React', 'TypeScript', 'Zustand', 'CSS Grid', 'Git', 'Webpack', 'Jest', 'Agile'],
    esperienze: [
      { ruolo: 'Senior React Developer', azienda: 'CloudTech S.p.A.', periodo: '2022 - Presente', descrizione: 'Responsabile dello sviluppo del frontend dell\'applicazione di analytics.' },
      { ruolo: 'Frontend Engineer', azienda: 'Web Agency S.r.l.', periodo: '2019 - 2022', descrizione: 'Sviluppo di applicazioni web e-commerce customizzate.' }
    ],
    istruzione: [
      { titolo: 'Laurea in Informatica', istituto: 'Università di Bologna', anno: '2019' }
    ],
    fit_score: 92,
    match_analysis: {
      fit_score: 92,
      analisi_fit: 'Profilo eccellente. Elena possiede tutte le competenze chiave richieste dal ruolo, inclusa un\'ottima esperienza specifica con TypeScript e lo stato globale Zustand.',
      punti_forza: ['5 anni di esperienza di sviluppo frontend focalizzato su React', 'Ottimo background accademico in informatica', 'Esperienza in metodologie agili'],
      punti_debolezza: ['Nessuna esperienza esplicita dichiarata con database Supabase'],
      domande_consigliate: ['Puoi farci un esempio di come hai gestito un problema di performance rendering in React?', 'Quali pattern utilizzi per implementare la sicurezza lato client con TypeScript?']
    },
    stato_interazione: 'Primo Colloquio Fissato',
    data_colloquio_1: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-cand-2',
    job_id: 'demo-job-1',
    name: 'Alessandro Neri',
    email: 'alessandro.neri@email.it',
    phone: '+39 349 765 4321',
    stage: 'Screening',
    cv_text: 'Curriculum Vitae Alessandro Neri. Web Developer con focus su JavaScript, Vue.js e React...',
    competenze: ['JavaScript', 'React', 'Vue.js', 'Bootstrap', 'REST APIs', 'Node.js', 'SQL'],
    esperienze: [
      { ruolo: 'Software Developer', azienda: 'Logistica Digitale S.r.l.', periodo: '2021 - Presente', descrizione: 'Manutenzione di portali interni aziendali scritti in React e Vue.' }
    ],
    istruzione: [
      { titolo: 'Diploma Perito Informatico', istituto: 'ITIS Cardano', anno: '2020' }
    ],
    fit_score: 75,
    match_analysis: {
      fit_score: 75,
      analisi_fit: 'Candidato solido ma con profilo mid-level. Possiede esperienza con React ma scarse referenze su TypeScript ed architetture complesse di state management.',
      punti_forza: ['Versatilità nell\'uso sia di React che di Vue.js', 'Competenze di backend (Node/SQL) utili per l\'integrazione'],
      punti_debolezza: ['Manca esperienza consolidata con TypeScript', 'Competenza su gestori di stato globali limitata'],
      domande_consigliate: ['Che differenze trovi nella gestione dei componenti tra React e Vue.js?', 'Hai avuto modo di usare TypeScript in progetti personali o lavorativi?']
    },
    stato_interazione: 'Da contattare',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-cand-3',
    job_id: 'demo-job-2',
    name: 'Sofia Romano',
    email: 'sofia.romano@salesmail.it',
    phone: '+39 328 444 5555',
    stage: 'Proposta',
    cv_text: 'Curriculum Vitae Sofia Romano. Sales Representative con esperienza B2B SaaS...',
    competenze: ['B2B Sales', 'Lead Generation', 'Salesforce', 'Negotiation', 'Account Management', 'CRM'],
    esperienze: [
      { ruolo: 'Inside Sales Specialist', azienda: 'SaaS Solutions S.p.A.', periodo: '2021 - Presente', descrizione: 'Chiusura di accordi commerciali B2B per software gestionali. Superamento costante dei target del 15%.' }
    ],
    istruzione: [
      { titolo: 'Laurea Triennale in Economia e Marketing', istituto: 'Università Luiss Roma', anno: '2020' }
    ],
    fit_score: 89,
    match_analysis: {
      fit_score: 89,
      analisi_fit: 'Ottima candidata commerciale con background specifico in soluzioni software SaaS B2B. Orientata al target con ottime metriche storiche di conversione.',
      punti_forza: ['Esperienza diretta nella vendita di software SaaS', 'Forte orientamento al superamento del target commerciale', 'Ottime capacità comunicative'],
      punti_debolezza: ['Poca dimestichezza con mercati enterprise ad alta scala corporativa'],
      domande_consigliate: ['Qual è stata la tua vendita B2B più difficile e come l\'hai conclusa?', 'Che metodologia di prospecting utilizzi solitamente?']
    },
    stato_interazione: 'Primo Colloquio Effettuato',
    data_colloquio_1: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const DEFAULT_NOTES = [
  {
    id: 'demo-note-1',
    candidate_id: 'demo-cand-1',
    author_email: 'recruiter.demo@azienda.it',
    content: 'Candidata eccellente. Fissato colloquio per lunedì.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const DEFAULT_APPOINTMENTS = [
  {
    id: 'demo-appt-1',
    candidate_id: 'demo-cand-1',
    candidate_name: 'Elena Bianchi',
    job_title: 'Senior Frontend Developer (React)',
    interviewer_email: 'intervistatore.tech@todos.it',
    date_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    meeting_type: 'Teams',
    meeting_link: 'https://teams.microsoft.com/l/meetup-join/mock-link-1',
    notes: 'Verifica approfondita React Hooks e TypeScript.'
  }
]

const DEFAULT_TEMPLATES = [
  {
    id: 'demo-temp-1',
    title: 'Sviluppatore React Standard (Standard Profile)',
    department: 'Tech',
    isTemplate: true,
    description: 'Sviluppo interfacce interattive in React, implementazione chiamate REST, coordinamento con designer.',
    requirements: 'Requisiti standard:\n- 2+ anni esperienza React\n- Conoscenza CSS / Git\n- Buone doti comunicative',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-temp-2',
    title: 'Sales Account Executive (B2B SaaS)',
    department: 'Commerciale',
    isTemplate: true,
    description: 'Pianificazione trattative commerciali, lead generation e presentazioni demo a clienti aziendali.',
    requirements: 'Requisiti:\n- 2+ anni vendite B2B\n- Familiarità CRM\n- Forte orientamento agli obiettivi',
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const DEFAULT_EMPLOYEES = [
  {
    id: 'demo-emp-1',
    name: 'Mario Rossi',
    email: 'm.rossi@todos.it',
    phone: '+39 333 4455667',
    department: 'Tech',
    role: 'Senior Frontend Developer',
    hire_date: '2024-01-15',
    contract_type: 'Tempo Indeterminato',
    ral: 42000,
    trial_period_end: '2024-07-15',
    assets: [
      { type: 'Notebook', model: 'MacBook Pro 16 M3', serial: 'C02F84HGQ05D', assignedAt: '2024-01-15' },
      { type: 'Smartphone', model: 'iPhone 15 Pro', serial: 'DNPD403K0J2D', assignedAt: '2024-01-15' },
      { type: 'Carta Carburante', model: 'Carta Eni Routeex', serial: 'CARD-99123', assignedAt: '2024-01-15' },
      { type: 'Auto Aziendale', model: 'Fiat Doblò 1.6 MultiJet', serial: 'FL-098-HR', assignedAt: '2024-01-15' }
    ],
    document_id_expiry: '2029-05-20',
    safety_course_expiry: '2027-02-10',
    medical_visit_expiry: '2026-08-15'
  },
  {
    id: 'demo-emp-2',
    name: 'Laura Bianchi',
    email: 'l.bianchi@todos.it',
    phone: '+39 347 1122334',
    department: 'Commerciale',
    role: 'Account Executive',
    hire_date: '2024-06-01',
    contract_type: 'Tempo Indeterminato',
    ral: 35000,
    trial_period_end: '2024-12-01',
    assets: [
      { type: 'Notebook', model: 'Dell Latitude 5440', serial: 'J94KSD2', assignedAt: '2024-06-01' },
      { type: 'Carta Carburante', model: 'Carta IP Plus', serial: 'CARD-99124', assignedAt: '2024-06-01' },
      { type: 'Auto Aziendale', model: 'Ford Transit Custom 2.0 EcoBlue', serial: 'AB-123-CD', assignedAt: '2024-06-01' }
    ],
    document_id_expiry: '2028-11-12',
    safety_course_expiry: '2026-05-10',
    medical_visit_expiry: '2027-06-18'
  },
  {
    id: 'demo-emp-3',
    name: 'Alessandro Neri',
    email: 'a.neri@todos.it',
    phone: '+39 329 8899001',
    department: 'HR / Recruiting',
    role: 'HR Manager',
    hire_date: '2023-03-10',
    contract_type: 'Tempo Indeterminato',
    ral: 45000,
    trial_period_end: null,
    assets: [
      { type: 'Notebook', model: 'MacBook Air 15 M2', serial: 'C02HG892Q05E', assignedAt: '2023-03-10' },
      { type: 'Badge', model: 'Accesso Ufficio A', serial: 'BDG-0021', assignedAt: '2023-03-10' },
      { type: 'Carta Carburante', model: 'Carta Q8 Easy', serial: 'CARD-99126', assignedAt: '2023-03-10' },
      { type: 'Auto Aziendale', model: 'Iveco Daily 35C16', serial: 'ZA-776-XX', assignedAt: '2023-03-10' }
    ],
    document_id_expiry: '2026-06-15',
    safety_course_expiry: '2028-09-22',
    medical_visit_expiry: '2026-05-20'
  },
  {
    id: 'demo-emp-4',
    name: 'Sofia Gialli',
    email: 's.gialli@todos.it',
    phone: '+39 340 7788990',
    department: 'Amministrazione',
    role: 'Responsabile Contabile',
    hire_date: '2025-09-01',
    contract_type: 'Tempo Determinato',
    ral: 32000,
    trial_period_end: '2025-11-01',
    assets: [
      { type: 'Notebook', model: 'HP ProBook 450', serial: 'HP-99321A', assignedAt: '2025-09-01' }
    ],
    document_id_expiry: '2030-02-14',
    safety_course_expiry: '2028-10-15',
    medical_visit_expiry: '2027-09-01'
  },
  {
    id: 'demo-emp-5',
    name: 'Valerio Verdi',
    email: 'v.verdi@todos.it',
    phone: '+39 335 1234567',
    department: 'Tech',
    role: 'Junior Full Stack Developer',
    hire_date: '2026-05-02',
    contract_type: 'Apprendistato',
    ral: 26000,
    trial_period_end: '2026-11-02',
    assets: [
      { type: 'Notebook', model: 'MacBook Air 13 M3', serial: 'C02G293KQ01E', assignedAt: '2026-05-02' },
      { type: 'Carta Carburante', model: 'Carta Esso Card', serial: 'CARD-99125', assignedAt: '2026-05-02' },
      { type: 'Auto Aziendale', model: 'Peugeot Partner 1.2 PureTech', serial: 'XY-889-ZZ', assignedAt: '2026-05-02' }
    ],
    document_id_expiry: '2031-10-05',
    safety_course_expiry: '2026-05-28',
    medical_visit_expiry: '2026-06-02'
  }
]

const DEFAULT_VEHICLES = [
  {
    id: "v-01",
    plate: "FL-098-HR",
    make_model: "Fiat Doblò 1.6 MultiJet",
    year: 2022,
    fuel_type: "Diesel",
    initial_odometer: 124500,
    current_odometer: 126800,
    fuel_card_code: "CARD-99123",
    assigned_employee_id: "demo-emp-1",
    api_vehicle_id: "RV-DOBLO-01",
    consumption_limit: 6.0,
    notes: "Veicolo commerciale per consegne tecniche"
  },
  {
    id: "v-02",
    plate: "AB-123-CD",
    make_model: "Ford Transit Custom 2.0 EcoBlue",
    year: 2023,
    fuel_type: "Diesel",
    initial_odometer: 89200,
    current_odometer: 91450,
    fuel_card_code: "CARD-99124",
    assigned_employee_id: "demo-emp-2",
    api_vehicle_id: "RV-TRANSIT-02",
    consumption_limit: 6.5,
    notes: "Utilizzato dal team commerciale per visite clienti"
  },
  {
    id: "v-03",
    plate: "XY-889-ZZ",
    make_model: "Peugeot Partner 1.2 PureTech",
    year: 2021,
    fuel_type: "Benzina",
    initial_odometer: 43100,
    current_odometer: 44950,
    fuel_card_code: "CARD-99125",
    assigned_employee_id: "demo-emp-5",
    api_vehicle_id: "RV-PARTNER-03",
    consumption_limit: 7.0,
    notes: "Veicolo di supporto tecnico Junior"
  },
  {
    id: "v-04",
    plate: "ZA-776-XX",
    make_model: "Iveco Daily 35C16",
    year: 2020,
    fuel_type: "Diesel",
    initial_odometer: 156000,
    current_odometer: 159100,
    fuel_card_code: "CARD-99126",
    assigned_employee_id: "demo-emp-3",
    api_vehicle_id: "RV-DAILY-04",
    consumption_limit: 9.5,
    notes: "Furgone pesante assegnato alle spedizioni"
  }
]


const DEFAULT_LEAVES = [
  {
    id: 'demo-leave-1',
    employee_id: 'demo-emp-1',
    employee_name: 'Mario Rossi',
    type: 'Ferie',
    start_date: '2026-05-24',
    end_date: '2026-05-28',
    hours: null,
    notes: 'Viaggio di famiglia programmato',
    status: 'Approved'
  },
  {
    id: 'demo-leave-2',
    employee_id: 'demo-emp-2',
    employee_name: 'Laura Bianchi',
    type: 'Permesso',
    start_date: '2026-05-29',
    end_date: '2026-05-29',
    hours: 4,
    notes: 'Visita dentistica nel pomeriggio',
    status: 'Pending'
  },
  {
    id: 'demo-leave-3',
    employee_id: 'demo-emp-3',
    employee_name: 'Alessandro Neri',
    type: 'Ferie',
    start_date: '2026-05-27',
    end_date: '2026-05-29',
    hours: null,
    notes: 'Ponte festività',
    status: 'Approved'
  },
  {
    id: 'demo-leave-4',
    employee_id: 'demo-emp-4',
    employee_name: 'Sofia Gialli',
    type: 'Malattia',
    start_date: '2026-05-25',
    end_date: '2026-05-26',
    hours: null,
    notes: 'Stato influenzale',
    status: 'Approved'
  },
  {
    id: 'demo-leave-5',
    employee_id: 'demo-emp-5',
    employee_name: 'Valerio Verdi',
    type: 'Ferie',
    start_date: '2026-06-15',
    end_date: '2026-06-19',
    hours: null,
    notes: 'Vacanza estiva anticipata',
    status: 'Pending'
  }
]

const DEFAULT_CHECKLISTS = [
  // Mario Rossi - Onboarding Completato (100%)
  { id: 'ch-1', employee_id: 'demo-emp-1', employee_name: 'Mario Rossi', type: 'Onboarding', task_name: 'Firma contratto assunzione', assigned_to: 'Amministrazione', is_completed: true, completed_at: '2024-01-15' },
  { id: 'ch-2', employee_id: 'demo-emp-1', employee_name: 'Mario Rossi', type: 'Onboarding', task_name: 'Creazione email e account Slack', assigned_to: 'IT', is_completed: true, completed_at: '2024-01-15' },
  { id: 'ch-3', employee_id: 'demo-emp-1', employee_name: 'Mario Rossi', type: 'Onboarding', task_name: 'Consegna laptop e smartphone', assigned_to: 'IT', is_completed: true, completed_at: '2024-01-15' },
  { id: 'ch-4', employee_id: 'demo-emp-1', employee_name: 'Mario Rossi', type: 'Onboarding', task_name: 'Configurazione accessi GitHub', assigned_to: 'IT', is_completed: true, completed_at: '2024-01-16' },
  { id: 'ch-5', employee_id: 'demo-emp-1', employee_name: 'Mario Rossi', type: 'Onboarding', task_name: 'Registrazione portale UNILAV', assigned_to: 'Amministrazione', is_completed: true, completed_at: '2024-01-15' },
  { id: 'ch-6', employee_id: 'demo-emp-1', employee_name: 'Mario Rossi', type: 'Onboarding', task_name: 'Corsi sicurezza obbligatori', assigned_to: 'HR', is_completed: true, completed_at: '2024-01-20' },

  // Laura Bianchi - Onboarding (83%)
  { id: 'ch-7', employee_id: 'demo-emp-2', employee_name: 'Laura Bianchi', type: 'Onboarding', task_name: 'Firma contratto assunzione', assigned_to: 'Amministrazione', is_completed: true, completed_at: '2024-06-01' },
  { id: 'ch-8', employee_id: 'demo-emp-2', employee_name: 'Laura Bianchi', type: 'Onboarding', task_name: 'Creazione email e account Slack', assigned_to: 'IT', is_completed: true, completed_at: '2024-06-01' },
  { id: 'ch-9', employee_id: 'demo-emp-2', employee_name: 'Laura Bianchi', type: 'Onboarding', task_name: 'Consegna laptop', assigned_to: 'IT', is_completed: true, completed_at: '2024-06-01' },
  { id: 'ch-10', employee_id: 'demo-emp-2', employee_name: 'Laura Bianchi', type: 'Onboarding', task_name: 'Registrazione portale UNILAV', assigned_to: 'Amministrazione', is_completed: true, completed_at: '2024-06-01' },
  { id: 'ch-11', employee_id: 'demo-emp-2', employee_name: 'Laura Bianchi', type: 'Onboarding', task_name: 'Corsi sicurezza obbligatori', assigned_to: 'HR', is_completed: false, completed_at: null },
  { id: 'ch-12', employee_id: 'demo-emp-2', employee_name: 'Laura Bianchi', type: 'Onboarding', task_name: 'Accessi al CRM aziendale', assigned_to: 'IT', is_completed: true, completed_at: '2024-06-02' },

  // Alessandro Neri - Onboarding completato, Offboarding in corso
  { id: 'ch-13', employee_id: 'demo-emp-3', employee_name: 'Alessandro Neri', type: 'Onboarding', task_name: 'Firma contratto assunzione', assigned_to: 'Amministrazione', is_completed: true, completed_at: '2023-03-10' },
  { id: 'ch-14', employee_id: 'demo-emp-3', employee_name: 'Alessandro Neri', type: 'Onboarding', task_name: 'Consegna laptop aziendale', assigned_to: 'IT', is_completed: true, completed_at: '2023-03-10' },

  // Sofia Gialli - Onboarding (66%)
  { id: 'ch-15', employee_id: 'demo-emp-4', employee_name: 'Sofia Gialli', type: 'Onboarding', task_name: 'Firma contratto assunzione', assigned_to: 'Amministrazione', is_completed: true, completed_at: '2025-09-01' },
  { id: 'ch-16', employee_id: 'demo-emp-4', employee_name: 'Sofia Gialli', type: 'Onboarding', task_name: 'Creazione email e account Slack', assigned_to: 'IT', is_completed: true, completed_at: '2025-09-01' },
  { id: 'ch-17', employee_id: 'demo-emp-4', employee_name: 'Sofia Gialli', type: 'Onboarding', task_name: 'Consegna laptop', assigned_to: 'IT', is_completed: false, completed_at: null },
  { id: 'ch-18', employee_id: 'demo-emp-4', employee_name: 'Sofia Gialli', type: 'Onboarding', task_name: 'Registrazione portale UNILAV', assigned_to: 'Amministrazione', is_completed: true, completed_at: '2025-09-01' },
  { id: 'ch-19', employee_id: 'demo-emp-4', employee_name: 'Sofia Gialli', type: 'Onboarding', task_name: 'Corsi sicurezza obbligatori', assigned_to: 'HR', is_completed: false, completed_at: null },
  { id: 'ch-20', employee_id: 'demo-emp-4', employee_name: 'Sofia Gialli', type: 'Onboarding', task_name: 'Accessi al gestionale contabilità', assigned_to: 'IT', is_completed: true, completed_at: '2025-09-02' },

  // Valerio Verdi - Onboarding iniziale (33%)
  { id: 'ch-21', employee_id: 'demo-emp-5', employee_name: 'Valerio Verdi', type: 'Onboarding', task_name: 'Firma contratto assunzione', assigned_to: 'Amministrazione', is_completed: true, completed_at: '2026-05-02' },
  { id: 'ch-22', employee_id: 'demo-emp-5', employee_name: 'Valerio Verdi', type: 'Onboarding', task_name: 'Creazione email e account Slack', assigned_to: 'IT', is_completed: true, completed_at: '2026-05-02' },
  { id: 'ch-23', employee_id: 'demo-emp-5', employee_name: 'Valerio Verdi', type: 'Onboarding', task_name: 'Consegna laptop', assigned_to: 'IT', is_completed: false, completed_at: null },
  { id: 'ch-24', employee_id: 'demo-emp-5', employee_name: 'Valerio Verdi', type: 'Onboarding', task_name: 'Registrazione portale UNILAV', assigned_to: 'Amministrazione', is_completed: false, completed_at: null },
  { id: 'ch-25', employee_id: 'demo-emp-5', employee_name: 'Valerio Verdi', type: 'Onboarding', task_name: 'Corsi sicurezza obbligatori', assigned_to: 'HR', is_completed: false, completed_at: null },
  { id: 'ch-26', employee_id: 'demo-emp-5', employee_name: 'Valerio Verdi', type: 'Onboarding', task_name: 'Configurazione accessi GitHub', assigned_to: 'IT', is_completed: false, completed_at: null }
]

const DEFAULT_PERFORMANCES = [
  {
    id: 'perf-1',
    employee_id: 'demo-emp-1',
    employee_name: 'Mario Rossi',
    review_period: 'Q1 2026',
    self_rating: { tech: 5, teamwork: 4, proactivity: 4, communication: 3 },
    manager_rating: { tech: 5, teamwork: 3, proactivity: 4, communication: 4 },
    overall_feedback: 'Mario dimostra una competenza tecnica straordinaria nello sviluppo dell\'architettura frontend di Todos.it. Ha gestito molto bene il refactoring dello stato globale. Deve migliorare nel coordinamento del team junior, dove a volte tende a delegare poco.',
    okrs: [
      { title: 'Refactoring del modulo Kanban', progress: 100 },
      { title: 'Velocizzare la build del 20%', progress: 80 },
      { title: 'Formazione interna su Zustand', progress: 50 }
    ]
  },
  {
    id: 'perf-2',
    employee_id: 'demo-emp-2',
    employee_name: 'Laura Bianchi',
    review_period: 'Q1 2026',
    self_rating: { tech: 3, teamwork: 5, proactivity: 4, communication: 5 },
    manager_rating: { tech: 2, teamwork: 5, proactivity: 4, communication: 4 },
    overall_feedback: 'Laura è una risorsa fantastica per l\'aspetto commerciale ed il contatto clienti. Molto forte nel lavoro di squadra e nella comunicazione, solida nel chiudere lead. Si consiglia un training specifico sull\'uso tecnico dei nostri gestionali interni.',
    okrs: [
      { title: 'Chiudere 10 nuovi contratti B2B', progress: 70 },
      { title: 'Familiarizzare con il gestionale CRM', progress: 95 }
    ]
  },
  {
    id: 'perf-3',
    employee_id: 'demo-emp-3',
    employee_name: 'Alessandro Neri',
    review_period: 'Q1 2026',
    self_rating: { tech: 4, teamwork: 4, proactivity: 5, communication: 5 },
    manager_rating: { tech: 4, teamwork: 4, proactivity: 5, communication: 5 },
    overall_feedback: 'Alessandro gestisce il reparto risorse umane con grande proattività ed empatia. Ha avviato ottime iniziative di onboarding e risolto molteplici criticità contrattuali in modo eccellente.',
    okrs: [
      { title: 'Pianificare piano welfare aziendale', progress: 90 },
      { title: 'Ridurre time-to-hire del 15%', progress: 60 }
    ]
  }
]

const DEFAULT_EXPENSES = [
  { id: 'exp-1', employee_id: 'demo-emp-1', employee_name: 'Mario Rossi', expense_date: '2026-05-15', merchant: 'Ristorante Da Mario', amount: 42.50, category: 'Pasti', receipt_name: 'Scontrino_Pasti_DaMario.jpg', status: 'Approved', notes: 'Cena con cliente per firma accordo aziendale' },
  { id: 'exp-2', employee_id: 'demo-emp-2', employee_name: 'Laura Bianchi', expense_date: '2026-05-18', merchant: 'Trenitalia Frecciarossa', amount: 89.00, category: 'Trasporti', receipt_name: 'Biglietto_Treno_Roma.jpg', status: 'Approved', notes: 'Biglietto A/R per meeting commerciale a Roma' },
  { id: 'exp-3', employee_id: 'demo-emp-3', employee_name: 'Alessandro Neri', expense_date: '2026-05-20', merchant: 'Hotel NH Milano', amount: 150.00, category: 'Alloggio', receipt_name: 'Fattura_Hotel_NH_Milano.jpg', status: 'Pending', notes: 'Soggiorno trasferta per fiera HR Innovation' },
  { id: 'exp-4', employee_id: 'demo-emp-4', employee_name: 'Sofia Gialli', expense_date: '2026-05-22', merchant: 'Amazon.it', amount: 24.99, category: 'Attrezzatura', receipt_name: 'Ricevuta_Amazon_Mouse.jpg', status: 'Approved', notes: 'Acquisto mouse ergonomico wireless per ufficio' },
  { id: 'exp-5', employee_id: 'demo-emp-5', employee_name: 'Valerio Verdi', expense_date: '2026-05-25', merchant: 'Pranzo di Lavoro - Bar Sport', amount: 18.00, category: 'Pasti', receipt_name: 'Scontrino_Pasti_BarSport.jpg', status: 'Pending', notes: 'Pranzo durante corso di formazione esterno' }
]

const generateDemoShifts = (employeesList) => {
  const weekDates = [];
  const current = new Date();
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().split('T')[0]);
  }

  return [
    { id: 'sh-1', employee_id: 'demo-emp-1', employee_name: 'Mario Rossi', shift_date: weekDates[0], start_time: '08:00', end_time: '16:00', shift_type: 'Mattina', notes: 'Ufficio Roma' },
    { id: 'sh-2', employee_id: 'demo-emp-1', employee_name: 'Mario Rossi', shift_date: weekDates[2], start_time: '08:00', end_time: '16:00', shift_type: 'Mattina', notes: 'Presidio Tecnico' },
    { id: 'sh-3', employee_id: 'demo-emp-1', employee_name: 'Mario Rossi', shift_date: weekDates[4], start_time: '08:00', end_time: '16:00', shift_type: 'Mattina', notes: 'Reperibilità' },
    
    { id: 'sh-4', employee_id: 'demo-emp-2', employee_name: 'Laura Bianchi', shift_date: weekDates[0], start_time: '14:00', end_time: '22:00', shift_type: 'Pomeriggio', notes: 'Ufficio Milano' },
    { id: 'sh-5', employee_id: 'demo-emp-2', employee_name: 'Laura Bianchi', shift_date: weekDates[1], start_time: '14:00', end_time: '22:00', shift_type: 'Pomeriggio', notes: 'Supporto Commerciale' },
    { id: 'sh-6', employee_id: 'demo-emp-2', employee_name: 'Laura Bianchi', shift_date: weekDates[3], start_time: '14:00', end_time: '22:00', shift_type: 'Pomeriggio', notes: 'Customer Care' },
    
    { id: 'sh-7', employee_id: 'demo-emp-3', employee_name: 'Alessandro Neri', shift_date: weekDates[2], start_time: '22:00', end_time: '06:00', shift_type: 'Notte', notes: 'Supervisione Notturna' },
    { id: 'sh-8', employee_id: 'demo-emp-3', employee_name: 'Alessandro Neri', shift_date: weekDates[3], start_time: '22:00', end_time: '06:00', shift_type: 'Notte', notes: 'Manutenzione Sistemi' },
    
    { id: 'sh-9', employee_id: 'demo-emp-4', employee_name: 'Sofia Gialli', shift_date: weekDates[1], start_time: '09:00', end_time: '18:00', shift_type: 'Custom', notes: 'Corso Recruiting' },
    { id: 'sh-10', employee_id: 'demo-emp-4', employee_name: 'Sofia Gialli', shift_date: weekDates[2], start_time: '09:00', end_time: '18:00', shift_type: 'Custom', notes: 'Interviste Candidati' },
    
    { id: 'sh-11', employee_id: 'demo-emp-5', employee_name: 'Valerio Verdi', shift_date: weekDates[0], start_time: '14:00', end_time: '22:00', shift_type: 'Pomeriggio', notes: 'Affiancamento' },
    { id: 'sh-12', employee_id: 'demo-emp-5', employee_name: 'Valerio Verdi', shift_date: weekDates[4], start_time: '08:00', end_time: '16:00', shift_type: 'Mattina', notes: 'Consolidamento Dati' }
  ];
};

export default function App() {
  const [user, setUser] = useState(null)
  const [isDemo, setIsDemo] = useState(true)
  const [loading, setLoading] = useState(true)

  // Stati del Database
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [notes, setNotes] = useState([])
  const [appointments, setAppointments] = useState([])
  const [jobTemplates, setJobTemplates] = useState([])
  const [employees, setEmployees] = useState([])
  const [leaves, setLeaves] = useState([])
  const [checklists, setChecklists] = useState([])
  const [performances, setPerformances] = useState([])
  const [expenses, setExpenses] = useState([])
  const [shifts, setShifts] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [fuelTransactions, setFuelTransactions] = useState([])
  const [verizonConfig, setVerizonConfig] = useState({ username: '', password: '', token: '' })
  const [currentRole, setCurrentRole] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState(() => {
    try {
      const local = localStorage.getItem('demo-dismissed-notifications')
      return local ? JSON.parse(local) : []
    } catch {
      return []
    }
  })
  const [showManualModal, setShowManualModal] = useState(false)

  // Navigazione principale: 'active', 'archived', 'templates', 'appointments', 'employees', 'absences'
  const [navTab, setNavTab] = useState('active')
  // Todos Hub: voce sidebar attiva (default 'home')
  const [currentNavItemId, setCurrentNavItemId] = useState('home')

  // Handler navigazione sidebar Hub
  const handleHubNavigate = (item) => {
    if (!item) return
    setCurrentNavItemId(item.id)
    if (item.id === 'home') return                 // home → render HomePage
    if (item.comingSoon) return                    // coming soon → niente
    if (item.tabId) {
      setSelectedJob(null)
      setNavTab(item.tabId)                        // legacy o WP2: setta navTab
    }
  }

  // Stati navigazione/interfaccia
  const [selectedJob, setSelectedJob] = useState(null)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)

  // 1. Ascolto stato autenticazione all'avvio
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user)
          setIsDemo(false)
        } else {
          const localDemoUser = localStorage.getItem('demo-user')
          if (localDemoUser) {
            setUser(JSON.parse(localDemoUser))
            setIsDemo(true)
          }
        }
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUser(session.user)
          setIsDemo(false)
        } else {
          const localDemoUser = localStorage.getItem('demo-user')
          if (!localDemoUser) setUser(null)
        }
      })

      return () => subscription.unsubscribe()
    } else {
      const localDemoUser = localStorage.getItem('demo-user')
      if (localDemoUser) {
        setUser(JSON.parse(localDemoUser))
        setIsDemo(true)
      }
      setLoading(false)
    }
  }, [])

  // Sincronizza il ruolo corrente quando l'utente si logga
  useEffect(() => {
    if (user) {
      if (!currentRole) {
        setCurrentRole(user.role || (['recruiter.demo@azienda.it', 'f.locatelli@todos.it'].includes(user.email) ? 'admin' : 'employee'));
      }
    } else {
      setCurrentRole(null);
    }
  }, [user]);

  // Controlla che la navTab sia compatibile col ruolo attivo corrente
  useEffect(() => {
    if (currentRole) {
      const availableTabs = [
        { id: 'active', roles: ['admin', 'hr'] },
        { id: 'archived', roles: ['admin', 'hr'] },
        { id: 'templates', roles: ['admin', 'hr'] },
        { id: 'appointments', roles: ['admin', 'hr'] },
        { id: 'employees', roles: ['admin', 'hr', 'servizi_generali', 'pm'] },
        { id: 'absences', roles: ['admin', 'hr', 'pm'] },
        { id: 'expenses', roles: ['admin', 'hr', 'pm'] },
        { id: 'shifts', roles: ['admin', 'hr', 'pm'] },
        { id: 'analytics', roles: ['admin', 'hr', 'pm'] },
        { id: 'mezzi', roles: ['admin', 'hr', 'servizi_generali', 'pm'] },
        { id: 'wp2', roles: ['admin', 'hr', 'pm', 'servizi_generali'] }
      ].filter(t => t.roles.includes(currentRole));

      const isTabAvailable = availableTabs.some(t => t.id === navTab);
      if (!isTabAvailable && availableTabs.length > 0) {
        setNavTab(availableTabs[0].id);
      }
    }
  }, [currentRole, navTab]);

  // 2. Caricamento Dati in base a Modalità Demo vs Supabase
  useEffect(() => {
    if (!user) return

    if (isDemo) {
      loadDemoData()
    } else {
      loadSupabaseData()
    }
  }, [user, isDemo])

  // --- CARICAMENTO DATI DEMO (LOCAL STORAGE) ---
  const loadDemoData = () => {
    const localJobs = localStorage.getItem('demo-jobs')
    const localCandidates = localStorage.getItem('demo-candidates')
    const localNotes = localStorage.getItem('demo-notes')
    const localAppointments = localStorage.getItem('demo-appointments')
    const localTemplates = localStorage.getItem('demo-job-templates')
    const localEmployees = localStorage.getItem('demo-employees')
    const localLeaves = localStorage.getItem('demo-leaves')
    const localChecklists = localStorage.getItem('demo-checklists')
    const localPerformances = localStorage.getItem('demo-performances')
    const localExpenses = localStorage.getItem('demo-expenses')
    const localShifts = localStorage.getItem('demo-shifts')
    const localVehicles = localStorage.getItem('demo-vehicles')
    const localFuelTransactions = localStorage.getItem('demo-fuel-transactions')
    const localVerizonConfig = localStorage.getItem('demo-verizon-config')

    if (localJobs && localCandidates && localNotes && localAppointments && localTemplates && localEmployees && localLeaves && localChecklists && localPerformances && localExpenses && localShifts && localVehicles) {
      setJobs(JSON.parse(localJobs))
      setCandidates(JSON.parse(localCandidates))
      setNotes(JSON.parse(localNotes))
      setAppointments(JSON.parse(localAppointments))
      setJobTemplates(JSON.parse(localTemplates))
      setEmployees(JSON.parse(localEmployees))
      setLeaves(JSON.parse(localLeaves))
      setChecklists(JSON.parse(localChecklists))
      setPerformances(JSON.parse(localPerformances))
      setExpenses(JSON.parse(localExpenses))
      setShifts(JSON.parse(localShifts))
      setVehicles(JSON.parse(localVehicles))
      setFuelTransactions(localFuelTransactions ? JSON.parse(localFuelTransactions) : [])
      setVerizonConfig(localVerizonConfig ? JSON.parse(localVerizonConfig) : { username: '', password: '', token: '' })
    } else {
      const initialShifts = generateDemoShifts(DEFAULT_EMPLOYEES)

      localStorage.setItem('demo-jobs', JSON.stringify(DEFAULT_JOBS))
      localStorage.setItem('demo-candidates', JSON.stringify(DEFAULT_CANDIDATES))
      localStorage.setItem('demo-notes', JSON.stringify(DEFAULT_NOTES))
      localStorage.setItem('demo-appointments', JSON.stringify(DEFAULT_APPOINTMENTS))
      localStorage.setItem('demo-job-templates', JSON.stringify(DEFAULT_TEMPLATES))
      localStorage.setItem('demo-employees', JSON.stringify(DEFAULT_EMPLOYEES))
      localStorage.setItem('demo-leaves', JSON.stringify(DEFAULT_LEAVES))
      localStorage.setItem('demo-checklists', JSON.stringify(DEFAULT_CHECKLISTS))
      localStorage.setItem('demo-performances', JSON.stringify(DEFAULT_PERFORMANCES))
      localStorage.setItem('demo-expenses', JSON.stringify(DEFAULT_EXPENSES))
      localStorage.setItem('demo-shifts', JSON.stringify(initialShifts))
      localStorage.setItem('demo-vehicles', JSON.stringify(DEFAULT_VEHICLES))
      localStorage.setItem('demo-fuel-transactions', JSON.stringify([]))
      localStorage.setItem('demo-verizon-config', JSON.stringify({ username: '', password: '', token: '' }))

      setJobs(DEFAULT_JOBS)
      setCandidates(DEFAULT_CANDIDATES)
      setNotes(DEFAULT_NOTES)
      setAppointments(DEFAULT_APPOINTMENTS)
      setJobTemplates(DEFAULT_TEMPLATES)
      setEmployees(DEFAULT_EMPLOYEES)
      setLeaves(DEFAULT_LEAVES)
      setChecklists(DEFAULT_CHECKLISTS)
      setPerformances(DEFAULT_PERFORMANCES)
      setExpenses(DEFAULT_EXPENSES)
      setShifts(initialShifts)
      setVehicles(DEFAULT_VEHICLES)
      setFuelTransactions([])
      setVerizonConfig({ username: '', password: '', token: '' })
    }
  }

  // --- CARICAMENTO DATI REALI (SUPABASE DB) ---
  const loadSupabaseData = async () => {
    try {
      const { data: dbJobs, error: errJobs } = await supabase
        .from('06app_CRM_HR_jobs')
        .select('*')
        .order('created_at', { ascending: false })
      if (errJobs) throw errJobs
      setJobs(dbJobs || [])

      const { data: dbCandidates, error: errCandidates } = await supabase
        .from('06app_CRM_HR_candidates')
        .select('*')
      if (errCandidates) throw errCandidates
      setCandidates(dbCandidates || [])

      const { data: dbNotes, error: errNotes } = await supabase
        .from('06app_CRM_HR_notes')
        .select('*')
      if (errNotes) throw errNotes
      setNotes(dbNotes || [])

      const { data: dbAppts, error: errAppts } = await supabase
        .from('06app_CRM_HR_appointments')
        .select('*')
        .order('date_time', { ascending: true })
      if (errAppts) throw errAppts
      setAppointments(dbAppts || [])

      const { data: dbTemplates, error: errTemplates } = await supabase
        .from('06app_CRM_HR_job_templates')
        .select('*')
        .order('created_at', { ascending: false })
      if (errTemplates) throw errTemplates
      setJobTemplates(dbTemplates || [])

      // Carica Dipendenti con gestione errore soft
      try {
        const { data: dbEmployees, error: errEmployees } = await supabase
          .from('06app_CRM_HR_employees')
          .select('*')
          .order('name', { ascending: true })
        if (errEmployees) throw errEmployees
        setEmployees(dbEmployees || [])
      } catch (empErr) {
        console.warn("Tabella '06app_CRM_HR_employees' non trovata in Supabase. Esegui la migrazione SQL.", empErr)
        setEmployees([])
      }

      // Carica Ferie/Assenze con gestione errore soft
      try {
        const { data: dbLeaves, error: errLeaves } = await supabase
          .from('06app_CRM_HR_leaves')
          .select('*')
          .order('created_at', { ascending: false })
        if (errLeaves) throw errLeaves
        setLeaves(dbLeaves || [])
      } catch (leaveErr) {
        console.warn("Tabella '06app_CRM_HR_leaves' non trovata in Supabase. Esegui la migrazione SQL.", leaveErr)
        setLeaves([])
      }

      // Carica Checklist con gestione errore soft
      try {
        const { data: dbChecklists, error: errChecklists } = await supabase
          .from('06app_CRM_HR_checklists')
          .select('*')
          .order('created_at', { ascending: true })
        if (errChecklists) throw errChecklists
        setChecklists(dbChecklists || [])
      } catch (chkErr) {
        console.warn("Tabella '06app_CRM_HR_checklists' non trovata in Supabase. Esegui la migrazione SQL.", chkErr)
        setChecklists([])
      }

      // Carica Performance con gestione errore soft
      try {
        const { data: dbPerformances, error: errPerformances } = await supabase
          .from('06app_CRM_HR_performances')
          .select('*')
          .order('created_at', { ascending: false })
        if (errPerformances) throw errPerformances
        setPerformances(dbPerformances || [])
      } catch (perfErr) {
        console.warn("Tabella '06app_CRM_HR_performances' non trovata in Supabase. Esegui la migrazione SQL.", perfErr)
        setPerformances([])
      }

      // Carica Note Spese con gestione errore soft
      try {
        const { data: dbExpenses, error: errExpenses } = await supabase
          .from('06app_CRM_HR_expenses')
          .select('*')
          .order('expense_date', { ascending: false })
        if (errExpenses) throw errExpenses
        setExpenses(dbExpenses || [])
      } catch (expErr) {
        console.warn("Tabella '06app_CRM_HR_expenses' non trovata in Supabase. Esegui la migrazione SQL.", expErr)
        setExpenses([])
      }

      // Carica Turni con gestione errore soft
      try {
        const { data: dbShifts, error: errShifts } = await supabase
          .from('06app_CRM_HR_shifts')
          .select('*')
          .order('shift_date', { ascending: true })
        if (errShifts) throw errShifts
        setShifts(dbShifts || [])
      } catch (shiftErr) {
        console.warn("Tabella '06app_CRM_HR_shifts' non trovata in Supabase. Esegui la migrazione SQL.", shiftErr)
        setShifts([])
      }

      // Carica Veicoli con gestione errore soft
      try {
        const { data: dbVehicles, error: errVehicles } = await supabase
          .from('06app_CRM_HR_vehicles')
          .select('*')
        if (errVehicles) throw errVehicles
        setVehicles(dbVehicles || [])
      } catch (vehErr) {
        console.warn("Tabella '06app_CRM_HR_vehicles' non trovata in Supabase. Esegui la migrazione SQL.", vehErr)
        setVehicles([])
      }

      // Carica Transazioni Carburante con gestione errore soft
      try {
        const { data: dbTx, error: errTx } = await supabase
          .from('06app_CRM_HR_fuel_transactions')
          .select('*')
        if (errTx) throw errTx
        setFuelTransactions(dbTx || [])
      } catch (txErr) {
        console.warn("Tabella '06app_CRM_HR_fuel_transactions' non trovata in Supabase. Esegui la migrazione SQL.", txErr)
        setFuelTransactions([])
      }
    } catch (e) {
      console.error('Errore durante il caricamento da Supabase:', e)
      alert('Errore nel sincronizzare i dati da Supabase: ' + e.message)
    }
  }

  // --- ENGINE AUTOMATICO DI SCADENZE & NOTIFICHE (FASE 7) ---
  useEffect(() => {
    if (!user) return;
    
    const dynamicAlerts = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    thirtyDaysFromNow.setHours(23,59,59,999);
    
    const isExpiringSoon = (dateStr) => {
      if (!dateStr) return false;
      const expiry = new Date(dateStr);
      return expiry >= today && expiry <= thirtyDaysFromNow;
    };
    
    const isExpired = (dateStr) => {
      if (!dateStr) return false;
      const expiry = new Date(dateStr);
      return expiry < today;
    };

    const getDaysLeft = (dateStr) => {
      if (!dateStr) return 0;
      const diffTime = new Date(dateStr) - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // A. Controlla scadenze dipendenti
    employees.forEach(emp => {
      // Documento di Identità
      if (emp.document_id_expiry) {
        const days = getDaysLeft(emp.document_id_expiry);
        if (isExpired(emp.document_id_expiry)) {
          dynamicAlerts.push({
            id: `expiry-doc-${emp.id}`,
            title: `Documento Scaduto - ${emp.name}`,
            description: `La carta d'identità è scaduta il ${emp.document_id_expiry}.`,
            type: 'expiry',
            createdAt: new Date().toISOString(),
            isRead: false
          });
        } else if (isExpiringSoon(emp.document_id_expiry)) {
          dynamicAlerts.push({
            id: `expiry-doc-${emp.id}`,
            title: `Documento in Scadenza - ${emp.name}`,
            description: `La carta d'identità scade tra ${days} giorni (${emp.document_id_expiry}).`,
            type: 'expiry',
            createdAt: new Date().toISOString(),
            isRead: false
          });
        }
      }

      // Corso Sicurezza
      if (emp.safety_course_expiry) {
        const days = getDaysLeft(emp.safety_course_expiry);
        if (isExpired(emp.safety_course_expiry)) {
          dynamicAlerts.push({
            id: `expiry-safety-${emp.id}`,
            title: `Corso Sicurezza Scaduto - ${emp.name}`,
            description: `Il corso di sicurezza obbligatorio è scaduto il ${emp.safety_course_expiry}.`,
            type: 'expiry',
            createdAt: new Date().toISOString(),
            isRead: false
          });
        } else if (isExpiringSoon(emp.safety_course_expiry)) {
          dynamicAlerts.push({
            id: `expiry-safety-${emp.id}`,
            title: `Corso Sicurezza in Scadenza - ${emp.name}`,
            description: `Il corso sicurezza scade tra ${days} giorni (${emp.safety_course_expiry}).`,
            type: 'expiry',
            createdAt: new Date().toISOString(),
            isRead: false
          });
        }
      }

      // Visita Medica
      if (emp.medical_visit_expiry) {
        const days = getDaysLeft(emp.medical_visit_expiry);
        if (isExpired(emp.medical_visit_expiry)) {
          dynamicAlerts.push({
            id: `expiry-medical-${emp.id}`,
            title: `Visita Medica Scaduta - ${emp.name}`,
            description: `La visita medica periodica è scaduta il ${emp.medical_visit_expiry}.`,
            type: 'expiry',
            createdAt: new Date().toISOString(),
            isRead: false
          });
        } else if (isExpiringSoon(emp.medical_visit_expiry)) {
          dynamicAlerts.push({
            id: `expiry-medical-${emp.id}`,
            title: `Visita Medica in Scadenza - ${emp.name}`,
            description: `La visita medica scade tra ${days} giorni (${emp.medical_visit_expiry}).`,
            type: 'expiry',
            createdAt: new Date().toISOString(),
            isRead: false
          });
        }
      }

      // Fine Periodo di Prova
      if (emp.trial_period_end) {
        const days = getDaysLeft(emp.trial_period_end);
        if (isExpiringSoon(emp.trial_period_end)) {
          dynamicAlerts.push({
            id: `expiry-trial-${emp.id}`,
            title: `Fine Periodo Prova - ${emp.name}`,
            description: `Il periodo di prova scade tra ${days} giorni (${emp.trial_period_end}).`,
            type: 'expiry',
            createdAt: new Date().toISOString(),
            isRead: false
          });
        }
      }
    });

    // B. Controlla Richieste Ferie Pendenti
    leaves.forEach(leave => {
      if (leave.status === 'Pending') {
        dynamicAlerts.push({
          id: `pending-leave-${leave.id}`,
          title: `Ferie in Attesa - ${leave.employee_name}`,
          description: `Richiesta di ${leave.type} dal ${leave.start_date} al ${leave.end_date} in attesa.`,
          type: 'leave',
          createdAt: leave.created_at || new Date().toISOString(),
          isRead: false
        });
      }
    });

    // C. Controlla Note Spese Pendenti
    expenses.forEach(exp => {
      if (exp.status === 'Pending') {
        dynamicAlerts.push({
          id: `pending-expense-${exp.id}`,
          title: `Spesa da Approvare - ${exp.employee_name}`,
          description: `Rimborso di ${exp.amount}€ da parte di ${exp.employee_name} per ${exp.merchant} in sospeso.`,
          type: 'expense',
          createdAt: exp.created_at || new Date().toISOString(),
          isRead: false
        });
      }
    });

    const filteredAlerts = dynamicAlerts.filter(alert => !dismissedNotificationIds.includes(alert.id));
    setNotifications(filteredAlerts);
  }, [employees, leaves, expenses, dismissedNotificationIds, user]);

  const handleMarkNotificationAsRead = (id) => {
    const updated = [...dismissedNotificationIds, id];
    setDismissedNotificationIds(updated);
    localStorage.setItem('demo-dismissed-notifications', JSON.stringify(updated));
  };

  const handleMarkAllNotificationsAsRead = () => {
    const currentIds = notifications.map(n => n.id);
    const updated = [...new Set([...dismissedNotificationIds, ...currentIds])];
    setDismissedNotificationIds(updated);
    localStorage.setItem('demo-dismissed-notifications', JSON.stringify(updated));
  };

  const handleClearNotifications = () => {
    handleMarkAllNotificationsAsRead();
  };

  // --- GESTIONE TURNI (FASE 8) ---
  const handleSaveShift = async (shiftData) => {
    if (isDemo) {
      let updatedShifts;
      if (shiftData.id) {
        updatedShifts = shifts.map(s => s.id === shiftData.id ? { ...s, ...shiftData } : s);
      } else {
        const newShift = {
          ...shiftData,
          id: 'sh-' + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString()
        };
        updatedShifts = [...shifts, newShift];
      }
      setShifts(updatedShifts);
      localStorage.setItem('demo-shifts', JSON.stringify(updatedShifts));
    } else {
      try {
        if (shiftData.id) {
          const { error } = await supabase
            .from('06app_CRM_HR_shifts')
            .update(shiftData)
            .eq('id', shiftData.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('06app_CRM_HR_shifts')
            .insert([shiftData]);
          if (error) throw error;
        }
        await loadSupabaseData();
      } catch (err) {
        console.error("Errore salvataggio turno Supabase:", err);
        alert("Impossibile salvare il turno. Riprova.");
      }
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (isDemo) {
      const updatedShifts = shifts.filter(s => s.id !== shiftId);
      setShifts(updatedShifts);
      localStorage.setItem('demo-shifts', JSON.stringify(updatedShifts));
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_shifts')
          .delete()
          .eq('id', shiftId);
        if (error) throw error;
        await loadSupabaseData();
      } catch (err) {
        console.error("Errore eliminazione turno Supabase:", err);
        alert("Impossibile eliminare il turno. Riprova.");
      }
    }
  };

  const handleSeedSupabaseData = async () => {
    if (isDemo) return;
    
    const confirmSeed = window.confirm(
      "Sei sicuro di voler popolare il database Supabase con i dati di esempio?\n" +
      "Questo inserirà 5 dipendenti demo, ferie, spese, turni e checklist standard."
    );
    if (!confirmSeed) return;

    try {
      setLoading(true);
      
      // Helper per mappare l'ID temporaneo in un UUID valido e statico
      const mapEmpId = (id) => {
        if (id === 'demo-emp-1') return '11111111-1111-1111-1111-111111111111';
        if (id === 'demo-emp-2') return '22222222-2222-2222-2222-222222222222';
        if (id === 'demo-emp-3') return '33333333-3333-3333-3333-333333333333';
        if (id === 'demo-emp-4') return '44444444-4444-4444-4444-444444444444';
        if (id === 'demo-emp-5') return '55555555-5555-5555-5555-555555555555';
        return id;
      };

      // 1. Check if already seeded to avoid duplicates
      const { data: currentEmp, error: errEmpCheck } = await supabase
        .from('06app_CRM_HR_employees')
        .select('id')
        .limit(1);
      
      if (currentEmp && currentEmp.length > 0) {
        alert("Il database Supabase contiene già dei dipendenti. Seeding annullato per evitare duplicati.");
        setLoading(false);
        return;
      }
      
      // Mappa e prepara i dipendenti con UUID validi
      const seedEmployees = DEFAULT_EMPLOYEES.map(emp => ({
        ...emp,
        id: mapEmpId(emp.id)
      }));

      // Insert default employees
      const { error: errEmpInsert } = await supabase
        .from('06app_CRM_HR_employees')
        .insert(seedEmployees);
      
      if (errEmpInsert) throw errEmpInsert;

      // Mappa le ferie (rimuovendo l'ID originario per far generare a Postgres un UUID randomico)
      const seedLeaves = DEFAULT_LEAVES.map(({ id, ...rest }) => ({
        ...rest,
        employee_id: mapEmpId(rest.employee_id)
      }));
      const { error: errLeaveInsert } = await supabase
        .from('06app_CRM_HR_leaves')
        .insert(seedLeaves);
      if (errLeaveInsert) throw errLeaveInsert;
      
      // Mappa le checklist (rimuovendo ID)
      const seedChecklists = DEFAULT_CHECKLISTS.map(({ id, ...rest }) => ({
        ...rest,
        employee_id: mapEmpId(rest.employee_id)
      }));
      const { error: errCheckInsert } = await supabase
        .from('06app_CRM_HR_checklists')
        .insert(seedChecklists);
      if (errCheckInsert) throw errCheckInsert;

      // Mappa le performance (rimuovendo ID)
      const seedPerformances = DEFAULT_PERFORMANCES.map(({ id, ...rest }) => ({
        ...rest,
        employee_id: mapEmpId(rest.employee_id)
      }));
      const { error: errPerfInsert } = await supabase
        .from('06app_CRM_HR_performances')
        .insert(seedPerformances);
      if (errPerfInsert) throw errPerfInsert;

      // Mappa le spese (rimuovendo ID)
      const seedExpenses = DEFAULT_EXPENSES.map(({ id, ...rest }) => ({
        ...rest,
        employee_id: mapEmpId(rest.employee_id)
      }));
      const { error: errExpInsert } = await supabase
        .from('06app_CRM_HR_expenses')
        .insert(seedExpenses);
      if (errExpInsert) throw errExpInsert;

      // Mappa i turni (rimuovendo ID)
      const rawShifts = generateDemoShifts(DEFAULT_EMPLOYEES);
      const seedShifts = rawShifts.map(({ id, ...rest }) => ({
        ...rest,
        employee_id: mapEmpId(rest.employee_id)
      }));
      const { error: errShiftInsert } = await supabase
        .from('06app_CRM_HR_shifts')
        .insert(seedShifts);
      if (errShiftInsert) throw errShiftInsert;

      alert("Database Supabase popolato con successo! 🎉 Ricarico le tabelle...");
      await loadSupabaseData();
    } catch (err) {
      console.error("Errore durante il seeding di Supabase:", err);
      alert(
        "Errore durante il popolamento del database: " + err.message + "\n\n" +
        "Assicurati di aver eseguito lo script SQL delle migrazioni sul pannello Supabase (SQL Editor).\n" +
        "Trovi le query da eseguire nel manuale (tasto Guida PDF in alto a destra)."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- AZIONI: LOGIN / LOGOUT ---
  const handleLoginSuccess = (userData, demoStatus) => {
    setUser(userData)
    setIsDemo(demoStatus)
    if (demoStatus) {
      localStorage.setItem('demo-user', JSON.stringify(userData))
    }
  }

  const handleLogout = async () => {
    if (!isDemo && isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem('demo-user')
    setUser(null)
    setJobs([])
    setCandidates([])
    setNotes([])
    setAppointments([])
    setJobTemplates([])
    setSelectedJob(null)
    setSelectedCandidate(null)
    setNavTab('active')
  }

  // --- CRUD POSIZIONI & TEMPLATE (JOBS & TEMPLATES) ---
  const handleSaveJob = async (jobData) => {
    if (jobData.isTemplate) {
      // GESTIONE SALVATAGGIO TEMPLATE ANAGRAFICA
      if (isDemo) {
        let updatedTemplates
        if (jobData.id) {
          updatedTemplates = jobTemplates.map(t => t.id === jobData.id ? { ...t, ...jobData } : t)
        } else {
          const newTemplate = {
            ...jobData,
            id: 'demo-temp-' + Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString()
          }
          updatedTemplates = [newTemplate, ...jobTemplates]
        }
        setJobTemplates(updatedTemplates)
        localStorage.setItem('demo-job-templates', JSON.stringify(updatedTemplates))
      } else {
        try {
          if (jobData.id) {
            const { error } = await supabase
              .from('06app_CRM_HR_job_templates')
              .update({
                title: jobData.title,
                department: jobData.department,
                description: jobData.description,
                requirements: jobData.requirements
              })
              .eq('id', jobData.id)
            if (error) throw error
          } else {
            const { error } = await supabase
              .from('06app_CRM_HR_job_templates')
              .insert([{
                title: jobData.title,
                department: jobData.department,
                description: jobData.description,
                requirements: jobData.requirements
              }])
            if (error) throw error
          }
          await loadSupabaseData()
        } catch (e) {
          alert("Errore nel salvataggio del template su Supabase: " + e.message)
        }
      }
    } else {
      // GESTIONE SALVATAGGIO RICERCA ATTIVA/ARCHIVIATA
      if (isDemo) {
        let updatedJobs
        if (jobData.id) {
          updatedJobs = jobs.map(j => j.id === jobData.id ? { ...j, ...jobData } : j)
        } else {
          const newJob = {
            ...jobData,
            id: 'demo-job-' + Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString()
          }
          updatedJobs = [newJob, ...jobs]
        }
        setJobs(updatedJobs)
        localStorage.setItem('demo-jobs', JSON.stringify(updatedJobs))
        
        if (selectedJob && selectedJob.id === jobData.id) {
          setSelectedJob(updatedJobs.find(j => j.id === jobData.id))
        }
      } else {
        try {
          if (jobData.id) {
            const { data, error } = await supabase
              .from('06app_CRM_HR_jobs')
              .update({
                title: jobData.title,
                department: jobData.department,
                status: jobData.status,
                description: jobData.description,
                requirements: jobData.requirements
              })
              .eq('id', jobData.id)
              .select()
            
            if (error) throw error
            await loadSupabaseData()
            
            if (selectedJob && selectedJob.id === jobData.id) {
              setSelectedJob(data[0])
            }
          } else {
            const { error } = await supabase
              .from('06app_CRM_HR_jobs')
              .insert([{
                title: jobData.title,
                department: jobData.department,
                status: jobData.status,
                description: jobData.description,
                requirements: jobData.requirements
              }])
            if (error) throw error
            await loadSupabaseData()
          }
        } catch (e) {
          alert("Errore nel salvataggio su Supabase: " + e.message)
        }
      }
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (isDemo) {
      const updatedJobs = jobs.filter(j => j.id !== jobId)
      const updatedCandidates = candidates.filter(c => c.job_id !== jobId)
      const updatedAppointments = appointments.filter(a => !updatedCandidates.find(c => c.id === a.candidate_id))
      setJobs(updatedJobs)
      setCandidates(updatedCandidates)
      setAppointments(updatedAppointments)
      localStorage.setItem('demo-jobs', JSON.stringify(updatedJobs))
      localStorage.setItem('demo-candidates', JSON.stringify(updatedCandidates))
      localStorage.setItem('demo-appointments', JSON.stringify(updatedAppointments))
      if (selectedJob?.id === jobId) setSelectedJob(null)
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_jobs')
          .delete()
          .eq('id', jobId)
        if (error) throw error
        await loadSupabaseData()
        if (selectedJob?.id === jobId) setSelectedJob(null)
      } catch (e) {
        alert("Errore nell'eliminazione su Supabase: " + e.message)
      }
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    if (isDemo) {
      const updatedTemplates = jobTemplates.filter(t => t.id !== templateId)
      setJobTemplates(updatedTemplates)
      localStorage.setItem('demo-job-templates', JSON.stringify(updatedTemplates))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_job_templates')
          .delete()
          .eq('id', templateId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'eliminazione del template: " + e.message)
      }
    }
  }

  // AVVIA UNA RICERCA ATTIVA PARTENDO DA UN TEMPLATE ANAGRAFICA
  const handleStartSearchFromTemplate = (template) => {
    const jobFromTemplate = {
      title: template.title,
      department: template.department,
      status: 'Open',
      description: template.description,
      requirements: template.requirements,
      isTemplate: false // Si apre come ricerca attiva!
    }
    setEditingJob(jobFromTemplate)
    setIsJobModalOpen(true)
  }

  // --- CRUD CANDIDATI ---
  const handleAddCandidate = async (candidateData) => {
    const newId = candidateData.id || 'demo-cand-' + Math.random().toString(36).substr(2, 9)
    if (isDemo) {
      const newCand = {
        ...candidateData,
        id: newId,
        created_at: candidateData.created_at || new Date().toISOString()
      }
      const updatedCandidates = [newCand, ...candidates]
      setCandidates(updatedCandidates)
      localStorage.setItem('demo-candidates', JSON.stringify(updatedCandidates))
      return newCand
    } else {
      try {
        const { data, error } = await supabase
          .from('06app_CRM_HR_candidates')
          .insert([candidateData])
          .select()
        if (error) throw error
        await loadSupabaseData()
        return data[0]
      } catch (e) {
        alert("Errore nell'inserimento del candidato su Supabase: " + e.message)
      }
    }
  }

  const handleUpdateCandidateStage = async (candidateId, newStage) => {
    if (isDemo) {
      const updatedCandidates = candidates.map(c => 
        c.id === candidateId ? { ...c, stage: newStage } : c
      )
      setCandidates(updatedCandidates)
      localStorage.setItem('demo-candidates', JSON.stringify(updatedCandidates))
      
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate(updatedCandidates.find(c => c.id === candidateId))
      }
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_candidates')
          .update({ stage: newStage })
          .eq('id', candidateId)
        if (error) throw error
        
        setCandidates(prev => prev.map(c => 
          c.id === candidateId ? { ...c, stage: newStage } : c
        ))
        if (selectedCandidate && selectedCandidate.id === candidateId) {
          setSelectedCandidate(prev => ({ ...prev, stage: newStage }))
        }
      } catch (e) {
        alert("Errore nell'aggiornamento dello stage su Supabase: " + e.message)
      }
    }
  }

  const handleDeleteCandidate = async (candidateId) => {
    if (isDemo) {
      const updatedCandidates = candidates.filter(c => c.id !== candidateId)
      const updatedNotes = notes.filter(n => n.candidate_id !== candidateId)
      const updatedAppointments = appointments.filter(a => a.candidate_id !== candidateId)
      setCandidates(updatedCandidates)
      setNotes(updatedNotes)
      setAppointments(updatedAppointments)
      localStorage.setItem('demo-candidates', JSON.stringify(updatedCandidates))
      localStorage.setItem('demo-notes', JSON.stringify(updatedNotes))
      localStorage.setItem('demo-appointments', JSON.stringify(updatedAppointments))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_candidates')
          .delete()
          .eq('id', candidateId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'eliminazione del candidato: " + e.message)
      }
    }
  }

  // --- GESTIONE APPUNTAMENTI ---
  const handleAddAppointment = async (apptData) => {
    const newId = apptData.id || 'demo-appt-' + Math.random().toString(36).substr(2, 9)
    if (isDemo) {
      const newAppt = { ...apptData, id: newId }
      const updatedAppts = [newAppt, ...appointments]
      setAppointments(updatedAppts)
      localStorage.setItem('demo-appointments', JSON.stringify(updatedAppts))
      return newAppt
    } else {
      try {
        const { data, error } = await supabase
          .from('06app_CRM_HR_appointments')
          .insert([apptData])
          .select()
        if (error) throw error
        await loadSupabaseData()
        return data[0]
      } catch (e) {
        alert("Errore nel pianificare l'appuntamento su Supabase: " + e.message)
      }
    }
  }

  const handleDeleteAppointment = async (apptId) => {
    if (isDemo) {
      const updatedAppts = appointments.filter(a => a.id !== apptId)
      setAppointments(updatedAppts)
      localStorage.setItem('demo-appointments', JSON.stringify(updatedAppts))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_appointments')
          .delete()
          .eq('id', apptId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nella cancellazione dell'appuntamento: " + e.message)
      }
    }
  }

  // --- GESTIONE NOTE ---
  const handleAddNote = async (candidateId, noteContent) => {
    const authorEmail = user?.email || 'recruiter@azienda.it'
    
    if (isDemo) {
      const newNote = {
        id: 'demo-note-' + Math.random().toString(36).substr(2, 9),
        candidate_id: candidateId,
        author_email: authorEmail,
        content: noteContent,
        created_at: new Date().toISOString()
      }
      const updatedNotes = [newNote, ...notes]
      setNotes(updatedNotes)
      localStorage.setItem('demo-notes', JSON.stringify(updatedNotes))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_notes')
          .insert([{
            candidate_id: candidateId,
            author_email: authorEmail,
            content: noteContent
          }])
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'aggiunta della nota su Supabase: " + e.message)
      }
    }
  }

  // --- GESTIONE DIPENDENTI (HRIS) ---
  const handleAddEmployee = async (empData) => {
    const newId = empData.id || 'demo-emp-' + Math.random().toString(36).substr(2, 9)
    const newEmp = { ...empData, id: newId, created_at: empData.created_at || new Date().toISOString() }

    const onboardingTasks = [
      { task_name: 'Firma contratto assunzione', assigned_to: 'Amministrazione' },
      { task_name: 'Creazione email e account Slack', assigned_to: 'IT' },
      { task_name: 'Consegna laptop aziendale', assigned_to: 'IT' },
      { task_name: 'Registrazione portale UNILAV', assigned_to: 'Amministrazione' },
      { task_name: 'Corsi sicurezza obbligatori', assigned_to: 'HR' },
      { task_name: 'Configurazione accessi GitHub', assigned_to: 'IT' }
    ]

    if (isDemo) {
      const updatedEmployees = [newEmp, ...employees]
      setEmployees(updatedEmployees)
      localStorage.setItem('demo-employees', JSON.stringify(updatedEmployees))

      // Inizializzazione automatica checklist onboarding per la demo
      const defaultTasks = onboardingTasks.map((task, index) => ({
        id: `demo-ch-auto-${newId}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        employee_id: newId,
        employee_name: newEmp.name,
        type: 'Onboarding',
        task_name: task.task_name,
        assigned_to: task.assigned_to,
        is_completed: false,
        completed_at: null
      }))
      const updatedChecklists = [...checklists, ...defaultTasks]
      setChecklists(updatedChecklists)
      localStorage.setItem('demo-checklists', JSON.stringify(updatedChecklists))

      return newEmp
    } else {
      try {
        const { data, error } = await supabase
          .from('06app_CRM_HR_employees')
          .insert([empData])
          .select()
        if (error) throw error
        
        const insertedEmp = data[0]
        // Inizializzazione automatica checklist onboarding in Supabase
        const defaultTasksDb = onboardingTasks.map(task => ({
          employee_id: insertedEmp.id,
          employee_name: insertedEmp.name,
          type: 'Onboarding',
          task_name: task.task_name,
          assigned_to: task.assigned_to,
          is_completed: false
        }))
        const { error: errChecklistInit } = await supabase
          .from('06app_CRM_HR_checklists')
          .insert(defaultTasksDb)
        if (errChecklistInit) {
          console.error("Errore nell'autoinizializzazione della checklist:", errChecklistInit)
        }

        await loadSupabaseData()
        return insertedEmp
      } catch (e) {
        alert("Errore nell'inserimento del dipendente su Supabase: " + e.message)
      }
    }
  }

  const handleUpdateEmployee = async (empId, updatedData) => {
    if (isDemo) {
      const updatedEmployees = employees.map(e => e.id === empId ? { ...e, ...updatedData } : e)
      setEmployees(updatedEmployees)
      localStorage.setItem('demo-employees', JSON.stringify(updatedEmployees))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_employees')
          .update(updatedData)
          .eq('id', empId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'aggiornamento del dipendente su Supabase: " + e.message)
      }
    }
  }

  const handleDeleteEmployee = async (empId) => {
    if (isDemo) {
      const updatedEmployees = employees.filter(e => e.id !== empId)
      const updatedLeaves = leaves.filter(l => l.employee_id !== empId)
      const updatedChecklists = checklists.filter(c => c.employee_id !== empId)
      const updatedPerformances = performances.filter(p => p.employee_id !== empId)
      const updatedExpenses = expenses.filter(exp => exp.employee_id !== empId)
      setEmployees(updatedEmployees)
      setLeaves(updatedLeaves)
      setChecklists(updatedChecklists)
      setPerformances(updatedPerformances)
      setExpenses(updatedExpenses)
      localStorage.setItem('demo-employees', JSON.stringify(updatedEmployees))
      localStorage.setItem('demo-leaves', JSON.stringify(updatedLeaves))
      localStorage.setItem('demo-checklists', JSON.stringify(updatedChecklists))
      localStorage.setItem('demo-performances', JSON.stringify(updatedPerformances))
      localStorage.setItem('demo-expenses', JSON.stringify(updatedExpenses))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_employees')
          .delete()
          .eq('id', empId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'eliminazione del dipendente su Supabase: " + e.message)
      }
    }
  }

  // --- GESTIONE FERIE / ASSENZE (HRIS) ---
  const handleAddLeave = async (leaveData) => {
    const newId = leaveData.id || 'demo-leave-' + Math.random().toString(36).substr(2, 9)
    const newLeave = { ...leaveData, id: newId, created_at: leaveData.created_at || new Date().toISOString() }

    if (isDemo) {
      const updatedLeaves = [newLeave, ...leaves]
      setLeaves(updatedLeaves)
      localStorage.setItem('demo-leaves', JSON.stringify(updatedLeaves))
      return newLeave
    } else {
      try {
        const { data, error } = await supabase
          .from('06app_CRM_HR_leaves')
          .insert([leaveData])
          .select()
        if (error) throw error
        await loadSupabaseData()
        return data[0]
      } catch (e) {
        alert("Errore nell'inserimento della richiesta su Supabase: " + e.message)
      }
    }
  }

  const handleUpdateLeaveStatus = async (leaveId, newStatus) => {
    if (isDemo) {
      const updatedLeaves = leaves.map(l => l.id === leaveId ? { ...l, status: newStatus } : l)
      setLeaves(updatedLeaves)
      localStorage.setItem('demo-leaves', JSON.stringify(updatedLeaves))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_leaves')
          .update({ status: newStatus })
          .eq('id', leaveId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'aggiornamento dello stato della richiesta su Supabase: " + e.message)
      }
    }
  }

  const handleDeleteLeave = async (leaveId) => {
    if (isDemo) {
      const updatedLeaves = leaves.filter(l => l.id !== leaveId)
      setLeaves(updatedLeaves)
      localStorage.setItem('demo-leaves', JSON.stringify(updatedLeaves))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_leaves')
          .delete()
          .eq('id', leaveId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nella cancellazione della richiesta su Supabase: " + e.message)
      }
    }
  }

  // --- GESTIONE CHECKLIST (HRIS) ---
  const handleUpdateChecklistTask = async (taskId, isCompleted) => {
    if (isDemo) {
      const updatedChecklists = checklists.map(c => {
        if (c.id === taskId) {
          return {
            ...c,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString().split('T')[0] : null
          }
        }
        return c
      })
      setChecklists(updatedChecklists)
      localStorage.setItem('demo-checklists', JSON.stringify(updatedChecklists))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_checklists')
          .update({
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', taskId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'aggiornamento del compito della checklist su Supabase: " + e.message)
      }
    }
  }

  const handleAddChecklistTask = async (taskData) => {
    if (isDemo) {
      const newId = 'demo-ch-' + Math.random().toString(36).substr(2, 9)
      const newTask = {
        ...taskData,
        id: newId,
        created_at: new Date().toISOString()
      }
      const updatedChecklists = [...checklists, newTask]
      setChecklists(updatedChecklists)
      localStorage.setItem('demo-checklists', JSON.stringify(updatedChecklists))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_checklists')
          .insert([taskData])
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'aggiunta del compito su Supabase: " + e.message)
      }
    }
  }

  // --- GESTIONE PERFORMANCE & OKR (HRIS) ---
  const handleSavePerformanceReview = async (reviewData) => {
    if (isDemo) {
      const existingIdx = performances.findIndex(p => p.employee_id === reviewData.employee_id && p.review_period === reviewData.review_period)
      let updatedPerformances
      if (existingIdx > -1) {
        const existing = performances[existingIdx]
        const updatedReview = {
          ...existing,
          ...reviewData,
          okrs: existing.okrs || []
        }
        updatedPerformances = [...performances]
        updatedPerformances[existingIdx] = updatedReview
      } else {
        const newReview = {
          ...reviewData,
          id: 'demo-perf-' + Math.random().toString(36).substr(2, 9),
          okrs: [],
          created_at: new Date().toISOString()
        }
        updatedPerformances = [newReview, ...performances]
      }
      setPerformances(updatedPerformances)
      localStorage.setItem('demo-performances', JSON.stringify(updatedPerformances))
    } else {
      try {
        const { data: existing, error: findError } = await supabase
          .from('06app_CRM_HR_performances')
          .select('*')
          .eq('employee_id', reviewData.employee_id)
          .eq('review_period', reviewData.review_period)
          .maybeSingle()
        
        if (findError) throw findError

        if (existing) {
          const { error: updateError } = await supabase
            .from('06app_CRM_HR_performances')
            .update({
              self_rating: reviewData.self_rating,
              manager_rating: reviewData.manager_rating,
              overall_feedback: reviewData.overall_feedback
            })
            .eq('id', existing.id)
          if (updateError) throw updateError
        } else {
          const { error: insertError } = await supabase
            .from('06app_CRM_HR_performances')
            .insert([{
              ...reviewData,
              okrs: []
            }])
          if (insertError) throw insertError
        }
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nel salvataggio della valutazione delle performance su Supabase: " + e.message)
      }
    }
  }

  const handleUpdateOkrProgress = async (employeeId, okrIndex, progressVal) => {
    if (isDemo) {
      const isFirstMatch = performances.findIndex(x => x.employee_id === employeeId)
      if (isFirstMatch > -1) {
        const updatedPerformances = [...performances]
        const p = updatedPerformances[isFirstMatch]
        const updatedOkrs = [...(p.okrs || [])]
        if (updatedOkrs[okrIndex]) {
          updatedOkrs[okrIndex] = { ...updatedOkrs[okrIndex], progress: progressVal }
        }
        updatedPerformances[isFirstMatch] = { ...p, okrs: updatedOkrs }
        setPerformances(updatedPerformances)
        localStorage.setItem('demo-performances', JSON.stringify(updatedPerformances))
      }
    } else {
      try {
        const activeReview = performances.find(p => p.employee_id === employeeId)
        if (!activeReview) return
        
        const updatedOkrs = [...(activeReview.okrs || [])]
        if (updatedOkrs[okrIndex]) {
          updatedOkrs[okrIndex] = { ...updatedOkrs[okrIndex], progress: progressVal }
        }

        const { error } = await supabase
          .from('06app_CRM_HR_performances')
          .update({ okrs: updatedOkrs })
          .eq('id', activeReview.id)
        
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'aggiornamento del progresso dell'OKR su Supabase: " + e.message)
      }
    }
  }

  const handleAddOkrObjective = async (employeeId, title) => {
    if (isDemo) {
      const firstMatchIdx = performances.findIndex(p => p.employee_id === employeeId)
      if (firstMatchIdx > -1) {
        const updatedPerformances = [...performances]
        const p = updatedPerformances[firstMatchIdx]
        const updatedOkrs = [...(p.okrs || []), { title, progress: 0 }]
        updatedPerformances[firstMatchIdx] = { ...p, okrs: updatedOkrs }
        setPerformances(updatedPerformances)
        localStorage.setItem('demo-performances', JSON.stringify(updatedPerformances))
      }
    } else {
      try {
        const activeReview = performances.find(p => p.employee_id === employeeId)
        if (!activeReview) return
        
        const updatedOkrs = [...(activeReview.okrs || []), { title, progress: 0 }]

        const { error } = await supabase
          .from('06app_CRM_HR_performances')
          .update({ okrs: updatedOkrs })
          .eq('id', activeReview.id)
        
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'inserimento dell'OKR su Supabase: " + e.message)
      }
    }
  }
  // --- GESTIONE NOTE SPESE & RIMBORSI (HRIS) ---
  const handleSaveExpense = async (expenseData) => {
    if (isDemo) {
      const newId = 'demo-exp-' + Math.random().toString(36).substr(2, 9)
      const newExpense = {
        ...expenseData,
        id: newId,
        created_at: new Date().toISOString()
      }
      const updatedExpenses = [newExpense, ...expenses]
      setExpenses(updatedExpenses)
      localStorage.setItem('demo-expenses', JSON.stringify(updatedExpenses))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_expenses')
          .insert([expenseData])
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'inserimento della nota spesa su Supabase: " + e.message)
      }
    }
  }

  const handleUpdateExpenseStatus = async (expenseId, newStatus) => {
    if (isDemo) {
      const updatedExpenses = expenses.map(e => e.id === expenseId ? { ...e, status: newStatus } : e)
      setExpenses(updatedExpenses)
      localStorage.setItem('demo-expenses', JSON.stringify(updatedExpenses))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_expenses')
          .update({ status: newStatus })
          .eq('id', expenseId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'aggiornamento dello stato della nota spesa su Supabase: " + e.message)
      }
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    if (isDemo) {
      const updatedExpenses = expenses.filter(e => e.id !== expenseId)
      setExpenses(updatedExpenses)
      localStorage.setItem('demo-expenses', JSON.stringify(updatedExpenses))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_expenses')
          .delete()
          .eq('id', expenseId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nella cancellazione della nota spesa su Supabase: " + e.message)
      }
    }
  }

  // --- GESTIONE PARCO MEZZI & CONSUMI ---
  const handleSaveVehicle = async (vehicleData) => {
    if (isDemo) {
      const existingIdx = vehicles.findIndex(v => v.id === vehicleData.id || v.plate === vehicleData.plate);
      let updatedVehicles;
      if (existingIdx > -1) {
        updatedVehicles = [...vehicles];
        updatedVehicles[existingIdx] = { ...updatedVehicles[existingIdx], ...vehicleData };
      } else {
        updatedVehicles = [vehicleData, ...vehicles];
      }
      setVehicles(updatedVehicles);
      localStorage.setItem('demo-vehicles', JSON.stringify(updatedVehicles));
      
      // Allinea le carte carburante e auto nei beni del dipendente
      if (vehicleData.assigned_employee_id) {
        const emp = employees.find(e => e.id === vehicleData.assigned_employee_id);
        if (emp) {
          const newAssets = [...(emp.assets || [])];
          const cleanedAssets = newAssets.filter(a => a.type !== 'Auto Aziendale' && a.type !== 'Carta Carburante');
          if (vehicleData.fuel_card_code) {
            cleanedAssets.push({
              type: 'Carta Carburante',
              model: 'Carta Rifornimento Abbinata',
              serial: vehicleData.fuel_card_code,
              assignedAt: new Date().toISOString().split('T')[0]
            });
          }
          cleanedAssets.push({
            type: 'Auto Aziendale',
            model: vehicleData.make_model,
            serial: vehicleData.plate,
            assignedAt: new Date().toISOString().split('T')[0]
          });
          
          const updatedEmployees = employees.map(e => e.id === emp.id ? { ...e, assets: cleanedAssets } : e);
          setEmployees(updatedEmployees);
          localStorage.setItem('demo-employees', JSON.stringify(updatedEmployees));
        }
      }
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_vehicles')
          .upsert([vehicleData])
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nel salvataggio del veicolo su Supabase: " + e.message)
      }
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (isDemo) {
      const updatedVehicles = vehicles.filter(v => v.id !== id);
      setVehicles(updatedVehicles);
      localStorage.setItem('demo-vehicles', JSON.stringify(updatedVehicles));
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_vehicles')
          .delete()
          .eq('id', id)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nella cancellazione del veicolo su Supabase: " + e.message)
      }
    }
  };

  const handleSaveVerizonConfig = (config) => {
    setVerizonConfig(config);
    if (isDemo) {
      localStorage.setItem('demo-verizon-config', JSON.stringify(config));
    }
  };

  const handleImportFuelTransactions = async (newTransactions) => {
    if (isDemo) {
      const updated = [...newTransactions, ...fuelTransactions];
      // remove duplicates
      const unique = updated.filter((v, i, a) => 
        a.findIndex(t => t.transaction_date === v.transaction_date && t.fuel_card_code === v.fuel_card_code && t.liters === v.liters) === i
      );
      setFuelTransactions(unique);
      localStorage.setItem('demo-fuel-transactions', JSON.stringify(unique));
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_fuel_transactions')
          .insert(newTransactions);
        if (error) throw error;
        await loadSupabaseData();
      } catch (e) {
        alert("Errore nel salvataggio delle transazioni su Supabase: " + e.message);
      }
    }
  };

  // Helpers
  const formatDateTime = (dateStr) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return dateStr
    }
  }

  const isUpcoming = (dateStr) => {
    try {
      return new Date(dateStr) >= new Date()
    } catch (e) {
      return true
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#181615',
        color: '#e7e5e4',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255,255,255,0.1)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%'
        }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Caricamento HR CRM Todos.it...</span>
      </div>
    )
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  // ============================================================================
  // APP MODE: Personal (noi.todos.it) vs Hub (vercel)
  // ----------------------------------------------------------------------------
  // Il mode è determinato da:
  //   - hostname (noi.todos.it → personal; vercel → hub)
  //   - query param ?mode=personal|hub (dev/override)
  //   - localStorage override (pulsante switch)
  //
  // Forzature:
  //   - currentRole === 'employee' → forziamo personal (operai non vedono Hub)
  // ============================================================================
  const hubUserRoles = mapLegacyRoleToHubRoles(currentRole)
  const resolvedMode = resolveAppMode()
  const effectiveMode =
    currentRole === 'employee' || !canAccessHub(hubUserRoles)
      ? APP_MODE.PERSONAL
      : resolvedMode

  if (effectiveMode === APP_MODE.PERSONAL) {
    return (
      <PersonalApp
        user={user}
        userRoles={hubUserRoles}
        onLogout={handleLogout}
        isDemo={isDemo}
      />
    )
  }

  // --- Render Hub (sidebar con tutti i moduli di lavoro) -------------------
  const headerNode = (
    <Header
      user={user}
      isDemo={isDemo}
      onLogout={handleLogout}
      onOpenJobModal={() => { setSelectedJob(null); setNavTab('create-search'); setCurrentNavItemId('hr-active'); }}
      notifications={notifications}
      onMarkAsRead={handleMarkNotificationAsRead}
      onMarkAllAsRead={handleMarkAllNotificationsAsRead}
      onClearNotifications={handleClearNotifications}
      onOpenManual={() => setShowManualModal(true)}
      showSeedButton={employees.length === 0}
      onSeedDatabase={handleSeedSupabaseData}
      currentRole={currentRole}
      onRoleChange={setCurrentRole}
    />
  )

  return (
    <AppShell
      userRoles={hubUserRoles}
      userName={user?.name || user?.email}
      currentItemId={currentNavItemId}
      onNavigate={handleHubNavigate}
      header={headerNode}
      onOpenSearch={() => alert('🔍 Search globale ⌘K — in costruzione (F0)')}
    >

      {/* === HOME PAGE === */}
      {currentNavItemId === 'home' && (
        <HomePage
          userRoles={hubUserRoles}
          userName={user?.name || user?.email}
          onNavigate={handleHubNavigate}
          isDemo={isDemo}
        />
      )}

      {/* === MODULI === */}
      {currentNavItemId !== 'home' && (
        /* Render Single Job Kanban Board if selected */
        selectedJob ? (
          <KanbanBoard
            job={selectedJob}
            candidates={candidates}
            onBack={() => setSelectedJob(null)}
            onUpdateCandidateStage={handleUpdateCandidateStage}
            onDeleteCandidate={handleDeleteCandidate}
            onAddCandidate={handleAddCandidate}
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            onEditJob={(job) => {
              setEditingJob(job)
              setIsJobModalOpen(true)
            }}
            isDemo={isDemo}
          />
        ) : (
          
          /* Switch between Navigation Views */
          <>
            {navTab === 'create-search' ? (
              <CreateSearch
                onSave={async (jobData) => {
                  await handleSaveJob(jobData)
                  setNavTab(jobData.isTemplate ? 'templates' : 'active')
                }}
                onCancel={() => setNavTab('active')}
              />
            ) : navTab === 'appointments' ? (
              /* APPOINTMENTS CALENDAR TAB VIEW */
              <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  borderBottom: '2px solid var(--border-color)',
                  paddingBottom: '16px',
                  marginBottom: '24px',
                  animation: 'fadeIn 0.15s ease'
                }}>
                  <Calendar size={28} style={{ color: 'var(--primary)' }} />
                  <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      📅 Calendario Appuntamenti Pianificati
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Elenco di tutti i colloqui pianificati con i candidati e i rispettivi intervistatori.
                    </p>
                  </div>
                </div>

                <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', overflow: 'hidden' }}>
                  {appointments.length > 0 ? (
                    <table className="compact-table">
                      <thead>
                        <tr>
                          <th>Data e Ora</th>
                          <th>Candidato</th>
                          <th>Posizione</th>
                          <th>Intervistatore</th>
                          <th>Modalità</th>
                          <th>Note</th>
                          <th style={{ textAlign: 'right' }}>Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appt) => {
                          const upcoming = isUpcoming(appt.date_time)
                          
                          return (
                            <tr key={appt.id}>
                              <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  color: upcoming ? 'var(--primary)' : 'var(--text-secondary)'
                                }}>
                                  <span style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: upcoming ? 'var(--success)' : 'var(--text-muted)'
                                  }} />
                                  {formatDateTime(appt.date_time)}
                                </span>
                              </td>
                              <td style={{ fontWeight: 700 }}>{appt.candidate_name}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{appt.job_title}</td>
                              <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{appt.interviewer_email}</td>
                              <td>
                                <span className={appt.meeting_type === 'Teams' ? "badge badge-primary" : "badge badge-success"} style={{ gap: '4px' }}>
                                  {appt.meeting_type === 'Teams' && <Video size={10} />}
                                  {appt.meeting_type}
                                </span>
                              </td>
                              <td style={{
                                color: 'var(--text-secondary)',
                                maxWidth: '240px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }} title={appt.notes}>
                                {appt.notes || '-'}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  {appt.meeting_link && (
                                    <a 
                                      href={appt.meeting_link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                                    >
                                      <ExternalLink size={12} />
                                      <span>Teams</span>
                                    </a>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (window.confirm("Annullare questo appuntamento?")) {
                                        handleDeleteAppointment(appt.id)
                                      }
                                    }}
                                    className="btn btn-danger"
                                    style={{ padding: '4px 6px' }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      <Calendar size={36} style={{ marginBottom: '12px', opacity: 0.3, color: 'var(--primary)' }} />
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Nessun appuntamento pianificato
                      </h3>
                      <p style={{ fontSize: '0.8rem' }}>
                        Fissa un colloquio nella scheda di un candidato all'interno delle ricerche attive.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : navTab === 'employees' ? (
              <EmployeesTab
                employees={employees}
                candidates={candidates}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                checklists={checklists}
                performances={performances}
                onUpdateChecklistTask={handleUpdateChecklistTask}
                onAddChecklistTask={handleAddChecklistTask}
                onSavePerformanceReview={handleSavePerformanceReview}
                onUpdateOkrProgress={handleUpdateOkrProgress}
                onAddOkrObjective={handleAddOkrObjective}
                currentRole={currentRole}
              />
            ) : navTab === 'absences' ? (
              <AbsencesTab
                employees={employees}
                leaves={leaves}
                onAddLeave={handleAddLeave}
                onUpdateLeaveStatus={handleUpdateLeaveStatus}
                onDeleteLeave={handleDeleteLeave}
              />
            ) : navTab === 'expenses' ? (
              <ExpensesTab
                employees={employees}
                expenses={expenses}
                onSaveExpense={handleSaveExpense}
                onUpdateExpenseStatus={handleUpdateExpenseStatus}
                onDeleteExpense={handleDeleteExpense}
              />
            ) : navTab === 'shifts' ? (
              <ShiftPlannerTab
                employees={employees}
                shifts={shifts}
                leaves={leaves}
                onSaveShift={handleSaveShift}
                onDeleteShift={handleDeleteShift}
              />
            ) : navTab === 'analytics' ? (
              <AnalyticsTab
                jobs={jobs}
                candidates={candidates}
                employees={employees}
                leaves={leaves}
                expenses={expenses}
              />
            ) : navTab === 'mezzi' ? (
              <MezziTab
                employees={employees}
                vehicles={vehicles}
                fuelTransactions={fuelTransactions}
                verizonConfig={verizonConfig}
                onSaveVehicle={handleSaveVehicle}
                onDeleteVehicle={handleDeleteVehicle}
                onSaveVerizonConfig={handleSaveVerizonConfig}
                onImportFuelTransactions={handleImportFuelTransactions}
              />
            ) : navTab === 'wp2' ? (
              <WP2Module />
            ) : (
              /* JOBS DASHBOARD VIEWS: ACTIVE, ARCHIVED OR TEMPLATES */
              <Dashboard
                jobs={jobs}
                candidates={candidates}
                jobTemplates={jobTemplates}
                onSelectJob={setSelectedJob}
                onEditJob={(item) => {
                  setEditingJob(item)
                  setIsJobModalOpen(true)
                }}
                onDeleteJob={handleDeleteJob}
                onSaveJob={handleSaveJob}
                onDeleteTemplate={handleDeleteTemplate}
                onStartSearchFromTemplate={handleStartSearchFromTemplate}
                activeTab={navTab} // 'active' | 'archived' | 'templates'
              />
            )}
          </>
        )
      )}

      {/* Modale Creazione / Modifica (Ricerche Attive o Template) */}
      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => {
          setIsJobModalOpen(false)
          setEditingJob(null)
        }}
        onSave={handleSaveJob}
        editingJob={editingJob}
      />

      {/* Modale Scheda Candidato (Dettaglio, Note, AI matching, Teams Calendar) */}
      <CandidateModal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
        notes={notes.filter(n => n.candidate_id === selectedCandidate?.id)}
        onAddNote={handleAddNote}
        isDemo={isDemo}
        onUpdateStage={handleUpdateCandidateStage}
        onAddAppointment={handleAddAppointment}
        job={jobs.find(j => j.job_id === selectedCandidate?.job_id || j.id === selectedCandidate?.job_id)}
        onAddEmployee={handleAddEmployee}
      />

      {/* Modale Manuale Operativo PDF / Guida (Fase 7-8) */}
      {showManualModal && (
        <div className="modal-overlay no-print" style={{ zIndex: 1100 }}>
          <div className="modal-content glass-panel" style={{ background: 'var(--bg-card)', maxWidth: '900px', width: '90%', height: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📖 Manuale Operativo - Todos Select Suite
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={() => window.print()} 
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.72rem', fontWeight: 700 }}
                >
                  📥 Salva / Stampa PDF
                </button>
                <button 
                  style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-primary)' }} 
                  onClick={() => setShowManualModal(false)}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body with Printable Class */}
            <div className="modal-body printable-manual" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '16px', marginBottom: '10px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--primary)' }}>Todos Select Suite</h1>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  GUIDA OPERATIVA COMPLETA ED ERGONOMICA (ATS & HRIS)
                </span>
              </div>

              {/* Sezione 1: ATS */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  1. 📋 Drag & Drop ATS & AI CV Parser (Fase 1)
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Nel tab <strong>📋 Ricerche Attive</strong>, trascinando e rilasciando un curriculum in formato PDF su qualsiasi colonna della Kanban Board, l'applicazione attiva in locale l'estrattore <code>PDF.js</code> per leggere il testo del CV. Subito dopo, le API di <strong>Gemini AI</strong> elaborano l'analisi e compilano anagrafica, competenze, e fit score, fornendo anche le domande consigliate per il colloquio.
                </p>
              </div>

              {/* Sezione 2: Colloqui */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  2. 📅 Appuntamenti, Colloqui & File ICS Outlook (Fase 2)
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Fissando un colloquio dal pannello del candidato, l'applicazione genera e scarica automaticamente un file di calendario standard <code>.ics</code>. Questo file, se aperto su Microsoft Outlook o Apple Calendar, compila in modo sicuro i dettagli dell'incontro e l'invito Teams, senza la necessità di collegare o esporre credenziali aziendali online.
                </p>
              </div>

              {/* Sezione 3: HRIS & Scadenziario */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  3. 👥 Anagrafica Personale & Alert Scadenze (Fase 2 & 7)
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Nel tab <strong>👥 Dipendenti</strong> è possibile gestire i contratti del personale, la RAL, e i beni tecnologici assegnati (MacBook, iPhone con relativi seriali). Inoltre, un motore di calcolo controlla costantemente le date di scadenza mediche, legali e dei corsi di sicurezza obbligatori, generando notifiche luminose nell'Header (Campana Notifiche) se mancano meno di 30 giorni alla scadenza.
                </p>
              </div>

              {/* Sezione 4: Performance */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  4. 📈 Performance Reviews & Radar SVG Custom (Fase 2)
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Per ciascun dipendente è integrata una scheda di autovalutazione e valutazione delle competenze chiave. Un grafico a ragnatela generato in <strong>SVG nativo</strong> confronta visivamente lo scostamento tra l'autovalutazione del dipendente (colore azzurro) e la valutazione del manager (colore rosso Todos). I Key Results (OKR) sono monitorati in tempo reale tramite slider orizzontali interattivi.
                </p>
              </div>

              {/* Sezione 5: Note Spese OCR */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  5. 💼 Note Spese Smart & AI OCR Scanner (Fase 3)
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Consente l'acquisizione intelligente dei rimborsi spese. Avviando lo scanner su uno scontrino modello, compare una raffinata animazione laser verde oscillante. Dopo 2 secondi di elaborazione AI OCR, il form viene precompilato con importo, esercente e data esatti. L'amministratore HR può approvare e scaricare il report generale formattato in formato CSV per l'ufficio contabilità.
                </p>
              </div>

              {/* Sezione 6: Organigramma */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  6. 🏢 Organigramma Gerarchico Aziendale (Fase 6)
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Un grafico gerarchico navigabile in tempo reale mostra l'albero organizzativo delle risorse umane (CEO, Tech, Commerciale). Facendo clic su un nodo dell'organigramma, la vista gerarchica si chiude da sola e la pagina effettua uno scorrimento automatico focalizzando ed evidenziando la scheda anagrafica e i dettagli di quel dipendente!
                </p>
              </div>

              {/* Sezione 7: Planner Turni */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  7. 📅 Planner Turni Settimanali & Collision Detector (Fase 8)
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  L'HR programma la turnazione settimanale (Mattina, Pomeriggio, Notte, Custom). Se un dipendente ha delle ferie registrate in un giorno in cui viene assegnato un turno, il sistema rileva la collisione evidenziando il blocco con una linea rossa brillante (Collision Detector). Allerta inoltre l'amministratore se le ore settimanali programmate superano le 40 ore di soglia.
                </p>
              </div>

              {/* Sezione 8: Portale SSP */}
              <div style={{ paddingBottom: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  8. 🔑 Portale Self-Service Dipendente - SSP (Fase 4 & 8)
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  I lavoratori (es. Rossi, Bianchi, Neri) dispongono di un'area riservata esclusiva a cui accedono selezionando il proprio profilo. Possono monitorare in tempo reale lo stato delle checklist di onboarding, caricare note spese o scontrini con lo scanner OCR, inserire richieste di ferie/malattia all'HR e consultare la propria turnazione con l'indicazione evidenziata in tempo reale per la giornata di <strong>OGGI</strong>.
                </p>
              </div>

              {/* Sezione 9: Migrazioni SQL */}
              <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '20px', paddingBottom: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: 'var(--primary)' }}>
                  9. 🗄️ Query SQL delle Migrazioni (Da eseguire nel SQL Editor di Supabase)
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '12px' }}>
                  Se riscontri errori durante il popolamento del database Supabase, significa che mancano le tabelle o i vincoli corretti nel tuo database cloud. <strong>Copia il seguente script SQL ed eseguilo integralmente nel pannello SQL Editor di Supabase</strong>, dopodiché riprova a cliccare sul pulsante di popolamento dei dati.
                </p>
                <div style={{ position: 'relative' }}>
                  <textarea
                    readOnly
                    onClick={(e) => { e.target.select(); document.execCommand('copy'); alert('Script SQL copiato negli appunti! 📋'); }}
                    style={{
                      width: '100%',
                      height: '250px',
                      background: 'rgba(0,0,0,0.3)',
                      color: '#a7f3d0',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      lineHeight: '1.4',
                      resize: 'vertical',
                      cursor: 'pointer'
                    }}
                    value={`-- 1. TABELLA POSIZIONI (06app_CRM_HR_jobs)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_jobs" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT DEFAULT 'Open' NOT NULL, -- 'Open' o 'Closed'
  description TEXT NOT NULL,
  requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABELLA CANDIDATI (06app_CRM_HR_candidates)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_candidates" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES "06app_CRM_HR_jobs"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  stage TEXT DEFAULT 'Nuovi CV' NOT NULL,
  cv_text TEXT,
  competenze JSONB DEFAULT '[]'::jsonb,
  esperienze JSONB DEFAULT '[]'::jsonb,
  istruzione JSONB DEFAULT '[]'::jsonb,
  fit_score INTEGER DEFAULT 0,
  match_analysis JSONB DEFAULT '{}'::jsonb,
  stato_interazione TEXT DEFAULT 'Da contattare',
  cv_url TEXT DEFAULT '',
  data_colloquio_1 TIMESTAMP WITH TIME ZONE,
  data_colloquio_2 TIMESTAMP WITH TIME ZONE,
  data_chiamata TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABELLA NOTE CANDIDATO (06app_CRM_HR_notes)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_notes" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES "06app_CRM_HR_candidates"(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABELLA APPUNTAMENTI (06app_CRM_HR_appointments)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_appointments" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES "06app_CRM_HR_candidates"(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  interviewer_email TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_type TEXT DEFAULT 'Teams' NOT NULL,
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABELLA TEMPLATE POSIZIONI (06app_CRM_HR_job_templates)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_job_templates" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TABELLA DIPENDENTI (06app_CRM_HR_employees)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_employees" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES "06app_CRM_HR_candidates"(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department TEXT NOT NULL,
  role TEXT NOT NULL,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  contract_type TEXT NOT NULL,
  ral NUMERIC DEFAULT 0,
  trial_period_end DATE,
  assets JSONB DEFAULT '[]'::jsonb,
  document_id_expiry DATE,
  safety_course_expiry DATE,
  medical_visit_expiry DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELLA FERIE/ASSENZE (06app_CRM_HR_leaves)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_leaves" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES "06app_CRM_HR_employees"(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  hours NUMERIC,
  status TEXT NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABELLA CHECKLISTS (06app_CRM_HR_checklists)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_checklists" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES "06app_CRM_HR_employees"(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  type TEXT NOT NULL,
  task_name TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABELLA PERFORMANCE (06app_CRM_HR_performances)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_performances" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES "06app_CRM_HR_employees"(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  review_period TEXT NOT NULL,
  self_rating JSONB NOT NULL,
  manager_rating JSONB NOT NULL,
  overall_feedback TEXT,
  okrs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABELLA NOTE SPESE (06app_CRM_HR_expenses)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_expenses" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES "06app_CRM_HR_employees"(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  merchant TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  receipt_name TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABELLA TURNI (06app_CRM_HR_shifts)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_shifts" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES "06app_CRM_HR_employees"(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABELLA VEICOLI (06app_CRM_HR_vehicles)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_vehicles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT NOT NULL UNIQUE,
  make_model TEXT NOT NULL,
  year INTEGER,
  fuel_type TEXT NOT NULL,
  initial_odometer NUMERIC NOT NULL DEFAULT 0,
  current_odometer NUMERIC NOT NULL DEFAULT 0,
  fuel_card_code TEXT UNIQUE,
  assigned_employee_id UUID REFERENCES "06app_CRM_HR_employees"(id) ON DELETE SET NULL,
  api_vehicle_id TEXT,
  consumption_limit NUMERIC DEFAULT 6.5,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. TABELLA TRANSAZIONI CARBURANTE (06app_CRM_HR_fuel_transactions)
CREATE TABLE IF NOT EXISTS "06app_CRM_HR_fuel_transactions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE NOT NULL,
  fuel_card_code TEXT NOT NULL,
  station_name TEXT,
  plate TEXT,
  liters NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  matched_employee_id UUID REFERENCES "06app_CRM_HR_employees"(id) ON DELETE SET NULL,
  matched_vehicle_id UUID REFERENCES "06app_CRM_HR_vehicles"(id) ON DELETE SET NULL,
  satellite_km NUMERIC,
  effective_consumption NUMERIC,
  anomaly_status TEXT DEFAULT 'OK',
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
                  />
                  <div style={{ fontSize: '0.68rem', color: 'var(--primary-light)', marginTop: '4px', textAlign: 'right', fontWeight: 600 }}>
                    💡 Fai clic all'interno del box per selezionare e copiare automaticamente lo script.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer no-print">
              <button className="btn btn-secondary" onClick={() => setShowManualModal(false)}>Chiudi Guida</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
