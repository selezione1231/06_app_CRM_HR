import React, { useEffect, useMemo, useState } from 'react'
import {
  MonitorSmartphone, Wifi, KeyRound, UserCircle2, MessageSquare, Plus,
  AlertTriangle, ShieldCheck, ShieldOff, Laptop, Smartphone, CreditCard
} from 'lucide-react'
import {
  ModulePage, ModuleHeader, TabBar, StatGrid, Card, TableWrap, THead, tdStyle,
  Pill, ExpiryPill, ProgressBar, EmptyState, Modal, Field, inputStyle, selectStyle,
  useLocalState, fmtEuro, fmtDate, expiryInfo
} from '../shared/ui'

// ============================================================================
// ITAssetModule — Asset / IT
// Viste: Dispositivi | Apparati di rete | Licenze | Account | Help desk
// ============================================================================

const TABS = [
  { id: 'devices',  label: 'PC, smartphone, SIM', icon: MonitorSmartphone },
  { id: 'network',  label: 'Apparati di rete',    icon: Wifi },
  { id: 'licenses', label: 'Licenze software',    icon: KeyRound },
  { id: 'accounts', label: 'Account aziendali',   icon: UserCircle2 },
  { id: 'helpdesk', label: 'Help desk IT',        icon: MessageSquare }
]

const INITIAL_DEVICES = [
  { id: 'd-1', type: 'Laptop',     model: 'Dell Latitude 5540',   serial: 'DL-2024-031', assignee: 'Alessandro Neri', warranty: '2027-02-15', status: 'Assegnato' },
  { id: 'd-2', type: 'Laptop',     model: 'Lenovo ThinkPad E14',  serial: 'LN-2023-112', assignee: 'Sofia Gialli',    warranty: '2026-06-22', status: 'Assegnato' },
  { id: 'd-3', type: 'Smartphone', model: 'Samsung Galaxy A54',   serial: 'SM-2024-078', assignee: 'Marco Ferrari',   warranty: '2026-04-10', status: 'Assegnato' },
  { id: 'd-4', type: 'Smartphone', model: 'iPhone 14',            serial: 'AP-2023-044', assignee: 'Laura Bianchi',   warranty: '2025-11-30', status: 'Assegnato' },
  { id: 'd-5', type: 'SIM',        model: 'TIM Business — 339xxx', serial: 'SIM-0921',   assignee: 'Gianni Corleto',  warranty: null,          status: 'Assegnato' },
  { id: 'd-6', type: 'Laptop',     model: 'HP ProBook 450',       serial: 'HP-2022-201', assignee: null,              warranty: '2025-09-01', status: 'In magazzino' },
  { id: 'd-7', type: 'Tablet',     model: 'iPad 10ª gen',         serial: 'AP-2024-091', assignee: 'Squadra Alfa',    warranty: '2027-03-18', status: 'Assegnato' }
]

const INITIAL_NETWORK = [
  { id: 'n-1', name: 'Firewall FortiGate 60F', site: 'Sede Milano',     ip: '10.0.0.1',  role: 'Firewall',  status: 'Online',  eos: '2028-06-30' },
  { id: 'n-2', name: 'Switch Cisco C1200-24',  site: 'Sede Milano',     ip: '10.0.0.2',  role: 'Switch',    status: 'Online',  eos: '2029-01-15' },
  { id: 'n-3', name: 'AP Ubiquiti U6-Pro ×4',  site: 'Sede Milano',     ip: '10.0.0.10', role: 'Wi-Fi',     status: 'Online',  eos: '2027-10-01' },
  { id: 'n-4', name: 'Router Teltonika RUT956',site: 'Magazzino Bergamo', ip: '10.1.0.1', role: 'Router 4G', status: 'Offline', eos: '2026-08-20' },
  { id: 'n-5', name: 'NAS Synology DS923+',    site: 'Sede Milano',     ip: '10.0.0.20', role: 'Storage',   status: 'Online',  eos: '2028-03-12' }
]

const INITIAL_LICENSES = [
  { id: 'l-1', name: 'Microsoft 365 Business',  seats: 35, used: 31, renewal: '2027-01-31', yearly_cost: 4830 },
  { id: 'l-2', name: 'AutoCAD LT',              seats: 4,  used: 4,  renewal: '2026-07-15', yearly_cost: 2120 },
  { id: 'l-3', name: 'QGIS (open source)',      seats: 99, used: 6,  renewal: null,          yearly_cost: 0 },
  { id: 'l-4', name: 'Adobe Acrobat Pro',       seats: 6,  used: 5,  renewal: '2026-06-28', yearly_cost: 1180 },
  { id: 'l-5', name: 'Antivirus ESET Protect',  seats: 40, used: 37, renewal: '2026-12-01', yearly_cost: 1480 }
]

const INITIAL_ACCOUNTS = [
  { id: 'a-1', person: 'Alessandro Neri', services: ['M365', 'VPN', 'CRM HR'],        mfa: true,  status: 'Attivo' },
  { id: 'a-2', person: 'Sofia Gialli',    services: ['M365', 'Gestionale contabile'], mfa: true,  status: 'Attivo' },
  { id: 'a-3', person: 'Marco Ferrari',   services: ['M365', 'VPN', 'Work-Pro'],      mfa: false, status: 'Attivo' },
  { id: 'a-4', person: 'Laura Bianchi',   services: ['M365', 'CRM commerciale'],      mfa: true,  status: 'Attivo' },
  { id: 'a-5', person: 'Ex dipendente — P. Brambilla', services: ['M365'],            mfa: false, status: 'Da disattivare' }
]

const INITIAL_TICKETS = [
  { id: 't-1', date: '2026-06-08', requester: 'Sofia Gialli',  subject: 'Stampante ufficio non raggiungibile', priority: 'Media', status: 'Aperto', assignee: 'Valerio Verdi' },
  { id: 't-2', date: '2026-06-07', requester: 'Marco Ferrari', subject: 'VPN lenta da cantiere BS25124',        priority: 'Alta',  status: 'In lavorazione', assignee: 'Valerio Verdi' },
  { id: 't-3', date: '2026-06-02', requester: 'Giulia Conti',  subject: 'Richiesta secondo monitor',            priority: 'Bassa', status: 'Chiuso', assignee: 'Mario Rossi' },
  { id: 't-4', date: '2026-05-30', requester: 'Gianni Corleto',subject: 'Tablet squadra non si accende',        priority: 'Alta',  status: 'Chiuso', assignee: 'Valerio Verdi' }
]

const PRIORITY_CFG = {
  'Alta':  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  'Media': { color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  'Bassa': { color: '#16a34a', bg: 'rgba(22,163,74,0.12)' }
}
const TICKET_STATUS_CFG = {
  'Aperto':         { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  'In lavorazione': { color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  'Chiuso':         { color: '#16a34a', bg: 'rgba(22,163,74,0.12)' }
}

const deviceIcon = (type) => type === 'Smartphone' ? Smartphone : type === 'SIM' ? CreditCard : Laptop

export default function ITAssetModule({ view = 'devices' }) {
  const [tab, setTab] = useState(view)
  useEffect(() => { setTab(view) }, [view])

  const [devices] = useLocalState('todos-it-devices', INITIAL_DEVICES)
  const [network] = useLocalState('todos-it-network', INITIAL_NETWORK)
  const [licenses] = useLocalState('todos-it-licenses', INITIAL_LICENSES)
  const [accounts, setAccounts] = useLocalState('todos-it-accounts', INITIAL_ACCOUNTS)
  const [tickets, setTickets] = useLocalState('todos-it-tickets', INITIAL_TICKETS)

  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [ticketForm, setTicketForm] = useState({ requester: '', subject: '', priority: 'Media' })

  const ticketsOpen = tickets.filter(t => t.status !== 'Chiuso').length

  const tabsWithBadge = TABS.map(t => t.id === 'helpdesk' ? { ...t, badge: ticketsOpen } : t)

  const deviceStats = useMemo(() => ([
    { label: 'Dispositivi', value: devices.length, icon: MonitorSmartphone, color: '#2563eb' },
    { label: 'Assegnati', value: devices.filter(d => d.status === 'Assegnato').length, icon: UserCircle2, color: '#16a34a' },
    { label: 'In magazzino', value: devices.filter(d => d.status === 'In magazzino').length, icon: MonitorSmartphone, color: '#7c3aed' },
    { label: 'Garanzie scadute', value: devices.filter(d => d.warranty && expiryInfo(d.warranty).status === 'scaduto').length, icon: AlertTriangle, color: '#ef4444' }
  ]), [devices])

  const licenseStats = useMemo(() => {
    const totCost = licenses.reduce((a, l) => a + Number(l.yearly_cost || 0), 0)
    const renewing = licenses.filter(l => l.renewal && (expiryInfo(l.renewal).status !== 'valido')).length
    const saturated = licenses.filter(l => l.used >= l.seats).length
    return [
      { label: 'Licenze gestite', value: licenses.length, icon: KeyRound, color: '#2563eb' },
      { label: 'Costo annuo', value: fmtEuro(totCost), icon: KeyRound, color: '#d90429' },
      { label: 'Rinnovi ≤ 30gg', value: renewing, icon: AlertTriangle, color: renewing > 0 ? '#d97706' : '#16a34a' },
      { label: 'Senza posti liberi', value: saturated, icon: AlertTriangle, color: saturated > 0 ? '#ef4444' : '#16a34a' }
    ]
  }, [licenses])

  const accountStats = useMemo(() => ([
    { label: 'Account attivi', value: accounts.filter(a => a.status === 'Attivo').length, icon: UserCircle2, color: '#16a34a' },
    { label: 'Senza MFA', value: accounts.filter(a => !a.mfa && a.status === 'Attivo').length, icon: ShieldOff, color: '#ef4444' },
    { label: 'Da disattivare', value: accounts.filter(a => a.status === 'Da disattivare').length, icon: AlertTriangle, color: '#d97706' }
  ]), [accounts])

  const ticketStats = useMemo(() => ([
    { label: 'Ticket aperti', value: ticketsOpen, icon: MessageSquare, color: ticketsOpen > 0 ? '#ef4444' : '#16a34a' },
    { label: 'In lavorazione', value: tickets.filter(t => t.status === 'In lavorazione').length, icon: MessageSquare, color: '#d97706' },
    { label: 'Chiusi (totale)', value: tickets.filter(t => t.status === 'Chiuso').length, icon: MessageSquare, color: '#16a34a' }
  ]), [tickets, ticketsOpen])

  const addTicket = () => {
    if (!ticketForm.requester.trim() || !ticketForm.subject.trim()) return
    setTickets([{
      id: 't-' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      requester: ticketForm.requester, subject: ticketForm.subject,
      priority: ticketForm.priority, status: 'Aperto', assignee: 'Valerio Verdi'
    }, ...tickets])
    setTicketModalOpen(false)
    setTicketForm({ requester: '', subject: '', priority: 'Media' })
  }

  const cycleTicketStatus = (id) => {
    const order = ['Aperto', 'In lavorazione', 'Chiuso']
    setTickets(tickets.map(t => t.id === id
      ? { ...t, status: order[(order.indexOf(t.status) + 1) % order.length] }
      : t))
  }

  const toggleAccountStatus = (id) => {
    setAccounts(accounts.map(a => a.id === id
      ? { ...a, status: a.status === 'Attivo' ? 'Da disattivare' : 'Attivo' }
      : a))
  }

  return (
    <ModulePage>
      <ModuleHeader
        icon={MonitorSmartphone}
        title="Asset — IT"
        subtitle="Dispositivi, rete, licenze, account e help desk interno."
        actions={tab === 'helpdesk' && (
          <button className="btn btn-primary" onClick={() => setTicketModalOpen(true)}>
            <Plus size={15} /> Nuovo ticket
          </button>
        )}
      />

      <TabBar tabs={tabsWithBadge} active={tab} onChange={setTab} />

      {/* ===== DISPOSITIVI ===== */}
      {tab === 'devices' && (
        <div>
          <StatGrid stats={deviceStats} />
          <TableWrap
            exportName="dispositivi_it"
            exportRows={devices.map(d => ({
              'Tipo': d.type, 'Modello': d.model, 'Matricola': d.serial,
              'Assegnatario': d.assignee ?? 'Non assegnato', 'Garanzia': d.warranty ?? '', 'Stato': d.status
            }))}
          >
            <table>
              <THead cols={['Tipo', 'Modello', 'Matricola', 'Assegnatario', 'Garanzia', 'Stato']} />
              <tbody>
                {devices.map(d => {
                  const Icon = deviceIcon(d.type)
                  return (
                    <tr key={d.id}>
                      <td style={tdStyle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                          <Icon size={14} style={{ color: 'var(--primary)' }} /> {d.type}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{d.model}</td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{d.serial}</td>
                      <td style={tdStyle}>{d.assignee || <em style={{ color: 'var(--text-muted)' }}>Non assegnato</em>}</td>
                      <td style={tdStyle}>{d.warranty ? <ExpiryPill date={d.warranty} /> : '—'}</td>
                      <td style={tdStyle}>
                        <Pill
                          color={d.status === 'Assegnato' ? '#16a34a' : '#7c3aed'}
                          bg={d.status === 'Assegnato' ? 'rgba(22,163,74,0.12)' : 'rgba(124,58,237,0.12)'}
                        >{d.status}</Pill>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableWrap>
        </div>
      )}

      {/* ===== APPARATI DI RETE ===== */}
      {tab === 'network' && (
        <TableWrap
          exportName="apparati_rete"
          exportRows={network.map(n => ({
            'Apparato': n.name, 'Ruolo': n.role, 'Sede': n.site, 'IP': n.ip,
            'Stato': n.status, 'End of support': n.eos
          }))}
        >
          <table>
            <THead cols={['Apparato', 'Ruolo', 'Sede', 'IP', 'Stato', 'End of support']} />
            <tbody>
              {network.map(n => (
                <tr key={n.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{n.name}</td>
                  <td style={tdStyle}>{n.role}</td>
                  <td style={tdStyle}>{n.site}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.78rem' }}>{n.ip}</td>
                  <td style={tdStyle}>
                    <Pill
                      color={n.status === 'Online' ? '#16a34a' : '#ef4444'}
                      bg={n.status === 'Online' ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.12)'}
                    >● {n.status}</Pill>
                  </td>
                  <td style={tdStyle}><ExpiryPill date={n.eos} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      {/* ===== LICENZE ===== */}
      {tab === 'licenses' && (
        <div>
          <StatGrid stats={licenseStats} />
          <TableWrap
            exportName="licenze_software"
            exportRows={licenses.map(l => ({
              'Software': l.name, 'Posti totali': l.seats, 'Posti usati': l.used,
              'Rinnovo': l.renewal ?? 'Perpetua', 'Costo annuo (EUR)': l.yearly_cost
            }))}
          >
            <table>
              <THead cols={['Software', 'Posti', 'Utilizzo', 'Rinnovo', 'Costo annuo']} />
              <tbody>
                {licenses.map(l => {
                  const pct = l.seats > 0 ? (l.used / l.seats) * 100 : 0
                  return (
                    <tr key={l.id}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{l.name}</td>
                      <td style={tdStyle}>{l.used} / {l.seats}</td>
                      <td style={{ ...tdStyle, minWidth: 130 }}>
                        <ProgressBar pct={pct} color={pct >= 100 ? '#ef4444' : pct >= 85 ? '#d97706' : '#16a34a'} />
                      </td>
                      <td style={tdStyle}>{l.renewal ? <ExpiryPill date={l.renewal} /> : <Pill color="#16a34a" bg="rgba(22,163,74,0.12)">Perpetua</Pill>}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{l.yearly_cost > 0 ? fmtEuro(l.yearly_cost) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableWrap>
        </div>
      )}

      {/* ===== ACCOUNT ===== */}
      {tab === 'accounts' && (
        <div>
          <StatGrid stats={accountStats} />
          <TableWrap
            exportName="account_aziendali"
            exportRows={accounts.map(a => ({
              'Persona': a.person, 'Servizi': a.services.join(', '),
              'MFA': a.mfa ? 'Attiva' : 'Assente', 'Stato': a.status
            }))}
          >
            <table>
              <THead cols={['Persona', 'Servizi', 'MFA', 'Stato', '']} />
              <tbody>
                {accounts.map(a => (
                  <tr key={a.id}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{a.person}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {a.services.map(s => <Pill key={s} color="var(--text-secondary)" bg="var(--primary-light)">{s}</Pill>)}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {a.mfa
                        ? <Pill color="#16a34a" bg="rgba(22,163,74,0.12)"><ShieldCheck size={11} /> Attiva</Pill>
                        : <Pill color="#ef4444" bg="rgba(239,68,68,0.12)"><ShieldOff size={11} /> Assente</Pill>}
                    </td>
                    <td style={tdStyle}>
                      <Pill
                        color={a.status === 'Attivo' ? '#16a34a' : '#d97706'}
                        bg={a.status === 'Attivo' ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)'}
                      >{a.status}</Pill>
                    </td>
                    <td style={tdStyle}>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => toggleAccountStatus(a.id)}>
                        {a.status === 'Attivo' ? 'Segna da disattivare' : 'Riattiva'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </div>
      )}

      {/* ===== HELP DESK ===== */}
      {tab === 'helpdesk' && (
        <div>
          <StatGrid stats={ticketStats} />
          {tickets.length === 0 ? (
            <Card><EmptyState icon={MessageSquare} title="Nessun ticket" text="Tutto tranquillo sul fronte IT." /></Card>
          ) : (
            <TableWrap
              exportName="ticket_helpdesk"
              exportRows={tickets.map(t => ({
                'Data': t.date, 'Richiedente': t.requester, 'Oggetto': t.subject,
                'Priorità': t.priority, 'Assegnato a': t.assignee, 'Stato': t.status
              }))}
            >
              <table>
                <THead cols={['Data', 'Richiedente', 'Oggetto', 'Priorità', 'Assegnato a', 'Stato']} />
                <tbody>
                  {tickets.map(t => {
                    const pr = PRIORITY_CFG[t.priority]
                    const st = TICKET_STATUS_CFG[t.status]
                    return (
                      <tr key={t.id}>
                        <td style={tdStyle}>{fmtDate(t.date)}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{t.requester}</td>
                        <td style={tdStyle}>{t.subject}</td>
                        <td style={tdStyle}><Pill color={pr.color} bg={pr.bg}>{t.priority}</Pill></td>
                        <td style={tdStyle}>{t.assignee}</td>
                        <td style={tdStyle}>
                          <button onClick={() => cycleTicketStatus(t.id)} title="Clic per avanzare lo stato"
                            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
                            <Pill color={st.color} bg={st.bg}>{t.status}</Pill>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </TableWrap>
          )}
        </div>
      )}

      {/* Modal nuovo ticket */}
      <Modal
        open={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Nuovo ticket help desk"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setTicketModalOpen(false)}>Annulla</button>
            <button className="btn btn-primary" onClick={addTicket}>Apri ticket</button>
          </>
        }
      >
        <div className="form-grid">
          <Field label="Richiedente">
            <input style={inputStyle} value={ticketForm.requester} onChange={e => setTicketForm({ ...ticketForm, requester: e.target.value })} placeholder="Nome e cognome" />
          </Field>
          <Field label="Priorità">
            <select style={selectStyle} value={ticketForm.priority} onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}>
              {Object.keys(PRIORITY_CFG).map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Oggetto" span>
            <input style={inputStyle} value={ticketForm.subject} onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })} placeholder="Descrivi il problema…" />
          </Field>
        </div>
      </Modal>
    </ModulePage>
  )
}
