// ============================================================================
// WORK-PRO TODOS — Seed dati demo
// Coerente con il modulo Work-Pro descritto nel docx e nel video noi.todos.it
// ============================================================================

// --- Project Managers ----------------------------------------------------
export const WP_PM = [
  { id: 'pm-1', code: 'c.fall',     name: 'Carlo Falloni',    email: 'c.fall@todos.it',    area: 'Lombardia Nord' },
  { id: 'pm-2', code: 'a.degani',   name: 'Anna Degani',      email: 'a.degani@todos.it',  area: 'Lombardia Sud' },
  { id: 'pm-3', code: 'p.locatelli', name: 'Paolo Locatelli',  email: 'p.locatelli@todos.it', area: 'Veneto' }
]

// --- Squadre -------------------------------------------------------------
export const WP_SQUADS = [
  { id: 'sq-1', name: 'Squadra Caravaggio',  pm_id: 'pm-1', leader_employee_id: 'wp-emp-1' },
  { id: 'sq-2', name: 'Squadra Brescia',     pm_id: 'pm-1', leader_employee_id: 'wp-emp-3' },
  { id: 'sq-3', name: 'Squadra Milano Sud',  pm_id: 'pm-2', leader_employee_id: 'wp-emp-5' },
  { id: 'sq-4', name: 'Squadra Bergamo',     pm_id: 'pm-2', leader_employee_id: 'wp-emp-8' },
  { id: 'sq-5', name: 'Squadra Verona',      pm_id: 'pm-3', leader_employee_id: 'wp-emp-10' }
]

// --- Classi di costo -----------------------------------------------------
export const WP_COST_CLASSES = [
  { id: 'cc-1', code: 'A', label: 'Classe A (Senior)',    hourly_cost: 32.0 },
  { id: 'cc-2', code: 'B', label: 'Classe B (Mid)',       hourly_cost: 26.0 },
  { id: 'cc-3', code: 'C', label: 'Classe C (Junior)',    hourly_cost: 19.5 },
  { id: 'cc-4', code: 'CS', label: 'Capo Squadra',         hourly_cost: 36.0 }
]

// --- Tipi reperibilità ---------------------------------------------------
export const WP_ONCALL_TYPES = ['Nessuna', 'CDZ', 'Uffici', 'RADIO']

// --- Dipendenti Work-Pro -------------------------------------------------
// Caposquadra (CS) hanno is_leader=true e vehicle_id assegnato
export const WP_EMPLOYEES = [
  { id: 'wp-emp-1',  code: 'g.corleto',  name: 'Gianni Corleto',    is_leader: true,  squad_id: 'sq-1', pm_id: 'pm-1', cost_class_id: 'cc-4', vehicle_id: 'veh-1', oncall: 'CDZ',    phone: '+39 333 1112233' },
  { id: 'wp-emp-2',  code: 'r.corleto',  name: 'Roberto Corleto',   is_leader: false, squad_id: 'sq-1', pm_id: 'pm-1', cost_class_id: 'cc-2', vehicle_id: null,    oncall: 'Nessuna', phone: '+39 333 2223344' },
  { id: 'wp-emp-3',  code: 'm.bettoni',  name: 'Marco Bettoni',     is_leader: true,  squad_id: 'sq-2', pm_id: 'pm-1', cost_class_id: 'cc-4', vehicle_id: 'veh-2', oncall: 'RADIO',  phone: '+39 333 3334455' },
  { id: 'wp-emp-4',  code: 'l.testa',    name: 'Luca Testa',        is_leader: false, squad_id: 'sq-2', pm_id: 'pm-1', cost_class_id: 'cc-3', vehicle_id: null,    oncall: 'Nessuna', phone: '+39 333 4445566' },
  { id: 'wp-emp-5',  code: 'a.calcagno', name: 'Andrea Calcagno',   is_leader: true,  squad_id: 'sq-3', pm_id: 'pm-2', cost_class_id: 'cc-4', vehicle_id: 'veh-3', oncall: 'Uffici', phone: '+39 333 5556677' },
  { id: 'wp-emp-6',  code: 'e.conti',    name: 'Emilio Conti',      is_leader: false, squad_id: 'sq-3', pm_id: 'pm-2', cost_class_id: 'cc-1', vehicle_id: null,    oncall: 'Nessuna', phone: '+39 333 6667788' },
  { id: 'wp-emp-7',  code: 'g.cattaneo', name: 'Giorgio Cattaneo',  is_leader: false, squad_id: 'sq-3', pm_id: 'pm-2', cost_class_id: 'cc-2', vehicle_id: 'veh-4', oncall: 'CDZ',    phone: '+39 333 7778899' },
  { id: 'wp-emp-8',  code: 's.colombo',  name: 'Stefano Colombo',   is_leader: true,  squad_id: 'sq-4', pm_id: 'pm-2', cost_class_id: 'cc-4', vehicle_id: 'veh-5', oncall: 'RADIO',  phone: '+39 333 8889900' },
  { id: 'wp-emp-9',  code: 'f.rossi',    name: 'Fabio Rossi',       is_leader: false, squad_id: 'sq-4', pm_id: 'pm-2', cost_class_id: 'cc-2', vehicle_id: null,    oncall: 'Nessuna', phone: '+39 333 9990011' },
  { id: 'wp-emp-10', code: 'd.ferrari',  name: 'Davide Ferrari',    is_leader: true,  squad_id: 'sq-5', pm_id: 'pm-3', cost_class_id: 'cc-4', vehicle_id: 'veh-6', oncall: 'Uffici', phone: '+39 333 0001122' },
  { id: 'wp-emp-11', code: 'm.greco',    name: 'Mauro Greco',       is_leader: false, squad_id: 'sq-5', pm_id: 'pm-3', cost_class_id: 'cc-3', vehicle_id: null,    oncall: 'Nessuna', phone: '+39 333 1122334' },
  { id: 'wp-emp-12', code: 'p.bianchi',  name: 'Pietro Bianchi',    is_leader: false, squad_id: 'sq-1', pm_id: 'pm-1', cost_class_id: 'cc-3', vehicle_id: null,    oncall: 'Nessuna', phone: '+39 333 2233445' }
]

// --- Clienti (mirror leggero da ARCA) -----------------------------------
export const WP_CLIENTS = [
  { id: 'cli-1', arca_code: '4G001',  name: '4G Italia S.r.l.',          piva: '01234567890', address: 'Milano',    type: 'Cliente' },
  { id: 'cli-2', arca_code: 'CDZ002', name: 'CDZ Industrie S.p.A.',      piva: '11122334455', address: 'Bergamo',   type: 'Cliente' },
  { id: 'cli-3', arca_code: 'ZAN003', name: 'Zanetti Brescia S.r.l.',    piva: '22233445566', address: 'Brescia',   type: 'Cliente' },
  { id: 'cli-4', arca_code: 'DC004',  name: 'DataCenter Liscate',        piva: '33344556677', address: 'Liscate',   type: 'Cliente' },
  { id: 'cli-5', arca_code: 'OFC005', name: 'Officine Verdi S.n.c.',     piva: '44455667788', address: 'Verona',    type: 'Cliente' },
  { id: 'cli-6', arca_code: 'MAT006', name: 'Materiali Edili Lupi',      piva: '55566778899', address: 'Milano',    type: 'Fornitore' },
  { id: 'cli-7', arca_code: 'NOL007', name: 'NolMezzi Italia S.r.l.',    piva: '66677889900', address: 'Verona',    type: 'Fornitore' }
]

// --- Cantieri ------------------------------------------------------------
// is_maintenance=true → codice mostrato in BLU
export const WP_SITES = [
  { id: 'site-1', code: 'BG24043_005', name: 'Caravaggio Industrie',         client_id: 'cli-2', address: 'Caravaggio (BG)', is_maintenance: false, start_date: '2026-03-01', end_date: '2026-09-30' },
  { id: 'site-2', code: 'BS25124_010', name: 'Brescia Zanetti',              client_id: 'cli-3', address: 'Brescia',         is_maintenance: false, start_date: '2026-04-15', end_date: '2026-07-15' },
  { id: 'site-3', code: 'MIL06',       name: 'DATACENTER (LISCATE)',         client_id: 'cli-4', address: 'Liscate (MI)',    is_maintenance: true,  start_date: '2025-01-01', end_date: null },
  { id: 'site-4', code: 'VR26011',     name: 'Officine Verdi - Manutenzione',client_id: 'cli-5', address: 'Verona',          is_maintenance: true,  start_date: '2024-01-01', end_date: null },
  { id: 'site-5', code: '4G24010',     name: 'Sede 4G Italia - Cablaggio',   client_id: 'cli-1', address: 'Milano',          is_maintenance: false, start_date: '2026-05-10', end_date: '2026-06-15' },
  { id: 'site-6', code: 'BG25080',     name: 'Cassa di Risparmio Bergamo',   client_id: 'cli-2', address: 'Bergamo',         is_maintenance: false, start_date: '2026-05-20', end_date: '2026-08-20' }
]

// --- Automezzi -----------------------------------------------------------
export const WP_VEHICLES = [
  { id: 'veh-1', plate: 'HA412YN', model: 'Fiat Ducato Cassonato',  fuel: 'Diesel',   ownership: 'Proprietà',  supplier_id: null,    has_winter_tires: true,  decommission_from: null, decommission_to: null },
  { id: 'veh-2', plate: 'GT408ML', model: 'Fiat Ducato Cassonato',  fuel: 'Diesel',   ownership: 'Proprietà',  supplier_id: null,    has_winter_tires: true,  decommission_from: null, decommission_to: null },
  { id: 'veh-3', plate: 'FV212HY', model: 'Fiat Ducato',            fuel: 'Diesel',   ownership: 'Proprietà',  supplier_id: null,    has_winter_tires: false, decommission_from: null, decommission_to: null },
  { id: 'veh-4', plate: 'GV670DL', model: 'Renault Van',            fuel: 'Diesel',   ownership: 'Proprietà',  supplier_id: null,    has_winter_tires: true,  decommission_from: null, decommission_to: null },
  { id: 'veh-5', plate: 'KX901WP', model: 'Iveco Daily',            fuel: 'Diesel',   ownership: 'Proprietà',  supplier_id: null,    has_winter_tires: false, decommission_from: null, decommission_to: null },
  { id: 'veh-6', plate: 'NL234RT', model: 'Ford Transit (NOLEGGIO)',fuel: 'Diesel',   ownership: 'Noleggio',   supplier_id: 'cli-7', has_winter_tires: false, decommission_from: null, decommission_to: null },
  { id: 'veh-7', plate: 'JN456AB', model: 'Fiat Panda',             fuel: 'Benzina',  ownership: 'Proprietà',  supplier_id: null,    has_winter_tires: false, decommission_from: '2026-06-01', decommission_to: '2026-07-15' }
]

// --- Scadenze mezzi (bollo / assicurazione / revisione) -----------------
export const WP_VEHICLE_EXPIRIES = [
  { id: 'vexp-1',  vehicle_id: 'veh-1', type: 'Bollo',         due_date: '2026-12-15' },
  { id: 'vexp-2',  vehicle_id: 'veh-1', type: 'Assicurazione', due_date: '2026-06-10' },
  { id: 'vexp-3',  vehicle_id: 'veh-1', type: 'Revisione',     due_date: '2027-03-20' },
  { id: 'vexp-4',  vehicle_id: 'veh-2', type: 'Bollo',         due_date: '2026-06-08' },  // <15gg → lampeggia
  { id: 'vexp-5',  vehicle_id: 'veh-2', type: 'Assicurazione', due_date: '2026-11-22' },
  { id: 'vexp-6',  vehicle_id: 'veh-3', type: 'Revisione',     due_date: '2026-06-05' },  // <15gg
  { id: 'vexp-7',  vehicle_id: 'veh-4', type: 'Bollo',         due_date: null },           // assente → segnalata
  { id: 'vexp-8',  vehicle_id: 'veh-4', type: 'Assicurazione', due_date: '2026-09-30' },
  { id: 'vexp-9',  vehicle_id: 'veh-5', type: 'Bollo',         due_date: '2027-01-12' },
  { id: 'vexp-10', vehicle_id: 'veh-6', type: 'Contratto Nol.',due_date: '2026-08-31' }
]

// --- Pneumatici in deposito ---------------------------------------------
export const WP_TIRES_STORAGE = [
  { id: 'tir-1', vehicle_id: 'veh-1', season: 'Invernali', location: 'Magazzino Milano', stored_at: '2026-04-15' },
  { id: 'tir-2', vehicle_id: 'veh-2', season: 'Invernali', location: 'Magazzino Milano', stored_at: '2026-04-15' },
  { id: 'tir-3', vehicle_id: 'veh-4', season: 'Estivi',    location: 'Magazzino Bergamo', stored_at: '2025-10-20' }
]

// --- Tessere carburante --------------------------------------------------
export const WP_FUEL_CARDS = [
  { id: 'fc-1', number: 'ENI-4421', supplier: 'Eni',        vehicle_id: 'veh-1', expires_at: '2027-01-31' },
  { id: 'fc-2', number: 'ENI-4422', supplier: 'Eni',        vehicle_id: 'veh-2', expires_at: '2026-06-10' }, // <15gg
  { id: 'fc-3', number: 'Q8-7733',  supplier: 'Q8',         vehicle_id: 'veh-3', expires_at: '2026-12-31' },
  { id: 'fc-4', number: 'IP-9988',  supplier: 'IP',         vehicle_id: 'veh-5', expires_at: null }              // assente
]

// --- Telepass ------------------------------------------------------------
export const WP_TELEPASS = [
  { id: 'tp-1', number: 'TP-110044', vehicle_id: 'veh-1', expires_at: '2028-06-30' },
  { id: 'tp-2', number: 'TP-110045', vehicle_id: 'veh-2', expires_at: '2026-06-12' }, // <15gg
  { id: 'tp-3', number: 'TP-110046', vehicle_id: 'veh-4', expires_at: '2027-09-15' }
]

// ============================================================================
// PIANIFICAZIONE SETTIMANALE
// Tipi speciali: Ferie, Ferie_IA (in approvazione), Malattia, Infortunio,
//                TD (Trasferta Diurna), TN (Trasferta Notturna),
//                RD (Reperibilità Diurna), RN (Reperibilità Notturna),
//                Permesso, Permesso_IA
// ============================================================================

// Helper per ottenere date settimana corrente (lunedì → domenica)
export const getCurrentWeekDates = () => {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

const W = getCurrentWeekDates()

// Assegnazioni settimana corrente — copertura parziale per mostrare l'alert
export const WP_ASSIGNMENTS = [
  // Squadra Caravaggio (PM Carlo Falloni)
  { id: 'a-1',  date: W[0], employee_id: 'wp-emp-1', site_id: 'site-1', vehicle_id: 'veh-1', special: null, notes: 'Setup quadri' },
  { id: 'a-2',  date: W[0], employee_id: 'wp-emp-2', site_id: 'site-1', vehicle_id: 'veh-1', special: null, notes: '' },
  { id: 'a-3',  date: W[1], employee_id: 'wp-emp-1', site_id: 'site-1', vehicle_id: 'veh-1', special: 'TD', notes: 'Trasferta diurna' },
  { id: 'a-4',  date: W[1], employee_id: 'wp-emp-2', site_id: 'site-1', vehicle_id: 'veh-1', special: 'TD', notes: '' },
  { id: 'a-5',  date: W[2], employee_id: 'wp-emp-1', site_id: 'site-6', vehicle_id: 'veh-1', special: null, notes: '' },
  { id: 'a-6',  date: W[3], employee_id: 'wp-emp-1', site_id: 'site-6', vehicle_id: 'veh-1', special: null, notes: '' },
  // wp-emp-12 SENZA assegnazioni → alert iniziale

  // Squadra Brescia (PM Carlo Falloni)
  { id: 'a-10', date: W[0], employee_id: 'wp-emp-3', site_id: 'site-2', vehicle_id: 'veh-2', special: null, notes: '' },
  { id: 'a-11', date: W[1], employee_id: 'wp-emp-3', site_id: 'site-2', vehicle_id: 'veh-2', special: null, notes: '' },
  { id: 'a-12', date: W[2], employee_id: 'wp-emp-3', site_id: 'site-2', vehicle_id: 'veh-2', special: 'TN', notes: 'Lavoro notturno' },
  { id: 'a-13', date: W[2], employee_id: 'wp-emp-4', site_id: 'site-2', vehicle_id: 'veh-2', special: 'TN', notes: '' },
  { id: 'a-14', date: W[0], employee_id: 'wp-emp-4', site_id: null, vehicle_id: null, special: 'Ferie', notes: 'Ferie programmate' },
  { id: 'a-15', date: W[1], employee_id: 'wp-emp-4', site_id: null, vehicle_id: null, special: 'Ferie', notes: '' },

  // Squadra Milano Sud (PM Anna Degani)
  { id: 'a-20', date: W[0], employee_id: 'wp-emp-5', site_id: 'site-3', vehicle_id: 'veh-3', special: null, notes: 'Manutenzione' },
  { id: 'a-21', date: W[0], employee_id: 'wp-emp-6', site_id: 'site-3', vehicle_id: null,    special: null, notes: '' },
  { id: 'a-22', date: W[0], employee_id: 'wp-emp-7', site_id: 'site-3', vehicle_id: 'veh-4', special: null, notes: '' },
  { id: 'a-23', date: W[1], employee_id: 'wp-emp-5', site_id: null, vehicle_id: null, special: 'Malattia', notes: 'Influenza' },
  { id: 'a-24', date: W[2], employee_id: 'wp-emp-6', site_id: null, vehicle_id: null, special: 'RD', notes: 'Reperibilità diurna' },
  { id: 'a-25', date: W[3], employee_id: 'wp-emp-7', site_id: 'site-5', vehicle_id: 'veh-4', special: null, notes: '' },

  // Squadra Bergamo (PM Anna Degani)
  { id: 'a-30', date: W[1], employee_id: 'wp-emp-8', site_id: 'site-6', vehicle_id: 'veh-5', special: null, notes: '' },
  { id: 'a-31', date: W[1], employee_id: 'wp-emp-9', site_id: 'site-6', vehicle_id: 'veh-5', special: null, notes: '' },
  { id: 'a-32', date: W[2], employee_id: 'wp-emp-9', site_id: null, vehicle_id: null, special: 'Permesso_IA', notes: '4h pomeriggio' },

  // Squadra Verona (PM Paolo Locatelli)
  { id: 'a-40', date: W[0], employee_id: 'wp-emp-10', site_id: 'site-4', vehicle_id: 'veh-6', special: null, notes: 'Manutenzione officine' },
  { id: 'a-41', date: W[0], employee_id: 'wp-emp-11', site_id: 'site-4', vehicle_id: null,    special: null, notes: '' },
  { id: 'a-42', date: W[3], employee_id: 'wp-emp-10', site_id: 'site-4', vehicle_id: 'veh-6', special: 'RN', notes: 'Reperibilità notturna' }
]

// --- Richieste ferie/permessi (in attesa / approvate) -------------------
export const WP_LEAVE_REQUESTS = [
  { id: 'lr-1', employee_id: 'wp-emp-4',  type: 'Ferie',    date_from: W[0], date_to: W[1], full_day: true,  motivation: 'Viaggio famiglia',     status: 'Approved', created_at: '2026-05-15', reason_type: null },
  { id: 'lr-2', employee_id: 'wp-emp-9',  type: 'Permesso', date_from: W[2], date_to: W[2], full_day: false, time_from: '14:00', time_to: '18:00', motivation: 'Visita dentista', status: 'Pending',  created_at: '2026-05-29', reason_type: 'Visita medica' },
  { id: 'lr-3', employee_id: 'wp-emp-11', type: 'Ferie',    date_from: W[5], date_to: W[6], full_day: true,  motivation: 'Riposo',               status: 'Pending',  created_at: '2026-05-28', reason_type: null },
  { id: 'lr-4', employee_id: 'wp-emp-2',  type: 'Permesso', date_from: W[4], date_to: W[4], full_day: false, time_from: '08:00', time_to: '12:00', motivation: 'Corso aggiornamento', status: 'Pending', created_at: '2026-05-30', reason_type: 'Corso di aggiornamento' },
  { id: 'lr-5', employee_id: 'wp-emp-12', type: 'Ferie',    date_from: W[3], date_to: W[6], full_day: true,  motivation: 'Vacanza',              status: 'Pending',  created_at: '2026-05-30', reason_type: null }
]

// --- Note dei dipendenti (dall'APP) -------------------------------------
export const WP_EMPLOYEE_NOTES = [
  { id: 'n-1', employee_id: 'wp-emp-3', text: 'Ducato cassonato GT408ML perde olio: serve controllo officina.', priority: 'high',   seen: false, created_at: '2026-05-30T08:14:00' },
  { id: 'n-2', employee_id: 'wp-emp-1', text: 'Materiale Caravaggio terminato, serve rifornimento.',            priority: 'normal', seen: false, created_at: '2026-05-29T17:30:00' },
  { id: 'n-3', employee_id: 'wp-emp-5', text: 'Cliente Liscate chiede preventivo per upgrade UPS.',             priority: 'normal', seen: true,  created_at: '2026-05-28T11:05:00' },
  { id: 'n-4', employee_id: 'wp-emp-10',text: 'Verona: cliente chiede sopralluogo urgente lunedì.',             priority: 'high',   seen: false, created_at: '2026-05-30T15:42:00' }
]

// --- Inserimento ore (timbrature da APP, in attesa di approvazione PM) --
export const WP_TIME_ENTRIES = [
  { id: 'te-1', employee_id: 'wp-emp-1', date: W[0], azienda: 'TODOS', client_id: 'cli-2', site_id: 'site-1', vehicle_id: 'veh-1', hours: 8,  trasferta: false, pernottamento: false, notturno: false, expenses: [{ desc: 'Pranzo', amount: 12.50 }], notes: '', status: 'Pending' },
  { id: 'te-2', employee_id: 'wp-emp-1', date: W[1], azienda: 'TODOS', client_id: 'cli-2', site_id: 'site-1', vehicle_id: 'veh-1', hours: 9,  trasferta: true,  pernottamento: false, notturno: false, expenses: [{ desc: 'Pedaggio A4', amount: 8.40 }, { desc: 'Pranzo', amount: 15.00 }], notes: 'Trasferta + ritardo per traffico', status: 'Pending' },
  { id: 'te-3', employee_id: 'wp-emp-3', date: W[2], azienda: 'TODOS', client_id: 'cli-3', site_id: 'site-2', vehicle_id: 'veh-2', hours: 8,  trasferta: false, pernottamento: false, notturno: true,  expenses: [], notes: 'Notturno completo', status: 'Pending' },
  { id: 'te-4', employee_id: 'wp-emp-5', date: W[0], azienda: 'TODOS', client_id: 'cli-4', site_id: 'site-3', vehicle_id: 'veh-3', hours: 8,  trasferta: false, pernottamento: false, notturno: false, expenses: [], notes: '', status: 'Approved' },
  { id: 'te-5', employee_id: 'wp-emp-10',date: W[0], azienda: 'TODOS', client_id: 'cli-5', site_id: 'site-4', vehicle_id: 'veh-6', hours: 10, trasferta: true,  pernottamento: true,  notturno: false, expenses: [{ desc: 'Hotel Verona', amount: 85.00 }, { desc: 'Cena', amount: 22.00 }], notes: 'Trasferta + pernotto', status: 'Pending' }
]

// --- Documenti My Todos --------------------------------------------------
// Visibility: 'all' | 'leaders' | 'custom' (con target_employee_ids)
export const WP_DOCS = [
  { id: 'doc-1', title: 'Attestato formazione specifica',          file_url: '#', visibility: 'all',     target_employee_ids: [], expires_at: '2027-03-15', created_at: '2026-04-02T11:43:56' },
  { id: 'doc-2', title: 'Attestato formazione generale',           file_url: '#', visibility: 'all',     target_employee_ids: [], expires_at: '2028-04-02', created_at: '2026-04-02T11:43:23' },
  { id: 'doc-3', title: 'Idoneità sanitaria',                      file_url: '#', visibility: 'all',     target_employee_ids: [], expires_at: '2026-08-15', created_at: '2026-04-02T08:45:24' },
  { id: 'doc-4', title: 'Politica QSA - Rev.1',                    file_url: '#', visibility: 'all',     target_employee_ids: [], expires_at: null,         created_at: '2022-12-28T10:27:44' },
  { id: 'doc-5', title: 'Codice Etico Aziendale - Rev. 01/09/2022',file_url: '#', visibility: 'all',     target_employee_ids: [], expires_at: null,         created_at: '2022-12-28T10:19:49' },
  { id: 'doc-6', title: 'OBBLIGO GREEN PASS',                      file_url: '#', visibility: 'all',     target_employee_ids: [], expires_at: null,         created_at: '2021-10-05T17:41:42' },
  { id: 'doc-7', title: 'Documentazione valutazione rischi COVID-19', file_url: '#', visibility: 'all',  target_employee_ids: [], expires_at: null,         created_at: '2020-04-22T10:45:04' },
  { id: 'doc-8', title: 'Procedura nuova flotta - solo CS',        file_url: '#', visibility: 'leaders', target_employee_ids: [], expires_at: null,         created_at: '2026-05-20T09:00:00' }
]

// --- Buste paga (per APP dipendente) ------------------------------------
export const WP_PAYSLIPS = [
  { id: 'pay-1', employee_id: 'wp-emp-1', period: '2026-04', file_url: '#', uploaded_at: '2026-05-10T10:00:00' },
  { id: 'pay-2', employee_id: 'wp-emp-1', period: '2026-03', file_url: '#', uploaded_at: '2026-04-10T10:00:00' },
  { id: 'pay-3', employee_id: 'wp-emp-1', period: '2026-02', file_url: '#', uploaded_at: '2026-03-10T10:00:00' }
]

// --- Dotazioni (DPI / Attrezzatura assegnata) ---------------------------
export const WP_EQUIPMENT = [
  { id: 'eq-1', employee_id: 'wp-emp-1', type: 'Casco protettivo',    serial: 'CSK-2024-0114', assigned_at: '2024-01-15' },
  { id: 'eq-2', employee_id: 'wp-emp-1', type: 'Scarpe antinfortunistiche', serial: 'AS-44-0221', assigned_at: '2024-01-15' },
  { id: 'eq-3', employee_id: 'wp-emp-1', type: 'Tester elettrico Fluke 117', serial: 'FK-117-9921', assigned_at: '2024-02-10' },
  { id: 'eq-4', employee_id: 'wp-emp-3', type: 'Casco protettivo',    serial: 'CSK-2024-0118', assigned_at: '2024-01-20' },
  { id: 'eq-5', employee_id: 'wp-emp-3', type: 'Imbragatura H',       serial: 'IMB-3344',      assigned_at: '2025-03-12' }
]

// --- Reperibilità (CDZ / Uffici / RADIO) per quadrimestre ---------------
// Quadrimestre = 1 (gen-apr), 2 (mag-ago), 3 (set-dic)
export const WP_ONCALL_SHIFTS = [
  { id: 'oc-1', area: 'CDZ',    employee_id: 'wp-emp-1', date: W[0], quadrimestre: 2, confirmed: true,  notes: '' },
  { id: 'oc-2', area: 'CDZ',    employee_id: 'wp-emp-7', date: W[1], quadrimestre: 2, confirmed: true,  notes: '' },
  { id: 'oc-3', area: 'CDZ',    employee_id: 'wp-emp-1', date: W[2], quadrimestre: 2, confirmed: false, notes: 'Da confermare' },
  { id: 'oc-4', area: 'Uffici', employee_id: 'wp-emp-5', date: W[0], quadrimestre: 2, confirmed: true,  notes: '' },
  { id: 'oc-5', area: 'Uffici', employee_id: 'wp-emp-10',date: W[1], quadrimestre: 2, confirmed: true,  notes: '' },
  { id: 'oc-6', area: 'RADIO',  employee_id: 'wp-emp-3', date: W[3], quadrimestre: 2, confirmed: true,  notes: 'Festivo - magg.' },
  { id: 'oc-7', area: 'RADIO',  employee_id: 'wp-emp-8', date: W[4], quadrimestre: 2, confirmed: false, notes: '' }
]

// --- Festivi (calcolo reperibilità RADIO) -------------------------------
export const WP_HOLIDAYS = [
  { id: 'h-1', date: '2026-01-01', name: 'Capodanno' },
  { id: 'h-2', date: '2026-01-06', name: 'Epifania' },
  { id: 'h-3', date: '2026-04-06', name: 'Pasquetta' },
  { id: 'h-4', date: '2026-04-25', name: 'Liberazione' },
  { id: 'h-5', date: '2026-05-01', name: 'Lavoro' },
  { id: 'h-6', date: '2026-06-02', name: 'Repubblica' },
  { id: 'h-7', date: '2026-08-15', name: 'Ferragosto' },
  { id: 'h-8', date: '2026-11-01', name: 'Tutti i Santi' },
  { id: 'h-9', date: '2026-12-08', name: 'Immacolata' },
  { id: 'h-10', date: '2026-12-25', name: 'Natale' },
  { id: 'h-11', date: '2026-12-26', name: 'S. Stefano' }
]

// ============================================================================
// HELPERS
// ============================================================================

// Verifica scadenze entro N giorni o senza data (per "Vedi Scadenze")
export const getUpcomingExpiries = (daysAhead = 15) => {
  const today = new Date()
  const limit = new Date()
  limit.setDate(today.getDate() + daysAhead)

  const items = []
  WP_VEHICLE_EXPIRIES.forEach(e => {
    const v = WP_VEHICLES.find(x => x.id === e.vehicle_id)
    if (!e.due_date) {
      items.push({ kind: 'mezzo', label: `${v?.plate} - ${e.type}`, due_date: null, status: 'missing', ref: e })
    } else {
      const due = new Date(e.due_date)
      if (due <= limit) items.push({ kind: 'mezzo', label: `${v?.plate} - ${e.type}`, due_date: e.due_date, status: due < today ? 'overdue' : 'soon', ref: e })
    }
  })
  WP_FUEL_CARDS.forEach(c => {
    if (!c.expires_at) {
      items.push({ kind: 'fuel', label: `Tessera ${c.supplier} ${c.number}`, due_date: null, status: 'missing', ref: c })
    } else {
      const due = new Date(c.expires_at)
      if (due <= limit) items.push({ kind: 'fuel', label: `Tessera ${c.supplier} ${c.number}`, due_date: c.expires_at, status: due < today ? 'overdue' : 'soon', ref: c })
    }
  })
  WP_TELEPASS.forEach(t => {
    if (!t.expires_at) {
      items.push({ kind: 'telepass', label: `Telepass ${t.number}`, due_date: null, status: 'missing', ref: t })
    } else {
      const due = new Date(t.expires_at)
      if (due <= limit) items.push({ kind: 'telepass', label: `Telepass ${t.number}`, due_date: t.expires_at, status: due < today ? 'overdue' : 'soon', ref: t })
    }
  })
  return items
}

// Mappa label tipi speciali in pianificazione
export const SPECIAL_LABELS = {
  'Ferie':       { label: 'FERIE',        bg: '#16a34a', color: 'white', icon: '🌴' },
  'Ferie_IA':    { label: 'FERIE (i.a.)', bg: '#fde047', color: '#713f12', icon: '⏳' },
  'Malattia':    { label: 'MALATTIA',     bg: '#dc2626', color: 'white', icon: '🤒' },
  'Infortunio':  { label: 'INFORTUNIO',   bg: '#b91c1c', color: 'white', icon: '⚠️' },
  'Permesso':    { label: 'PERMESSO',     bg: '#0ea5e9', color: 'white', icon: '✋' },
  'Permesso_IA': { label: 'PERM. (i.a.)', bg: '#bae6fd', color: '#0c4a6e', icon: '⏳' },
  'TD':          { label: 'TD',           bg: '#f97316', color: 'white', icon: '☀️' },
  'TN':          { label: 'TN',           bg: '#1e293b', color: 'white', icon: '🌙' },
  'RD':          { label: 'RD',           bg: '#a855f7', color: 'white', icon: '📞' },
  'RN':          { label: 'RN',           bg: '#581c87', color: 'white', icon: '📞' }
}
