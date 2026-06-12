import React, { useState, useEffect, useRef } from 'react'
import { Sun, Moon, LogOut, Database, Award, User, Plus, Cloud, Bell, Trash2, CheckCheck, AlertTriangle, Calendar, Receipt, Smartphone, ExternalLink } from 'lucide-react'
import { APP_MODE, getOtherAppUrl } from '../lib/appMode'
import RoleSwitcher from './layout/RoleSwitcher'
import NotificationCenter from './layout/NotificationCenter'

export default function Header({ 
  user, 
  isDemo, 
  onLogout, 
  onOpenJobModal, 
  notifications = [], 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onClearNotifications,
  onOpenManual,
  showSeedButton = false,
  onSeedDatabase,
  currentRole,
  onRoleChange,
  userRoles = [],         // ← NEW: array di ruoli (RBAC multi)
  onUserRolesChange,      // ← NEW: callback per il multi-selector
  onNavigateHub           // ← NEW: per il NotificationCenter (deep link a moduli)
}) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('crm-theme') || 'dark'
  })
  
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('crm-theme', theme)
  }, [theme])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <header className="glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      boxSizing: 'border-box',
      padding: '12px 24px',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      background: 'var(--bg-sidebar)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Database Status Indicator (il brand è già nella sidebar) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isDemo && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--warning-light)',
            color: 'var(--warning)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.72rem',
            fontWeight: 700,
            border: '1px solid rgba(208, 128, 0, 0.2)'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--warning)',
              display: 'inline-block',
              boxShadow: '0 0 6px var(--warning)'
            }} />
            <span>DEMO MODE</span>
          </div>
        )}

        {/* Database Seeder Button (flashing premium button) */}
        {!isDemo && showSeedButton && (
          <button
            onClick={onSeedDatabase}
            style={{
              padding: '4px 10px',
              fontSize: '0.68rem',
              fontWeight: 800,
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              border: '1.5px solid var(--primary)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              animation: 'pulse 1.2s infinite alternate',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
            title="Popola le tabelle del Database Supabase con i dati di esempio"
          >
            <span>🌱 Popola Dati Demo</span>
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="header-right-controls" ref={dropdownRef}>
        
        {/* Manual/Guide Button */}
        <button
          onClick={onOpenManual}
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            height: '30px',
            padding: '0 10px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}
          title="Manuale Operativo PDF"
        >
          <span>📖</span>
          <span className="header-btn-text">Guida PDF</span>
        </button>

        {/* Link "Mio personale" → noi.todos.it */}
        <a
          href={getOtherAppUrl(APP_MODE.HUB)}
          title="Vai alla tua area personale (timbra, ferie, buste paga)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.72rem',
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            height: '30px',
            boxSizing: 'border-box'
          }}
        >
          <Smartphone size={12} />
          <span className="header-btn-text">Mio personale</span>
          <ExternalLink size={10} />
        </a>

        {/* Role Selector (RBAC multi-ruolo) */}
        {onUserRolesChange && (
          <RoleSwitcher
            selectedRoles={userRoles}
            onChange={onUserRolesChange}
            isDemo={isDemo}
          />
        )}

        {/* User profile capsule */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px 4px 6px',
          background: 'rgba(0, 0, 0, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={10} />
          </div>
          <span className="header-username-text" style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)'
          }}>
            {user?.name || user?.email || 'recruiter@todos.it'}
          </span>
        </div>

        {/* Notification Center (unificato, multi-modulo) */}
        <NotificationCenter
          userRoles={userRoles}
          onNavigate={onNavigateHub}
          variant="hub"
        />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            width: '30px',
            height: '30px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={theme === 'dark' ? 'Tema chiaro' : 'Tema scuro'}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--danger)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 700,
            fontSize: '0.78rem',
            padding: '6px'
          }}
        >
          <LogOut size={14} />
          <span className="header-btn-text">Esci</span>
        </button>
      </div>
    </header>
  )
}
