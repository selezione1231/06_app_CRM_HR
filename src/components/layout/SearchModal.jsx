import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Search, X, ArrowDown, ArrowUp, CornerDownLeft, Clock, Sparkles } from 'lucide-react'
import { search, getRecentSearches, pushRecentSearch, clearRecentSearches, ENTITY_META } from '../../lib/search'

// ============================================================================
// SearchModal — modal di ricerca globale (⌘K / Ctrl+K)
// ----------------------------------------------------------------------------
// Layout: input centrato in alto, lista risultati raggruppata per entità.
// Tastiera: ↑↓ naviga, Enter apre, Esc chiude.
// ============================================================================

export default function SearchModal({ open, onClose, userRoles = [], onNavigate }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const debounceRef = useRef(null)

  // Reset stato all'apertura
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setActiveIdx(0)
      setRecent(getRecentSearches())
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setActiveIdx(0)
      return
    }
    setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const r = await search(query, { userRoles, limit: 40 })
      setResults(r)
      setActiveIdx(0)
      setLoading(false)
    }, 120)
    return () => debounceRef.current && clearTimeout(debounceRef.current)
  }, [query, JSON.stringify(userRoles)])

  // Tastiera
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose?.() }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)) }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
      else if (e.key === 'Enter')     { e.preventDefault(); handleSelect(results[activeIdx]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, results, activeIdx])

  // Scroll item attivo nel viewport
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector(`[data-idx="${activeIdx}"]`)
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  const handleSelect = (item) => {
    if (!item) return
    pushRecentSearch(query)
    onNavigate?.(item.action)
    onClose?.()
  }

  // Raggruppa per entity preservando l'ordine di score
  const grouped = useMemo(() => {
    const map = new Map()
    results.forEach(r => {
      if (!map.has(r.entity)) map.set(r.entity, [])
      map.get(r.entity).push(r)
    })
    return Array.from(map.entries())  // [ [entityKey, items[]] , ... ]
  }, [results])

  // Indice piatto per evidenziare l'item attivo
  const flatIdxOf = (entity, idxInGroup) => {
    let count = 0
    for (const [k, list] of grouped) {
      if (k === entity) return count + idxInGroup
      count += list.length
    }
    return -1
  }

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        padding: '8vh 20px 20px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '640px',
          background: 'white', borderRadius: '14px',
          boxShadow: '0 30px 60px -10px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: '78vh'
        }}
      >
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 18px', borderBottom: '1px solid #e2e8f0'
        }}>
          <Search size={18} color="#94a3b8" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca dipendenti, cantieri, fornitori, mezzi, documenti..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '1rem', fontWeight: 500,
              color: '#0f172a', background: 'transparent',
              fontFamily: 'inherit'
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={iconBtn} title="Pulisci">
              <X size={14} />
            </button>
          )}
          <kbd style={kbdStyle}>Esc</kbd>
        </div>

        {/* Body */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto' }}>
          {/* Empty state: ricerche recenti */}
          {!query && (
            <div style={{ padding: '12px 12px 16px' }}>
              {recent.length > 0 && (
                <>
                  <div style={groupHeaderStyle}>
                    <Clock size={11} /> Ricerche recenti
                    <button onClick={() => { clearRecentSearches(); setRecent([]) }}
                      style={{ marginLeft: 'auto', ...subtleBtn }}>Pulisci</button>
                  </div>
                  {recent.map(q => (
                    <button key={q} onClick={() => setQuery(q)}
                      style={recentRowStyle}>
                      <Clock size={12} color="#94a3b8" /> {q}
                    </button>
                  ))}
                </>
              )}
              <div style={{ padding: '24px 8px', textAlign: 'center', color: '#64748b' }}>
                <Sparkles size={22} style={{ color: '#cbd5e1', marginBottom: '6px' }} />
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>Search globale</div>
                <div style={{ fontSize: '0.78rem', marginTop: '4px', lineHeight: 1.6 }}>
                  Cerca dipendenti, cantieri, fornitori, mezzi, documenti<br/>
                  o usa parole come <strong>"vai a"</strong> per navigare velocemente.
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {query && loading && results.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
              Ricerca in corso...
            </div>
          )}

          {/* No results */}
          {query && !loading && results.length === 0 && (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🔎</div>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>Nessun risultato</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Prova con un altro termine (es. parte di nome, targa, codice cantiere)
              </div>
            </div>
          )}

          {/* Results grouped */}
          {query && grouped.map(([entity, items]) => {
            const meta = ENTITY_META[entity] || { label: entity, icon: '•', color: '#64748b' }
            return (
              <div key={entity}>
                <div style={{ ...groupHeaderStyle, color: meta.color }}>
                  <span>{meta.icon}</span> {meta.label} <span style={{ color: '#94a3b8', fontWeight: 600 }}>({items.length})</span>
                </div>
                {items.map((it, idxInGroup) => {
                  const flatIdx = flatIdxOf(entity, idxInGroup)
                  const active = flatIdx === activeIdx
                  return (
                    <button
                      key={`${entity}-${it.id}-${idxInGroup}`}
                      data-idx={flatIdx}
                      onClick={() => handleSelect(it)}
                      onMouseEnter={() => setActiveIdx(flatIdx)}
                      style={{
                        ...rowStyle,
                        background: active ? '#fce4e8' : 'transparent',
                        borderLeft: active ? `3px solid ${meta.color}` : '3px solid transparent'
                      }}
                    >
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        background: meta.color + '20', color: meta.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', flexShrink: 0
                      }}>{meta.icon}</div>
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {it.title}
                        </div>
                        {it.subtitle && (
                          <div style={{ fontSize: '0.74rem', color: '#64748b',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {it.subtitle}
                          </div>
                        )}
                      </div>
                      {active && <CornerDownLeft size={13} color="#A82238" />}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Footer hints */}
        <div style={{
          padding: '8px 14px', borderTop: '1px solid #e2e8f0',
          display: 'flex', gap: '14px', fontSize: '0.7rem', color: '#94a3b8',
          flexWrap: 'wrap'
        }}>
          <span><kbd style={kbdSm}>↑</kbd><kbd style={kbdSm}>↓</kbd> Naviga</span>
          <span><kbd style={kbdSm}>↵</kbd> Apri</span>
          <span><kbd style={kbdSm}>Esc</kbd> Chiudi</span>
          {results.length > 0 && (
            <span style={{ marginLeft: 'auto' }}>{results.length} risultati</span>
          )}
        </div>
      </div>
    </div>
  )
}

const kbdStyle = {
  fontSize: '0.62rem', padding: '2px 6px',
  border: '1px solid #e2e8f0', borderRadius: '4px',
  background: '#f8fafc', color: '#475569',
  fontFamily: 'inherit', fontWeight: 700
}
const kbdSm = {
  fontSize: '0.6rem', padding: '1px 5px',
  border: '1px solid #e2e8f0', borderRadius: '3px',
  background: 'white', color: '#475569',
  fontFamily: 'inherit', fontWeight: 700, marginRight: '4px'
}
const iconBtn = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: '#94a3b8', padding: '4px',
  display: 'flex', alignItems: 'center'
}
const subtleBtn = {
  fontSize: '0.62rem', padding: '2px 6px',
  border: '1px solid #e2e8f0', borderRadius: '4px',
  background: 'white', color: '#64748b',
  cursor: 'pointer', fontWeight: 700
}
const groupHeaderStyle = {
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '8px 16px 4px',
  fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#94a3b8'
}
const rowStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
  width: '100%', padding: '8px 16px',
  border: 'none', cursor: 'pointer',
  background: 'transparent', textAlign: 'left',
  borderLeft: '3px solid transparent'
}
const recentRowStyle = {
  display: 'flex', alignItems: 'center', gap: '6px',
  width: '100%', padding: '6px 12px',
  border: 'none', cursor: 'pointer', borderRadius: '6px',
  background: 'transparent', color: '#475569', fontSize: '0.82rem',
  textAlign: 'left'
}
