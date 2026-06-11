import React, { useState, useMemo, useEffect } from 'react'
import {
  ShieldCheck, HardHat, HeartPulse, AlertTriangle, FileText,
  CheckCircle2, Clock, XCircle, Plus, ChevronRight, Users,
  Package, Wrench, Activity
} from 'lucide-react'
import { ExportButton } from '../shared/ui'

// ============================================================================
// HSEModule — Health, Safety & Environment
// Viste: Cruscotto | DPI | Sorveglianza Sanitaria | Incidenti/Near Miss | DVR
// ============================================================================

const EMPLOYEES = [
  { id: 'demo-emp-1', name: 'Mario Rossi',       dept: 'Tech',           medical_expiry: '2026-08-15', safety_expiry: '2027-02-10' },
  { id: 'demo-emp-2', name: 'Laura Bianchi',     dept: 'Commerciale',    medical_expiry: '2027-06-18', safety_expiry: '2026-05-10' },
  { id: 'demo-emp-3', name: 'Alessandro Neri',   dept: 'HR',             medical_expiry: '2026-05-20', safety_expiry: '2028-09-22' },
  { id: 'demo-emp-4', name: 'Sofia Gialli',      dept: 'Amministrazione',medical_expiry: '2027-09-01', safety_expiry: '2028-10-15' },
  { id: 'demo-emp-5', name: 'Valerio Verdi',     dept: 'Tech',           medical_expiry: '2026-06-02', safety_expiry: '2026-05-28' }
]

const DPI_CATALOG = [
  { id: 'dpi-1', type: 'Casco di protezione',   category: 'Testa',   norm: 'EN 397', risk_level: 'Alto' },
  { id: 'dpi-2', type: 'Scarpe antinfortunio',   category: 'Piedi',   norm: 'EN ISO 20345', risk_level: 'Alto' },
  { id: 'dpi-3', type: 'Guanti da lavoro',       category: 'Mani',    norm: 'EN 388', risk_level: 'Medio' },
  { id: 'dpi-4', type: 'Imbracatura anticaduta', category: 'Corpo',   norm: 'EN 361', risk_level: 'Alto' },
  { id: 'dpi-5', type: 'Occhiali protettivi',    category: 'Occhi',   norm: 'EN 166', risk_level: 'Medio' },
  { id: 'dpi-6', type: 'Cuffie antirumore',      category: 'Udito',   norm: 'EN 352', risk_level: 'Alto' },
  { id: 'dpi-7', type: 'Gilet alta visibilità',  category: 'Corpo',   norm: 'EN ISO 20471', risk_level: 'Medio' },
  { id: 'dpi-8', type: 'Mascherina FFP2',        category: 'Respiratorio', norm: 'EN 149', risk_level: 'Medio' }
]

const LS_DPI = 'todos-hse-dpi'
const LS_INCIDENTS = 'todos-hse-incidents'

const INITIAL_DPI_ASSIGNMENTS = [
  { id: 'da-1', employee_id: 'demo-emp-1', dpi_id: 'dpi-1', assigned_at: '2024-01-15', expiry: '2026-01-15', status: 'scaduto' },
  { id: 'da-2', employee_id: 'demo-emp-1', dpi_id: 'dpi-2', assigned_at: '2024-01-15', expiry: '2027-01-15', status: 'valido' },
  { id: 'da-3', employee_id: 'demo-emp-3', dpi_id: 'dpi-3', assigned_at: '2023-03-10', expiry: '2025-03-10', status: 'scaduto' },
  { id: 'da-4', employee_id: 'demo-emp-5', dpi_id: 'dpi-4', assigned_at: '2026-05-02', expiry: '2027-05-02', status: 'valido' },
  { id: 'da-5', employee_id: 'demo-emp-2', dpi_id: 'dpi-7', assigned_at: '2024-06-01', expiry: '2026-06-01', status: 'in-scadenza' }
]

const INITIAL_INCIDENTS = [
  { id: 'inc-1', date: '2026-04-12', type: 'Near Miss', severity: 'Bassa', location: 'Cantiere BG24043', description: 'Operatore ha perso l\'equilibrio su scala mobile senza protezioni. Nessuna lesione.', employee_involved: 'Gianni Corleto', corrective_action: 'Installate protezioni laterali su tutte le scale. Briefing sicurezza squadra.', status: 'Chiuso' },
  { id: 'inc-2', date: '2026-05-22', type: 'Infortunio', severity: 'Media', location: 'Magazzino Milano', description: 'Contusione al piede sinistro durante carico materiali. Prognosi 5 giorni.', employee_involved: 'Roberto Corleto', corrective_action: 'Revisione procedura carico/scarico. DPI obbligatorio per tutti.', status: 'Aperto' },
  { id: 'inc-3', date: '2026-06-01', type: 'Near Miss', severity: 'Alta', location: 'Cantiere BS25124', description: 'Cavo elettrico non protetto trovato in zona di lavoro. Nessun contatto.', employee_involved: 'Luca Testa', corrective_action: 'Ispezione elettrica urgente ordinata. Area temporaneamente chiusa.', status: 'In lavorazione' }
]

function loadFromLS(key, defaultVal) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : defaultVal } catch { return defaultVal }
}
function saveToLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* no-op */ }
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
}

function getExpiryStatus(dateStr) {
  const days = getDaysUntil(dateStr)
  if (days === null) return 'nd'
  if (days < 0) return 'scaduto'
  if (days <= 30) return 'in-scadenza'
  return 'valido'
}

const STATUS_COLORS = {
  'valido':      { color: '#16a34a', bg: '#f0fdf4', label: 'Valido' },
  'in-scadenza': { color: '#d97706', bg: '#fffbeb', label: 'In scadenza' },
  'scaduto':     { color: '#ef4444', bg: '#fef2f2', label: 'Scaduto' },
  'nd':          { color: '#94a3b8', bg: '#f8fafc', label: 'N.D.' }
}

const SEVERITY_COLORS = {
  'Bassa': { color: '#16a34a', bg: '#f0fdf4' },
  'Media': { color: '#d97706', bg: '#fffbeb' },
  'Alta':  { color: '#ef4444', bg: '#fef2f2' }
}

const TABS = [
  { id: 'dashboard', label: 'Cruscotto',          icon: Activity },
  { id: 'certs',     label: 'Certificazioni',     icon: CheckCircle2 },
  { id: 'medical',   label: 'Sorveglianza San.',  icon: HeartPulse },
  { id: 'dpi',       label: 'DPI',                icon: HardHat },
  { id: 'incidents', label: 'Near Miss/Infortuni',icon: AlertTriangle },
  { id: 'dvr',       label: 'DVR & Procedure',    icon: FileText }
]

// Certificazioni / abilitazioni del personale (demo)
const CERTIFICATIONS = [
  { id: 'cert-1', employee_id: 'demo-emp-1', name: 'Corso Sicurezza Generale + Specifica (rischio alto)', achieved: '2023-02-10', expiry: '2028-02-10' },
  { id: 'cert-2', employee_id: 'demo-emp-1', name: 'Preposto',                                            achieved: '2024-05-18', expiry: '2026-05-18' },
  { id: 'cert-3', employee_id: 'demo-emp-2', name: 'Primo Soccorso (Gruppo B)',                           achieved: '2024-09-12', expiry: '2027-09-12' },
  { id: 'cert-4', employee_id: 'demo-emp-3', name: 'Antincendio (rischio medio)',                         achieved: '2022-11-03', expiry: '2025-11-03' },
  { id: 'cert-5', employee_id: 'demo-emp-5', name: 'PLE — Piattaforme di Lavoro Elevabili',               achieved: '2023-06-21', expiry: '2028-06-21' },
  { id: 'cert-6', employee_id: 'demo-emp-5', name: 'Lavori in quota + DPI III cat.',                      achieved: '2024-03-30', expiry: '2026-06-15' },
  { id: 'cert-7', employee_id: 'demo-emp-4', name: 'Corso Sicurezza Generale (rischio basso)',            achieved: '2023-01-15', expiry: '2028-01-15' }
]

export default function HSEModule({ view = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(view)
  useEffect(() => { setActiveTab(view) }, [view])
  const [dpiAssignments, setDpiAssignments] = useState(() => loadFromLS(LS_DPI, INITIAL_DPI_ASSIGNMENTS))
  const [incidents, setIncidents] = useState(() => loadFromLS(LS_INCIDENTS, INITIAL_INCIDENTS))
  const [showIncidentForm, setShowIncidentForm] = useState(false)
  const [incidentForm, setIncidentForm] = useState({ date: '', type: 'Near Miss', severity: 'Bassa', location: '', description: '', employee_involved: '', corrective_action: '' })

  const stats = useMemo(() => {
    const medScaduti = EMPLOYEES.filter(e => getExpiryStatus(e.medical_expiry) === 'scaduto').length
    const medInScad = EMPLOYEES.filter(e => getExpiryStatus(e.medical_expiry) === 'in-scadenza').length
    const safScaduti = EMPLOYEES.filter(e => getExpiryStatus(e.safety_expiry) === 'scaduto').length
    const dpiScaduti = dpiAssignments.filter(d => getExpiryStatus(d.expiry) === 'scaduto').length
    const incidentiAperti = incidents.filter(i => i.status !== 'Chiuso').length
    return { medScaduti, medInScad, safScaduti, dpiScaduti, incidentiAperti }
  }, [dpiAssignments, incidents])

  const handleAddIncident = () => {
    if (!incidentForm.date || !incidentForm.description) return
    const newInc = { ...incidentForm, id: 'inc-' + Date.now(), status: 'Aperto' }
    const updated = [newInc, ...incidents]
    setIncidents(updated)
    saveToLS(LS_INCIDENTS, updated)
    setShowIncidentForm(false)
    setIncidentForm({ date: '', type: 'Near Miss', severity: 'Bassa', location: '', description: '', employee_involved: '', corrective_action: '' })
  }

  const getDpiInfo = (dpiId) => DPI_CATALOG.find(d => d.id === dpiId)
  const getEmpName = (empId) => EMPLOYEES.find(e => e.id === empId)?.name || empId

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '8px 12px', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }
  const selectStyle = { ...inputStyle, background: 'var(--bg-card, white)' }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid var(--border-color, #e2e8f0)' }}>
        <ShieldCheck size={30} style={{ color: 'var(--primary, #A82238)', marginTop: 2 }} />
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary, #1e293b)', margin: 0 }}>HSE — Health, Safety & Environment</h1>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.84rem', margin: '4px 0 0' }}>Gestione DPI, sorveglianza sanitaria, incidenti e documentazione sicurezza.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-app, #f1f5f9)', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
              border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: active ? 700 : 500,
              background: active ? 'white' : 'transparent',
              color: active ? 'var(--primary, #A82238)' : 'var(--text-muted, #64748b)',
              boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}>
              <Icon size={14} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* ===== DASHBOARD ===== */}
      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
            {[
              { label: 'Visite scadute', value: stats.medScaduti, color: '#ef4444', icon: XCircle },
              { label: 'Visite in scad.', value: stats.medInScad, color: '#d97706', icon: Clock },
              { label: 'Corsi scaduti', value: stats.safScaduti, color: '#ef4444', icon: XCircle },
              { label: 'DPI scaduti', value: stats.dpiScaduti, color: '#ef4444', icon: HardHat },
              { label: 'Incidenti aperti', value: stats.incidentiAperti, color: '#7c3aed', icon: AlertTriangle }
            ].map(k => {
              const Icon = k.icon
              return (
                <div key={k.label} style={{ background: 'var(--bg-card, white)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '8px', background: k.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={17} style={{ color: k.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: k.value > 0 ? k.color : '#16a34a', lineHeight: 1 }}>{k.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>{k.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary, #1e293b)', marginBottom: '12px' }}>Stato conformità per dipendente</h3>
          <div style={{ background: 'var(--bg-card, white)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--bg-app, #f8fafc)' }}>
                {['Dipendente', 'Reparto', 'Visita Medica', 'Corso Sicurezza', 'DPI assegnati'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {EMPLOYEES.map((emp, idx) => {
                  const medStatus = getExpiryStatus(emp.medical_expiry)
                  const safStatus = getExpiryStatus(emp.safety_expiry)
                  const empDpi = dpiAssignments.filter(d => d.employee_id === emp.id)
                  const medCfg = STATUS_COLORS[medStatus]
                  const safCfg = STATUS_COLORS[safStatus]
                  return (
                    <tr key={emp.id} style={{ borderBottom: idx < EMPLOYEES.length - 1 ? '1px solid var(--border-color, #f1f5f9)' : 'none' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary, #1e293b)' }}>{emp.name}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>{emp.dept}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, background: medCfg.bg, color: medCfg.color }}>
                          {medCfg.label} · {emp.medical_expiry}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, background: safCfg.bg, color: safCfg.color }}>
                          {safCfg.label} · {emp.safety_expiry}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'var(--text-secondary, #475569)' }}>
                        {empDpi.length > 0 ? `${empDpi.length} DPI assegnati` : <span style={{ color: '#94a3b8' }}>Nessuno</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== CERTIFICAZIONI ===== */}
      {activeTab === 'certs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary, #1e293b)', margin: 0 }}>Certificazioni e abilitazioni del personale</h3>
            <ExportButton
              filename="certificazioni_personale"
              rows={CERTIFICATIONS.map(c => ({
                'Dipendente': getEmpName(c.employee_id), 'Certificazione': c.name,
                'Conseguita il': c.achieved, 'Scadenza': c.expiry,
                'Stato': STATUS_COLORS[getExpiryStatus(c.expiry)].label
              }))}
            />
          </div>
          <div style={{ background: 'var(--bg-card, white)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--bg-app, #f8fafc)' }}>
                {['Dipendente', 'Certificazione', 'Conseguita il', 'Scadenza', 'Stato'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {CERTIFICATIONS.map((cert, idx) => {
                  const status = getExpiryStatus(cert.expiry)
                  const sCfg = STATUS_COLORS[status]
                  const days = getDaysUntil(cert.expiry)
                  return (
                    <tr key={cert.id} style={{ borderBottom: idx < CERTIFICATIONS.length - 1 ? '1px solid var(--border-color, #f1f5f9)' : 'none' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '0.84rem' }}>{getEmpName(cert.employee_id)}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.83rem' }}>{cert.name}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>{cert.achieved}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.82rem' }}>
                        {cert.expiry}
                        {days !== null && <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: days < 0 ? '#ef4444' : days <= 30 ? '#d97706' : '#94a3b8' }}>({days < 0 ? `${Math.abs(days)}gg scaduta` : `${days}gg`})</span>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, background: sCfg.bg, color: sCfg.color }}>{sCfg.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== DPI ===== */}
      {activeTab === 'dpi' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary, #1e293b)', margin: 0 }}>Assegnazioni DPI</h3>
            <ExportButton
              filename="elenco_dpi"
              rows={dpiAssignments.map(da => {
                const dpi = getDpiInfo(da.dpi_id)
                return {
                  'Dipendente': getEmpName(da.employee_id), 'DPI': dpi?.type ?? da.dpi_id,
                  'Categoria': dpi?.category ?? '', 'Norma': dpi?.norm ?? '',
                  'Assegnato il': da.assigned_at, 'Scadenza': da.expiry,
                  'Stato': STATUS_COLORS[getExpiryStatus(da.expiry)].label
                }
              })}
            />
          </div>
          <div style={{ background: 'var(--bg-card, white)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--bg-app, #f8fafc)' }}>
                {['Dipendente', 'DPI', 'Categoria', 'Assegnato il', 'Scadenza', 'Stato'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {dpiAssignments.map((da, idx) => {
                  const dpi = getDpiInfo(da.dpi_id)
                  const status = getExpiryStatus(da.expiry)
                  const sCfg = STATUS_COLORS[status]
                  return (
                    <tr key={da.id} style={{ borderBottom: idx < dpiAssignments.length - 1 ? '1px solid var(--border-color, #f1f5f9)' : 'none' }}>
                      <td style={{ padding: '11px 14px', fontWeight: 600, fontSize: '0.83rem' }}>{getEmpName(da.employee_id)}</td>
                      <td style={{ padding: '11px 14px', fontSize: '0.83rem' }}>{dpi?.type}</td>
                      <td style={{ padding: '11px 14px', fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>{dpi?.category}</td>
                      <td style={{ padding: '11px 14px', fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>{da.assigned_at}</td>
                      <td style={{ padding: '11px 14px', fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>{da.expiry}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, background: sCfg.bg, color: sCfg.color }}>{sCfg.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary, #1e293b)', marginBottom: '12px' }}>Catalogo DPI aziendali</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {DPI_CATALOG.map(dpi => (
              <div key={dpi.id} style={{ background: 'var(--bg-card, white)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '10px', padding: '14px', display: 'flex', gap: '10px' }}>
                <HardHat size={18} style={{ color: 'var(--primary, #A82238)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-primary, #1e293b)', marginBottom: '3px' }}>{dpi.type}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>{dpi.category} · {dpi.norm}</div>
                  <div style={{ fontSize: '0.68rem', marginTop: '4px', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', background: dpi.risk_level === 'Alto' ? '#fef2f2' : '#fffbeb', color: dpi.risk_level === 'Alto' ? '#ef4444' : '#d97706', fontWeight: 600 }}>
                    Rischio {dpi.risk_level}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== SORVEGLIANZA SANITARIA ===== */}
      {activeTab === 'medical' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <ExportButton
              filename="sorveglianza_sanitaria"
              rows={EMPLOYEES.map(emp => ({
                'Dipendente': emp.name, 'Reparto': emp.dept,
                'Scadenza visita medica': emp.medical_expiry,
                'Stato visita': STATUS_COLORS[getExpiryStatus(emp.medical_expiry)].label,
                'Scadenza corso sicurezza': emp.safety_expiry,
                'Stato corso': STATUS_COLORS[getExpiryStatus(emp.safety_expiry)].label
              }))}
            />
          </div>
          <div style={{ background: 'var(--bg-card, white)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--bg-app, #f8fafc)' }}>
                {['Dipendente', 'Reparto', 'Visita Medica Scade', 'Stato VM', 'Corso Sicurezza Scade', 'Stato CS'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {EMPLOYEES.map((emp, idx) => {
                  const medStatus = getExpiryStatus(emp.medical_expiry)
                  const safStatus = getExpiryStatus(emp.safety_expiry)
                  const medDays = getDaysUntil(emp.medical_expiry)
                  const safDays = getDaysUntil(emp.safety_expiry)
                  const medCfg = STATUS_COLORS[medStatus]
                  const safCfg = STATUS_COLORS[safStatus]
                  return (
                    <tr key={emp.id} style={{ borderBottom: idx < EMPLOYEES.length - 1 ? '1px solid var(--border-color, #f1f5f9)' : 'none' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '0.84rem' }}>{emp.name}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>{emp.dept}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.82rem' }}>
                        {emp.medical_expiry}
                        {medDays !== null && <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: medDays < 0 ? '#ef4444' : medDays <= 30 ? '#d97706' : '#94a3b8' }}>({medDays < 0 ? `${Math.abs(medDays)}gg scaduta` : `${medDays}gg`})</span>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, background: medCfg.bg, color: medCfg.color }}>{medCfg.label}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.82rem' }}>
                        {emp.safety_expiry}
                        {safDays !== null && <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: safDays < 0 ? '#ef4444' : safDays <= 30 ? '#d97706' : '#94a3b8' }}>({safDays < 0 ? `${Math.abs(safDays)}gg scaduta` : `${safDays}gg`})</span>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, background: safCfg.bg, color: safCfg.color }}>{safCfg.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== INCIDENTI ===== */}
      {activeTab === 'incidents' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <ExportButton
              filename="registro_eventi_hse"
              rows={incidents.map(inc => ({
                'Data': inc.date, 'Tipo': inc.type, 'Severità': inc.severity,
                'Luogo': inc.location, 'Dipendente coinvolto': inc.employee_involved,
                'Descrizione': inc.description, 'Azione correttiva': inc.corrective_action,
                'Stato': inc.status
              }))}
            />
            <button onClick={() => setShowIncidentForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--primary, #A82238)', color: 'white', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              <Plus size={15} /> Registra evento
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incidents.map(inc => {
              const sevCfg = SEVERITY_COLORS[inc.severity] || SEVERITY_COLORS['Bassa']
              const statusColor = inc.status === 'Chiuso' ? '#16a34a' : inc.status === 'Aperto' ? '#ef4444' : '#d97706'
              return (
                <div key={inc.id} style={{ background: 'var(--bg-card, white)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                    <AlertTriangle size={18} style={{ color: sevCfg.color, marginTop: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary, #1e293b)' }}>{inc.type}</span>
                        <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: sevCfg.bg, color: sevCfg.color }}>Severità {inc.severity}</span>
                        <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: statusColor + '15', color: statusColor }}>{inc.status}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', marginTop: '3px' }}>{inc.date} · {inc.location} · {inc.employee_involved}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary, #475569)', marginBottom: '8px' }}>{inc.description}</div>
                  {inc.corrective_action && (
                    <div style={{ padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', fontSize: '0.78rem', color: '#15803d', border: '1px solid #bbf7d0' }}>
                      <strong>Azione correttiva:</strong> {inc.corrective_action}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {showIncidentForm && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ background: 'var(--bg-card, white)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '1.1rem', fontWeight: 800 }}>Registra evento sicurezza</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '4px' }}>Data *</label>
                      <input type="date" value={incidentForm.date} onChange={e => setIncidentForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '4px' }}>Tipo</label>
                      <select value={incidentForm.type} onChange={e => setIncidentForm(f => ({ ...f, type: e.target.value }))} style={selectStyle}>
                        <option>Near Miss</option><option>Infortunio</option><option>Malattia professionale</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '4px' }}>Severità</label>
                    <select value={incidentForm.severity} onChange={e => setIncidentForm(f => ({ ...f, severity: e.target.value }))} style={selectStyle}>
                      <option>Bassa</option><option>Media</option><option>Alta</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '4px' }}>Luogo</label>
                    <input value={incidentForm.location} onChange={e => setIncidentForm(f => ({ ...f, location: e.target.value }))} placeholder="es. Cantiere BG24043" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '4px' }}>Dipendente coinvolto</label>
                    <input value={incidentForm.employee_involved} onChange={e => setIncidentForm(f => ({ ...f, employee_involved: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '4px' }}>Descrizione *</label>
                    <textarea value={incidentForm.description} onChange={e => setIncidentForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '4px' }}>Azione correttiva</label>
                    <textarea value={incidentForm.corrective_action} onChange={e => setIncidentForm(f => ({ ...f, corrective_action: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '18px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowIncidentForm(false)} style={{ padding: '9px 18px', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', background: 'var(--bg-card, white)', cursor: 'pointer', fontWeight: 600 }}>Annulla</button>
                  <button onClick={handleAddIncident} style={{ padding: '9px 18px', border: 'none', borderRadius: '8px', background: 'var(--primary, #A82238)', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Registra</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== DVR ===== */}
      {activeTab === 'dvr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { title: 'DVR — Documento di Valutazione dei Rischi', version: 'Rev. 3.1', date: '2025-01-15', status: 'Vigente', desc: 'Valutazione completa dei rischi aziendali per tutte le sedi e cantieri.' },
            { title: 'Procedura Emergenza — Piano di Evacuazione', version: 'Rev. 2.0', date: '2024-06-01', status: 'Vigente', desc: 'Piano di evacuazione e gestione emergenze per sede principale.' },
            { title: 'Procedura Lavori in Quota', version: 'Rev. 1.2', date: '2025-03-10', status: 'Vigente', desc: 'Procedura operativa per lavori in quota con DPI anticaduta.' },
            { title: 'Manuale Sicurezza Elettrica', version: 'Rev. 1.0', date: '2023-09-01', status: 'Da aggiornare', desc: 'Linee guida sicurezza impianti elettrici e attività di manutenzione.' },
            { title: 'Registro Infortuni', version: 'Anno 2026', date: '2026-01-01', status: 'Vigente', desc: 'Registro obbligatorio D.Lgs. 81/08 art. 53 degli infortuni sul lavoro.' }
          ].map(doc => (
            <div key={doc.title} style={{ background: 'var(--bg-card, white)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '10px', padding: '16px 18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <FileText size={20} style={{ color: 'var(--primary, #A82238)', marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary, #1e293b)', marginBottom: '3px' }}>{doc.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginBottom: '6px' }}>{doc.version} · Aggiornato: {doc.date}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #475569)' }}>{doc.desc}</div>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', background: doc.status === 'Vigente' ? '#f0fdf4' : '#fffbeb', color: doc.status === 'Vigente' ? '#16a34a' : '#d97706' }}>
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
