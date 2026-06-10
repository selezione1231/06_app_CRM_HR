import React, { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { Lock, Mail, Server, Compass, CheckCircle } from 'lucide-react'

export default function Login({ onLoginSuccess, setDemoMode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRealLogin = async (e) => {
    e.preventDefault()
    if (!isSupabaseConfigured) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      onLoginSuccess(data.user, false) // real mode
    } catch (err) {
      setError(err.message || 'Errore durante l\'accesso. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setLoading(true)
    setTimeout(() => {
      onLoginSuccess({
        id: 'demo-user-123',
        email: 'recruiter.demo@azienda.it',
        user_metadata: { full_name: 'Recruiter Demo' }
      }, true) // demo mode = true
      setLoading(false)
    }, 800)
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Orbs */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'rgba(99, 102, 241, 0.15)',
        borderRadius: '50%',
        top: '-10%',
        left: '-10%',
        filter: 'blur(80px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'rgba(217, 70, 239, 0.1)',
        borderRadius: '50%',
        bottom: '-15%',
        right: '-10%',
        filter: 'blur(100px)',
        zIndex: 0
      }} />

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '450px',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 32px',
        zIndex: 1,
        position: 'relative'
      }}>
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img 
            src="/todos-logo.png" 
            alt="Todos Logo" 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: '16px',
              boxShadow: '0 8px 16px rgba(217, 4, 41, 0.25)'
            }} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/todos-logo.jpg';
            }}
          />
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.8rem',
            letterSpacing: '-0.02em',
            marginBottom: '6px'
          }}>Todos Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Accedi alla piattaforma aziendale integrata
          </p>
        </div>

        {error && (
          <div className="badge-danger" style={{
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            lineHeight: '1.4'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {isSupabaseConfigured ? (
          /* Real Credentials Form */
          <form onSubmit={handleRealLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Email aziendale</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  type="email"
                  required
                  placeholder="nome@azienda.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(15, 23, 42, 0.02)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(15, 23, 42, 0.02)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{
              width: '100%',
              padding: '14px',
              marginTop: '8px',
              fontSize: '0.95rem'
            }}>
              {loading ? (
                <span className="spinner" style={{
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%'
                }} />
              ) : 'Accedi'}
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              margin: '8px 0',
              color: 'var(--text-muted)',
              fontSize: '0.8rem'
            }}>
              <hr style={{ flexGrow: 1, borderColor: 'var(--border-color)' }} />
              <span>OPPURE</span>
              <hr style={{ flexGrow: 1, borderColor: 'var(--border-color)' }} />
            </div>
          </form>
        ) : (
          /* Supabase Offline Message */
          <div style={{
            background: 'var(--primary-light)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--primary)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            lineHeight: '1.4'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, marginBottom: '6px' }}>
              <Server size={16} />
              <span>Database Supabase scollegato</span>
            </div>
            Le credenziali Supabase non sono impostate nel file <code>.env</code>. L'applicazione si avvierà in modalità Demo con database locale simulato.
          </div>
        )}

        {/* Demo Login Button */}
        <button
          onClick={handleDemoLogin}
          className={isSupabaseConfigured ? "btn btn-secondary" : "btn btn-primary"}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '0.95rem'
          }}
        >
          <Compass size={18} />
          <span>Accedi come Admin HR (Demo)</span>
        </button>

        {/* Portale Dipendenti Demo Access */}
        <div style={{
          marginTop: '20px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <label style={{
            display: 'block',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textAlign: 'center'
          }}>
            🔑 Portale Self-Service Dipendenti (Demo)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              id="employee-select"
              style={{
                flexGrow: 1,
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.02)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              <option value="demo-emp-1" style={{ background: '#1c1917' }}>Mario Rossi (Tech)</option>
              <option value="demo-emp-2" style={{ background: '#1c1917' }}>Laura Bianchi (Sales)</option>
              <option value="demo-emp-3" style={{ background: '#1c1917' }}>Alessandro Neri (HR)</option>
            </select>
            <button
              type="button"
              onClick={() => {
                const select = document.getElementById('employee-select')
                const selectedVal = select.value
                const empNames = {
                  'demo-emp-1': { name: 'Mario Rossi', email: 'm.rossi@todos.it' },
                  'demo-emp-2': { name: 'Laura Bianchi', email: 'l.bianchi@todos.it' },
                  'demo-emp-3': { name: 'Alessandro Neri', email: 'a.neri@todos.it' }
                }
                const emp = empNames[selectedVal]
                onLoginSuccess({
                  id: selectedVal,
                  email: emp.email,
                  role: 'employee',
                  user_metadata: { full_name: emp.name }
                }, true)
              }}
              className="btn btn-primary"
              style={{ padding: '10px 16px', fontSize: '0.82rem' }}
            >
              Entra
            </button>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
            <CheckCircle size={12} style={{ color: 'var(--success)' }} />
            <span>Accesso e profilazione ruoli attivi</span>
          </div>
          Tutti i dati caricati in modalità Demo restano persistiti nel browser.
        </div>
      </div>
    </div>
  )
}
