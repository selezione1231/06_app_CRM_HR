import React, { useState, useEffect, useRef } from 'react'
import { X, Inbox, Download, Upload } from 'lucide-react'

// ============================================================================
// shared/ui — primitive UI riusabili per i moduli del Todos Hub
// ----------------------------------------------------------------------------
// Tutti i componenti usano le CSS variables del design system (index.css)
// e le classi responsive .module-page / .module-tabs / .table-wrap / .stat-grid
// così ogni modulo è automaticamente mobile-friendly.
// ============================================================================

// --- Persistenza condivisa (Supabase + cache localStorage + realtime) -------
export { useSharedState } from '../../lib/sharedState'

// --- Persistenza locale (stesso pattern di HSEModule) -----------------------
export function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : initial
    } catch { return initial }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)) } catch { /* no-op */ }
  }, [key, state])
  return [state, setState]
}

// --- Formattazione -----------------------------------------------------------
export const fmtEuro = (n, dec = 0) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: dec }).format(Number(n) || 0)

export const fmtNum = (n, dec = 0) =>
  new Intl.NumberFormat('it-IT', { maximumFractionDigits: dec }).format(Number(n) || 0)

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export const daysUntil = (d) =>
  d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null

// Stato scadenza → colore/etichetta
export function expiryInfo(d) {
  const days = daysUntil(d)
  if (days === null) return { status: 'nd',          color: '#94a3b8', bg: 'rgba(148,163,184,0.14)', label: 'N.D.' }
  if (days < 0)      return { status: 'scaduto',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Scaduto' }
  if (days <= 30)    return { status: 'in-scadenza', color: '#d97706', bg: 'rgba(217,119,6,0.12)',  label: `${days} gg` }
  return               { status: 'valido',      color: '#16a34a', bg: 'rgba(22,163,74,0.12)',  label: 'Valido' }
}

// --- Stili input -------------------------------------------------------------
export const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
  border: '1px solid var(--border-color)', borderRadius: '8px',
  fontSize: '0.85rem', outline: 'none',
  background: 'var(--bg-card)', color: 'var(--text-primary)'
}
export const selectStyle = { ...inputStyle }

// --- Layout ------------------------------------------------------------------
export function ModulePage({ children }) {
  return <div className="module-page">{children}</div>
}

export function ModuleHeader({ icon: Icon, title, subtitle, actions }) {
  return (
    <div className="module-header" style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap',
      marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid var(--border-color)'
    }}>
      {Icon && <Icon size={30} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: '200px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  )
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="module-tabs">
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = active === tab.id
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
            border: '1px solid ' + (isActive ? 'var(--primary)' : 'var(--border-color)'),
            borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            fontSize: '0.8rem', fontWeight: isActive ? 700 : 500,
            background: isActive ? 'var(--primary-light)' : 'var(--bg-card)',
            color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
          }}>
            {Icon && <Icon size={14} />} {tab.label}
            {tab.badge != null && tab.badge !== 0 && (
              <span style={{
                background: 'var(--primary)', color: 'white', borderRadius: '999px',
                fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', lineHeight: 1.4
              }}>{tab.badge}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// --- KPI ----------------------------------------------------------------------
export function StatGrid({ stats }) {
  return (
    <div className="stat-grid">
      {stats.map(k => {
        const Icon = k.icon
        return (
          <div key={k.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: '10px', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            {Icon && (
              <div style={{
                width: 36, height: 36, borderRadius: '8px', flexShrink: 0,
                background: (k.color || 'var(--primary)') + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={17} style={{ color: k.color || 'var(--primary)' }} />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 'clamp(1.02rem, 4.2vw, 1.45rem)', fontWeight: 800, color: k.color || 'var(--text-primary)', lineHeight: 1.1, overflowWrap: 'anywhere' }}>{k.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{k.label}</div>
              {k.sub && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', opacity: 0.8 }}>{k.sub}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// --- Contenitori --------------------------------------------------------------
export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: '12px', overflow: 'hidden', ...style
    }}>{children}</div>
  )
}

// --- Export XLSX -----------------------------------------------------------------
// Esporta un array di oggetti in un file .xlsx. Le chiavi degli oggetti
// diventano le intestazioni di colonna. La libreria è caricata on-demand
// (dynamic import) per non pesare sul bundle iniziale.
export async function exportRowsToXlsx(rows, filename = 'export', sheetName = 'Dati') {
  if (!rows || rows.length === 0) return
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = Object.keys(rows[0]).map(k => ({
    wch: Math.min(45, Math.max(k.length, ...rows.map(r => String(r[k] ?? '').length)) + 2)
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31))
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function ExportButton({ rows, filename, label = 'Esporta XLSX' }) {
  const disabled = !rows || rows.length === 0
  return (
    <button
      className="btn btn-secondary"
      onClick={() => exportRowsToXlsx(rows, filename)}
      disabled={disabled}
      title={disabled ? 'Nessun dato da esportare' : `Scarica ${filename}.xlsx`}
      style={{ padding: '5px 10px', fontSize: '0.75rem', opacity: disabled ? 0.5 : 1 }}
    >
      <Download size={13} /> {label}
    </button>
  )
}

// --- Import XLSX -----------------------------------------------------------------
// Legge la prima colonna-intestazioni di un .xlsx/.xls/.csv e restituisce le
// righe come array di oggetti. Speculare a exportRowsToXlsx.

// Cerca un valore nella riga provando più nomi di colonna (case/accenti-insensitive).
export function pickField(row, ...names) {
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
  for (const key of Object.keys(row)) {
    for (const n of names) {
      if (norm(key) === norm(n)) {
        const v = row[key]
        if (v !== undefined && v !== null && String(v).trim() !== '') return v
      }
    }
  }
  return ''
}

// Converte una cella data (seriale Excel, Date o stringa) in 'YYYY-MM-DD' (o '').
export function cellToISODate(v) {
  if (v === undefined || v === null || v === '') return ''
  if (typeof v === 'number') {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000))
    return isNaN(d) ? '' : d.toISOString().slice(0, 10)
  }
  if (v instanceof Date) return isNaN(v) ? '' : v.toISOString().slice(0, 10)
  const s = String(v).trim()
  // dd/mm/yyyy o dd-mm-yyyy → ISO
  const it = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (it) return `${it[3]}-${it[2].padStart(2, '0')}-${it[1].padStart(2, '0')}`
  const d = new Date(s)
  return isNaN(d) ? '' : d.toISOString().slice(0, 10)
}

// Pulsante "Importa XLSX": apre il file picker, parsa il foglio, mappa le righe
// con mapRow (riga grezza → entità; ritorna null/undefined per scartare la riga),
// chiede conferma e chiama onImport(entità[]).
export function ImportButton({ onImport, mapRow, label = 'Importa XLSX', confirmText }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const XLSX = await import('xlsx')
      const wb = XLSX.read(await file.arrayBuffer())
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { defval: '' })
      if (raw.length === 0) { alert('Il file non contiene righe di dati.'); return }
      const rows = (mapRow ? raw.map((r, i) => mapRow(r, i)) : raw).filter(Boolean)
      if (rows.length === 0) {
        alert('Nessuna riga valida trovata. Controlla le intestazioni di colonna del file.')
        return
      }
      const skipped = raw.length - rows.length
      const msg = (confirmText || 'Importare {n} righe da "{file}"?')
        .replace('{n}', rows.length).replace('{file}', file.name)
        + (skipped > 0 ? `\n(${skipped} righe scartate perché incomplete)` : '')
      if (!window.confirm(msg)) return
      await onImport(rows)
    } catch (err) {
      alert("Errore durante l'import: " + err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFile} />
      <button
        className="btn btn-secondary"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        title="Carica un file Excel: la prima riga deve contenere le intestazioni di colonna"
        style={{ padding: '5px 10px', fontSize: '0.75rem', opacity: busy ? 0.6 : 1 }}
      >
        <Upload size={13} /> {busy ? 'Importo…' : label}
      </button>
    </>
  )
}

// TableWrap: se riceve exportRows/exportName mostra la barra con il pulsante
// "Esporta XLSX" sopra la tabella; extraActions aggiunge altri pulsanti
// (es. ImportButton) nella stessa barra.
export function TableWrap({ children, exportRows, exportName, extraActions }) {
  return (
    <Card>
      {((exportRows && exportRows.length > 0) || extraActions) && (
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '8px 10px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {extraActions}
          {exportRows && exportRows.length > 0 && (
            <ExportButton rows={exportRows} filename={exportName || 'export'} />
          )}
        </div>
      )}
      <div className="table-wrap">{children}</div>
    </Card>
  )
}

export const thStyle = {
  padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em',
  borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap'
}
export const tdStyle = {
  padding: '11px 14px', fontSize: '0.83rem', color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle'
}

export function THead({ cols }) {
  return (
    <thead>
      <tr>
        {cols.map(c => <th key={c} style={thStyle}>{c}</th>)}
      </tr>
    </thead>
  )
}

export function SectionTitle({ children, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', margin: '4px 0 12px' }}>
      <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{children}</h3>
      {actions && <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  )
}

// --- Badge / progress -----------------------------------------------------------
export function Pill({ color, bg, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600,
      whiteSpace: 'nowrap', background: bg, color
    }}>{children}</span>
  )
}

export function ExpiryPill({ date }) {
  const info = expiryInfo(date)
  return <Pill color={info.color} bg={info.bg}>{info.label}{date ? ` · ${fmtDate(date)}` : ''}</Pill>
}

export function ProgressBar({ pct, color = 'var(--primary)', height = 7 }) {
  const clamped = Math.max(0, Math.min(100, pct || 0))
  return (
    <div style={{ background: 'var(--border-color)', borderRadius: '999px', height, width: '100%', overflow: 'hidden' }}>
      <div style={{ width: clamped + '%', height: '100%', background: color, borderRadius: '999px', transition: 'width 0.3s ease' }} />
    </div>
  )
}

// --- Empty state ----------------------------------------------------------------
export function EmptyState({ icon: Icon = Inbox, title, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
      <Icon size={36} style={{ marginBottom: '12px', opacity: 0.3, color: 'var(--primary)' }} />
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</h3>
      {text && <p style={{ fontSize: '0.8rem', margin: 0 }}>{text}</p>}
    </div>
  )
}

// --- Modal (riusa le classi globali, fullscreen su mobile via CSS) ---------------
export function Modal({ open, onClose, title, children, footer, maxWidth = 560 }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth, background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, children, span }) {
  return (
    <div style={span ? { gridColumn: '1 / -1' } : undefined}>
      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  )
}
