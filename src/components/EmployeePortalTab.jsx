import React, { useState } from 'react'
import { Calendar, Users, Briefcase, FileText, CheckCircle, Clock, Sparkles, Send, Receipt, ShieldAlert, Award, Car } from 'lucide-react'

const getSafeAssets = (assets) => {
  if (!assets) return []
  if (Array.isArray(assets)) return assets
  if (typeof assets === 'string') {
    try {
      const parsed = JSON.parse(assets)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }
  return []
}

export default function EmployeePortalTab({
  user,
  employees = [],
  checklists = [],
  performances = [],
  leaves = [],
  expenses = [],
  shifts = [],
  vehicles = [],
  onUpdateChecklistTask,
  onAddLeave,
  onSaveExpense,
  onDeleteLeave,
  onDeleteExpense
}) {
  const [activeSubTab, setActiveSubTab] = useState('fascicolo') // 'fascicolo' | 'checklist' | 'ferie' | 'spese' | 'turni'

  // Trova l'impiegato corrispondente all'utente loggato
  const currentEmp = employees.find(e => e.id === user.id || e.email === user.email) || employees[0]

  // --- STATI FORM FERIE ---
  const [leaveType, setLeaveType] = useState('Ferie')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [leaveNotes, setLeaveNotes] = useState('')

  // --- STATI FORM SPESE & OCR ---
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Pasti')
  const [expenseNotes, setExpenseNotes] = useState('')
  const [receiptName, setReceiptName] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState(null) // 'scanning' | 'done'
  const [selectedReceiptModel, setSelectedReceiptModel] = useState(null)

  const RECEIPT_MODELS = [
    {
      id: 'rc-1',
      title: '🍕 Cena di Lavoro (Da Mario)',
      amount: '42.50',
      merchant: 'Ristorante Da Mario',
      category: 'Pasti',
      notes: 'Cena con cliente per rinnovo contratto Todos',
      fileName: 'scontrino_ristorante_mario.jpg'
    },
    {
      id: 'rc-2',
      title: '🚄 Biglietto Frecciarossa Roma',
      amount: '89.00',
      merchant: 'Trenitalia Spa',
      category: 'Trasporti',
      notes: 'Viaggio A/R trasferta commerciale filiale Centro',
      fileName: 'ticket_frecciarossa_roma.pdf'
    },
    {
      id: 'rc-3',
      title: '🏨 Soggiorno Hotel NH Milano',
      amount: '150.00',
      merchant: 'Hotel NH Congress',
      category: 'Alloggio',
      notes: 'Pernottamento fiera HRTech Innovation Days',
      fileName: 'fattura_hotel_nh_milano.jpg'
    }
  ]

  if (!currentEmp) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <ShieldAlert size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
        <h3>Errore nel Caricamento Profilo</h3>
        <p>Non è stato possibile associare il tuo utente ad un fascicolo dipendente nel database.</p>
      </div>
    )
  }

  // --- FILTRO DATI DIPENDENTE ---
  const myChecklist = checklists.filter(c => c.employee_id === currentEmp.id)
  const myCompletedChecklistCount = myChecklist.filter(c => c.is_completed).length
  const myTotalChecklistCount = myChecklist.length
  const checklistPercent = myTotalChecklistCount > 0 ? Math.round((myCompletedChecklistCount / myTotalChecklistCount) * 100) : 0

  const myLeaves = leaves.filter(l => l.employee_id === currentEmp.id)
  const myExpenses = expenses.filter(e => e.employee_id === currentEmp.id)
  const myPerformance = performances.find(p => p.employee_id === currentEmp.id)

  // --- SUBMIT COMPITO CHECKLIST ---
  const handleToggleChecklist = async (taskId, currentStatus) => {
    if (onUpdateChecklistTask) {
      await onUpdateChecklistTask(taskId, !currentStatus)
    }
  }

  // --- SUBMIT RICHIESTA FERIE ---
  const handleSubmitLeave = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate) {
      alert("Inserisci data d'inizio e di fine per la richiesta.")
      return
    }
    const leaveData = {
      employee_id: currentEmp.id,
      employee_name: currentEmp.name,
      type: leaveType,
      start_date: startDate,
      end_date: endDate,
      status: 'Pending',
      notes: leaveNotes
    }

    if (onAddLeave) {
      await onAddLeave(leaveData)
      setStartDate('')
      setEndDate('')
      setLeaveNotes('')
      alert("Richiesta di assenza inviata con successo all'ufficio HR!")
    }
  }

  // --- SIMULATORE OCR SPESE ---
  const handleSelectReceiptModel = (model) => {
    setSelectedReceiptModel(model)
    setIsScanning(true)
    setScanStep('scanning')

    setTimeout(() => {
      setScanStep('done')
      setAmount(model.amount)
      setMerchant(model.merchant)
      setCategory(model.category)
      setExpenseNotes(model.notes)
      setReceiptName(model.fileName)
      setIsScanning(false)
    }, 2000)
  }

  const handleResetExpenseForm = () => {
    setMerchant('')
    setAmount('')
    setCategory('Pasti')
    setExpenseNotes('')
    setReceiptName('')
    setSelectedReceiptModel(null)
    setScanStep(null)
  }

  const handleSubmitExpense = async (e) => {
    e.preventDefault()
    if (!merchant.trim() || !amount || parseFloat(amount) <= 0) {
      alert("Compila tutti i campi obbligatori (Esercente, Importo valido).")
      return
    }

    const expenseData = {
      employee_id: currentEmp.id,
      employee_name: currentEmp.name,
      expense_date: expenseDate,
      merchant: merchant,
      amount: parseFloat(amount),
      category: category,
      receipt_name: receiptName || 'Inserito da Portale Dipendenti',
      status: 'Pending',
      notes: expenseNotes
    }

    if (onSaveExpense) {
      await onSaveExpense(expenseData)
      handleResetExpenseForm()
      alert("Nota spesa inviata correttamente all'ufficio HR per l'approvazione!")
    }
  }

  // Helper scadenze
  const getDeadlineBadge = (dateStr) => {
    if (!dateStr) return { label: 'Non Impostata', class: 'badge-secondary' }
    const expiry = new Date(dateStr)
    const today = new Date()
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { label: `Scaduta il ${expiry.toLocaleDateString('it-IT')}`, class: 'badge-danger' }
    } else if (diffDays <= 30) {
      return { label: `In scadenza tra ${diffDays} gg`, class: 'badge-warning' }
    } else {
      return { label: `Valida (fino al ${expiry.toLocaleDateString('it-IT')})`, class: 'badge-success' }
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: 'calc(100vh - 120px)', gap: '24px', padding: '24px' }}>
      
      {/* Sidelist / Sidebar del Portale Dipendente */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* User Card */}
        <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            margin: '0 auto 12px auto',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {currentEmp.name.charAt(0)}
          </div>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>{currentEmp.name}</h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '3px' }}>
            {currentEmp.role}
          </span>
          <span style={{
            fontSize: '0.62rem',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(217,4,41,0.1)',
            color: 'var(--primary)',
            fontWeight: 700,
            display: 'inline-block',
            marginTop: '8px'
          }}>
            🏢 Dip. {currentEmp.department}
          </span>
        </div>

        {/* Menu Schede */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'fascicolo', label: '📄 Il mio Fascicolo', icon: <FileText size={16} /> },
            { id: 'checklist', label: `📋 La mia Checklist (${checklistPercent}%)`, icon: <CheckCircle size={16} /> },
            { id: 'ferie', label: '🗓️ Richiesta Ferie', icon: <Calendar size={16} /> },
            { id: 'spese', label: '💼 Le mie Note Spese', icon: <Receipt size={16} /> },
            { id: 'turni', label: '📅 I Miei Turni', icon: <Clock size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: activeSubTab === tab.id ? 'var(--primary)' : 'none',
                color: activeSubTab === tab.id ? 'white' : 'var(--text-secondary)',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: activeSubTab === tab.id ? 700 : 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Contenuto della Scheda Attiva */}
      <div style={{ overflowY: 'auto' }}>
        
        {/* TAB 1: IL MIO FASCICOLO */}
        {activeSubTab === 'fascicolo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                📄 Dati Contrattuali & Inquadramento
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tipo Contratto</span>
                  <strong style={{ fontSize: '0.95rem' }}>{currentEmp.contract_type}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Data Assunzione</span>
                  <strong style={{ fontSize: '0.95rem' }}>{new Date(currentEmp.hire_date).toLocaleDateString('it-IT')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>RAL Individuale</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>€ {currentEmp.ral?.toLocaleString()} / anno</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Fine Periodo di Prova</span>
                  <strong style={{ fontSize: '0.95rem' }}>
                    {currentEmp.trial_period_end ? new Date(currentEmp.trial_period_end).toLocaleDateString('it-IT') : 'Superato/Non Definito'}
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Asset consegnati */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 14px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  💻 Asset & Beni Consegnati
                </h2>
                {(getSafeAssets(currentEmp.assets).length === 0) ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nessun dispositivo aziendale assegnato.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {getSafeAssets(currentEmp.assets).map((asset, idx) => (
                      <div key={idx} style={{
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <strong style={{ display: 'block' }}>{asset.type} - {asset.model}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>S/N: {asset.serial}</span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{asset.assignedAt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scadenziere Personale */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 14px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  🚨 Documenti & Visite Mediche
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Documento d'Identità:</span>
                    <span className={`badge ${getDeadlineBadge(currentEmp.document_id_expiry).class}`}>
                      {getDeadlineBadge(currentEmp.document_id_expiry).label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Corso Sicurezza Obbligatorio:</span>
                    <span className={`badge ${getDeadlineBadge(currentEmp.safety_course_expiry).class}`}>
                      {getDeadlineBadge(currentEmp.safety_course_expiry).label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Visita Medica Periodica:</span>
                    <span className={`badge ${getDeadlineBadge(currentEmp.medical_visit_expiry).class}`}>
                      {getDeadlineBadge(currentEmp.medical_visit_expiry).label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Veicolo Aziendale Assegnato */}
            {(() => {
              const autoAsset = currentEmp.assets?.find(a => a.type === 'Auto Aziendale' || a.type === 'Auto');
              const cardAsset = currentEmp.assets?.find(a => a.type === 'Carta Carburante');
              
              if (!autoAsset && !cardAsset) return null;
              
              const vehicleDetail = vehicles.find(v => v.plate === autoAsset?.serial || v.fuel_card_code === cardAsset?.serial);
              
              return (
                <div className="glass-panel animate-fade-in" style={{ padding: '24px', background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--bg-card) 100%)', border: '1px solid var(--border-color)' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 14px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Car size={18} style={{ color: 'var(--primary)' }} />
                    <span>🚗 Veicolo & Carta Carburante Assegnati</span>
                  </h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.82rem' }}>
                    {autoAsset && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Veicolo Assegnato</span>
                        <strong style={{ fontSize: '0.9rem' }}>{autoAsset.model}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Targa: <code>{autoAsset.serial}</code></span>
                      </div>
                    )}
                    
                    {cardAsset && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Carta Carburante in Dotazione</span>
                        <strong style={{ fontSize: '0.9rem' }}>{cardAsset.model}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Codice: <code>{cardAsset.serial}</code></span>
                      </div>
                    )}

                    {vehicleDetail && (
                      <>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Odomentrico Satellitare (Live)</span>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span className="spinner" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)' }} />
                            {vehicleDetail.current_odometer?.toLocaleString('it-IT')} Km
                          </strong>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Odomentrico Iniziale: {vehicleDetail.initial_odometer?.toLocaleString('it-IT')} Km</span>
                        </div>
                        
                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Stato Telematica Satellitare</span>
                          <span className="badge badge-success" style={{ gap: '4px', marginTop: '4px', fontSize: '0.62rem' }}>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--success)' }} />
                            Verizon Connect Active
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Eventuale Review o Feedback se presente */}
            {myPerformance && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} style={{ color: 'var(--primary)' }} />
                  <span>Ultimo Ciclo Valutativo ({myPerformance.review_period})</span>
                </h2>
                <p style={{ fontSize: '0.82rem', lineHeight: '1.5', margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  "{myPerformance.overall_feedback}"
                </p>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: LA MIA CHECKLIST */}
        {activeSubTab === 'checklist' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>📋 Checklist Attività Onboarding</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Spunta le attività assegnate non appena le porti a termine per notificarlo all'HR.
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{myCompletedChecklistCount}/{myTotalChecklistCount}</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>({checklistPercent}% Completato)</span>
              </div>
            </div>

            {/* Barra avanzamento */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ width: `${checklistPercent}%`, height: '100%', background: 'var(--success)', transition: 'width 0.3s ease' }} />
            </div>

            {myChecklist.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>
                Nessuna attività di checklist registrata per te.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {myChecklist.map(task => (
                  <div key={task.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: task.is_completed ? 'rgba(16, 185, 129, 0.02)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${task.is_completed ? 'rgba(16, 185, 129, 0.15)' : 'var(--border-color)'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={task.is_completed}
                        onChange={() => handleToggleChecklist(task.id, task.is_completed)}
                        style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                      />
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textDecoration: task.is_completed ? 'line-through' : 'none',
                        color: task.is_completed ? 'var(--text-muted)' : 'var(--text-primary)'
                      }}>
                        {task.task_name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-xs)',
                        fontWeight: 700,
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-muted)'
                      }}>
                        {task.assigned_to}
                      </span>
                      {task.is_completed && task.completed_at && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--success)' }}>
                          Spuntato il {new Date(task.completed_at).toLocaleDateString('it-IT')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RICHIESTA ASSENZE */}
        {activeSubTab === 'ferie' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Form invio */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                🗓️ Invia Nuova Richiesta di Assenza
              </h2>

              <form onSubmit={handleSubmitLeave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Tipologia
                  </label>
                  <select
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.02)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Ferie" style={{ background: '#1c1917' }}>🌴 Ferie</option>
                    <option value="Permesso" style={{ background: '#1c1917' }}>⏱️ Permesso</option>
                    <option value="Malattia" style={{ background: '#1c1917' }}>🤒 Malattia</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Data Inizio
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.02)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Data Fine
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.02)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Note / Giustificativo
                  </label>
                  <input
                    type="text"
                    placeholder="Specificare motivazioni (es. Viaggio famiglia, Visita specialistica)..."
                    value={leaveNotes}
                    onChange={e => setLeaveNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.02)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Send size={13} />
                  <span>Invia Richiesta</span>
                </button>
              </form>
            </div>

            {/* Storico Richieste */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                📋 Storico Le mie Richieste
              </h2>
              {myLeaves.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                  Nessuna richiesta di assenza effettuata.
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '8px' }}>Tipo</th>
                      <th style={{ padding: '8px' }}>Periodo</th>
                      <th style={{ padding: '8px' }}>Note</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Stato</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Elimina</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaves.map(l => (
                      <tr key={l.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 600 }}>{l.type}</td>
                        <td style={{ padding: '10px 8px' }}>
                          {new Date(l.start_date).toLocaleDateString('it-IT')} - {new Date(l.end_date).toLocaleDateString('it-IT')}
                        </td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{l.notes || '-'}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-xs)',
                            fontWeight: 700,
                            background: l.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : l.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: l.status === 'Approved' ? 'var(--success)' : l.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)',
                            border: `1px solid ${l.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : l.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                          }}>
                            {l.status === 'Approved' ? 'Approvata' : l.status === 'Rejected' ? 'Rifiutata' : 'Pendente'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          {l.status === 'Pending' && (
                            <button
                              onClick={() => {
                                if (confirm("Sei sicuro di voler annullare questa richiesta?")) {
                                  onDeleteLeave(l.id)
                                }
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: NOTE SPESE PERSONALI */}
        {activeSubTab === 'spese' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', alignItems: 'start' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Scanner laser AI OCR */}
              <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>📸 Scanner Scontrini AI OCR</h3>
                </div>
                
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Seleziona uno scontrino modello per simulare l'acquisizione tramite scanner laser:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  {RECEIPT_MODELS.map(model => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => handleSelectReceiptModel(model)}
                      disabled={isScanning}
                      className="btn btn-secondary"
                      style={{
                        justifyContent: 'flex-start',
                        fontSize: '0.72rem',
                        padding: '6px 10px',
                        borderColor: selectedReceiptModel?.id === model.id ? 'var(--primary)' : 'var(--border-color)',
                        background: selectedReceiptModel?.id === model.id ? 'rgba(217, 4, 41, 0.05)' : 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <span>{model.title}</span>
                    </button>
                  ))}
                </div>

                {selectedReceiptModel && (
                  <div style={{
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px',
                    background: 'rgba(0,0,0,0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {scanStep === 'scanning' && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        height: '3px',
                        background: '#10b981',
                        boxShadow: '0 0 10px #10b981',
                        animation: 'scan 1.2s ease-in-out infinite',
                        zIndex: 2
                      }} />
                    )}

                    {scanStep === 'scanning' ? (
                      <>
                        <div className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#10b981' }} />
                        <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>SCANNER IN CORSO...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700 }}>LETTURA COMPLETATA!</span>
                        <button type="button" onClick={handleResetExpenseForm} style={{ fontSize: '0.62rem', color: 'var(--primary)', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}>Resetta</button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Form manuale */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <form onSubmit={handleSubmitExpense} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Data Spesa *</label>
                      <input
                        type="date"
                        required
                        value={expenseDate}
                        onChange={e => setExpenseDate(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Importo (€) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        min="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Esercente *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome negozio, taxi, hotel..."
                      value={merchant}
                      onChange={e => setMerchant(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Categoria *</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none' }}
                    >
                      <option value="Pasti">🍕 Pasti</option>
                      <option value="Trasporti">🚄 Trasporti</option>
                      <option value="Alloggio">🏨 Alloggio</option>
                      <option value="Attrezzatura">💻 Attrezzatura</option>
                      <option value="Altro">📦 Altro</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Descrizione</label>
                    <textarea
                      rows="2"
                      placeholder="Motivazione spesa..."
                      value={expenseNotes}
                      onChange={e => setExpenseNotes(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none', resize: 'none' }}
                    />
                  </div>

                  {receiptName && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--primary)', display: 'block' }}>📎 Allegato: {receiptName}</span>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '9px', marginTop: '4px' }}>
                    <Send size={13} />
                    <span>Invia per Approvazione</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Registro Rimborsi */}
            <div className="glass-panel" style={{ padding: '20px', minHeight: '380px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 14px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                📋 Le mie Richieste Rimborsi
              </h2>
              {myExpenses.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Nessuna spesa caricata.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {myExpenses.map(exp => (
                    <div key={exp.id} style={{
                      padding: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.78rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700 }}>{exp.merchant}</span>
                        <strong style={{ color: 'var(--primary)' }}>€ {exp.amount.toFixed(2)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', alignItems: 'center' }}>
                        <span>{new Date(exp.expense_date).toLocaleDateString('it-IT')} ({exp.category})</span>
                        <span style={{
                          fontSize: '0.62rem',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                          fontWeight: 700,
                          background: exp.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : exp.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: exp.status === 'Approved' ? 'var(--success)' : exp.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)'
                        }}>
                          {exp.status === 'Approved' ? 'Approvata' : exp.status === 'Rejected' ? 'Rifiutata' : 'Pendente'}
                        </span>
                      </div>
                      {exp.status === 'Pending' && (
                        <div style={{ textAlign: 'right', marginTop: '6px' }}>
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.68rem', textDecoration: 'underline' }}
                          >
                            Elimina
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: I MIEI TURNI */}
        {activeSubTab === 'turni' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              📅 Programmazione dei Miei Turni Lavorativi
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Di seguito viene mostrato l'elenco dei turni pianificati per te dall'ufficio HR per le prossime giornate.
            </p>

            {shifts.filter(s => s.employee_id === currentEmp.id).length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>
                Nessun turno programmato al momento. Contatta l'amministratore HR per informazioni.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {shifts
                  .filter(s => s.employee_id === currentEmp.id)
                  .sort((a, b) => new Date(a.shift_date) - new Date(b.shift_date))
                  .map(shift => {
                    const shiftDate = new Date(shift.shift_date)
                    const isToday = shift.shift_date === new Date().toISOString().split('T')[0]
                    
                    let bg = 'rgba(255, 255, 255, 0.01)'
                    let color = 'var(--text-primary)'
                    let iconBg = 'var(--primary-light)'
                    let border = '1px solid var(--border-color)'

                    if (shift.shift_type === 'Mattina') {
                      bg = 'rgba(59, 130, 246, 0.03)'
                      color = '#3b82f6'
                      iconBg = 'rgba(59, 130, 246, 0.1)'
                    } else if (shift.shift_type === 'Pomeriggio') {
                      bg = 'var(--warning-light)'
                      color = 'var(--warning)'
                      iconBg = 'rgba(208, 128, 0, 0.1)'
                    } else if (shift.shift_type === 'Notte') {
                      bg = 'rgba(139, 92, 246, 0.03)'
                      color = '#8b5cf6'
                      iconBg = 'rgba(139, 92, 246, 0.1)'
                    } else if (shift.shift_type === 'Custom') {
                      bg = 'var(--success-light)'
                      color = 'var(--success)'
                      iconBg = 'rgba(15, 159, 110, 0.1)'
                    }

                    if (isToday) {
                      border = '1.5px solid var(--primary)'
                    }

                    return (
                      <div 
                        key={shift.id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 18px',
                          borderRadius: 'var(--radius-md)',
                          background: bg,
                          border: border,
                          boxShadow: 'var(--shadow-sm)',
                          position: 'relative'
                        }}
                      >
                        {isToday && (
                          <span style={{
                            position: 'absolute',
                            top: '-8px',
                            left: '12px',
                            background: 'var(--primary)',
                            color: 'white',
                            fontSize: '0.58rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '2px',
                            letterSpacing: '0.05em'
                          }}>
                            OGGI
                          </span>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-md)',
                            background: iconBg,
                            color: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 800
                          }}>
                            {shift.shift_type.charAt(0)}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.88rem', display: 'block', color: 'var(--text-primary)' }}>
                              Turno di {shift.shift_type} ({shift.start_time} - {shift.end_time})
                            </strong>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              {shiftDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {shift.notes && (
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--text-secondary)', 
                            background: 'rgba(0,0,0,0.03)', 
                            padding: '6px 12px', 
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            maxWidth: '300px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }} title={shift.notes}>
                            📝 Note: {shift.notes}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* CSS scansione laser */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
      ` }} />

    </div>
  )
}
