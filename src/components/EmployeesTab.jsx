import React, { useState, useEffect } from 'react'

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

export default function EmployeesTab({ 
  employees, 
  candidates, 
  onAddEmployee, 
  onUpdateEmployee, 
  onDeleteEmployee,
  checklists = [],
  performances = [],
  onUpdateChecklistTask,
  onAddChecklistTask,
  onSavePerformanceReview,
  onUpdateOkrProgress,
  onAddOkrObjective,
  currentRole
}) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || null)
  const [showOrgChart, setShowOrgChart] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (currentRole === 'servizi_generali') return 'assets';
    if (currentRole === 'pm') return 'assets';
    return 'contract';
  })
  
  useEffect(() => {
    if (currentRole === 'servizi_generali') {
      setActiveSubTab('assets');
    } else if (currentRole === 'pm' && activeSubTab === 'contract') {
      setActiveSubTab('assets');
    }
  }, [currentRole]);

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEmp, setEditingEmp] = useState(null)
  
  // Campi del form dipendente
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formDept, setFormDept] = useState('Tech')
  const [formRole, setFormRole] = useState('')
  const [formContract, setFormContract] = useState('Tempo Indeterminato')
  const [formRal, setFormRal] = useState('30000')
  const [formHireDate, setFormHireDate] = useState(new Date().toISOString().split('T')[0])
  const [formTrialEnd, setFormTrialEnd] = useState('')
  const [formDocExpiry, setFormDocExpiry] = useState('')
  const [formSafetyExpiry, setFormSafetyExpiry] = useState('')
  const [formMedicalExpiry, setFormMedicalExpiry] = useState('')

  // Gestione Asset
  const [newAssetType, setNewAssetType] = useState('Notebook')
  const [newAssetModel, setNewAssetModel] = useState('')
  const [newAssetSerial, setNewAssetSerial] = useState('')

  // Gestione Checklist
  const [checklistType, setChecklistType] = useState('Onboarding') // 'Onboarding' | 'Offboarding'
  const [newChecklistTask, setNewChecklistTask] = useState('')
  const [newChecklistAssigned, setNewChecklistAssigned] = useState('HR')

  // Gestione Performance Form
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [reviewPeriod, setReviewPeriod] = useState('Q1 2026')
  const [selfTech, setSelfTech] = useState(4)
  const [selfTeamwork, setSelfTeamwork] = useState(4)
  const [selfProactivity, setSelfProactivity] = useState(4)
  const [selfComm, setSelfComm] = useState(4)
  const [managerTech, setManagerTech] = useState(4)
  const [managerTeamwork, setManagerTeamwork] = useState(4)
  const [managerProactivity, setManagerProactivity] = useState(4)
  const [managerComm, setManagerComm] = useState(4)
  const [reviewFeedback, setReviewFeedback] = useState('')

  // Gestione OKR Form
  const [newOkrTitle, setNewOkrTitle] = useState('')

  const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0]

  const openAddForm = () => {
    setEditingEmp(null)
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormDept('Tech')
    setFormRole('')
    setFormContract('Tempo Indeterminato')
    setFormRal('30000')
    setFormHireDate(new Date().toISOString().split('T')[0])
    setFormTrialEnd('')
    setFormDocExpiry('')
    setFormSafetyExpiry('')
    setFormMedicalExpiry('')
    setIsFormOpen(true)
  }

  const openEditForm = (emp) => {
    setEditingEmp(emp)
    setFormName(emp.name)
    setFormEmail(emp.email)
    setFormPhone(emp.phone || '')
    setFormDept(emp.department)
    setFormRole(emp.role)
    setFormContract(emp.contract_type)
    setFormRal(emp.ral || '0')
    setFormHireDate(emp.hire_date || '')
    setFormTrialEnd(emp.trial_period_end || '')
    setFormDocExpiry(emp.document_id_expiry || '')
    setFormSafetyExpiry(emp.safety_course_expiry || '')
    setFormMedicalExpiry(emp.medical_visit_expiry || '')
    setIsFormOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formName.trim() || !formEmail.trim() || !formRole.trim()) {
      alert("Compila tutti i campi obbligatori (Nome, Email, Ruolo).")
      return
    }

    const empData = {
      name: formName,
      email: formEmail,
      phone: formPhone,
      department: formDept,
      role: formRole,
      contract_type: formContract,
      ral: parseFloat(formRal) || 0,
      hire_date: formHireDate,
      trial_period_end: formTrialEnd || null,
      document_id_expiry: formDocExpiry || null,
      safety_course_expiry: formSafetyExpiry || null,
      medical_visit_expiry: formMedicalExpiry || null,
      assets: editingEmp ? editingEmp.assets : []
    }

    if (editingEmp) {
      await onUpdateEmployee(editingEmp.id, empData)
    } else {
      const added = await onAddEmployee(empData)
      if (added) setSelectedEmpId(added.id)
    }
    setIsFormOpen(false)
  }

  const handleAddAsset = async () => {
    if (!newAssetModel.trim()) return
    const newAsset = {
      type: newAssetType,
      model: newAssetModel,
      serial: newAssetSerial || 'N/D',
      assignedAt: new Date().toISOString().split('T')[0]
    }
    
    const updatedAssets = [...getSafeAssets(selectedEmp.assets), newAsset]
    await onUpdateEmployee(selectedEmp.id, { ...selectedEmp, assets: updatedAssets })
    setNewAssetModel('')
    setNewAssetSerial('')
  }

  const handleRemoveAsset = async (index) => {
    const updatedAssets = getSafeAssets(selectedEmp.assets).filter((_, i) => i !== index)
    await onUpdateEmployee(selectedEmp.id, { ...selectedEmp, assets: updatedAssets })
  }

  const handleDelete = async (id) => {
    if (confirm("Sei sicuro di voler eliminare questo dipendente e il suo fascicolo digitale? L'operazione non è reversibile.")) {
      await onDeleteEmployee(id)
      setSelectedEmpId(null)
    }
  }

  // Gestione compiti checklist
  const handleToggleChecklist = async (taskId, currentStatus) => {
    if (onUpdateChecklistTask) {
      await onUpdateChecklistTask(taskId, !currentStatus)
    }
  }

  const handleAddCustomChecklistTask = async (e) => {
    e.preventDefault()
    if (!newChecklistTask.trim() || !selectedEmp) return
    if (onAddChecklistTask) {
      await onAddChecklistTask({
        employee_id: selectedEmp.id,
        employee_name: selectedEmp.name,
        type: checklistType,
        task_name: newChecklistTask,
        assigned_to: newChecklistAssigned,
        is_completed: false
      })
      setNewChecklistTask('')
    }
  }

  // Gestione Valutazioni Performance
  const handleOpenReviewForm = () => {
    setReviewPeriod('Q1 2026')
    setSelfTech(4)
    setSelfTeamwork(4)
    setSelfProactivity(4)
    setSelfComm(4)
    setManagerTech(4)
    setManagerTeamwork(4)
    setManagerProactivity(4)
    setManagerComm(4)
    setReviewFeedback('')
    setIsReviewFormOpen(true)
  }

  const handleSaveReview = async (e) => {
    e.preventDefault()
    if (!selectedEmp) return
    if (onSavePerformanceReview) {
      const reviewData = {
        employee_id: selectedEmp.id,
        employee_name: selectedEmp.name,
        review_period: reviewPeriod,
        self_rating: { tech: selfTech, teamwork: selfTeamwork, proactivity: selfProactivity, communication: selfComm },
        manager_rating: { tech: managerTech, teamwork: managerTeamwork, proactivity: managerProactivity, communication: managerComm },
        overall_feedback: reviewFeedback
      }
      await onSavePerformanceReview(reviewData)
      setIsReviewFormOpen(false)
    }
  }

  // Gestione OKR
  const handleAddOkr = async (e) => {
    e.preventDefault()
    if (!newOkrTitle.trim() || !selectedEmp) return
    if (onAddOkrObjective) {
      await onAddOkrObjective(selectedEmp.id, newOkrTitle)
      setNewOkrTitle('')
    }
  }

  const handleOkrProgressChange = async (idx, val) => {
    if (onUpdateOkrProgress && selectedEmp) {
      await onUpdateOkrProgress(selectedEmp.id, idx, parseInt(val))
    }
  }

  // Helper per controllare scadenze
  const getDeadlineStatus = (dateStr) => {
    if (!dateStr) return { label: 'Non Impostata', class: 'badge-secondary', icon: '❓' }
    const today = new Date()
    const expiry = new Date(dateStr)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { label: `Scaduta da ${Math.abs(diffDays)} gg`, class: 'badge-danger', icon: '❌' }
    } else if (diffDays <= 30) {
      return { label: `In Scadenza (${diffDays} gg)`, class: 'badge-warning', icon: '⚠️' }
    } else {
      return { label: `Valida (scade il ${expiry.toLocaleDateString('it-IT')})`, class: 'badge-success', icon: '✅' }
    }
  }

  // Dati filtrati per l'impiegato selezionato
  const empChecklist = checklists.filter(item => item.employee_id === selectedEmp?.id && item.type === checklistType)
  const empCompletedTasks = empChecklist.filter(t => t.is_completed).length
  const empTotalTasks = empChecklist.length
  const checklistPercent = empTotalTasks > 0 ? Math.round((empCompletedTasks / empTotalTasks) * 100) : 0

  const empReviews = performances.filter(p => p.employee_id === selectedEmp?.id)
  const activeReview = empReviews[0] // Prendi la più recente

  // Generatore coordinate Radar Chart SVG nativo a 4 Assi (Tech, Teamwork, Proactivity, Communication)
  // Centro: x=100, y=100. Raggio massimo per rating 5 = 70.
  const getRadarCoordinates = (rating) => {
    if (!rating) return { tech: {x:100, y:100}, teamwork: {x:100, y:100}, proactivity: {x:100, y:100}, comm: {x:100, y:100} }
    
    const maxR = 70
    const cx = 100
    const cy = 100

    return {
      // Tech: Asse Verticale Superiore (0 gradi)
      tech: {
        x: cx,
        y: cy - (rating.tech / 5) * maxR
      },
      // Teamwork: Asse Orizzontale Destro (90 gradi)
      teamwork: {
        x: cx + (rating.teamwork / 5) * maxR,
        y: cy
      },
      // Proactivity: Asse Verticale Inferiore (180 gradi)
      proactivity: {
        x: cx,
        y: cy + (rating.proactivity / 5) * maxR
      },
      // Communication: Asse Orizzontale Sinistro (270 gradi)
      comm: {
        x: cx - (rating.communication / 5) * maxR,
        y: cy
      }
    }
  }

  const selfCoords = activeReview ? getRadarCoordinates(activeReview.self_rating) : null
  const managerCoords = activeReview ? getRadarCoordinates(activeReview.manager_rating) : null

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', minHeight: 'calc(100vh - 120px)' }}>
      {/* Intestazione del Tab */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem' }}>👥 Anagrafica & Fascicolo Dipendenti</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gestione contratti, beni aziendali consegnati, checklists e scadenze legali del personale di Todos.it</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['admin', 'hr'].includes(currentRole || 'admin') ? (
            <>
              <button className="btn btn-secondary" onClick={() => setShowOrgChart(!showOrgChart)}>
                <span>{showOrgChart ? '📄 Elenco & Fascicoli' : '🏢 Vedi Organigramma'}</span>
              </button>
              <button className="btn btn-primary" onClick={openAddForm}>
                <span>+ Aggiungi Dipendente</span>
              </button>
            </>
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
              🔒 Visualizzazione Limitata Anagrafica
            </span>
          )}
        </div>
      </div>

      {showOrgChart ? (
        <div className="glass-panel" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 20px',
          gap: '24px',
          borderRadius: 'var(--radius-lg)',
          flexGrow: 1,
          overflowY: 'auto',
          minHeight: '520px'
        }}>
          {/* LEVEL 1: CEO / HR MANAGER (Direzione) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {(() => {
              const manager = employees.find(e => e.department.toLowerCase().includes('hr') || e.role.toLowerCase().includes('manager')) || employees[0]
              if (!manager) return <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Crea un dipendente HR/Manager per guidare l'organigramma.</p>
              return (
                <div 
                  onClick={() => { setSelectedEmpId(manager.id); setShowOrgChart(false); setActiveSubTab('contract'); }}
                  className="table-row-hover"
                  style={{
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--primary)',
                    background: 'rgba(217, 4, 41, 0.05)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(217,4,41,0.15)',
                    minWidth: '220px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: 'var(--radius-sm)', background: 'var(--primary)', color: 'white', fontWeight: 700, display: 'inline-block', marginBottom: '6px', textTransform: 'uppercase' }}>
                    👑 Direzione Generale & HR
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.85rem' }}>{manager.name}</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{manager.role}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>📧 {manager.email}</span>
                </div>
              )
            })()}

            {/* Linea verticale verso il basso */}
            <div style={{ width: '2px', height: '24px', background: 'var(--border-color)', marginTop: '4px' }} />
          </div>

          {/* Linea orizzontale di collegamento */}
          <div style={{ width: '60%', height: '2px', background: 'var(--border-color)', marginTop: '-24px', marginBottom: '24px' }} />

          {/* LEVEL 2: Dipartimenti subordinati */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', width: '100%', maxWidth: '800px', alignItems: 'start' }}>
            
            {/* COLONNA A: Tech Department */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 700 }}>
                💻 Dipartimento Tech
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
                {employees.filter(e => e.department.toLowerCase() === 'tech').map((emp, idx) => (
                  <div 
                    key={emp.id}
                    onClick={() => { setSelectedEmpId(emp.id); setShowOrgChart(false); setActiveSubTab('contract'); }}
                    className="table-row-hover"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: idx === 0 ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                      background: idx === 0 ? 'rgba(59,130,246,0.02)' : 'var(--bg-card)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      width: '200px',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {idx === 0 && (
                      <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 'var(--radius-xs)', background: '#3b82f6', color: 'white', fontWeight: 700, display: 'inline-block', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Lead Developer
                      </span>
                    )}
                    <strong style={{ display: 'block', fontSize: '0.8rem' }}>{emp.name}</strong>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{emp.role}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>📧 {emp.email}</span>
                  </div>
                ))}
                {employees.filter(e => e.department.toLowerCase() === 'tech').length === 0 && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nessuna risorsa in Tech.</span>
                )}
              </div>
            </div>

            {/* COLONNA B: Commerciale / Vendite */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700 }}>
                📢 Commerciale & Sales
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
                {employees.filter(e => e.department.toLowerCase().includes('commer') || e.department.toLowerCase().includes('vendit')).map(emp => (
                  <div 
                    key={emp.id}
                    onClick={() => { setSelectedEmpId(emp.id); setShowOrgChart(false); setActiveSubTab('contract'); }}
                    className="table-row-hover"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      width: '200px',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <strong style={{ display: 'block', fontSize: '0.8rem' }}>{emp.name}</strong>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{emp.role}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>📧 {emp.email}</span>
                  </div>
                ))}
                {employees.filter(e => e.department.toLowerCase().includes('commer') || e.department.toLowerCase().includes('vendit')).length === 0 && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nessuna risorsa nel Commerciale.</span>
                )}
              </div>
            </div>

          </div>

          <div style={{ marginTop: '20px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            💡 Clicca su qualsiasi scheda per aprire istantaneamente il suo **Fascicolo Digitale** contrattuale.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3" style={{ gap: '16px', alignItems: 'stretch', flexGrow: 1 }}>
        {/* Colonna 1: Elenco dei Dipendenti */}
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '500px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            Lista Personale ({employees.length})
          </h3>
          {employees.length === 0 ? (
            <div style={{ padding: '40px 10px', textAlignment: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Nessun dipendente censito nel database.<br />Clicca su "+ Aggiungi" o assumi un candidato per iniziare!
            </div>
          ) : (
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '550px' }}>
              {employees.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => { setSelectedEmpId(emp.id); setActiveSubTab('contract'); }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: selectedEmpId === emp.id ? 'var(--primary)' : 'var(--border-color)',
                    background: selectedEmpId === emp.id ? 'var(--primary-light)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{emp.role} • {emp.department}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.7rem' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>{emp.contract_type}</span>
                    <span style={{ color: 'var(--text-muted)' }}>DAL {new Date(emp.hire_date).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonna 2 e 3: Fascicolo Digitale Dettagliato */}
        <div className="glass-panel" style={{ gridColumn: 'span 2', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!selectedEmp ? (
            <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', flexDirection: 'column', gap: '8px' }}>
              <span>👥 Seleziona un dipendente per visualizzare il suo fascicolo digitale</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              {/* Header Fascicolo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{selectedEmp.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <strong>{selectedEmp.role}</strong> — Dipartimento: {selectedEmp.department}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px', fontSize: '0.75rem' }}>
                    <span>📧 {selectedEmp.email}</span>
                    {selectedEmp.phone && <span>📞 {selectedEmp.phone}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['admin', 'hr'].includes(currentRole || 'admin') && (
                    <>
                      <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => openEditForm(selectedEmp)}>Modifica</button>
                      <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => handleDelete(selectedEmp.id)}>Elimina</button>
                    </>
                  )}
                </div>
              </div>

              {/* Sub Navigation del Fascicolo */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px', overflowX: 'auto' }}>
                {[
                  { id: 'contract', label: '📄 Dati Contrattuali', roles: ['admin', 'hr'] },
                  { id: 'assets', label: `💻 Asset & Dotazione (${getSafeAssets(selectedEmp.assets).length})`, roles: ['admin', 'hr', 'servizi_generali', 'pm'] },
                  { id: 'deadlines', label: '🚨 Adempimenti & Scadenze', roles: ['admin', 'hr'] },
                  { id: 'checklist', label: `📋 Checklist (${checklistPercent}%)`, roles: ['admin', 'hr', 'pm'] },
                  { id: 'performance', label: '📈 Valutazioni & OKR', roles: ['admin', 'hr', 'pm'] }
                ].filter(sub => sub.roles.includes(currentRole || 'admin')).map(subTab => (
                  <button
                    key={subTab.id}
                    onClick={() => setActiveSubTab(subTab.id)}
                    style={{
                      padding: '8px 0',
                      border: 'none',
                      background: 'transparent',
                      borderBottom: activeSubTab === subTab.id ? '2px solid var(--primary)' : '2px solid transparent',
                      color: activeSubTab === subTab.id ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {subTab.label}
                  </button>
                ))}
              </div>

              {/* Contenuto del Tab Selezionato */}
              <div style={{ flexGrow: 1, padding: '4px 0', overflowY: 'auto', maxHeight: '500px' }}>
                {/* 1. Dati Contrattuali */}
                {activeSubTab === 'contract' && (
                  <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Dettaglio Lavorativo</h4>
                      <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                        <div><strong>Tipo Contratto:</strong> {selectedEmp.contract_type}</div>
                        <div><strong>Data Assunzione:</strong> {new Date(selectedEmp.hire_date).toLocaleDateString('it-IT')}</div>
                        <div><strong>Fine Periodo Prova:</strong> {selectedEmp.trial_period_end ? new Date(selectedEmp.trial_period_end).toLocaleDateString('it-IT') : 'Nessuna/Superato'}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Inquadramento Economico</h4>
                      <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                        <div><strong>RAL Annuale Lorda:</strong> € {selectedEmp.ral?.toLocaleString('it-IT') || '0'}</div>
                        <div><strong>Costo Mensile Stimato:</strong> € {Math.round((selectedEmp.ral * 1.37) / 12).toLocaleString('it-IT')} <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>(con oneri aziendali)</span></div>
                        <div><strong>Stato:</strong> <span className="badge badge-success">Attivo</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Asset e Dotazione */}
                {activeSubTab === 'assets' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Attrezzatura e Beni Assegnati</h4>
                    
                    <table className="compact-table">
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th>Modello / Descrizione</th>
                          <th>Seriale</th>
                          <th>Data Consegna</th>
                          <th style={{ width: '60px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(getSafeAssets(selectedEmp.assets).length === 0) ? (
                          <tr>
                            <td colSpan="5" style={{ textAlignment: 'center', color: 'var(--text-secondary)', padding: '16px' }}>
                              Nessun bene aziendale assegnato a questo dipendente.
                            </td>
                          </tr>
                        ) : (
                          getSafeAssets(selectedEmp.assets).map((asset, idx) => (
                            <tr key={idx}>
                              <td><strong>{asset.type}</strong></td>
                              <td>{asset.model}</td>
                              <td><code>{asset.serial}</code></td>
                              <td>{new Date(asset.assignedAt).toLocaleDateString('it-IT')}</td>
                              <td>
                                {['admin', 'hr', 'servizi_generali'].includes(currentRole || 'admin') && (
                                  <button className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '0.65rem' }} onClick={() => handleRemoveAsset(idx)}>Rimuovi</button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* Aggiungi Asset Form */}
                    {['admin', 'hr', 'servizi_generali'].includes(currentRole || 'admin') && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                        <h5 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>Assegna Nuovo Dispositivo / Bene</h5>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <select
                            value={newAssetType}
                            onChange={(e) => setNewAssetType(e.target.value)}
                            style={{ padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                          >
                            <option value="Notebook">Notebook</option>
                            <option value="Smartphone">Smartphone</option>
                            <option value="Auto">Auto Aziendale</option>
                            <option value="Carta Carburante">Carta Carburante</option>
                            <option value="Badge">Badge Ufficio</option>
                            <option value="Altro">Altro / Licenza</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Modello (es. MacBook Pro M3)"
                            value={newAssetModel}
                            onChange={(e) => setNewAssetModel(e.target.value)}
                            style={{ flexGrow: 1, padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                          />
                          <input
                            type="text"
                            placeholder="Seriale / Targa / Numero"
                            value={newAssetSerial}
                            onChange={(e) => setNewAssetSerial(e.target.value)}
                            style={{ width: '150px', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                          />
                          <button className="btn btn-primary" style={{ padding: '6px 10px' }} onClick={handleAddAsset}>Assegna</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Scadenziere Adempimenti */}
                {activeSubTab === 'deadlines' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Monitoraggio Scadenze Legali e Sanitarie</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Scadenza Documento Identità */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.8rem' }}>
                          <strong>🪪 Carta d'Identità / Documento</strong>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '2px' }}>Richiesta per conformità buste paga e UNILAV.</div>
                        </div>
                        <div>
                          <span className={`badge ${getDeadlineStatus(selectedEmp.document_id_expiry).class}`} style={{ gap: '4px' }}>
                            {getDeadlineStatus(selectedEmp.document_id_expiry).icon} {getDeadlineStatus(selectedEmp.document_id_expiry).label}
                          </span>
                        </div>
                      </div>

                      {/* Scadenza Corso Sicurezza */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.8rem' }}>
                          <strong>🛡️ Corso di Formazione sulla Sicurezza ASR</strong>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '2px' }}>Formazione obbligatoria ai sensi del D.Lgs. 81/08.</div>
                        </div>
                        <div>
                          <span className={`badge ${getDeadlineStatus(selectedEmp.safety_course_expiry).class}`} style={{ gap: '4px' }}>
                            {getDeadlineStatus(selectedEmp.safety_course_expiry).icon} {getDeadlineStatus(selectedEmp.safety_course_expiry).label}
                          </span>
                        </div>
                      </div>

                      {/* Scadenza Visita Medica */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.8rem' }}>
                          <strong>🩺 Visita Medica del Lavoro (Idoneità)</strong>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '2px' }}>Visita medica periodica obbligatoria di sorveglianza sanitaria.</div>
                        </div>
                        <div>
                          <span className={`badge ${getDeadlineStatus(selectedEmp.medical_visit_expiry).class}`} style={{ gap: '4px' }}>
                            {getDeadlineStatus(selectedEmp.medical_visit_expiry).icon} {getDeadlineStatus(selectedEmp.medical_visit_expiry).label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Checklist Onboarding/Offboarding */}
                {activeSubTab === 'checklist' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className={`btn ${checklistType === 'Onboarding' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          onClick={() => setChecklistType('Onboarding')}
                        >
                          🚪 Accoglienza (Onboarding)
                        </button>
                        <button
                          className={`btn ${checklistType === 'Offboarding' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          onClick={() => setChecklistType('Offboarding')}
                        >
                          🏃‍♂️ Uscita (Offboarding)
                        </button>
                      </div>
                      
                      <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        Avanzamento: <span style={{ color: 'var(--primary)' }}>{empCompletedTasks}/{empTotalTasks}</span> ({checklistPercent}%)
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${checklistPercent}%`, height: '100%', background: 'var(--success)', transition: 'width 0.3s ease' }} />
                    </div>

                    {/* Tasks List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                      {empChecklist.length === 0 ? (
                        <div style={{ textAlignment: 'center', color: 'var(--text-secondary)', padding: '20px 0', fontSize: '0.8rem' }}>
                          Nessun compito registrato per questa checklist.
                        </div>
                      ) : (
                        empChecklist.map(task => (
                          <div
                            key={task.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background: 'var(--bg-app)',
                              borderRadius: 'var(--radius-md)',
                              borderLeft: task.is_completed ? '3px solid var(--success)' : '3px solid var(--text-muted)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', cursor: 'pointer', flexGrow: 1 }}>
                              <input
                                type="checkbox"
                                checked={task.is_completed}
                                onChange={() => handleToggleChecklist(task.id, task.is_completed)}
                                style={{ width: '15px', height: '15px', accentColor: 'var(--success)' }}
                              />
                              <span style={{ textDecoration: task.is_completed ? 'line-through' : 'none', color: task.is_completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                {task.task_name}
                              </span>
                            </label>
                            <span className="badge badge-primary" style={{ fontSize: '0.58rem', padding: '1px 4px' }}>
                              {task.assigned_to}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Custom Task Form */}
                    <form onSubmit={handleAddCustomChecklistTask} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '8px' }}>
                      <input
                        type="text"
                        required
                        placeholder={`Aggiungi attività personalizzata di ${checklistType}...`}
                        value={newChecklistTask}
                        onChange={e => setNewChecklistTask(e.target.value)}
                        style={{ flexGrow: 1, padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                      />
                      <select
                        value={newChecklistAssigned}
                        onChange={e => setNewChecklistAssigned(e.target.value)}
                        style={{ padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                      >
                        <option value="HR">HR</option>
                        <option value="IT">IT</option>
                        <option value="Amministrazione">Admin</option>
                      </select>
                      <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px' }}>Aggiungi</button>
                    </form>
                  </div>
                )}

                {/* 5. Performance Reviews & OKR */}
                {activeSubTab === 'performance' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Valutazione Radar & Feedback */}
                    <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                      {/* Sinistra: Radar Chart SVG */}
                      <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
                        <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          Radar Chart Competenziale ({activeReview ? activeReview.review_period : 'Nessuna Scheda'})
                        </h5>
                        
                        {!activeReview ? (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlignment: 'center', padding: '40px 10px' }}>
                            Nessuna scheda di valutazione presente.<br />Clicca sul pulsante per redigerne una!
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <svg width="200" height="200" viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
                              {/* Rete Concentrica (Diamonds) per livelli da 1 a 5 */}
                              {[14, 28, 42, 56, 70].map((r, i) => (
                                <polygon
                                  key={i}
                                  points={`100,${100 - r} ${100 + r},100 100,${100 + r} ${100 - r},100`}
                                  fill="none"
                                  stroke="var(--border-color)"
                                  strokeWidth="0.8"
                                  strokeDasharray="2 2"
                                />
                              ))}
                              
                              {/* Assi Ortogonali */}
                              <line x1="100" y1="30" x2="100" y2="170" stroke="var(--border-color)" strokeWidth="1" />
                              <line x1="30" y1="100" x2="170" y2="100" stroke="var(--border-color)" strokeWidth="1" />

                              {/* Etichette degli Assi */}
                              <text x="100" y="22" textAnchor="middle" fontSize="7" fontWeight="bold" fill="var(--text-primary)">Tech</text>
                              <text x="176" y="103" textAnchor="start" fontSize="7" fontWeight="bold" fill="var(--text-primary)">Teamwork</text>
                              <text x="100" y="186" textAnchor="middle" fontSize="7" fontWeight="bold" fill="var(--text-primary)">Proactivity</text>
                              <text x="24" y="103" textAnchor="end" fontSize="7" fontWeight="bold" fill="var(--text-primary)">Comm.</text>

                              {/* Poligono Autovalutazione (Self) in Azzurro */}
                              <polygon
                                points={`${selfCoords.tech.x},${selfCoords.tech.y} ${selfCoords.teamwork.x},${selfCoords.teamwork.y} ${selfCoords.proactivity.x},${selfCoords.proactivity.y} ${selfCoords.comm.x},${selfCoords.comm.y}`}
                                fill="rgba(59, 130, 246, 0.22)"
                                stroke="#3b82f6"
                                strokeWidth="1.5"
                              />

                              {/* Poligono Valutazione Manager in Rosso Todos */}
                              <polygon
                                points={`${managerCoords.tech.x},${managerCoords.tech.y} ${managerCoords.teamwork.x},${managerCoords.teamwork.y} ${managerCoords.proactivity.x},${managerCoords.proactivity.y} ${managerCoords.comm.x},${managerCoords.comm.y}`}
                                fill="rgba(217, 4, 41, 0.22)"
                                stroke="var(--primary)"
                                strokeWidth="1.5"
                              />
                            </svg>
                            
                            {/* Legenda Radar */}
                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.65rem', marginTop: '8px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }} />
                                <span>Self Rating</span>
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />
                                <span>Manager Rating</span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Destra: Feedback & Nuova Review */}
                      <div style={{ display: 'flex', flexDirection: 'column', justify: 'space-between', gap: '10px' }}>
                        <div>
                          <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>Feedback di Direzione</h5>
                          <div style={{ background: 'var(--bg-app)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-primary)', fontStyle: 'italic', minHeight: '110px' }}>
                            {activeReview?.overall_feedback || "Nessun feedback registrato per questo periodo."}
                          </div>
                        </div>
                        
                        <button className="btn btn-secondary" style={{ width: '100%', padding: '6px' }} onClick={handleOpenReviewForm}>
                          📝 Redigi Nuova Valutazione
                        </button>
                      </div>
                    </div>

                    {/* Area OKR (Obiettivi e Progresso) */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '8px' }}>🚀 Obiettivi Strategici (OKR)</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(!activeReview || !activeReview.okrs || activeReview.okrs.length === 0) ? (
                          <div style={{ textAlignment: 'center', color: 'var(--text-secondary)', padding: '20px 0', fontSize: '0.75rem' }}>
                            Nessun obiettivo strategico (OKR) assegnato a questo dipendente.<br />Compila una valutazione per definire gli obiettivi!
                          </div>
                        ) : (
                          activeReview.okrs.map((okr, idx) => (
                            <div key={idx} style={{ background: 'var(--bg-app)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                                <span>{okr.title}</span>
                                <span style={{ color: 'var(--primary)' }}>{okr.progress}%</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={okr.progress}
                                  onChange={(e) => handleOkrProgressChange(idx, e.target.value)}
                                  style={{ flexGrow: 1, accentColor: 'var(--primary)', height: '4px', cursor: 'pointer' }}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add OKR form */}
                      {activeReview && (
                        <form onSubmit={handleAddOkr} style={{ display: 'flex', gap: '8px', borderTop: '1px dashed var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                          <input
                            type="text"
                            required
                            placeholder="Definisci nuovo obiettivo OKR..."
                            value={newOkrTitle}
                            onChange={e => setNewOkrTitle(e.target.value)}
                            style={{ flexGrow: 1, padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                          />
                          <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px' }}>Aggiungi OKR</button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>)}

      {/* FORM DI AGGIUNTA / MODIFICA DIPENDENTE (MODAL INTERNO) */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ background: 'var(--bg-card)', maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                {editingEmp ? "📝 Modifica Fascicolo Dipendente" : "👥 Aggiungi Nuovo Dipendente"}
              </h3>
              <button style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-primary)' }} onClick={() => setIsFormOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Sezione Anagrafica Base */}
                <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>Dati Personali & Ruolo</h4>
                
                <div className="grid grid-cols-2" style={{ gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Nome e Cognome *</label>
                    <input type="text" required value={formName} onChange={e => setFormName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Email Aziendale / Personale *</label>
                    <input type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                  </div>
                </div>

                <div className="grid grid-cols-3" style={{ gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Telefono</label>
                    <input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Dipartimento</label>
                    <select value={formDept} onChange={e => setFormDept(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                      <option value="Tech">Tech / Sviluppo</option>
                      <option value="Commerciale">Commerciale</option>
                      <option value="HR / Recruiting">HR / Recruiting</option>
                      <option value="Amministrazione">Amministrazione</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Ruolo Professionale *</label>
                    <input type="text" required value={formRole} onChange={e => setFormRole(e.target.value)} placeholder="es. Senior Frontend Developer" style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                  </div>
                </div>

                {/* Sezione Contratto e RAL */}
                <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginTop: '8px' }}>Inquadramento & Scadenze</h4>

                <div className="grid grid-cols-3" style={{ gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tipo Contratto</label>
                    <select value={formContract} onChange={e => setFormContract(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                      <option value="Tempo Indeterminato">Tempo Indeterminato</option>
                      <option value="Tempo Determinato">Tempo Determinato</option>
                      <option value="Apprendistato">Apprendistato Professionalizzante</option>
                      <option value="Co.co.co">Collaborazione (Co.co.co)</option>
                      <option value="Partita IVA">Partita IVA / Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>RAL Annuo Lordo (€)</label>
                    <input type="number" value={formRal} onChange={e => setFormRal(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Data Assunzione</label>
                    <input type="date" value={formHireDate} onChange={e => setFormHireDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                  </div>
                </div>

                <div className="grid grid-cols-4" style={{ gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Scadenza Prova</label>
                    <input type="date" value={formTrialEnd} onChange={e => setFormTrialEnd(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.75rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Scadenza ID/Doc</label>
                    <input type="date" value={formDocExpiry} onChange={e => setFormDocExpiry(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.75rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Scadenza Sicurezza</label>
                    <input type="date" value={formSafetyExpiry} onChange={e => setFormSafetyExpiry(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.75rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Scadenza Visita Med.</label>
                    <input type="date" value={formMedicalExpiry} onChange={e => setFormMedicalExpiry(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.75rem' }} />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">{editingEmp ? "Salva Modifiche" : "Aggiungi Dipendente"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM DI VALUTAZIONE PERFORMANCE (MODAL INTERNO) */}
      {isReviewFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ background: 'var(--bg-card)', maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                📝 Nuova Valutazione delle Performance
              </h3>
              <button style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-primary)' }} onClick={() => setIsReviewFormOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveReview}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Periodo di Valutazione</label>
                  <input
                    type="text"
                    required
                    value={reviewPeriod}
                    onChange={e => setReviewPeriod(e.target.value)}
                    placeholder="es. Q1 2026 o Anno 2026"
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                  {/* Autovalutazione */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>Autovalutazione (Self)</h4>
                    
                    {[
                      { label: 'Competenze Tecniche', val: selfTech, setVal: setSelfTech },
                      { label: 'Lavoro di Gruppo', val: selfTeamwork, setVal: setSelfTeamwork },
                      { label: 'Proattività', val: selfProactivity, setVal: setSelfProactivity },
                      { label: 'Comunicazione', val: selfComm, setVal: setSelfComm }
                    ].map((item, idx) => (
                      <div key={idx}>
                        <label style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span>{item.label}</span>
                          <strong>{item.val}/5</strong>
                        </label>
                        <input type="range" min="1" max="5" value={item.val} onChange={e => item.setVal(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#3b82f6' }} />
                      </div>
                    ))}
                  </div>

                  {/* Valutazione Manager */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>Valutazione Direzione</h4>
                    
                    {[
                      { label: 'Competenze Tecniche', val: managerTech, setVal: setManagerTech },
                      { label: 'Lavoro di Gruppo', val: managerTeamwork, setVal: setManagerTeamwork },
                      { label: 'Proattività', val: managerProactivity, setVal: setManagerProactivity },
                      { label: 'Comunicazione', val: managerComm, setVal: setManagerComm }
                    ].map((item, idx) => (
                      <div key={idx}>
                        <label style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span>{item.label}</span>
                          <strong>{item.val}/5</strong>
                        </label>
                        <input type="range" min="1" max="5" value={item.val} onChange={e => item.setVal(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Feedback Globale Scritto</label>
                  <textarea
                    rows="3"
                    value={reviewFeedback}
                    onChange={e => setReviewFeedback(e.target.value)}
                    placeholder="Fornisci una sintesi costruttiva sulla crescita del dipendente e le prospettive future..."
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'none' }}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsReviewFormOpen(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">Registra Scheda</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
