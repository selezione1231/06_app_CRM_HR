import React, { useState } from 'react'
import { Users, BarChart3, TrendingUp, Calendar, Briefcase, Award, ArrowUpRight, DollarSign } from 'lucide-react'

export default function AnalyticsTab({
  jobs = [],
  candidates = [],
  employees = [],
  leaves = [],
  expenses = []
}) {
  const [hoveredDept, setHoveredDept] = useState(null)
  const [hoveredLeave, setHoveredLeave] = useState(null)

  // --- 1. DATI KPI GENERALI ---
  const totalEmployees = employees.length
  
  // Costo aziendale annuo (RAL + 30% tasse e contributi)
  const totalRal = employees.reduce((sum, e) => sum + parseFloat(e.ral || 0), 0)
  const totalCompanyCost = totalRal * 1.30

  // Conversion rate ATS: Assunti / Totale Candidati
  const hiredCandidatesCount = candidates.filter(c => c.stage === 'Assunto' || c.stage === 'Assunto/Firmato').length
  const totalCandidatesCount = candidates.length
  const conversionRate = totalCandidatesCount > 0 ? Math.round((hiredCandidatesCount / totalCandidatesCount) * 100) : 0

  // Time-to-hire stimato medio (simulato)
  const avgTimeToHire = 24 // giorni

  // --- 2. ELABORAZIONE DATI COSTI PER DIPARTIMENTO ---
  const deptData = employees.reduce((acc, curr) => {
    const dept = curr.department || 'Altro'
    if (!acc[dept]) {
      acc[dept] = { name: dept, totalRal: 0, count: 0 }
    }
    acc[dept].totalRal += parseFloat(curr.ral || 0)
    acc[dept].count += 1
    return acc
  }, {})

  const deptList = Object.values(deptData).sort((a, b) => b.totalRal - a.totalRal)
  const maxDeptRal = deptList.length > 0 ? Math.max(...deptList.map(d => d.totalRal)) : 1

  // --- 3. ELABORAZIONE DONUT CHART FERIE/ASSENZE ---
  const leaveData = leaves.reduce((acc, curr) => {
    const type = curr.type || 'Ferie'
    if (curr.status === 'Approved') {
      acc[type] = (acc[type] || 0) + 1
    }
    return acc
  }, { Ferie: 0, Permesso: 0, Malattia: 0 })

  const totalLeavesCount = Object.values(leaveData).reduce((sum, val) => sum + val, 0) || 1
  
  // Mappa colori e icone
  const LEAVE_CONFIGS = {
    Ferie: { label: '🌴 Ferie', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    Permesso: { label: '⏱️ Permessi', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    Malattia: { label: '🤒 Malattia', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
  }

  // Costruzione segmenti Donut SVG
  let accumulatedPercent = 0
  const donutSegments = Object.entries(leaveData).map(([type, count]) => {
    const percent = Math.round((count / totalLeavesCount) * 100)
    const segment = {
      type,
      count,
      percent,
      startPercent: accumulatedPercent,
      color: LEAVE_CONFIGS[type]?.color || '#6b7280'
    }
    accumulatedPercent += percent
    return segment
  })

  // --- 4. FUNNEL DI SELEZIONE ATS ---
  // Calcolo candidati per fase
  const funnelStages = [
    { label: 'CV Screening', count: candidates.length, percent: 100, color: 'var(--primary)' },
    { label: 'Colloquio HR', count: candidates.filter(c => c.stage !== 'Nuovo' && c.stage !== 'Screening').length, percent: 68, color: 'rgba(217, 4, 41, 0.85)' },
    { label: 'Colloquio Tecnico', count: candidates.filter(c => c.stage === 'Colloquio Tecnico' || c.stage === 'Offerta' || c.stage === 'Assunto').length, percent: 34, color: 'rgba(217, 4, 41, 0.65)' },
    { label: 'Offerta Contrattuale', count: candidates.filter(c => c.stage === 'Offerta' || c.stage === 'Assunto').length, percent: 14, color: 'rgba(217, 4, 41, 0.45)' },
    { label: 'Assunti / Hired', count: hiredCandidatesCount, percent: conversionRate, color: '#10b981' }
  ]

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Intestazione */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', margin: 0 }}>
          📊 HR Analytics & Reportistica C-Level
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Panoramica finanziaria ed organizzativa di Todos Select per supportare le decisioni aziendali strategiche.
        </p>
      </div>

      {/* Widget KPI Finanziari & ATS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        
        {/* KPI 1: Organico */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
              Organico Attivo
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalEmployees} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)' }}><ArrowUpRight size={13} style={{ display: 'inline' }} /> +15%</span>
            </span>
          </div>
        </div>

        {/* KPI 2: Costo Aziendale Annuo */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(217, 4, 41, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
              Costo Annuo Aziendale (Runrate)
            </span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              € {totalCompanyCost.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* KPI 3: Tasso Conversione ATS */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
              Tasso Conversione ATS
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
              {conversionRate}% <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>di assunti su CV</span>
            </span>
          </div>
        </div>

        {/* KPI 4: Time-to-hire Medio */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(139, 92, 246, 0.1)',
            color: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
              Time-to-Hire Medio
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {avgTimeToHire} giorni
            </span>
          </div>
        </div>

      </div>

      {/* Colonne Grafici */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        
        {/* GRAFICO A: Distribuzione Costi RAL per Dipartimento (SVG Bar Chart Nativo) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>💼 Allocazione Budget Contratti (RAL) per Dipartimento</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Costo complessivo dei contratti attivi suddiviso per aree di business (costi esclusi di oneri fiscali).
            </span>
          </div>

          {deptList.length === 0 ? (
            <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '220px' }}>
              Nessun dipendente presente nel fascicolo digitale.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              {deptList.map(dept => {
                const widthPercent = maxDeptRal > 0 ? (dept.totalRal / maxDeptRal) * 100 : 0
                const isHovered = hoveredDept === dept.name
                
                return (
                  <div 
                    key={dept.name} 
                    onMouseEnter={() => setHoveredDept(dept.name)}
                    onMouseLeave={() => setHoveredDept(null)}
                    style={{ display: 'flex', flexDirection: 'column', gap: '6px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ color: isHovered ? 'var(--primary)' : 'var(--text-primary)' }}>
                        🏢 {dept.name} ({dept.count} {dept.count === 1 ? 'risorsa' : 'risorse'})
                      </span>
                      <strong style={{ color: isHovered ? 'var(--primary)' : 'var(--text-primary)' }}>
                        € {dept.totalRal.toLocaleString('it-IT')} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ anno</span>
                      </strong>
                    </div>
                    
                    <div style={{
                      height: '14px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${widthPercent}%`,
                        height: '100%',
                        background: isHovered 
                          ? 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)' 
                          : 'linear-gradient(90deg, rgba(217,4,41,0.6) 0%, rgba(217,4,41,0.9) 100%)',
                        transition: 'width 0.8s cubic-bezier(0.1, 0.8, 0.2, 1), background 0.2s',
                        borderRadius: '3px',
                        boxShadow: isHovered ? '0 0 10px rgba(217,4,41,0.3)' : 'none'
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* GRAFICO B: Assenteismo Ferie (SVG Donut Chart Nativo) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>🌴 Distribuzione Richieste Ferie & Permessi</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Percentuale di assenze approvate nel mese corrente suddivise per giustificativo.
            </span>
          </div>

          <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', gap: '20px', minHeight: '180px' }}>
            {/* SVG Donut Chart */}
            <svg width="140" height="140" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.15))' }}>
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="4.5" />
              {donutSegments.map((seg, idx) => {
                const radius = 15.91549430918954
                const circumference = 2 * Math.PI * radius // ~100
                const strokeDasharray = `${seg.percent} ${100 - seg.percent}`
                const strokeDashoffset = 100 - seg.startPercent + 25 // Sfalsato
                const isHovered = hoveredLeave === seg.type
                
                return (
                  <circle
                    key={seg.type}
                    cx="21"
                    cy="21"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isHovered ? '5.5' : '4.5'}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-width 0.2s', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredLeave(seg.type)}
                    onMouseLeave={() => setHoveredLeave(null)}
                  />
                )
              })}
            </svg>

            {/* Legenda Donut */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
              {donutSegments.map(seg => {
                const conf = LEAVE_CONFIGS[seg.type]
                const isHovered = hoveredLeave === seg.type
                
                return (
                  <div 
                    key={seg.type}
                    onMouseEnter={() => setHoveredLeave(seg.type)}
                    onMouseLeave={() => setHoveredLeave(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isHovered ? conf.bg : 'transparent',
                      color: isHovered ? conf.color : 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: conf.color }} />
                      <span style={{ fontWeight: 600 }}>{conf.label}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>
                      {seg.count} <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>({seg.percent}%)</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>

      {/* GRAFICO C: Recruiting Funnel (ATS Conversion Funnel) */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>🎯 Imbuto di Selezione & Recruiting Funnel (ATS)</h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Efficienza del flusso di recruiting di Todos.it. Analisi della conversione complessiva dei candidati inseriti a gestionale.
          </span>
        </div>

        {/* Funnel Layout */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          width: '100%',
          maxWidth: '650px',
          margin: '12px auto'
        }}>
          {funnelStages.map((stage, idx) => {
            const nextStage = funnelStages[idx + 1]
            const passRate = nextStage ? Math.round((nextStage.count / (stage.count || 1)) * 100) : null
            
            return (
              <React.Fragment key={stage.label}>
                <div style={{
                  width: `${100 - idx * 15}%`,
                  minHeight: '44px',
                  background: `linear-gradient(135deg, ${stage.color} 0%, rgba(217,4,41,0.05) 100%)`,
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `3.5px solid ${stage.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <span>{stage.label}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{stage.count} candidati</span>
                    <span style={{
                      color: idx === 4 ? '#10b981' : 'var(--text-secondary)',
                      fontSize: '0.78rem'
                    }}>{stage.percent}%</span>
                  </div>
                </div>

                {/* Conversion Rate Connector */}
                {passRate !== null && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    padding: '2px 0',
                    position: 'relative'
                  }}>
                    <div style={{ width: '1px', height: '14px', background: 'var(--border-color)' }} />
                    <span style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-color)',
                      color: '#3b82f6',
                      marginTop: '-4px',
                      marginBottom: '-4px',
                      zIndex: 2
                    }}>
                      Tasso Conversione: {passRate}%
                    </span>
                    <div style={{ width: '1px', height: '14px', background: 'var(--border-color)' }} />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

    </div>
  )
}
