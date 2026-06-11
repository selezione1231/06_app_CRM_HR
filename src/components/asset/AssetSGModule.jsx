import React, { useEffect, useMemo, useState } from 'react'
import {
  Fuel, Building, Wrench, Package, Plus, AlertTriangle, TrendingUp,
  Car, Boxes, ArrowDownCircle, ArrowUpCircle, Trash2
} from 'lucide-react'
import {
  ModulePage, ModuleHeader, TabBar, StatGrid, Card, TableWrap, THead, tdStyle,
  Pill, ExpiryPill, ProgressBar, EmptyState, Modal, Field, inputStyle, selectStyle,
  useSharedState, fmtEuro, fmtNum, fmtDate, expiryInfo, ExportButton,
  ImportButton, pickField, cellToISODate
} from '../shared/ui'

// ============================================================================
// AssetSGModule — Asset / Servizi Generali
// Viste: Consumi carburante | Sedi & impianti | Beni & attrezzature | Inventario
// La vista iniziale arriva dalla sidebar (prop `view`), i tab interni
// permettono di passare da una sezione all'altra.
// ============================================================================

const TABS = [
  { id: 'fuel',      label: 'Consumi carburante', icon: Fuel },
  { id: 'sites',     label: 'Sedi & impianti',    icon: Building },
  { id: 'equipment', label: 'Beni & attrezzature',icon: Wrench },
  { id: 'warehouse', label: 'Inventario',         icon: Package }
]

// --- Demo data ----------------------------------------------------------------
const VEHICLES = ['FT123AB — Fiat Ducato', 'GH456CD — Iveco Daily', 'JK789EF — Fiat Panda Van', 'LM012GH — Ford Transit']

const INITIAL_FUEL = [
  { id: 'f-1', date: '2026-06-05', vehicle: VEHICLES[0], liters: 62,  amount: 105.4, km: 128400 },
  { id: 'f-2', date: '2026-06-03', vehicle: VEHICLES[1], liters: 71,  amount: 120.7, km: 89200 },
  { id: 'f-3', date: '2026-05-28', vehicle: VEHICLES[0], liters: 58,  amount: 98.6,  km: 127650 },
  { id: 'f-4', date: '2026-05-25', vehicle: VEHICLES[2], liters: 38,  amount: 64.6,  km: 45300 },
  { id: 'f-5', date: '2026-05-20', vehicle: VEHICLES[3], liters: 66,  amount: 112.2, km: 152800 },
  { id: 'f-6', date: '2026-05-12', vehicle: VEHICLES[1], liters: 69,  amount: 117.3, km: 88350 }
]

const INITIAL_SITES = [
  { id: 's-1', name: 'Sede centrale Milano', address: 'Via Larga 8, Milano', type: 'Uffici',
    plants: [
      { id: 'pl-1', name: 'Climatizzazione', next_maintenance: '2026-09-15' },
      { id: 'pl-2', name: 'Impianto antincendio', next_maintenance: '2026-06-20' },
      { id: 'pl-3', name: 'Ascensore', next_maintenance: '2026-07-02' }
    ] },
  { id: 's-2', name: 'Magazzino Bergamo', address: 'Via dell\'Industria 12, Bergamo', type: 'Magazzino',
    plants: [
      { id: 'pl-4', name: 'Impianto antincendio', next_maintenance: '2026-05-30' },
      { id: 'pl-5', name: 'Carroponte', next_maintenance: '2026-11-10' }
    ] },
  { id: 's-3', name: 'Ufficio Brescia', address: 'Via Milano 45, Brescia', type: 'Uffici',
    plants: [
      { id: 'pl-6', name: 'Climatizzazione', next_maintenance: '2027-03-01' }
    ] }
]

const INITIAL_EQUIPMENT = [
  { id: 'e-1', name: 'Giuntatrice Fujikura 90S', category: 'Strumentazione', serial: 'FJK-2031', assignee: 'Gianni Corleto', status: 'Operativo', next_check: '2026-10-12' },
  { id: 'e-2', name: 'OTDR EXFO MaxTester',      category: 'Strumentazione', serial: 'EXF-7741', assignee: 'Matteo Sala',    status: 'Operativo', next_check: '2026-06-25' },
  { id: 'e-3', name: 'Miniescavatore Kubota',    category: 'Mezzi d\'opera', serial: 'KBT-1102', assignee: 'Squadra Bravo',  status: 'In manutenzione', next_check: '2026-06-08' },
  { id: 'e-4', name: 'Generatore Honda 5kW',     category: 'Attrezzatura',   serial: 'HND-5520', assignee: 'Magazzino BG',   status: 'Operativo', next_check: '2027-01-15' },
  { id: 'e-5', name: 'PLE autocarrata 20m',      category: 'Mezzi d\'opera', serial: 'PLE-0098', assignee: 'Marco Ferrari',  status: 'Operativo', next_check: '2026-05-30' },
  { id: 'e-6', name: 'Compressore aria 50L',     category: 'Attrezzatura',   serial: 'CMP-3310', assignee: 'Magazzino BG',   status: 'Fuori uso', next_check: null }
]

const INITIAL_INVENTORY = [
  { id: 'i-1', code: 'FO-048', name: 'Cavo FO 48 fibre (m)',     location: 'BG — Scaffale A1', qty: 3200, min_qty: 1000, unit: 'm' },
  { id: 'i-2', code: 'FO-144', name: 'Cavo FO 144 fibre (m)',    location: 'BG — Scaffale A2', qty: 850,  min_qty: 1000, unit: 'm' },
  { id: 'i-3', code: 'MUF-24', name: 'Muffola 24 fibre',         location: 'BG — Scaffale B1', qty: 46,   min_qty: 20,   unit: 'pz' },
  { id: 'i-4', code: 'ROE-8',  name: 'ROE 8 utenze',             location: 'BG — Scaffale B3', qty: 12,   min_qty: 25,   unit: 'pz' },
  { id: 'i-5', code: 'TUB-50', name: 'Tubazione corrugata Ø50 (m)', location: 'BG — Esterno',  qty: 5400, min_qty: 2000, unit: 'm' },
  { id: 'i-6', code: 'PIG-SC', name: 'Pigtail SC/APC',           location: 'MI — Armadio 2',   qty: 380,  min_qty: 100,  unit: 'pz' }
]

const EQUIP_STATUS = {
  'Operativo':        { color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  'In manutenzione':  { color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  'Fuori uso':        { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
}

export default function AssetSGModule({ view = 'fuel' }) {
  const [tab, setTab] = useState(view)
  useEffect(() => { setTab(view) }, [view])

  const [fuel, setFuel] = useSharedState('todos-asset-fuel', INITIAL_FUEL)
  const [sites] = useSharedState('todos-asset-sites', INITIAL_SITES)
  const [equipment, setEquipment] = useSharedState('todos-asset-equipment', INITIAL_EQUIPMENT)
  const [inventory, setInventory] = useSharedState('todos-asset-inventory', INITIAL_INVENTORY)

  // --- Fuel ---------------------------------------------------------------
  const [fuelModalOpen, setFuelModalOpen] = useState(false)
  const [fuelForm, setFuelForm] = useState({ date: '', vehicle: VEHICLES[0], liters: '', amount: '', km: '' })

  const fuelStats = useMemo(() => {
    const totL = fuel.reduce((a, f) => a + Number(f.liters || 0), 0)
    const totE = fuel.reduce((a, f) => a + Number(f.amount || 0), 0)
    const avgPrice = totL > 0 ? totE / totL : 0
    return [
      { label: 'Rifornimenti', value: fuel.length, icon: Fuel, color: '#2563eb' },
      { label: 'Litri totali', value: fmtNum(totL), icon: Fuel, color: '#7c3aed' },
      { label: 'Spesa totale', value: fmtEuro(totE), icon: TrendingUp, color: '#d90429' },
      { label: '€/litro medio', value: fmtEuro(avgPrice, 2), icon: TrendingUp, color: '#d97706' }
    ]
  }, [fuel])

  const fuelByVehicle = useMemo(() => {
    const map = {}
    for (const f of fuel) {
      if (!map[f.vehicle]) map[f.vehicle] = { liters: 0, amount: 0 }
      map[f.vehicle].liters += Number(f.liters || 0)
      map[f.vehicle].amount += Number(f.amount || 0)
    }
    const max = Math.max(1, ...Object.values(map).map(v => v.amount))
    return Object.entries(map).map(([vehicle, v]) => ({ vehicle, ...v, pct: (v.amount / max) * 100 }))
  }, [fuel])

  const addFuel = () => {
    if (!fuelForm.date || !fuelForm.liters || !fuelForm.amount) return
    setFuel([{ id: 'f-' + Date.now(), ...fuelForm, liters: Number(fuelForm.liters), amount: Number(fuelForm.amount), km: Number(fuelForm.km) || null }, ...fuel])
    setFuelModalOpen(false)
    setFuelForm({ date: '', vehicle: VEHICLES[0], liters: '', amount: '', km: '' })
  }

  // --- Equipment ------------------------------------------------------------
  const equipStats = useMemo(() => ([
    { label: 'Attrezzature', value: equipment.length, icon: Wrench, color: '#2563eb' },
    { label: 'Operative', value: equipment.filter(e => e.status === 'Operativo').length, icon: Wrench, color: '#16a34a' },
    { label: 'In manutenzione', value: equipment.filter(e => e.status === 'In manutenzione').length, icon: AlertTriangle, color: '#d97706' },
    { label: 'Verifiche scadute', value: equipment.filter(e => e.next_check && expiryInfo(e.next_check).status === 'scaduto').length, icon: AlertTriangle, color: '#ef4444' }
  ]), [equipment])

  const cycleEquipStatus = (id) => {
    const order = ['Operativo', 'In manutenzione', 'Fuori uso']
    setEquipment(equipment.map(e => e.id === id
      ? { ...e, status: order[(order.indexOf(e.status) + 1) % order.length] }
      : e))
  }

  // --- Inventory --------------------------------------------------------------
  const [moveModal, setMoveModal] = useState(null) // { item, dir }
  const [moveQty, setMoveQty] = useState('')

  const invStats = useMemo(() => ([
    { label: 'Articoli a catalogo', value: inventory.length, icon: Boxes, color: '#2563eb' },
    { label: 'Sotto scorta', value: inventory.filter(i => i.qty < i.min_qty).length, icon: AlertTriangle, color: '#ef4444' },
    { label: 'Ubicazioni', value: new Set(inventory.map(i => i.location.split(' — ')[0])).size, icon: Building, color: '#7c3aed' }
  ]), [inventory])

  const applyMove = () => {
    const qty = Number(moveQty)
    if (!moveModal || !qty || qty <= 0) return
    setInventory(inventory.map(i => i.id === moveModal.item.id
      ? { ...i, qty: Math.max(0, i.qty + (moveModal.dir === 'in' ? qty : -qty)) }
      : i))
    setMoveModal(null)
    setMoveQty('')
  }

  return (
    <ModulePage>
      <ModuleHeader
        icon={Boxes}
        title="Asset — Servizi Generali"
        subtitle="Carburante, sedi e impianti, attrezzature e magazzino."
        actions={tab === 'fuel' && (
          <button className="btn btn-primary" onClick={() => setFuelModalOpen(true)}>
            <Plus size={15} /> Nuovo rifornimento
          </button>
        )}
      />

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* ===== CONSUMI CARBURANTE ===== */}
      {tab === 'fuel' && (
        <div>
          <StatGrid stats={fuelStats} />

          <Card style={{ padding: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)' }}>Spesa per mezzo</h3>
            {fuelByVehicle.map(v => (
              <div key={v.vehicle} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}><Car size={12} style={{ verticalAlign: -2 }} /> {v.vehicle}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{fmtNum(v.liters)} L · {fmtEuro(v.amount)}</span>
                </div>
                <ProgressBar pct={v.pct} color="var(--primary)" />
              </div>
            ))}
          </Card>

          <TableWrap
            exportName="consumi_carburante"
            exportRows={fuel.map(f => ({
              'Data': f.date, 'Mezzo': f.vehicle, 'Litri': f.liters,
              'Importo (EUR)': f.amount, 'Km': f.km ?? '',
              'EUR/litro': f.liters > 0 ? Number((f.amount / f.liters).toFixed(3)) : ''
            }))}
          >
            <table>
              <THead cols={['Data', 'Mezzo', 'Litri', 'Importo', 'Km', '€/litro']} />
              <tbody>
                {fuel.map(f => (
                  <tr key={f.id}>
                    <td style={tdStyle}>{fmtDate(f.date)}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{f.vehicle}</td>
                    <td style={tdStyle}>{fmtNum(f.liters)} L</td>
                    <td style={tdStyle}>{fmtEuro(f.amount, 2)}</td>
                    <td style={tdStyle}>{f.km ? fmtNum(f.km) : '—'}</td>
                    <td style={tdStyle}>{f.liters > 0 ? fmtEuro(f.amount / f.liters, 2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </div>
      )}

      {/* ===== SEDI & IMPIANTI ===== */}
      {tab === 'sites' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <ExportButton
              filename="sedi_impianti"
              rows={sites.flatMap(s => s.plants.map(pl => ({
                'Sede': s.name, 'Indirizzo': s.address, 'Tipo': s.type,
                'Impianto': pl.name, 'Prossima manutenzione': pl.next_maintenance
              })))}
            />
          </div>
          <div className="card-grid">
          {sites.map(site => (
            <Card key={site.id} style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{site.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{site.address}</div>
                </div>
                <Pill color="#2563eb" bg="rgba(37,99,235,0.12)">{site.type}</Pill>
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '10px 0 6px' }}>
                Impianti & manutenzioni
              </div>
              {site.plants.map(pl => (
                <div key={pl.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px dashed var(--border-color)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{pl.name}</span>
                  <ExpiryPill date={pl.next_maintenance} />
                </div>
              ))}
            </Card>
          ))}
          </div>
        </div>
      )}

      {/* ===== BENI & ATTREZZATURE ===== */}
      {tab === 'equipment' && (
        <div>
          <StatGrid stats={equipStats} />
          <TableWrap
            exportName="beni_attrezzature"
            extraActions={
              <ImportButton
                label="Importa attrezzature"
                confirmText={'Importare {n} attrezzature da "{file}"?'}
                mapRow={(r, i) => {
                  const name = pickField(r, 'Attrezzatura', 'Nome', 'Descrizione', 'Bene')
                  if (!name) return null
                  return {
                    id: `e-imp-${Date.now()}-${i}`,
                    name: String(name),
                    category: String(pickField(r, 'Categoria', 'Tipo') || 'Strumentazione'),
                    serial: String(pickField(r, 'Matricola', 'Seriale', 'S/N', 'SN', 'Serial') || ''),
                    assignee: String(pickField(r, 'Assegnatario', 'Assegnato a', 'Operatore', 'Squadra') || ''),
                    status: String(pickField(r, 'Stato', 'Status') || 'Operativo'),
                    next_check: cellToISODate(pickField(r, 'Prossima verifica', 'Scadenza verifica', 'Verifica', 'Scadenza')) || null
                  }
                }}
                onImport={(rows) => setEquipment([...rows, ...equipment])}
              />
            }
            exportRows={equipment.map(e => ({
              'Attrezzatura': e.name, 'Categoria': e.category, 'Matricola': e.serial,
              'Assegnatario': e.assignee, 'Stato': e.status, 'Prossima verifica': e.next_check ?? ''
            }))}
          >
            <table>
              <THead cols={['Attrezzatura', 'Categoria', 'Matricola', 'Assegnatario', 'Stato', 'Prossima verifica']} />
              <tbody>
                {equipment.map(e => {
                  const st = EQUIP_STATUS[e.status]
                  return (
                    <tr key={e.id}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{e.name}</td>
                      <td style={tdStyle}>{e.category}</td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{e.serial}</td>
                      <td style={tdStyle}>{e.assignee}</td>
                      <td style={tdStyle}>
                        <button onClick={() => cycleEquipStatus(e.id)} title="Clic per cambiare stato"
                          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
                          <Pill color={st.color} bg={st.bg}>{e.status}</Pill>
                        </button>
                      </td>
                      <td style={tdStyle}>{e.next_check ? <ExpiryPill date={e.next_check} /> : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableWrap>
        </div>
      )}

      {/* ===== INVENTARIO ===== */}
      {tab === 'warehouse' && (
        <div>
          <StatGrid stats={invStats} />
          <TableWrap
            exportName="inventario_magazzino"
            exportRows={inventory.map(i => ({
              'Codice': i.code, 'Articolo': i.name, 'Ubicazione': i.location,
              'Giacenza': i.qty, 'Scorta minima': i.min_qty, 'UM': i.unit,
              'Stato': i.qty < i.min_qty ? 'Sotto scorta' : 'OK'
            }))}
          >
            <table>
              <THead cols={['Codice', 'Articolo', 'Ubicazione', 'Giacenza', 'Scorta min.', 'Stato', 'Movimenti']} />
              <tbody>
                {inventory.map(i => {
                  const low = i.qty < i.min_qty
                  return (
                    <tr key={i.id}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--text-muted)' }}>{i.code}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{i.name}</td>
                      <td style={tdStyle}>{i.location}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: low ? '#ef4444' : 'var(--text-primary)' }}>{fmtNum(i.qty)} {i.unit}</td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{fmtNum(i.min_qty)} {i.unit}</td>
                      <td style={tdStyle}>
                        {low
                          ? <Pill color="#ef4444" bg="rgba(239,68,68,0.12)"><AlertTriangle size={11} /> Sotto scorta</Pill>
                          : <Pill color="#16a34a" bg="rgba(22,163,74,0.12)">OK</Pill>}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            onClick={() => { setMoveModal({ item: i, dir: 'in' }); setMoveQty('') }}>
                            <ArrowDownCircle size={12} /> Carico
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            onClick={() => { setMoveModal({ item: i, dir: 'out' }); setMoveQty('') }}>
                            <ArrowUpCircle size={12} /> Scarico
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableWrap>
        </div>
      )}

      {/* Modal rifornimento */}
      <Modal
        open={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
        title="Nuovo rifornimento"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setFuelModalOpen(false)}>Annulla</button>
            <button className="btn btn-primary" onClick={addFuel}>Salva</button>
          </>
        }
      >
        <div className="form-grid">
          <Field label="Data">
            <input type="date" style={inputStyle} value={fuelForm.date} onChange={e => setFuelForm({ ...fuelForm, date: e.target.value })} />
          </Field>
          <Field label="Mezzo">
            <select style={selectStyle} value={fuelForm.vehicle} onChange={e => setFuelForm({ ...fuelForm, vehicle: e.target.value })}>
              {VEHICLES.map(v => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Litri">
            <input type="number" style={inputStyle} value={fuelForm.liters} onChange={e => setFuelForm({ ...fuelForm, liters: e.target.value })} />
          </Field>
          <Field label="Importo (€)">
            <input type="number" step="0.01" style={inputStyle} value={fuelForm.amount} onChange={e => setFuelForm({ ...fuelForm, amount: e.target.value })} />
          </Field>
          <Field label="Km al rifornimento">
            <input type="number" style={inputStyle} value={fuelForm.km} onChange={e => setFuelForm({ ...fuelForm, km: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Modal movimento magazzino */}
      <Modal
        open={!!moveModal}
        onClose={() => setMoveModal(null)}
        title={moveModal ? `${moveModal.dir === 'in' ? 'Carico' : 'Scarico'} — ${moveModal.item.name}` : ''}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setMoveModal(null)}>Annulla</button>
            <button className="btn btn-primary" onClick={applyMove}>Conferma</button>
          </>
        }
      >
        {moveModal && (
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              Giacenza attuale: <strong>{fmtNum(moveModal.item.qty)} {moveModal.item.unit}</strong>
            </p>
            <Field label={`Quantità da ${moveModal.dir === 'in' ? 'caricare' : 'scaricare'} (${moveModal.item.unit})`}>
              <input type="number" min="1" style={inputStyle} value={moveQty} onChange={e => setMoveQty(e.target.value)} autoFocus />
            </Field>
          </div>
        )}
      </Modal>
    </ModulePage>
  )
}
