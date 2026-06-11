import React, { useEffect, useMemo, useState } from 'react'
import {
  ShoppingCart, Briefcase, FileSpreadsheet, FileText, ClipboardList, FileSearch,
  Plus, CheckCircle2, XCircle, AlertTriangle, Sparkles, TrendingUp, Star
} from 'lucide-react'
import {
  ModulePage, ModuleHeader, TabBar, StatGrid, Card, TableWrap, THead, tdStyle,
  Pill, ExpiryPill, ProgressBar, EmptyState, Modal, Field, inputStyle, selectStyle,
  useLocalState, fmtEuro, fmtDate, expiryInfo, ExportButton
} from '../shared/ui'

// ============================================================================
// BuyingModule — Acquisti
// Viste: Fornitori | Listini | Accordi quadro | RDA | Ordini | Controllo fatture (AI)
// ============================================================================

const TABS = [
  { id: 'suppliers', label: 'Fornitori',        icon: Briefcase },
  { id: 'listini',   label: 'Listini',          icon: FileSpreadsheet },
  { id: 'accordi',   label: 'Accordi quadro',   icon: FileText },
  { id: 'rda',       label: 'RDA',              icon: ClipboardList },
  { id: 'orders',    label: 'Ordini',           icon: ShoppingCart },
  { id: 'invoices',  label: 'Controllo fatture (AI)', icon: FileSearch }
]

const INITIAL_SUPPLIERS = [
  { id: 'sup-1', name: 'Telmec Forniture Srl',   category: 'Materiale FO',     vat: '02845670163', rating: 4, durc_expiry: '2026-08-12', contact: 'ordini@telmec.it' },
  { id: 'sup-2', name: 'EdilNoleggi SpA',        category: 'Noleggio mezzi',   vat: '01938460982', rating: 3, durc_expiry: '2026-06-18', contact: 'noleggi@edilnoleggi.it' },
  { id: 'sup-3', name: 'SicurPoint Snc',         category: 'DPI & sicurezza',  vat: '03561240165', rating: 5, durc_expiry: '2026-11-03', contact: 'vendite@sicurpoint.it' },
  { id: 'sup-4', name: 'Ferramenta Industriale Bg', category: 'Consumabili',   vat: '01122334455', rating: 4, durc_expiry: '2026-05-20', contact: 'info@ferrindbg.it' }
]

const INITIAL_LISTINI = [
  { id: 'li-1', supplier: 'Telmec Forniture Srl', item: 'Cavo FO 48f (m)',        price: 1.18,  valid_until: '2026-12-31' },
  { id: 'li-2', supplier: 'Telmec Forniture Srl', item: 'Muffola 24f',            price: 38.50, valid_until: '2026-12-31' },
  { id: 'li-3', supplier: 'SicurPoint Snc',       item: 'Casco EN 397',           price: 12.90, valid_until: '2027-03-31' },
  { id: 'li-4', supplier: 'SicurPoint Snc',       item: 'Scarpe antinfortunio S3',price: 54.00, valid_until: '2027-03-31' },
  { id: 'li-5', supplier: 'EdilNoleggi SpA',      item: 'PLE 20m (giorno)',       price: 145.00,valid_until: '2026-09-30' }
]

const INITIAL_ACCORDI = [
  { id: 'aq-1', supplier: 'Telmec Forniture Srl', subject: 'Fornitura materiale FO 2026',   ceiling: 120000, used: 78400, expiry: '2026-12-31' },
  { id: 'aq-2', supplier: 'EdilNoleggi SpA',      subject: 'Noleggio mezzi d\'opera 2026',  ceiling: 60000,  used: 41200, expiry: '2026-12-31' },
  { id: 'aq-3', supplier: 'SicurPoint Snc',       subject: 'DPI e vestiario 2026-27',       ceiling: 25000,  used: 9800,  expiry: '2027-06-30' }
]

const INITIAL_RDA = [
  { id: 'rda-1', date: '2026-06-08', requester: 'Marco Ferrari',  dept: 'Operations', item: 'Muffole 24f ×20',           amount: 770,   cost_center: 'BG24043', status: 'In approvazione' },
  { id: 'rda-2', date: '2026-06-05', requester: 'Valerio Verdi',  dept: 'IT',         item: 'Laptop sostitutivo',        amount: 950,   cost_center: 'IT-2026', status: 'In approvazione' },
  { id: 'rda-3', date: '2026-06-01', requester: 'Roberto Corleto',dept: 'HSE',        item: 'Imbracature anticaduta ×4', amount: 480,   cost_center: 'HSE-2026', status: 'Approvata' },
  { id: 'rda-4', date: '2026-05-28', requester: 'Gianni Corleto', dept: 'Operations', item: 'Pigtail SC/APC ×200',       amount: 260,   cost_center: 'BG24043', status: 'Ordinata' },
  { id: 'rda-5', date: '2026-05-22', requester: 'Sofia Gialli',   dept: 'Amministrazione', item: 'Toner stampanti ×6',   amount: 310,   cost_center: 'GEN-2026', status: 'Ricevuta' },
  { id: 'rda-6', date: '2026-05-18', requester: 'Simone Galli',   dept: 'Operations', item: 'Smartphone personale',      amount: 740,   cost_center: 'BS25124', status: 'Rifiutata' }
]

const INITIAL_ORDERS = [
  { id: 'ord-1', number: 'ODA-2026-041', date: '2026-06-03', supplier: 'Telmec Forniture Srl', amount: 4820,  delivery: '2026-06-15', status: 'In consegna' },
  { id: 'ord-2', number: 'ODA-2026-040', date: '2026-05-29', supplier: 'SicurPoint Snc',       amount: 1240,  delivery: '2026-06-06', status: 'Consegnato' },
  { id: 'ord-3', number: 'ODA-2026-039', date: '2026-05-26', supplier: 'EdilNoleggi SpA',      amount: 2900,  delivery: '2026-06-20', status: 'Confermato' },
  { id: 'ord-4', number: 'ODA-2026-038', date: '2026-05-20', supplier: 'Ferramenta Industriale Bg', amount: 640, delivery: '2026-05-27', status: 'Consegnato' }
]

const INITIAL_INVOICES = [
  { id: 'inv-1', number: 'FT 2026/0892', supplier: 'Telmec Forniture Srl', order: 'ODA-2026-038', amount: 640,  ai_status: 'OK',        ai_note: 'Importo e quantità coerenti con l\'ordine.', confidence: 98 },
  { id: 'inv-2', number: 'FT 2026/0875', supplier: 'EdilNoleggi SpA',      order: 'ODA-2026-035', amount: 3120, ai_status: 'Anomalia',  ai_note: 'Importo +7,5% rispetto all\'ordine (€ 2.900). Possibile addebito extra trasporto non concordato.', confidence: 91 },
  { id: 'inv-3', number: 'FT 2026/0871', supplier: 'SicurPoint Snc',       order: 'ODA-2026-040', amount: 1240, ai_status: 'OK',        ai_note: 'Corrispondenza completa ordine/DDT/fattura.', confidence: 99 },
  { id: 'inv-4', number: 'FT 2026/0860', supplier: 'Telmec Forniture Srl', order: '—',            amount: 480,  ai_status: 'Da verificare', ai_note: 'Nessun ordine collegato trovato. Verificare se acquisto diretto autorizzato.', confidence: 76 }
]

const RDA_STATUS_CFG = {
  'Bozza':           { color: '#94a3b8', bg: 'rgba(148,163,184,0.14)' },
  'In approvazione': { color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  'Approvata':       { color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  'Ordinata':        { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  'Ricevuta':        { color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  'Rifiutata':       { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
}

const ORDER_STATUS_CFG = {
  'Confermato':  { color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  'In consegna': { color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  'Consegnato':  { color: '#16a34a', bg: 'rgba(22,163,74,0.12)' }
}

const AI_STATUS_CFG = {
  'OK':            { color: '#16a34a', bg: 'rgba(22,163,74,0.12)', icon: CheckCircle2 },
  'Anomalia':      { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: AlertTriangle },
  'Da verificare': { color: '#d97706', bg: 'rgba(217,119,6,0.12)', icon: FileSearch }
}

export default function BuyingModule({ view = 'suppliers' }) {
  const [tab, setTab] = useState(view)
  useEffect(() => { setTab(view) }, [view])

  const [suppliers] = useLocalState('todos-buy-suppliers', INITIAL_SUPPLIERS)
  const [listini] = useLocalState('todos-buy-listini', INITIAL_LISTINI)
  const [accordi] = useLocalState('todos-buy-accordi', INITIAL_ACCORDI)
  const [rda, setRda] = useLocalState('todos-buy-rda', INITIAL_RDA)
  const [orders] = useLocalState('todos-buy-orders', INITIAL_ORDERS)
  const [invoices] = useLocalState('todos-buy-invoices', INITIAL_INVOICES)

  const [rdaModalOpen, setRdaModalOpen] = useState(false)
  const [rdaForm, setRdaForm] = useState({ requester: '', dept: 'Operations', item: '', amount: '', cost_center: '' })

  const pendingRda = rda.filter(r => r.status === 'In approvazione').length
  const tabsWithBadge = TABS.map(t => t.id === 'rda' ? { ...t, badge: pendingRda } : t)

  const buyStats = useMemo(() => {
    const totOrders = orders.reduce((a, o) => a + Number(o.amount || 0), 0)
    const anomalie = invoices.filter(i => i.ai_status !== 'OK').length
    const durcInScadenza = suppliers.filter(s => expiryInfo(s.durc_expiry).status !== 'valido').length
    return [
      { label: 'Fornitori attivi', value: suppliers.length, icon: Briefcase, color: '#2563eb' },
      { label: 'RDA da approvare', value: pendingRda, icon: ClipboardList, color: pendingRda > 0 ? '#d97706' : '#16a34a' },
      { label: 'Ordinato (periodo)', value: fmtEuro(totOrders), icon: TrendingUp, color: '#7c3aed' },
      { label: 'Fatture da verificare', value: anomalie, icon: AlertTriangle, color: anomalie > 0 ? '#ef4444' : '#16a34a' },
      { label: 'DURC in scadenza', value: durcInScadenza, icon: AlertTriangle, color: durcInScadenza > 0 ? '#d97706' : '#16a34a' }
    ]
  }, [suppliers, orders, invoices, pendingRda])

  const setRdaStatus = (id, status) => setRda(rda.map(r => (r.id === id ? { ...r, status } : r)))

  const addRda = () => {
    if (!rdaForm.requester.trim() || !rdaForm.item.trim()) return
    setRda([{
      id: 'rda-' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      requester: rdaForm.requester, dept: rdaForm.dept, item: rdaForm.item,
      amount: Number(rdaForm.amount) || 0, cost_center: rdaForm.cost_center || '—',
      status: 'In approvazione'
    }, ...rda])
    setRdaModalOpen(false)
    setRdaForm({ requester: '', dept: 'Operations', item: '', amount: '', cost_center: '' })
  }

  return (
    <ModulePage>
      <ModuleHeader
        icon={ShoppingCart}
        title="Buying — Acquisti"
        subtitle="Fornitori, listini, accordi quadro, richieste d'acquisto e controllo fatture."
        actions={tab === 'rda' && (
          <button className="btn btn-primary" onClick={() => setRdaModalOpen(true)}>
            <Plus size={15} /> Nuova RDA
          </button>
        )}
      />

      <StatGrid stats={buyStats} />

      <TabBar tabs={tabsWithBadge} active={tab} onChange={setTab} />

      {/* ===== FORNITORI ===== */}
      {tab === 'suppliers' && (
        <TableWrap
          exportName="anagrafica_fornitori"
          exportRows={suppliers.map(s => ({
            'Ragione sociale': s.name, 'Categoria': s.category, 'P.IVA': s.vat,
            'Rating (1-5)': s.rating, 'Scadenza DURC': s.durc_expiry, 'Contatto': s.contact
          }))}
        >
          <table>
            <THead cols={['Ragione sociale', 'Categoria', 'P.IVA', 'Rating', 'DURC', 'Contatto']} />
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id}>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{s.name}</td>
                  <td style={tdStyle}><Pill color="var(--text-secondary)" bg="var(--primary-light)">{s.category}</Pill></td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.78rem' }}>{s.vat}</td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-flex', gap: 1 }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} size={13} style={{ color: n <= s.rating ? '#d97706' : 'var(--border-color)', fill: n <= s.rating ? '#d97706' : 'none' }} />
                      ))}
                    </span>
                  </td>
                  <td style={tdStyle}><ExpiryPill date={s.durc_expiry} /></td>
                  <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{s.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      {/* ===== LISTINI ===== */}
      {tab === 'listini' && (
        <TableWrap
          exportName="listini_fornitori"
          exportRows={listini.map(l => ({
            'Fornitore': l.supplier, 'Articolo': l.item,
            'Prezzo (EUR)': l.price, 'Valido fino al': l.valid_until
          }))}
        >
          <table>
            <THead cols={['Fornitore', 'Articolo', 'Prezzo concordato', 'Validità']} />
            <tbody>
              {listini.map(l => (
                <tr key={l.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{l.supplier}</td>
                  <td style={tdStyle}>{l.item}</td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtEuro(l.price, 2)}</td>
                  <td style={tdStyle}><ExpiryPill date={l.valid_until} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      {/* ===== ACCORDI QUADRO ===== */}
      {tab === 'accordi' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <ExportButton
              filename="accordi_quadro"
              rows={accordi.map(a => ({
                'Oggetto': a.subject, 'Fornitore': a.supplier,
                'Massimale (EUR)': a.ceiling, 'Utilizzato (EUR)': a.used,
                'Utilizzo %': a.ceiling > 0 ? Number(((a.used / a.ceiling) * 100).toFixed(1)) : '',
                'Scadenza': a.expiry
              }))}
            />
          </div>
          <div className="card-grid">
          {accordi.map(a => {
            const pct = a.ceiling > 0 ? (a.used / a.ceiling) * 100 : 0
            return (
              <Card key={a.id} style={{ padding: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{a.subject}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 12 }}>{a.supplier}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Utilizzato</span>
                  <strong style={{ color: pct > 90 ? '#ef4444' : 'var(--text-primary)' }}>
                    {fmtEuro(a.used)} / {fmtEuro(a.ceiling)} ({pct.toFixed(0)}%)
                  </strong>
                </div>
                <ProgressBar pct={pct} color={pct > 90 ? '#ef4444' : pct > 70 ? '#d97706' : '#16a34a'} height={9} />
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Scadenza accordo</span>
                  <ExpiryPill date={a.expiry} />
                </div>
              </Card>
            )
          })}
          </div>
        </div>
      )}

      {/* ===== RDA ===== */}
      {tab === 'rda' && (
        rda.length === 0 ? (
          <Card><EmptyState icon={ClipboardList} title="Nessuna richiesta" text="Crea la prima RDA con il pulsante in alto." /></Card>
        ) : (
          <TableWrap
            exportName="richieste_acquisto_rda"
            exportRows={rda.map(r => ({
              'Data': r.date, 'Richiedente': r.requester, 'Funzione': r.dept,
              'Oggetto': r.item, 'Importo (EUR)': r.amount,
              'Centro di costo': r.cost_center, 'Stato': r.status
            }))}
          >
            <table>
              <THead cols={['Data', 'Richiedente', 'Oggetto', 'Importo', 'Centro di costo', 'Stato', 'Azioni']} />
              <tbody>
                {rda.map(r => {
                  const st = RDA_STATUS_CFG[r.status] || RDA_STATUS_CFG['Bozza']
                  return (
                    <tr key={r.id}>
                      <td style={tdStyle}>{fmtDate(r.date)}</td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>{r.requester}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.dept}</div>
                      </td>
                      <td style={tdStyle}>{r.item}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtEuro(r.amount)}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.76rem' }}>{r.cost_center}</td>
                      <td style={tdStyle}><Pill color={st.color} bg={st.bg}>{r.status}</Pill></td>
                      <td style={tdStyle}>
                        {r.status === 'In approvazione' ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#16a34a' }}
                              onClick={() => setRdaStatus(r.id, 'Approvata')}>
                              <CheckCircle2 size={12} /> Approva
                            </button>
                            <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                              onClick={() => setRdaStatus(r.id, 'Rifiutata')}>
                              <XCircle size={12} /> Rifiuta
                            </button>
                          </div>
                        ) : r.status === 'Approvata' ? (
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            onClick={() => setRdaStatus(r.id, 'Ordinata')}>
                            <ShoppingCart size={12} /> Segna ordinata
                          </button>
                        ) : r.status === 'Ordinata' ? (
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            onClick={() => setRdaStatus(r.id, 'Ricevuta')}>
                            <CheckCircle2 size={12} /> Segna ricevuta
                          </button>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableWrap>
        )
      )}

      {/* ===== ORDINI ===== */}
      {tab === 'orders' && (
        <TableWrap
          exportName="ordini_fornitori"
          exportRows={orders.map(o => ({
            'Numero': o.number, 'Data': o.date, 'Fornitore': o.supplier,
            'Importo (EUR)': o.amount, 'Consegna prevista': o.delivery, 'Stato': o.status
          }))}
        >
          <table>
            <THead cols={['Numero', 'Data', 'Fornitore', 'Importo', 'Consegna prevista', 'Stato']} />
            <tbody>
              {orders.map(o => {
                const st = ORDER_STATUS_CFG[o.status] || ORDER_STATUS_CFG['Confermato']
                return (
                  <tr key={o.id}>
                    <td style={{ ...tdStyle, fontWeight: 700, fontFamily: 'monospace', fontSize: '0.78rem' }}>{o.number}</td>
                    <td style={tdStyle}>{fmtDate(o.date)}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{o.supplier}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtEuro(o.amount)}</td>
                    <td style={tdStyle}>{fmtDate(o.delivery)}</td>
                    <td style={tdStyle}><Pill color={st.color} bg={st.bg}>{o.status}</Pill></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TableWrap>
      )}

      {/* ===== CONTROLLO FATTURE AI ===== */}
      {tab === 'invoices' && (
        <div>
          <Card style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              L'AI confronta automaticamente ogni fattura con ordini e DDT collegati,
              segnalando differenze di importo, quantità o fatture senza ordine.
            </p>
            <ExportButton
              filename="controllo_fatture"
              rows={invoices.map(inv => ({
                'Numero fattura': inv.number, 'Fornitore': inv.supplier, 'Ordine': inv.order,
                'Importo (EUR)': inv.amount, 'Esito AI': inv.ai_status,
                'Nota AI': inv.ai_note, 'Confidenza %': inv.confidence
              }))}
            />
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {invoices.map(inv => {
              const cfg = AI_STATUS_CFG[inv.ai_status]
              const Icon = cfg.icon
              return (
                <Card key={inv.id} style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: 8 }}>
                    <Icon size={18} style={{ color: cfg.color, flexShrink: 0 }} />
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{inv.number}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{inv.supplier}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.88rem' }}>{fmtEuro(inv.amount)}</span>
                    <Pill color={cfg.color} bg={cfg.bg}>{inv.ai_status}</Pill>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <span>Ordine: <strong style={{ fontFamily: 'monospace' }}>{inv.order}</strong></span>
                    <span style={{ flex: 1, minWidth: 200 }}>{inv.ai_note}</span>
                    <span style={{ color: 'var(--text-muted)' }}>Confidenza AI: {inv.confidence}%</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal nuova RDA */}
      <Modal
        open={rdaModalOpen}
        onClose={() => setRdaModalOpen(false)}
        title="Nuova richiesta d'acquisto"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setRdaModalOpen(false)}>Annulla</button>
            <button className="btn btn-primary" onClick={addRda}>Invia in approvazione</button>
          </>
        }
      >
        <div className="form-grid">
          <Field label="Richiedente">
            <input style={inputStyle} value={rdaForm.requester} onChange={e => setRdaForm({ ...rdaForm, requester: e.target.value })} />
          </Field>
          <Field label="Funzione">
            <select style={selectStyle} value={rdaForm.dept} onChange={e => setRdaForm({ ...rdaForm, dept: e.target.value })}>
              {['Operations', 'IT', 'HSE', 'HR', 'Amministrazione', 'Servizi Generali'].map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Oggetto della richiesta" span>
            <input style={inputStyle} value={rdaForm.item} onChange={e => setRdaForm({ ...rdaForm, item: e.target.value })} placeholder="Cosa serve acquistare…" />
          </Field>
          <Field label="Importo stimato (€)">
            <input type="number" style={inputStyle} value={rdaForm.amount} onChange={e => setRdaForm({ ...rdaForm, amount: e.target.value })} />
          </Field>
          <Field label="Centro di costo">
            <input style={inputStyle} value={rdaForm.cost_center} onChange={e => setRdaForm({ ...rdaForm, cost_center: e.target.value })} placeholder="Es. BG24043" />
          </Field>
        </div>
      </Modal>
    </ModulePage>
  )
}
