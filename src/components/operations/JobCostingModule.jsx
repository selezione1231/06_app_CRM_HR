import React, { useMemo, useState } from 'react'
import {
  LineChart, Plus, TrendingUp, TrendingDown, Briefcase, AlertTriangle,
  Pencil, Trash2, ChevronDown, ChevronUp
} from 'lucide-react'
import {
  ModulePage, ModuleHeader, StatGrid, Card, TableWrap, THead, tdStyle, Pill,
  ProgressBar, EmptyState, Modal, Field, inputStyle, selectStyle,
  useLocalState, fmtEuro
} from '../shared/ui'

// ============================================================================
// JobCostingModule — Commesse & Costing (Operations)
// Budget vs consuntivo per commessa: manodopera, materiali, mezzi, margine.
// ============================================================================

const INITIAL_JOBS = [
  {
    id: 'jc-1', code: 'BG24043', client: 'OpenFiber', title: 'FTTH Bergamo — Lotto 3',
    status: 'In corso', revenue: 185000,
    budget:   { labor: 78000, materials: 32000, equipment: 18000 },
    actual:   { labor: 64200, materials: 29800, equipment: 15400 },
    hours_budget: 2600, hours_actual: 2140
  },
  {
    id: 'jc-2', code: 'BS25124', client: 'TIM', title: 'Backbone Brescia Sud',
    status: 'In corso', revenue: 96000,
    budget:   { labor: 41000, materials: 22000, equipment: 12000 },
    actual:   { labor: 44800, materials: 24100, equipment: 13900 },
    hours_budget: 1380, hours_actual: 1495
  },
  {
    id: 'jc-3', code: 'MI25201', client: 'Fastweb', title: 'Citofonia Milano — Quartiere Adriano',
    status: 'In corso', revenue: 52000,
    budget:   { labor: 21000, materials: 9500, equipment: 4800 },
    actual:   { labor: 12400, materials: 5200, equipment: 2100 },
    hours_budget: 700, hours_actual: 410
  },
  {
    id: 'jc-4', code: 'VR25080', client: 'EOLO', title: 'FWA Verona — Siti collinari',
    status: 'Chiusa', revenue: 71000,
    budget:   { labor: 28000, materials: 16000, equipment: 9000 },
    actual:   { labor: 26300, materials: 14750, equipment: 8200 },
    hours_budget: 940, hours_actual: 905
  }
]

const STATUS_CFG = {
  'In corso': { color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  'Chiusa':   { color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  'Sospesa':  { color: '#d97706', bg: 'rgba(217,119,6,0.12)' }
}

const EMPTY_FORM = {
  code: '', client: '', title: '', status: 'In corso', revenue: 0,
  budget_labor: 0, budget_materials: 0, budget_equipment: 0,
  actual_labor: 0, actual_materials: 0, actual_equipment: 0,
  hours_budget: 0, hours_actual: 0
}

const totCost = (c) => (Number(c.labor) || 0) + (Number(c.materials) || 0) + (Number(c.equipment) || 0)
const marginOf = (j) => j.revenue - totCost(j.actual)
const marginPct = (j) => (j.revenue > 0 ? (marginOf(j) / j.revenue) * 100 : 0)

export default function JobCostingModule() {
  const [jobs, setJobs] = useLocalState('todos-ops-jobcosting', INITIAL_JOBS)
  const [expandedId, setExpandedId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const stats = useMemo(() => {
    const active = jobs.filter(j => j.status === 'In corso')
    const totalRevenue = jobs.reduce((a, j) => a + Number(j.revenue || 0), 0)
    const totalMargin = jobs.reduce((a, j) => a + marginOf(j), 0)
    const inLoss = jobs.filter(j => marginPct(j) < 0).length
    const avgMargin = jobs.length ? jobs.reduce((a, j) => a + marginPct(j), 0) / jobs.length : 0
    return [
      { label: 'Commesse attive',  value: active.length,                 icon: Briefcase,    color: '#2563eb' },
      { label: 'Ricavi totali',    value: fmtEuro(totalRevenue),         icon: TrendingUp,   color: '#16a34a' },
      { label: 'Margine totale',   value: fmtEuro(totalMargin),          icon: LineChart,    color: totalMargin >= 0 ? '#16a34a' : '#ef4444' },
      { label: 'Margine medio',    value: avgMargin.toFixed(1) + '%',    icon: TrendingUp,   color: avgMargin >= 0 ? '#16a34a' : '#ef4444' },
      { label: 'In perdita',       value: inLoss,                        icon: AlertTriangle,color: inLoss > 0 ? '#ef4444' : '#16a34a' }
    ]
  }, [jobs])

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (j) => {
    setEditingId(j.id)
    setForm({
      code: j.code, client: j.client, title: j.title, status: j.status, revenue: j.revenue,
      budget_labor: j.budget.labor, budget_materials: j.budget.materials, budget_equipment: j.budget.equipment,
      actual_labor: j.actual.labor, actual_materials: j.actual.materials, actual_equipment: j.actual.equipment,
      hours_budget: j.hours_budget, hours_actual: j.hours_actual
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.code.trim() || !form.title.trim()) return
    const job = {
      id: editingId || 'jc-' + Date.now(),
      code: form.code, client: form.client, title: form.title, status: form.status,
      revenue: Number(form.revenue) || 0,
      budget: { labor: Number(form.budget_labor) || 0, materials: Number(form.budget_materials) || 0, equipment: Number(form.budget_equipment) || 0 },
      actual: { labor: Number(form.actual_labor) || 0, materials: Number(form.actual_materials) || 0, equipment: Number(form.actual_equipment) || 0 },
      hours_budget: Number(form.hours_budget) || 0,
      hours_actual: Number(form.hours_actual) || 0
    }
    setJobs(editingId ? jobs.map(j => (j.id === editingId ? job : j)) : [job, ...jobs])
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Eliminare questa commessa?')) return
    setJobs(jobs.filter(j => j.id !== id))
  }

  const numField = (label, key) => (
    <Field label={label} key={key}>
      <input type="number" style={inputStyle} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
    </Field>
  )

  return (
    <ModulePage>
      <ModuleHeader
        icon={LineChart}
        title="Job costing — Commesse"
        subtitle="Budget vs consuntivo: manodopera, materiali, mezzi e margine per commessa."
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Nuova commessa
          </button>
        }
      />

      <StatGrid stats={stats} />

      {jobs.length === 0 ? (
        <Card><EmptyState icon={Briefcase} title="Nessuna commessa" text="Aggiungi la prima commessa per monitorare i costi." /></Card>
      ) : (
        <TableWrap
          exportName="job_costing_commesse"
          exportRows={jobs.map(j => ({
            'Codice': j.code, 'Titolo': j.title, 'Cliente': j.client, 'Stato': j.status,
            'Ricavi (EUR)': j.revenue,
            'Budget manodopera (EUR)': j.budget.labor, 'Consuntivo manodopera (EUR)': j.actual.labor,
            'Budget materiali (EUR)': j.budget.materials, 'Consuntivo materiali (EUR)': j.actual.materials,
            'Budget mezzi (EUR)': j.budget.equipment, 'Consuntivo mezzi (EUR)': j.actual.equipment,
            'Costi totali (EUR)': totCost(j.actual),
            'Margine (EUR)': marginOf(j), 'Margine %': Number(marginPct(j).toFixed(1)),
            'Ore budget': j.hours_budget, 'Ore consuntivate': j.hours_actual
          }))}
        >
          <table>
            <THead cols={['Commessa', 'Cliente', 'Stato', 'Ricavi', 'Costi', 'Margine', 'Avanzamento ore', '']} />
            <tbody>
              {jobs.map(j => {
                const cost = totCost(j.actual)
                const margin = marginOf(j)
                const mPct = marginPct(j)
                const hoursPct = j.hours_budget > 0 ? (j.hours_actual / j.hours_budget) * 100 : 0
                const st = STATUS_CFG[j.status] || STATUS_CFG['In corso']
                const expanded = expandedId === j.id
                return (
                  <React.Fragment key={j.id}>
                    <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedId(expanded ? null : j.id)}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700 }}>{j.code}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{j.title}</div>
                      </td>
                      <td style={tdStyle}>{j.client}</td>
                      <td style={tdStyle}><Pill color={st.color} bg={st.bg}>{j.status}</Pill></td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{fmtEuro(j.revenue)}</td>
                      <td style={tdStyle}>{fmtEuro(cost)}</td>
                      <td style={tdStyle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, color: margin >= 0 ? '#16a34a' : '#ef4444' }}>
                          {margin >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                          {fmtEuro(margin)} ({mPct.toFixed(1)}%)
                        </span>
                      </td>
                      <td style={{ ...tdStyle, minWidth: 140 }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3 }}>
                          {j.hours_actual} / {j.hours_budget} h
                        </div>
                        <ProgressBar pct={hoursPct} color={hoursPct > 100 ? '#ef4444' : 'var(--primary)'} />
                      </td>
                      <td style={tdStyle}>
                        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={8} style={{ ...tdStyle, background: 'var(--primary-light)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', padding: '6px 0' }}>
                            {[
                              { label: 'Manodopera', b: j.budget.labor,     a: j.actual.labor },
                              { label: 'Materiali',  b: j.budget.materials, a: j.actual.materials },
                              { label: 'Mezzi',      b: j.budget.equipment, a: j.actual.equipment }
                            ].map(row => {
                              const pct = row.b > 0 ? (row.a / row.b) * 100 : 0
                              return (
                                <div key={row.label}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 4 }}>
                                    <strong>{row.label}</strong>
                                    <span style={{ color: pct > 100 ? '#ef4444' : 'var(--text-secondary)' }}>
                                      {fmtEuro(row.a)} / {fmtEuro(row.b)}
                                    </span>
                                  </div>
                                  <ProgressBar pct={pct} color={pct > 100 ? '#ef4444' : pct > 85 ? '#d97706' : '#16a34a'} />
                                </div>
                              )
                            })}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: 10 }}>
                            <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); openEdit(j) }}>
                              <Pencil size={12} /> Modifica
                            </button>
                            <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); handleDelete(j.id) }}>
                              <Trash2 size={12} /> Elimina
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </TableWrap>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Modifica commessa' : 'Nuova commessa'}
        maxWidth={680}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Annulla</button>
            <button className="btn btn-primary" onClick={handleSave}>Salva</button>
          </>
        }
      >
        <div className="form-grid">
          <Field label="Codice commessa">
            <input style={inputStyle} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Es. BG26001" />
          </Field>
          <Field label="Cliente">
            <input style={inputStyle} value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} />
          </Field>
          <Field label="Titolo" span>
            <input style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Stato">
            <select style={selectStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {Object.keys(STATUS_CFG).map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          {numField('Ricavi previsti (€)', 'revenue')}
          {numField('Budget manodopera (€)', 'budget_labor')}
          {numField('Budget materiali (€)', 'budget_materials')}
          {numField('Budget mezzi (€)', 'budget_equipment')}
          {numField('Consuntivo manodopera (€)', 'actual_labor')}
          {numField('Consuntivo materiali (€)', 'actual_materials')}
          {numField('Consuntivo mezzi (€)', 'actual_equipment')}
          {numField('Ore a budget', 'hours_budget')}
          {numField('Ore consuntivate', 'hours_actual')}
        </div>
      </Modal>
    </ModulePage>
  )
}
