import React, { useMemo, useState } from 'react'
import { Users2, Plus, HardHat, MapPin, Award, Pencil, Trash2, UserCircle2, CheckCircle2 } from 'lucide-react'
import {
  ModulePage, ModuleHeader, StatGrid, Card, SectionTitle, Pill, EmptyState,
  Modal, Field, inputStyle, selectStyle, useLocalState, ExportButton
} from '../shared/ui'

// ============================================================================
// SquadreModule — gestione squadre operative (Operations → Anagrafiche)
// Composizione squadre, caposquadra, specializzazione, cantiere assegnato.
// ============================================================================

const OPERAI = [
  { id: 'op-1',  name: 'Gianni Corleto',    role: 'Caposquadra',  skills: ['Giunzione FO', 'Collaudo OTDR'] },
  { id: 'op-2',  name: 'Roberto Corleto',   role: 'Operaio',      skills: ['Posa cavi', 'Scavi'] },
  { id: 'op-3',  name: 'Luca Testa',        role: 'Operaio',      skills: ['Giunzione FO'] },
  { id: 'op-4',  name: 'Marco Ferrari',     role: 'Caposquadra',  skills: ['Posa aerea', 'PLE'] },
  { id: 'op-5',  name: 'Andrea Colombo',    role: 'Operaio',      skills: ['Scavi', 'Minitrincea'] },
  { id: 'op-6',  name: 'Stefano Riva',      role: 'Operaio',      skills: ['Posa cavi', 'Giunzione FO'] },
  { id: 'op-7',  name: 'Davide Moretti',    role: 'Caposquadra',  skills: ['Collaudo OTDR', 'Permessi'] },
  { id: 'op-8',  name: 'Simone Galli',      role: 'Operaio',      skills: ['Posa aerea'] },
  { id: 'op-9',  name: 'Paolo Fontana',     role: 'Operaio',      skills: ['Scavi', 'Ripristini'] },
  { id: 'op-10', name: 'Matteo Sala',       role: 'Operaio',      skills: ['Giunzione FO', 'Collaudo OTDR'] }
]

const CANTIERI = ['BG24043 — Bergamo FTTH', 'BS25124 — Brescia Backbone', 'MI25201 — Milano Citofonia', 'VR25080 — Verona FWA', '— Nessuno —']

const SPECIALIZZAZIONI = ['Posa & Scavi', 'Giunzione & Collaudo', 'Posa aerea', 'Ripristini', 'Mista']

const INITIAL_SQUADS = [
  {
    id: 'sq-1', name: 'Squadra Alfa', specialization: 'Giunzione & Collaudo',
    leader_id: 'op-1', member_ids: ['op-3', 'op-6'], site: 'BG24043 — Bergamo FTTH', status: 'In cantiere'
  },
  {
    id: 'sq-2', name: 'Squadra Bravo', specialization: 'Posa & Scavi',
    leader_id: 'op-4', member_ids: ['op-2', 'op-5', 'op-9'], site: 'BS25124 — Brescia Backbone', status: 'In cantiere'
  },
  {
    id: 'sq-3', name: 'Squadra Charlie', specialization: 'Posa aerea',
    leader_id: 'op-7', member_ids: ['op-8', 'op-10'], site: '— Nessuno —', status: 'Disponibile'
  }
]

const STATUS_CFG = {
  'In cantiere':  { color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  'Disponibile':  { color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  'In ferie':     { color: '#d97706', bg: 'rgba(217,119,6,0.12)' }
}

const EMPTY_FORM = { name: '', specialization: SPECIALIZZAZIONI[0], leader_id: OPERAI[0].id, member_ids: [], site: '— Nessuno —', status: 'Disponibile' }

export default function SquadreModule() {
  const [squads, setSquads] = useLocalState('todos-ops-squads', INITIAL_SQUADS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const opName = (id) => OPERAI.find(o => o.id === id)?.name || id

  const stats = useMemo(() => ([
    { label: 'Squadre totali',   value: squads.length,                                            icon: Users2,      color: '#2563eb' },
    { label: 'In cantiere',      value: squads.filter(s => s.status === 'In cantiere').length,    icon: HardHat,     color: '#16a34a' },
    { label: 'Disponibili',      value: squads.filter(s => s.status === 'Disponibile').length,    icon: CheckCircle2,color: '#7c3aed' },
    { label: 'Operai assegnati', value: squads.reduce((acc, s) => acc + 1 + s.member_ids.length, 0), icon: UserCircle2, color: '#d97706' }
  ]), [squads])

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (squad) => { setEditingId(squad.id); setForm({ ...squad }); setModalOpen(true) }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingId) {
      setSquads(squads.map(s => (s.id === editingId ? { ...form, id: editingId } : s)))
    } else {
      setSquads([{ ...form, id: 'sq-' + Date.now() }, ...squads])
    }
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Eliminare questa squadra?')) return
    setSquads(squads.filter(s => s.id !== id))
  }

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      member_ids: f.member_ids.includes(id) ? f.member_ids.filter(m => m !== id) : [...f.member_ids, id]
    }))
  }

  return (
    <ModulePage>
      <ModuleHeader
        icon={Users2}
        title="Squadre operative"
        subtitle="Composizione squadre, caposquadra, specializzazioni e cantiere assegnato."
        actions={
          <>
            <ExportButton
              filename="squadre_operative"
              rows={squads.map(s => ({
                'Squadra': s.name, 'Specializzazione': s.specialization,
                'Caposquadra': opName(s.leader_id),
                'Componenti': s.member_ids.map(opName).join(', '),
                'N. componenti': 1 + s.member_ids.length,
                'Cantiere': s.site, 'Stato': s.status
              }))}
            />
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={15} /> Nuova squadra
            </button>
          </>
        }
      />

      <StatGrid stats={stats} />

      {squads.length === 0 ? (
        <Card><EmptyState icon={Users2} title="Nessuna squadra" text="Crea la prima squadra per iniziare." /></Card>
      ) : (
        <div className="card-grid">
          {squads.map(squad => {
            const st = STATUS_CFG[squad.status] || STATUS_CFG['Disponibile']
            return (
              <Card key={squad.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>{squad.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 2 }}>
                      <Award size={12} /> {squad.specialization}
                    </div>
                  </div>
                  <Pill color={st.color} bg={st.bg}>{squad.status}</Pill>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 4 }}>
                    <HardHat size={13} style={{ color: 'var(--primary)' }} />
                    <strong>{opName(squad.leader_id)}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>caposquadra</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                    {squad.site === '— Nessuno —' ? <em style={{ color: 'var(--text-muted)' }}>Nessun cantiere</em> : squad.site}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                    Componenti ({squad.member_ids.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {squad.member_ids.length === 0
                      ? <em style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Solo caposquadra</em>
                      : squad.member_ids.map(id => (
                        <Pill key={id} color="var(--text-secondary)" bg="var(--primary-light)">{opName(id)}</Pill>
                      ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                  <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => openEdit(squad)}>
                    <Pencil size={12} /> Modifica
                  </button>
                  <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => handleDelete(squad.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Modifica squadra' : 'Nuova squadra'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Annulla</button>
            <button className="btn btn-primary" onClick={handleSave}>Salva</button>
          </>
        }
      >
        <div className="form-grid">
          <Field label="Nome squadra">
            <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Es. Squadra Delta" />
          </Field>
          <Field label="Specializzazione">
            <select style={selectStyle} value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}>
              {SPECIALIZZAZIONI.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Caposquadra">
            <select style={selectStyle} value={form.leader_id} onChange={e => setForm({ ...form, leader_id: e.target.value })}>
              {OPERAI.filter(o => o.role === 'Caposquadra').map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Field>
          <Field label="Cantiere assegnato">
            <select style={selectStyle} value={form.site} onChange={e => setForm({ ...form, site: e.target.value })}>
              {CANTIERI.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Stato">
            <select style={selectStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {Object.keys(STATUS_CFG).map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Componenti" span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {OPERAI.filter(o => o.id !== form.leader_id).map(o => {
                const selected = form.member_ids.includes(o.id)
                return (
                  <button key={o.id} type="button" onClick={() => toggleMember(o.id)} style={{
                    padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 600,
                    border: '1px solid ' + (selected ? 'var(--primary)' : 'var(--border-color)'),
                    background: selected ? 'var(--primary-light)' : 'var(--bg-card)',
                    color: selected ? 'var(--primary)' : 'var(--text-secondary)'
                  }}>
                    {o.name}
                  </button>
                )
              })}
            </div>
          </Field>
        </div>
      </Modal>
    </ModulePage>
  )
}
