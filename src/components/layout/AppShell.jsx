import React, { useState, useEffect, useCallback } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import SearchModal from './SearchModal'

// ============================================================================
// AppShell — wrapper layout principale dell'app
// ----------------------------------------------------------------------------
// Mette insieme:
//   - Sidebar (desktop) / Drawer + BottomNav (mobile)
//   - Top bar (Header esistente passato come prop)
//   - Content area (children)
//
// È un componente puramente presentazionale: la routing è gestita dal
// genitore tramite `currentItemId` + `onNavigate(item)`.
// ============================================================================

export default function AppShell({
  // Identity
  userRoles = [],
  userName,
  currentItemId,
  onNavigate,

  // Header pass-through
  header,                  // ReactNode (Header già configurato)

  // Content
  children
}) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('todos-hub-sidebar-collapsed') === '1' } catch { return false }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('todos-hub-sidebar-collapsed', collapsed ? '1' : '0')
  }, [collapsed])

  // Shortcut ⌘K / Ctrl+K → apri search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleNavigate = useCallback((item) => {
    onNavigate?.(item)
    setMobileOpen(false)
  }, [onNavigate])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app, #f9f8f6)' }}>

      {/* SIDEBAR (desktop) + DRAWER (mobile) */}
      <Sidebar
        userRoles={userRoles}
        currentItemId={currentItemId}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* SEARCH MODAL ⌘K */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        userRoles={userRoles}
        onNavigate={(action) => {
          // action = { navId, entityId? } → traduco in onNavigate del parent
          if (action?.navId) onNavigate?.({ id: action.navId })
        }}
      />

      {/* MAIN COLUMN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* HEADER MOBILE (hamburger + title) */}
        <div className="todos-hub-mobile-header" style={{
          display: 'none',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 14px',
          background: 'var(--bg-sidebar, white)',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          position: 'sticky', top: 0, zIndex: 70
        }}>
          <button onClick={() => setMobileOpen(true)} style={{
            background: 'transparent', border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <Menu size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
            <img src="/todos-logo.png" alt="Todos" style={{ width: '22px', height: '22px', borderRadius: '50%' }}
              onError={(e) => { e.target.style.display = 'none' }} />
            <strong style={{ fontSize: '0.92rem' }}>Todos Hub</strong>
          </div>
        </div>

        {/* HEADER DESKTOP (passato dal genitore) */}
        <div className="todos-hub-desktop-header">
          {header}
        </div>

        {/* CONTENT */}
        <main className="todos-hub-main" style={{
          flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column'
        }}>
          {children}
        </main>
      </div>

      {/* BOTTOM NAV (mobile) */}
      <BottomNav
        userRoles={userRoles}
        currentItemId={currentItemId}
        onNavigate={handleNavigate}
        onOpenSidebar={() => setMobileOpen(true)}
      />
    </div>
  )
}
