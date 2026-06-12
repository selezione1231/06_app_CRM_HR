import React, { useState, useEffect } from 'react'
import { DatabaseZap, Upload, CheckCircle2, AlertTriangle, RefreshCw, ShieldAlert, Lock } from 'lucide-react'
import { ModulePage, ModuleHeader, Card, Pill } from '../shared/ui'
import { supabase, isSupabaseConfigured } from '../../supabaseClient'

// ============================================================================
// ImportDatiModule — SOLO ADMIN
// Import massivo dal gestionale WORK_PRO_TODOS (SQL Server).
// Flusso: backup .bak ripristinato → tabelle esportate in CSV →
// qui ogni CSV viene mappato sulle tabelle Supabase di atterraggio
// con upsert su legacy_id (rilanciabile senza creare duplicati).
// ============================================================================

const CHUNK = 500

// --- Conversioni dai formati del CSV legacy ---------------------------------
const S = (v) => { const s = String(v ?? '').trim(); return s === '' ? null : s }
const I = (v) => { const s = S(v); if (s === null) return null; const n = parseInt(s, 10); return isNaN(n) ? null : n }
const N = (v) => { const s = S(v); if (s === null) return null; const n = parseFloat(s); return isNaN(n) ? null : n }
// Nel gestionale i flag "vero" sono -1 (stile Access/VB6); accettiamo anche 1
const B = (v) => { const n = I(v); return n === 1 || n === -1 }
const D = (v) => { const s = S(v); if (!s) return null; const d = s.slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null }
const TS = (v) => { const s = S(v); if (!s) return null; return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.replace(' ', 'T') : null }

// --- Definizione import: tabella legacy → tabella Supabase ------------------
const IMPORTS = [
  // FASE 1 — Tabelle base
  { phase: '1 · Base', file: 'TB_AZIENDE.csv', table: 'companies', expected: 7,
    map: r => ({ legacy_id: I(r.ORDORD), name: S(r.RAGSOC) || '—', active: B(r.ATTIVO) }) },
  { phase: '1 · Base', file: 'TB_SEDI.csv', table: 'locations', expected: 12,
    map: r => ({ legacy_id: I(r.IDSEDE), name: S(r.SEDE) || '—', active: B(r.ATTIVO) }) },
  { phase: '1 · Base', file: 'TB_PM.csv', table: 'app_users', expected: 67,
    map: r => ({ legacy_id: I(r.IDPM), name: S(r.PM), code: S(r.COD_PM), can_view: B(r.VISUALIZZA), can_login: B(r.LOGIN), admin_console: B(r.CONSOLE_AMM), is_master: B(r.MASTER), deleted: B(r.ELIMINATO), company_legacy_id: I(r.IDAZI), company_filter: S(r.FILTRO_AZI), payslips: B(r.CEDOLINI) }) },
  { phase: '1 · Base', file: 'TB_CLASSI_COSTO.csv', table: 'cost_classes', expected: 26,
    map: r => ({ legacy_id: I(r.ORDORD), code: S(r.CLASSE), description: S(r.DESCRIZIONE), is_vehicle: B(r.AUTOMEZZO), cost: N(r.COSTO), expected_production: N(r.PROD_ATTESA) }) },
  { phase: '1 · Base', file: 'TB_FESTIVI.csv', table: 'holidays', expected: 12,
    map: r => ({ legacy_id: I(r.ORDORD), day: I(r.GIORNO), month: I(r.MESE), description: S(r.DESCRIZIONE), is_radio: B(r.RADIO), removable: B(r.ELIMINABILE), editable: B(r.MODIFICABILE) }) },

  // FASE 2 — Anagrafiche
  { phase: '2 · Anagrafiche', file: 'TB_ANAGRAFE.csv', table: 'contacts', expected: 12148,
    map: r => ({ legacy_id: I(r.IDANA), name: S(r.RAGSOC) || '—', internal_code: S(r.CODINT), address: S(r.INDIRIZZO), zip: S(r.CAP), city: S(r.COMUNE), province: S(r.PRO), country: S(r.NAZIONE), fiscal_code: S(r.CODFISC), vat_number: S(r.PIVA), is_customer: B(r.CLIENTE), is_supplier: B(r.FORNITORE), is_contact: B(r.CONTATTO), is_public_body: B(r.ENTE_PUBBLICO), phone1: S(r.TEL1), phone2: S(r.TEL2), mobile1: S(r.CEL1), mobile2: S(r.CEL2), email: S(r.MAIL), email_admin: S(r.MAIL_AMM), email_pec: S(r.MAIL_PEC), contact_person1: S(r.PERSONA_RIF1), contact_person2: S(r.PERSONA_RIF2), notes: S(r.NOTE), unused: B(r.INUTILIZZATO), company_legacy_id: I(r.IDAZI) }) },
  { phase: '2 · Anagrafiche', file: 'TB_DIPENDENTI.csv', table: 'employees', expected: 674,
    map: r => ({ legacy_id: I(r.IDDIP), last_name: S(r.COGNOME), first_name: S(r.NOME), is_team_leader: B(r.CAPOSQUADRA), vehicle_legacy_id: I(r.IDAUT), app_username: S(r.DIP_USER), code: S(r.CODICE), badge_code: S(r.CODIFICA), rep_cdz: B(r.REP_CDZ), rep_uffici: B(r.REP_UFFICI), rep_radio: B(r.REP_RADIO), squad_legacy_id: I(r.IDSQUA), pm_legacy_id: I(r.IDPM), cost_class_legacy_id: I(r.CLASSE), lunch_enabled: B(r.PASTO), email: S(r.MAIL), email2: S(r.MAIL2), email3: S(r.MAIL3), phone: S(r.TEL), active: B(r.ATTIVO), is_pm: B(r.PM), normal_cost: N(r.COSTO_NORMALE), reduced_cost: N(r.COSTO_RIDOTTA), night_cost: N(r.COSTO_NOTTURNA), is_external: B(r.EST), fiscal_code: S(r.CODFISC), company_legacy_id: I(r.IDAZI), location_legacy_id: I(r.IDSEDE) }) },
  { phase: '2 · Anagrafiche', file: 'TB_CANTIERI.csv', table: 'projects', expected: 6089,
    map: r => ({ legacy_id: I(r.IDCAN), customer_legacy_id: I(r.IDANA), code: S(r.COD_CANTIERE), description: S(r.DESCRIZIONE), notes: S(r.NOTE), hidden: B(r.NASCOSTO), cf_code: S(r.COD_CF), project_type: S(r.TIPO), unused: B(r.INUTILIZZATO), pm_employee_legacy_id: I(r.IDDIP), company_legacy_id: I(r.IDAZI) }) },
  { phase: '2 · Anagrafiche', file: 'TB_AUTOMEZZI.csv', table: 'vehicles', expected: 203,
    map: r => ({ legacy_id: I(r.IDAUT), name: S(r.AUTOMEZZO), plate: S(r.TARGA), out_of_service: B(r.FUORI_USO), date_from: D(r.DAL), date_to: D(r.AL), fuel: S(r.ALIMENTAZIONE), vehicle_type: S(r.TIPO_MEZZO), assigned_employee_legacy_id: I(r.IDDIP), insurance_expiry: D(r.SCAD_ASSICURAZIONE), tax_expiry: D(r.SCAD_BOLLO), inspection_expiry: D(r.SCAD_REVISIONE), last_inspection: D(r.ULTIMA_REVISIONE), service_km: N(r.KM_TAGLIANDO), last_service_km: N(r.ULTIMO_TAGLIANDO), next_service_km: N(r.PROS_TAGLIANDO), summer_tires_deposit: N(r.GOMME_EST_DEPOSITO), summer_tires_notes: S(r.NOTE_EST_DEPOSITO), winter_tires_deposit: N(r.GOMME_INV_DEPOSITO), winter_tires_notes: S(r.NOTE_INV_DEPOSITO), other_equipment: S(r.ALTRE_DOTAZIONI), custom_deadline1: S(r.SCADENZA1), custom_deadline2: S(r.SCADENZA2), custom_deadline1_date: D(r.DATA_SCADENZA1), custom_deadline2_date: D(r.DATA_SCADENZA2), dismissed: B(r.DISMESSO), location: S(r.SEDE), extinguisher_number: S(r.NR_ESTINTORE), first_aid_kit_number: S(r.NR_CASSETTA), extinguisher_expiry: D(r.SCAD_ESTINTORE), first_aid_kit_expiry: D(r.SCAD_CASSETTA), company_legacy_id: I(r.IDAZI), registration_year: I(r.ANNO_IMMATRICOLAZIONE), typology: S(r.TIPOLOGIA), albo_registered: B(r.ISCRIZIONE_ALBO), visirun: S(r.VISIRUN) }) },

  // FASE 3 — Dati operativi (volumi grandi)
  { phase: '3 · Operativo', file: 'TB_MOVIMENTI.csv', table: 'time_entries', expected: 120479,
    map: r => ({ legacy_id: I(r.ORDORD), employee_legacy_id: I(r.IDOPE), time_from: S(r.DALLE), time_to: S(r.ALLE), work_date: D(r.DATA), notes: S(r.NOTE),
      expenses: [1, 2, 3, 4].map(i => ({ label: S(r['SPESA' + i]), amount: N(r['IMPORTO' + i]) })).filter(e => e.label || e.amount),
      project_legacy_id: I(r.IDCAN), contact_legacy_id: I(r.IDANA), approved: B(r.APPROVATO),
      flags: { man: I(r.MAN), s: [1,2,3,4,5,6,7,8,9,10].map(i => S(r['S' + i])).filter(Boolean) },
      overnight: B(r.PERNOTTAMENTO), total_hours: N(r.TOTORE), squad_legacy_id: I(r.IDSQUA), pm_legacy_id: I(r.IDPM), transfer: B(r.TRASFERTA), extra: N(r.EXTRA), vehicle_legacy_id: I(r.IDMEZ), night: B(r.NOTTURNO) }) },
  { phase: '3 · Operativo', file: 'TB_PIANIFICA.csv', table: 'planning_entries', expected: 195804,
    map: r => ({ legacy_id: I(r.ORDORD), plan_date: D(r.DATA), employee_legacy_id: I(r.IDDIP), squad_legacy_id: I(r.IDSQUA), pm_legacy_id: I(r.IDPM), project_legacy_id: I(r.IDCAN), vehicle_legacy_id: I(r.IDAUT), rental_legacy_id: I(r.IDNOLEGGIO), notes: S(r.NOTE), is_team_leader: B(r.CAPOSQUADRA), det_count: I(r.NDET),
      specials: [1,2,3,4,5].map(i => S(r['SPECIALE' + i])).filter(Boolean),
      transfer_notes: S(r.TRASFERTA_NOTE), components: S(r.COMPONENTI), rental_notes: S(r.NOTE_NOLEGGIO) }) },
  { phase: '3 · Operativo', file: 'TB_RICHIESTE.csv', table: 'requests', expected: 8191,
    map: r => ({ legacy_id: I(r.ORDORD), employee_legacy_id: I(r.IDDIP), date_from: D(r.DAL), date_to: D(r.AL), time_from: S(r.DALLE), time_to: S(r.ALLE), reason: S(r.MOTIVO), full_day: B(r.GIORNATA), approved: I(r.APPROVATO), approved_at: TS(r.DATA_APPROVAZIONE), mail_sent: B(r.MAIL_INVIATA), request_type: S(r.TIPO), is_paid_leave: B(r.FERIE), pm_legacy_id: I(r.IDPM), inserted_at: TS(r.DATAINS) }) },

  // FASE 4 — Mezzi: satelliti
  { phase: '4 · Mezzi', file: 'TB_AUTOMEZZI_CARB.csv', table: 'vehicle_fuel_cards', expected: 180,
    map: r => ({ legacy_id: I(r.ORDORD), vehicle_legacy_id: I(r.IDAUT), card_number: S(r.NR_CARD), supplier: S(r.DISTRIBUTORE), notes: S(r.NOTE), expiry_date: D(r.DATA_SCADENZA) }) },
  { phase: '4 · Mezzi', file: 'TB_AUTOMEZZI_GOMME.csv', table: 'vehicle_tires', expected: 351,
    map: r => ({ legacy_id: I(r.ORDORD), vehicle_legacy_id: I(r.IDAUT), quantity: I(r.QTA), serial: S(r.MATRICOLA), tire_type: S(r.TIPO), notes: S(r.NOTE), purchase_date: D(r.DATA_ACQUISTO), install_date: D(r.DATA_INSTALLAZIONE), change_date: D(r.DATA_CAMBIO), wear: I(r.USURA), in_use: B(r.INUSO), deposit: S(r.DEPOSITO) }) },
  { phase: '4 · Mezzi', file: 'TB_AUTOMEZZI_REV.csv', table: 'vehicle_inspections', expected: 51,
    map: r => ({ legacy_id: I(r.ORDORD), vehicle_legacy_id: I(r.IDAUT), inspection_date: D(r.DATA), description: S(r.DESCRIZ), pm: S(r.PM), blocked: B(r.BLOCCATO) }) },
  { phase: '4 · Mezzi', file: 'TB_AUTOMEZZI_TELEPASS.csv', table: 'vehicle_tolls', expected: 174,
    map: r => ({ legacy_id: I(r.ORDORD), device_type: S(r.TIPO), card_number: S(r.NR_CARD), vehicle_legacy_id: I(r.IDAUT), notes: S(r.NOTE), expiry_date: D(r.DATA_SCADENZA) }) },
  { phase: '4 · Mezzi', file: 'TB_CATEGORIE_INTERVENTI.csv', table: 'maintenance_categories', expected: 5,
    map: r => ({ legacy_id: I(r.IDINT), name: S(r.INTERVENTO) }) },
  { phase: '4 · Mezzi', file: 'TB_MEZZI_INTERVENTI.csv', table: 'vehicle_maintenance', expected: 2736,
    map: r => ({ legacy_id: I(r.ORDORD), supplier_legacy_id: I(r.IDANA), intervention_date: D(r.DATA), amount: N(r.IMPORTO), description: S(r.DESCRIZIONE), vehicle_legacy_id: I(r.IDMEZ), notes: S(r.NOTE), category_legacy_id: I(r.IDINT) }) },
  { phase: '4 · Mezzi', file: 'TB_MEZZI_NOLEGGIO.csv', table: 'rental_equipment', expected: 65,
    map: r => ({ legacy_id: I(r.IDMEZZO), name: S(r.MEZZO), supplier_legacy_id: I(r.IDANA) }) },

  // FASE 5 — DPI e attrezzature
  { phase: '5 · DPI/Attrezz.', file: 'TB_CATEGORIE_DPI.csv', table: 'ppe_categories', expected: 50,
    map: r => ({ legacy_id: I(r.ORDORD), name: S(r.CATEGORIA), months: I(r.MESI), family: S(r.FAMIGLIA) }) },
  { phase: '5 · DPI/Attrezz.', file: 'TB_POSIZIONI_DPI.csv', table: 'ppe_positions', expected: 8,
    map: r => ({ legacy_id: I(r.ORDORD), name: S(r.POSIZIONE) }) },
  { phase: '5 · DPI/Attrezz.', file: 'TB_DIPENDENTI_DPI.csv', table: 'employee_ppe', expected: 1049,
    map: r => ({ legacy_id: I(r.ORDORD), employee_legacy_id: I(r.IDDIP), description: S(r.DESCRIZIONE), serial_number: S(r.N_SERIE), purchase_date: D(r.DATA_ACQUISTO), delivery_date: D(r.DATA_ASSEGNAZIONE), last_maintenance: D(r.ULTIMA_MANUTENZIONE), next_maintenance: D(r.PROSSIMA_MANUTENZIONE), end_of_life: B(r.FINE_VITA), category_legacy_id: I(r.IDCAT), position_legacy_id: I(r.IDPOS), photo1: S(r.FOTO1), photo2: S(r.FOTO2), photo3: S(r.FOTO3) }) },
  { phase: '5 · DPI/Attrezz.', file: 'TB_CATEGORIE_ATTREZZATURE.csv', table: 'equipment_categories', expected: 10,
    map: r => ({ legacy_id: I(r.ORDORD), name: S(r.CATEGORIA), months: I(r.MESI), family: S(r.FAMIGLIA) }) },
  { phase: '5 · DPI/Attrezz.', file: 'TB_ATTREZZATURE_NEW.csv', table: 'equipment', expected: 19,
    map: r => ({ legacy_id: I(r.IDATT), serial_number: S(r.N_SERIE), description: S(r.DESCRIZIONE), purchase_date: D(r.DATA_ACQ), notes: S(r.NOTE), position_legacy_id: I(r.IDPOS), category_legacy_id: I(r.IDCAT), dismissed: B(r.DISMESSA), employee_legacy_id: I(r.IDDIP), previous_employee_legacy_id: I(r.IDDIP_PRE), photo1: S(r.FOTO1), photo2: S(r.FOTO2), photo3: S(r.FOTO3) }) },
  { phase: '5 · DPI/Attrezz.', file: 'TB_ATTREZZATURE.csv', table: 'equipment_allocations', expected: 1841,
    map: r => ({ legacy_id: I(r.ORDORD), employee_legacy_id: I(r.IDDIP), sku: S(r.CODART), description: S(r.ARTICOLO), quantity: I(r.QTA) }) },

  // FASE 6 — Documenti e scadenze
  { phase: '6 · Doc/Scadenze', file: 'TB_TIPOLOGIA_DOCUMENTI.csv', table: 'document_types', expected: 22,
    map: r => ({ legacy_id: I(r.ORDORD), name: S(r.TIPOLOGIA) }) },
  { phase: '6 · Doc/Scadenze', file: 'TB_DOCUMENTI.csv', table: 'documents', expected: 11757,
    map: r => ({ legacy_id: I(r.ORDORD), path: S(r.PATH), description: S(r.DESCRIZIONE), inserted_at: TS(r.DATA_INS), visible_to: S(r.VISIBILE_A), expiry_date: D(r.DATA_SCADENZA), type_legacy_id: I(r.IDTIPO), employee_legacy_id: I(r.IDDIP), original_file: S(r.FILEORIG) }) },
  { phase: '6 · Doc/Scadenze', file: 'TB_SCADENZIARIO_DET.csv', table: 'deadlines', expected: 4006,
    map: r => ({ legacy_id: I(r.ORDORD), master_id: I(r.IDSCAD), machine_legacy_id: I(r.IDMAC), employee_legacy_id: I(r.IDDIP), due_date: D(r.SCADENZA), description: S(r.DESCRIZIONE), done: B(r.ESEGUITO), typology: I(r.TIPOLOGIA), notes: S(r.NOTE), unit: S(r.UM), quantity: N(r.QTA), ppe_legacy_id: I(r.IDDPI), attachment: S(r.ALLEGATO), withdrawn: B(r.RITIRATO), withdrawal_notes: S(r.NOTE_RITIRO), done_at: D(r.DATAESEC), validity_months: I(r.VALIDITA), status: S(r.STATO), is_numeric: B(r.NUMERICO), numeric_due: N(r.SCADENZA2), contact_legacy_id: I(r.IDANA), amount: N(r.IMPORTO), reference: S(r.RIFERIMENTO), equipment_legacy_id: I(r.IDATT),
      extra: { idlotto: I(r.IDLOTTO), idfundet: I(r.IDFUNDET), idscaddet: I(r.IDSCADDET), idscadpre: I(r.IDSCADPRE), intest: I(r.INTEST), idope: I(r.IDOPE), dacar: I(r.DACAR), idsegn: I(r.IDSEGN) } }) }
]

const PHASES = [...new Set(IMPORTS.map(i => i.phase))]

export default function ImportDatiModule({ userRoles = [], user }) {
  const isAdmin = userRoles.includes('admin')
  const [counts, setCounts] = useState({})        // table → righe già presenti
  const [status, setStatus] = useState({})        // file → { state, done, total, errors }
  const [busyFile, setBusyFile] = useState(null)

  const refreshCounts = async () => {
    if (!isSupabaseConfigured) return
    const out = {}
    await Promise.all(IMPORTS.map(async (cfg) => {
      const { count, error } = await supabase.from(cfg.table).select('*', { count: 'exact', head: true })
      out[cfg.table] = error ? `err: ${error.message.slice(0, 40)}` : count
    }))
    setCounts(out)
  }
  useEffect(() => { if (isAdmin) refreshCounts() }, [isAdmin])

  const runImport = async (cfg, file) => {
    setBusyFile(cfg.file)
    setStatus(s => ({ ...s, [cfg.file]: { state: 'parsing', done: 0, total: 0, errors: [] } }))
    try {
      const XLSX = await import('xlsx')
      // raw: true → le date del CSV restano stringhe (niente seriali Excel),
      // le conversioni le facciamo noi con D()/TS()
      const wb = XLSX.read(await file.arrayBuffer(), { raw: true })
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: true })
      const mapped = rows.map(cfg.map).filter(r => r.legacy_id !== null && r.legacy_id !== undefined)
      if (mapped.length === 0) throw new Error('Nessuna riga valida: controlla che il file sia ' + cfg.file)

      const errors = []
      let done = 0
      setStatus(s => ({ ...s, [cfg.file]: { state: 'importing', done: 0, total: mapped.length, errors } }))
      for (let i = 0; i < mapped.length; i += CHUNK) {
        const chunk = mapped.slice(i, i + CHUNK)
        const { error } = await supabase.from(cfg.table).upsert(chunk, { onConflict: 'legacy_id' })
        if (error) {
          errors.push(`Righe ${i + 1}-${i + chunk.length}: ${error.message}`)
          if (errors.length >= 3) throw new Error('Troppi errori, import interrotto. ' + errors.join(' | '))
        } else {
          done += chunk.length
        }
        setStatus(s => ({ ...s, [cfg.file]: { state: 'importing', done, total: mapped.length, errors: [...errors] } }))
      }
      setStatus(s => ({ ...s, [cfg.file]: { state: errors.length ? 'partial' : 'done', done, total: mapped.length, errors } }))
      await refreshCounts()
    } catch (e) {
      setStatus(s => ({ ...s, [cfg.file]: { ...(s[cfg.file] || {}), state: 'error', errors: [e.message] } }))
    } finally {
      setBusyFile(null)
    }
  }

  if (!isAdmin) {
    return (
      <ModulePage>
        <Card style={{ padding: '40px', textAlign: 'center' }}>
          <Lock size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <h3 style={{ margin: '0 0 6px' }}>Area riservata</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>L'import dei dati è disponibile solo per gli amministratori.</p>
        </Card>
      </ModulePage>
    )
  }

  return (
    <ModulePage>
      <ModuleHeader
        icon={DatabaseZap}
        title="Import dati dal gestionale (Admin)"
        subtitle="Carica i CSV esportati da WORK_PRO_TODOS. Ogni import è rilanciabile: le righe già caricate vengono aggiornate, non duplicate."
        actions={
          <button className="btn btn-secondary" onClick={refreshCounts}>
            <RefreshCw size={14} /> Aggiorna conteggi
          </button>
        }
      />

      <Card style={{ padding: '12px 16px', marginBottom: '16px', borderLeft: '3px solid #d97706', background: 'rgba(217,119,6,0.06)' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.8rem' }}>
          <ShieldAlert size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Procedura:</strong> i CSV vanno generati dal backup SQL Server (cartella <code>C:\App\sql_restore\export\</code>).
            Importa nell'ordine delle fasi (1 → 6): le tabelle base servono a risolvere i riferimenti delle successive.
            I file grandi (movimenti ~120k righe, pianificazione ~195k) impiegano qualche minuto: non chiudere la pagina.
          </div>
        </div>
      </Card>

      {PHASES.map(phase => (
        <div key={phase} style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
            Fase {phase}
          </h3>
          <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '10px' }}>
            {IMPORTS.filter(c => c.phase === phase).map(cfg => {
              const st = status[cfg.file]
              const inDb = counts[cfg.table]
              const complete = typeof inDb === 'number' && inDb >= cfg.expected
              return (
                <Card key={cfg.file} style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.82rem' }}>{cfg.file.replace('.csv', '')}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>→ {cfg.table} · attese ~{cfg.expected.toLocaleString('it-IT')}</div>
                    </div>
                    <Pill
                      color={complete ? '#16a34a' : (inDb > 0 ? '#d97706' : 'var(--text-muted)')}
                      bg={complete ? 'rgba(22,163,74,0.12)' : (inDb > 0 ? 'rgba(217,119,6,0.12)' : 'rgba(148,163,184,0.12)')}
                    >
                      {inDb === undefined ? '…' : `${Number(inDb).toLocaleString('it-IT')} in DB`}
                    </Pill>
                  </div>

                  {st && (
                    <div style={{ marginTop: 8 }}>
                      {(st.state === 'importing' || st.state === 'parsing') && (
                        <>
                          <div style={{ height: 6, background: 'var(--bg-app)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: st.total ? `${Math.round(st.done / st.total * 100)}%` : '8%', background: 'var(--primary)', transition: 'width 0.3s' }} />
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 }}>
                            {st.state === 'parsing' ? 'Lettura file…' : `${st.done.toLocaleString('it-IT')} / ${st.total.toLocaleString('it-IT')} righe`}
                          </div>
                        </>
                      )}
                      {st.state === 'done' && (
                        <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={12} /> Importate {st.done.toLocaleString('it-IT')} righe
                        </div>
                      )}
                      {(st.state === 'error' || st.state === 'partial') && (
                        <div style={{ fontSize: '0.7rem', color: '#dc2626', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                          <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                          <span>{st.errors.join(' · ').slice(0, 220)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <label
                    className="btn btn-secondary"
                    style={{ marginTop: 10, padding: '6px 12px', fontSize: '0.74rem', cursor: busyFile ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: busyFile && busyFile !== cfg.file ? 0.4 : 1 }}
                  >
                    <Upload size={13} /> Carica {cfg.file}
                    <input
                      type="file" accept=".csv,.xlsx" disabled={!!busyFile}
                      style={{ display: 'none' }}
                      onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) runImport(cfg, f) }}
                    />
                  </label>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </ModulePage>
  )
}
