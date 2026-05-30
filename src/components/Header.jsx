import React, { useState, useEffect, useRef } from 'react'
import { Sun, Moon, LogOut, Database, Award, User, Plus, Cloud, Bell, Trash2, CheckCheck, AlertTriangle, Calendar, Receipt } from 'lucide-react'

export default function Header({ 
  user, 
  isDemo, 
  onLogout, 
  onOpenJobModal, 
  notifications = [], 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onClearNotifications,
  onOpenManual
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
      padding: '12px 24px',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      background: 'var(--bg-sidebar)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand Logo & Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img 
          src="/todos-logo.png" 
          alt="Todos Logo" 
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 2px 6px rgba(217, 4, 41, 0.15)'
          }} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/todos-logo.jpg';
          }}
        />
        <div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.1rem',
            letterSpacing: '-0.02em',
            display: 'block',
            lineHeight: '1.1'
          }}>
            Todos Select
          </span>
          <span style={{
            fontSize: '0.62rem',
            color: 'var(--text-muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'block',
            marginTop: '1px'
          }}>
            born to be wireless
          </span>
        </div>
      </div>

      {/* Center Database Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isDemo ? (
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
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--success-light)',
            color: 'var(--success)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.72rem',
            fontWeight: 700,
            border: '1px solid rgba(15, 159, 110, 0.2)'
          }}>
            <Database size={10} />
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--success)',
              display: 'inline-block',
              boxShadow: '0 0 6px var(--success)'
            }} />
            <span>SUPABASE CONNESSO</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }} ref={dropdownRef}>
        
        {/* + CREA RICERCA BUTTON (Only shown for ATS/Recruiters, i.e., non-employees) */}
        {user?.role !== 'employee' && (
          <button
            className="btn btn-primary"
            onClick={onOpenJobModal}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              gap: '4px',
              boxShadow: 'var(--shadow-premium)'
            }}
          >
            <Plus size={14} />
            <span>Crea Ricerca</span>
          </button>
        )}

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
          <span>📖 Guida PDF</span>
        </button>

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
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)'
          }}>
            {user?.name || user?.email || 'recruiter@todos.it'}
          </span>
        </div>

        {/* Notification Bell Icon */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
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
              justifyContent: 'center',
              position: 'relative'
            }}
            title="Notifiche"
          >
            <Bell size={14} style={{ animation: unreadCount > 0 ? 'bell-bounce 1s infinite alternate' : 'none' }} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--primary)',
                color: 'white',
                fontSize: '0.62rem',
                fontWeight: 800,
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 6px var(--primary)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              width: '360px',
              maxHeight: '450px',
              overflowY: 'hidden',
              zIndex: 1000,
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Dropdown Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={13} style={{ color: 'var(--primary)' }} /> Notifiche ({unreadCount})
                </span>
                {notifications.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => { onMarkAllAsRead(); }} 
                      title="Segna tutti come letti"
                      style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700 }}
                    >
                      <CheckCheck size={11} />
                      <span>Letti</span>
                    </button>
                    <button 
                      onClick={() => { onClearNotifications(); }} 
                      title="Svuota tutto"
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700 }}
                    >
                      <Trash2 size={11} />
                      <span>Svuota</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Dropdown Content */}
              {notifications.length === 0 ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '1.6rem' }}>🛎️</div>
                  <strong style={{ color: 'var(--text-primary)' }}>Tutto in ordine!</strong>
                  <span>Nessuna scadenza o avviso in corso.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '320px', paddingRight: '4px' }}>
                  {notifications.map(n => {
                    let bg = 'rgba(0, 0, 0, 0.01)'
                    let borderLeft = '3px solid var(--border-color)'
                    let icon = <Bell size={13} />
                    
                    if (!n.isRead) {
                      if (n.type === 'expiry') {
                        bg = 'var(--warning-light)'
                        borderLeft = '3px solid var(--warning)'
                        icon = <AlertTriangle size={13} style={{ color: 'var(--warning)' }} />
                      } else if (n.type === 'leave') {
                        bg = 'var(--primary-light)'
                        borderLeft = '3px solid var(--primary)'
                        icon = <Calendar size={13} style={{ color: 'var(--primary)' }} />
                      } else if (n.type === 'expense') {
                        bg = 'var(--success-light)'
                        borderLeft = '3px solid var(--success)'
                        icon = <Receipt size={13} style={{ color: 'var(--success)' }} />
                      } else {
                        bg = 'var(--primary-light)'
                        borderLeft = '3px solid var(--primary)'
                      }
                    } else {
                      bg = 'transparent'
                      borderLeft = '3px solid var(--text-muted)'
                      icon = <CheckCheck size={13} style={{ color: 'var(--text-muted)' }} />
                    }

                    return (
                      <div 
                        key={n.id} 
                        style={{
                          background: bg,
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 10px',
                          position: 'relative',
                          display: 'flex',
                          gap: '8px',
                          border: '1px solid var(--border-color)',
                          borderLeft: borderLeft,
                          opacity: n.isRead ? 0.6 : 1,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ marginTop: '2px' }}>
                          {icon}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: n.isRead ? 600 : 800, color: 'var(--text-primary)' }}>
                              {n.title}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(n.id);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                padding: '0px 2px',
                                lineHeight: 1
                              }}
                              title="Rimuovi"
                            >
                              ×
                            </button>
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: '1.2' }}>
                            {n.description}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

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
          <span>Esci</span>
        </button>
      </div>
    </header>
  )
}
