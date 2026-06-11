import React, { useMemo, useState } from 'react'
import { Building, ChevronDown, ChevronRight, Users2, UserCircle2, Search } from 'lucide-react'
import { ModulePage, ModuleHeader, StatGrid, Card, Pill, inputStyle, ExportButton } from '../shared/ui'

// ============================================================================
// OrgChartModule — Organigramma aziendale (People → HR)
// Albero gerarchico espandibile: Direzione → funzioni → team → persone.
// Su mobile l'albero è verticale con indentazione, sempre leggibile.
// ============================================================================

const ORG_TREE = {
  id: 'ceo', name: 'Federico Locatelli', title: 'Amministratore Delegato', dept: 'Direzione',
  children: [
    {
      id: 'ops', name: 'Davide Moretti', title: 'Direttore Operations', dept: 'Operations',
      children: [
        {
          id: 'pm1', name: 'Marco Ferrari', title: 'Project Manager', dept: 'Operations',
          children: [
            { id: 'cs1', name: 'Gianni Corleto', title: 'Caposquadra — Squadra Alfa', dept: 'Operations', children: [
              { id: 'op1', name: 'Luca Testa', title: 'Operaio specializzato', dept: 'Operations' },
              { id: 'op2', name: 'Stefano Riva', title: 'Operaio', dept: 'Operations' }
            ]},
            { id: 'cs2', name: 'Paolo Fontana', title: 'Caposquadra — Squadra Bravo', dept: 'Operations', children: [
              { id: 'op3', name: 'Andrea Colombo', title: 'Operaio', dept: 'Operations' },
              { id: 'op4', name: 'Simone Galli', title: 'Operaio', dept: 'Operations' }
            ]}
          ]
        },
        { id: 'ni1', name: 'Matteo Sala', title: 'Network Implementation Lead', dept: 'Operations' }
      ]
    },
    {
      id: 'hr', name: 'Alessandro Neri', title: 'HR Manager', dept: 'HR',
      children: [
        { id: 'hr1', name: 'Giulia Conti', title: 'HR Specialist — Recruiting', dept: 'HR' },
        { id: 'hr2', name: 'Francesca De Luca', title: 'HR Admin — Payroll', dept: 'HR' }
      ]
    },
    {
      id: 'amm', name: 'Sofia Gialli', title: 'Responsabile Amministrazione', dept: 'Amministrazione',
      children: [
        { id: 'am1', name: 'Elena Ricci', title: 'Contabilità fornitori', dept: 'Amministrazione' },
        { id: 'am2', name: 'Chiara Marini', title: 'Contabilità clienti', dept: 'Amministrazione' }
      ]
    },
    {
      id: 'sales', name: 'Laura Bianchi', title: 'Responsabile Commerciale', dept: 'Commerciale',
      children: [
        { id: 'sl1', name: 'Antonio Greco', title: 'Account Manager', dept: 'Commerciale' }
      ]
    },
    {
      id: 'it', name: 'Mario Rossi', title: 'IT Manager', dept: 'IT',
      children: [
        { id: 'it1', name: 'Valerio Verdi', title: 'Sistemista', dept: 'IT' }
      ]
    },
    { id: 'hse', name: 'Roberto Corleto', title: 'HSE Manager (RSPP)', dept: 'HSE' }
  ]
}

const DEPT_COLORS = {
  'Direzione':       '#7c3aed',
  'Operations':      '#2563eb',
  'HR':              '#d90429',
  'Amministrazione': '#d97706',
  'Commerciale':     '#16a34a',
  'IT':              '#0891b2',
  'HSE':             '#ea580c'
}

function countPeople(node) {
  return 1 + (node.children || []).reduce((a, c) => a + countPeople(c), 0)
}

function flatten(node, acc = []) {
  acc.push(node)
  for (const c of node.children || []) flatten(c, acc)
  return acc
}

function OrgNode({ node, depth, query, expandedIds, onToggle }) {
  const hasChildren = (node.children || []).length > 0
  const expanded = expandedIds.has(node.id)
  const color = DEPT_COLORS[node.dept] || 'var(--primary)'
  const matches = query && (node.name.toLowerCase().includes(query) || node.title.toLowerCase().includes(query))

  return (
    <div>
      <div
        onClick={() => hasChildren && onToggle(node.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 12px', marginLeft: depth * 18, marginBottom: 6,
          background: matches ? 'var(--warning-light)' : 'var(--bg-card)',
          border: '1px solid ' + (matches ? 'var(--warning)' : 'var(--border-color)'),
          borderLeft: `3px solid ${color}`,
          borderRadius: '10px', cursor: hasChildren ? 'pointer' : 'default'
        }}
      >
        {hasChildren
          ? (expanded ? <ChevronDown size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> : <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />)
          : <span style={{ width: 15, flexShrink: 0 }} />}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: color + '18', color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.78rem'
        }}>
          {node.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.title}</div>
        </div>
        {hasChildren && (
          <Pill color={color} bg={color + '15'}>
            <Users2 size={11} /> {countPeople(node) - 1}
          </Pill>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map(c => (
            <OrgNode key={c.id} node={c} depth={depth + 1} query={query} expandedIds={expandedIds} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrgChartModule() {
  const allIds = useMemo(() => flatten(ORG_TREE).map(n => n.id), [])
  const [expandedIds, setExpandedIds] = useState(() => new Set(allIds))
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()

  const all = useMemo(() => flatten(ORG_TREE), [])
  const depts = useMemo(() => {
    const map = {}
    for (const p of all) map[p.dept] = (map[p.dept] || 0) + 1
    return map
  }, [all])

  const stats = useMemo(() => ([
    { label: 'Persone totali', value: all.length, icon: Users2, color: '#2563eb' },
    { label: 'Funzioni', value: Object.keys(depts).length, icon: Building, color: '#7c3aed' },
    { label: 'Manager', value: all.filter(n => (n.children || []).length > 0).length, icon: UserCircle2, color: '#16a34a' },
    { label: 'Span of control max', value: Math.max(...all.map(n => (n.children || []).length)), icon: Users2, color: '#d97706' }
  ]), [all, depts])

  const onToggle = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <ModulePage>
      <ModuleHeader
        icon={Building}
        title="Organigramma"
        subtitle="Struttura organizzativa aziendale: funzioni, riporti e team."
        actions={
          <>
            <ExportButton
              filename="organigramma"
              rows={all.map(p => ({
                'Nome': p.name, 'Ruolo': p.title, 'Funzione': p.dept,
                'Riporti diretti': (p.children || []).length
              }))}
            />
            <button className="btn btn-secondary" onClick={() => setExpandedIds(new Set(allIds))}>Espandi tutto</button>
            <button className="btn btn-secondary" onClick={() => setExpandedIds(new Set([ORG_TREE.id]))}>Comprimi</button>
          </>
        }
      />

      <StatGrid stats={stats} />

      {/* Legenda funzioni */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        {Object.entries(depts).map(([dept, count]) => (
          <Pill key={dept} color={DEPT_COLORS[dept] || 'var(--text-secondary)'} bg={(DEPT_COLORS[dept] || '#94a3b8') + '15'}>
            {dept} · {count}
          </Pill>
        ))}
      </div>

      {/* Ricerca */}
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: '16px' }}>
        <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          style={{ ...inputStyle, paddingLeft: 34 }}
          placeholder="Cerca persona o ruolo…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Card style={{ padding: '14px', overflow: 'visible' }}>
        <OrgNode node={ORG_TREE} depth={0} query={query} expandedIds={expandedIds} onToggle={onToggle} />
      </Card>
    </ModulePage>
  )
}
