import React, { useState } from 'react'
import { UserCircle2 } from 'lucide-react'
import { WP_COLORS, wpCard } from './shared/wpStyles'
import { WP_PM } from './shared/wpSeed'

import ClientsTable from './pm/ClientsTable'
import SitesTable from './pm/SitesTable'
import EmployeesRegistry from './pm/EmployeesRegistry'
import VehiclesTable from './pm/VehiclesTable'
import PrintsHub from './pm/PrintsHub'
import MyTodosDocs from './pm/MyTodosDocs'
import OnCallScheduler from './pm/OnCallScheduler'
import ProjectManagersTable from './pm/ProjectManagersTable'
import ExpiriesPanel from './pm/ExpiriesPanel'
import WeeklyPlanner from './pm/WeeklyPlanner'
import LeaveRequestsInbox from './pm/LeaveRequestsInbox'
import EmployeeNotesInbox from './pm/EmployeeNotesInbox'
import TimeEntriesApproval from './pm/TimeEntriesApproval'

// ============================================================================
// WP2Route — dispatch da tabId sidebar al sotto-componente Work-Pro corretto
// ----------------------------------------------------------------------------
// Le voci anagrafiche (clienti, cantieri, mezzi, scadenze, ...) non
// richiedono PM. Le voci operative (planner, approvazioni, note) sono
// PM-scoped: mostriamo un selettore P.M. in alto.
// ============================================================================

const PM_SCOPED_VIEWS = new Set(['planner', 'leaves', 'time', 'notes'])

export default function WP2Route({ view }) {
  const [pmId, setPmId] = useState(WP_PM[0]?.id || null)

  const needsPm = PM_SCOPED_VIEWS.has(view)
  const pm = WP_PM.find(p => p.id === pmId)

  const renderView = () => {
    switch (view) {
      case 'clients':   return <ClientsTable />
      case 'sites':     return <SitesTable />
      case 'vehicles':  return <VehiclesTable />
      case 'expiries':  return <ExpiriesPanel />
      case 'oncall':    return <OnCallScheduler />
      case 'pm':        return <ProjectManagersTable />
      case 'docs':      return <MyTodosDocs />
      case 'prints':    return <PrintsHub />
      case 'employees': return <EmployeesRegistry pmId={pmId} />

      // PM-scoped
      case 'planner':   return pmId ? <WeeklyPlanner pmId={pmId} /> : null
      case 'leaves':    return pmId ? <LeaveRequestsInbox pmId={pmId} /> : null
      case 'time':      return pmId ? <TimeEntriesApproval pmId={pmId} /> : null
      case 'notes':     return pmId ? <EmployeeNotesInbox pmId={pmId} /> : null

      default: return <div style={{ padding: '20px' }}>Vista non riconosciuta: {view}</div>
    }
  }

  return (
    <div style={{ background: WP_COLORS.bgAlt, minHeight: 'calc(100vh - 120px)', padding: '20px' }}>
      {/* PM selector quando la vista è PM-scoped */}
      {needsPm && (
        <div style={{
          ...wpCard, marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: WP_COLORS.primaryLight, color: WP_COLORS.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UserCircle2 size={20} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '0.7rem', color: WP_COLORS.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>
              Vista per Project Manager
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>
              {pm ? `${pm.name} · ${pm.area}` : '— Seleziona P.M. —'}
            </div>
          </div>
          <select
            value={pmId || ''}
            onChange={(e) => setPmId(e.target.value)}
            style={{
              padding: '8px 10px',
              border: `1.5px solid ${WP_COLORS.primary}`,
              borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: 600,
              background: 'white', color: WP_COLORS.primary,
              minWidth: '200px', outline: 'none'
            }}
          >
            {WP_PM.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.area})</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ ...wpCard }}>
        {renderView()}
      </div>
    </div>
  )
}
