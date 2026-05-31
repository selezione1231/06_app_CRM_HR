import React, { useState, useMemo } from 'react'
import {
  Calendar, ClipboardList, MessageSquare, CheckCircle2,
  Users, Building2, UserCircle2, Car, Printer,
  FileText, Phone, Briefcase, AlertOctagon, LogOut,
  ChevronRight
} from 'lucide-react'
import { WP_COLORS, wpButton, wpTileButton, wpCard } from '../shared/wpStyles'
import {
  WP_PM, WP_EMPLOYEES, WP_LEAVE_REQUESTS, WP_EMPLOYEE_NOTES,
  WP_TIME_ENTRIES, getUpcomingExpiries
} from '../shared/wpSeed'

import WeeklyPlanner from './WeeklyPlanner'
import LeaveRequestsInbox from './LeaveRequestsInbox'
import EmployeeNotesInbox from './EmployeeNotesInbox'
import TimeEntriesApproval from './TimeEntriesApproval'
import ClientsTable from './ClientsTable'
import SitesTable from './SitesTable'
import EmployeesRegistry from './EmployeesRegistry'
import VehiclesTable from './VehiclesTable'
import PrintsHub from './PrintsHub'
import MyTodosDocs from './MyTodosDocs'
import OnCallScheduler from './OnCallScheduler'
import ProjectManagersTable from './ProjectManagersTable'
import ExpiriesPanel from './ExpiriesPanel'

// ============================================================================
// PMConsole — la "console principale" del P.M. con i 13 comandi del docx
// ============================================================================
export default function PMConsole({ pmId, onLogout }) {
  const [activeView, setActiveView] = useState(null) // null = home

  const pm = WP_PM.find(p => p.id === pmId)

  // --- Conteggi notifiche per i tile ---
  const counts = useMemo(() => {
    const teamIds = WP_EMPLOYEES.filter(e => e.pm_id === pmId).map(e => e.id)
    return {
      leaveRequests: WP_LEAVE_REQUESTS.filter(r => teamIds.includes(r.employee_id) && r.status === 'Pending').length,
      notes: WP_EMPLOYEE_NOTES.filter(n => teamIds.includes(n.employee_id) && !n.seen).length,
      notesHigh: WP_EMPLOYEE_NOTES.filter(n => teamIds.includes(n.employee_id) && !n.seen && n.priority === 'high').length,
      timeEntries: WP_TIME_ENTRIES.filter(t => teamIds.includes(t.employee_id) && t.status === 'Pending').length,
      expiries: getUpcomingExpiries(15).length
    }
  }, [pmId])

  const tiles = [
    { id: 'planner',    label: 'Calendario',          icon: <Calendar size={28} />, badge: null },
    { id: 'leaves',     label: 'Richieste Ferie/Permessi', icon: <ClipboardList size={28} />, badge: counts.leaveRequests },
    { id: 'notes',      label: 'Note Inserite',       icon: <MessageSquare size={28} />, badge: counts.notes, urgent: counts.notesHigh > 0 },
    { id: 'time',       label: 'Approva Inserimenti', icon: <CheckCircle2 size={28} />, badge: counts.timeEntries },
    { id: 'clients',    label: 'Clienti',             icon: <Briefcase size={28} />, badge: null },
    { id: 'sites',      label: 'Cantieri',            icon: <Building2 size={28} />, badge: null },
    { id: 'employees',  label: 'Dipendenti',          icon: <Users size={28} />, badge: null },
    { id: 'vehicles',   label: 'Automezzi',           icon: <Car size={28} />, badge: null },
    { id: 'prints',     label: 'Stampe',              icon: <Printer size={28} />, badge: null },
    { id: 'docs',       label: 'My Todos (Doc.)',     icon: <FileText size={28} />, badge: null },
    { id: 'oncall',     label: 'Reperibilità',        icon: <Phone size={28} />, badge: null },
    { id: 'pms',        label: 'P.M.',                icon: <UserCircle2 size={28} />, badge: null },
    { id: 'expiries',   label: 'Vedi Scadenze',       icon: <AlertOctagon size={28} />, badge: counts.expiries, blink: counts.expiries > 0 }
  ]

  // --- Render sotto-view o home ---
  const renderView = () => {
    switch (activeView) {
      case 'planner':   return <WeeklyPlanner pmId={pmId} />
      case 'leaves':    return <LeaveRequestsInbox pmId={pmId} />
      case 'notes':     return <EmployeeNotesInbox pmId={pmId} />
      case 'time':      return <TimeEntriesApproval pmId={pmId} />
      case 'clients':   return <ClientsTable />
      case 'sites':     return <SitesTable />
      case 'employees': return <EmployeesRegistry pmId={pmId} />
      case 'vehicles':  return <VehiclesTable />
      case 'prints':    return <PrintsHub pmId={pmId} />
      case 'docs':      return <MyTodosDocs pmId={pmId} />
      case 'oncall':    return <OnCallScheduler />
      case 'pms':       return <ProjectManagersTable />
      case 'expiries':  return <ExpiriesPanel />
      default:          return null
    }
  }

  return (
    <div>
      {/* PM HEADER */}
      <div style={{ ...wpCard, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: WP_COLORS.primaryLight, color: WP_COLORS.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1rem'
          }}>
            {pm.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{pm.name}</div>
            <div style={{ fontSize: '0.72rem', color: WP_COLORS.textMuted }}>P.M. · {pm.area} · {pm.code}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {activeView && (
            <button onClick={() => setActiveView(null)} style={{ ...wpButton('secondary', 'sm') }}>
              ← Console Principale
            </button>
          )}
          <button onClick={onLogout} style={{ ...wpButton('ghost', 'sm') }}>
            <LogOut size={14} /> Esci
          </button>
        </div>
      </div>

      {/* SOTTO-VIEW oppure HOME TILE */}
      {activeView ? (
        <div style={{ ...wpCard, minHeight: '500px' }}>
          {renderView()}
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: WP_COLORS.text }}>
            Console Principale
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '14px'
          }}>
            {tiles.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveView(t.id)}
                className={`wp-tile ${t.blink ? 'wp-blink' : ''}`}
                style={{
                  ...wpTileButton,
                  position: 'relative'
                }}
              >
                {t.badge != null && t.badge > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: t.urgent ? '#ffffff' : 'rgba(255,255,255,0.95)',
                    color: t.urgent ? WP_COLORS.danger : WP_COLORS.primary,
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    minWidth: '22px',
                    textAlign: 'center'
                  }}>
                    {t.urgent ? `! ${t.badge}` : t.badge}
                  </span>
                )}
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
