import React, { useMemo, useState } from 'react'
import { Award, AlertTriangle, Users2, Target, Info } from 'lucide-react'
import {
  ModulePage, ModuleHeader, StatGrid, Card, TableWrap, thStyle, tdStyle,
  Pill, useLocalState, selectStyle, ExportButton
} from '../shared/ui'

// ============================================================================
// SkillMatrixModule — Matrice competenze (People → HR)
// Dipendenti × skill con livello 0–4. Click su una cella per aggiornare
// il livello (ciclico). Su mobile la tabella scorre orizzontalmente.
// ============================================================================

const SKILLS = [
  { id: 'sk-1', name: 'Giunzione FO',     category: 'Tecnica',    critical: true },
  { id: 'sk-2', name: 'Collaudo OTDR',    category: 'Tecnica',    critical: true },
  { id: 'sk-3', name: 'Posa cavi',        category: 'Tecnica',    critical: false },
  { id: 'sk-4', name: 'Scavi & minitrincea', category: 'Tecnica', critical: false },
  { id: 'sk-5', name: 'Lavori in quota (PLE)', category: 'Abilitazioni', critical: true },
  { id: 'sk-6', name: 'Primo soccorso',   category: 'Abilitazioni', critical: true },
  { id: 'sk-7', name: 'Gestione permessi',category: 'Gestionale', critical: false },
  { id: 'sk-8', name: 'Lettura progetti', category: 'Gestionale', critical: false }
]

const PEOPLE = [
  { id: 'p-1', name: 'Gianni Corleto',  dept: 'Operations' },
  { id: 'p-2', name: 'Roberto Corleto', dept: 'Operations' },
  { id: 'p-3', name: 'Luca Testa',      dept: 'Operations' },
  { id: 'p-4', name: 'Marco Ferrari',   dept: 'Operations' },
  { id: 'p-5', name: 'Andrea Colombo',  dept: 'Operations' },
  { id: 'p-6', name: 'Stefano Riva',    dept: 'Operations' },
  { id: 'p-7', name: 'Matteo Sala',     dept: 'Operations' },
  { id: 'p-8', name: 'Valerio Verdi',   dept: 'IT' }
]

// livelli: 0 = nessuna, 1 = base, 2 = autonomo, 3 = esperto, 4 = formatore
const LEVELS = [
  { value: 0, label: 'Nessuna',  color: '#e2e8f0', text: '#94a3b8' },
  { value: 1, label: 'Base',     color: '#fde68a', text: '#92400e' },
  { value: 2, label: 'Autonomo', color: '#93c5fd', text: '#1e40af' },
  { value: 3, label: 'Esperto',  color: '#86efac', text: '#166534' },
  { value: 4, label: 'Formatore',color: '#16a34a', text: '#ffffff' }
]

const INITIAL_MATRIX = {
  'p-1': { 'sk-1': 4, 'sk-2': 3, 'sk-3': 2, 'sk-5': 2, 'sk-6': 2, 'sk-8': 2 },
  'p-2': { 'sk-3': 3, 'sk-4': 3, 'sk-6': 1 },
  'p-3': { 'sk-1': 2, 'sk-2': 1, 'sk-3': 2 },
  'p-4': { 'sk-3': 3, 'sk-5': 3, 'sk-7': 3, 'sk-8': 3, 'sk-6': 2 },
  'p-5': { 'sk-4': 2, 'sk-3': 1 },
  'p-6': { 'sk-1': 2, 'sk-3': 2, 'sk-6': 1 },
  'p-7': { 'sk-1': 3, 'sk-2': 3, 'sk-8': 2, 'sk-5': 1 },
  'p-8': { 'sk-8': 2 }
}

export default function SkillMatrixModule() {
  const [matrix, setMatrix] = useLocalState('todos-hr-skillmatrix', INITIAL_MATRIX)
  const [deptFilter, setDeptFilter] = useState('Tutti')
  const [catFilter, setCatFilter] = useState('Tutte')

  const depts = ['Tutti', ...new Set(PEOPLE.map(p => p.dept))]
  const cats = ['Tutte', ...new Set(SKILLS.map(s => s.category))]

  const visiblePeople = PEOPLE.filter(p => deptFilter === 'Tutti' || p.dept === deptFilter)
  const visibleSkills = SKILLS.filter(s => catFilter === 'Tutte' || s.category === catFilter)

  const levelOf = (pId, sId) => matrix[pId]?.[sId] ?? 0

  const cycleLevel = (pId, sId) => {
    const next = (levelOf(pId, sId) + 1) % 5
    setMatrix({ ...matrix, [pId]: { ...(matrix[pId] || {}), [sId]: next } })
  }

  const stats = useMemo(() => {
    const criticalSkills = SKILLS.filter(s => s.critical)
    // copertura: per ogni skill critica, quante persone hanno livello >= 2
    let covered = 0
    let gaps = 0
    for (const s of criticalSkills) {
      const n = PEOPLE.filter(p => levelOf(p.id, s.id) >= 2).length
      if (n >= 2) covered++
      else gaps++
    }
    const trainers = PEOPLE.filter(p => SKILLS.some(s => levelOf(p.id, s.id) === 4)).length
    const avg = PEOPLE.reduce((a, p) => a + SKILLS.reduce((b, s) => b + levelOf(p.id, s.id), 0), 0) / (PEOPLE.length * SKILLS.length)
    return [
      { label: 'Skill critiche coperte', value: `${covered}/${criticalSkills.length}`, icon: Target, color: gaps > 0 ? '#d97706' : '#16a34a', sub: 'almeno 2 persone ≥ Autonomo' },
      { label: 'Gap di copertura', value: gaps, icon: AlertTriangle, color: gaps > 0 ? '#ef4444' : '#16a34a' },
      { label: 'Formatori interni', value: trainers, icon: Award, color: '#7c3aed' },
      { label: 'Livello medio', value: avg.toFixed(1) + ' / 4', icon: Users2, color: '#2563eb' }
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matrix])

  return (
    <ModulePage>
      <ModuleHeader
        icon={Award}
        title="Skill matrix"
        subtitle="Mappa delle competenze del personale. Clicca su una cella per aggiornare il livello."
      />

      <StatGrid stats={stats} />

      {/* Filtri + legenda */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
        <select style={{ ...selectStyle, width: 'auto' }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
        <select style={{ ...selectStyle, width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginLeft: 'auto' }}>
          {LEVELS.map(l => (
            <span key={l.value} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: l.color, display: 'inline-block', border: '1px solid var(--border-color)' }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <TableWrap
        exportName="skill_matrix"
        exportRows={visiblePeople.map(p => {
          const row = { 'Dipendente': p.name, 'Reparto': p.dept }
          for (const s of visibleSkills) row[s.name] = LEVELS[levelOf(p.id, s.id)].label
          return row
        })}
      >
        <table>
          <thead>
            <tr>
              <th style={{ ...thStyle, position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 1 }}>Dipendente</th>
              {visibleSkills.map(s => (
                <th key={s.id} style={{ ...thStyle, textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span>{s.name}</span>
                    {s.critical && <Pill color="#ef4444" bg="rgba(239,68,68,0.1)">critica</Pill>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiblePeople.map(p => (
              <tr key={p.id}>
                <td style={{ ...tdStyle, position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 1, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {p.name}
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>{p.dept}</div>
                </td>
                {visibleSkills.map(s => {
                  const lvl = LEVELS[levelOf(p.id, s.id)]
                  return (
                    <td key={s.id} style={{ ...tdStyle, textAlign: 'center', padding: '7px' }}>
                      <button
                        onClick={() => cycleLevel(p.id, s.id)}
                        title={`${p.name} — ${s.name}: ${lvl.label} (clic per cambiare)`}
                        style={{
                          width: 40, height: 30, borderRadius: 7, cursor: 'pointer',
                          border: '1px solid var(--border-color)',
                          background: lvl.color, color: lvl.text,
                          fontWeight: 800, fontSize: '0.78rem'
                        }}
                      >
                        {lvl.value > 0 ? lvl.value : '·'}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, color: 'var(--text-muted)', fontSize: '0.74rem' }}>
        <Info size={13} />
        Livelli: 0 nessuna competenza · 1 base · 2 autonomo · 3 esperto · 4 formatore. Le modifiche sono salvate automaticamente.
      </div>
    </ModulePage>
  )
}
