import React, { useState } from 'react'

export default function EmployeesTab({ employees, candidates, onAddEmployee, onUpdateEmployee, onDeleteEmployee }) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || null)
  const [activeSubTab, setActiveSubTab] = useState('contract') // 'contract', 'assets', 'deadlines'
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEmp, setEditingEmp] = useState(null)
  
  // Campi del form
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
    
    const updatedAssets = [...(selectedEmp.assets || []), newAsset]
    await onUpdateEmployee(selectedEmp.id, { ...selectedEmp, assets: updatedAssets })
    setNewAssetModel('')
    setNewAssetSerial('')
  }

  const handleRemoveAsset = async (index) => {
    const updatedAssets = (selectedEmp.assets || []).filter((_, i) => i !== index)
    await onUpdateEmployee(selectedEmp.id, { ...selectedEmp, assets: updatedAssets })
  }

  const handleDelete = async (id) => {
    if (confirm("Sei sicuro di voler eliminare questo dipendente e il suo fascicolo digitale? L'operazione non è reversibile.")) {
      await onDeleteEmployee(id)
      setSelectedEmpId(null)
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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', minHeight: 'calc(100vh - 120px)' }}>
      {/* Intestazione del Tab */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem' }}>👥 Anagrafica & Fascicolo Dipendenti</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gestione contratti, beni aziendali consegnati e scadenze legali del personale di Todos.it</p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          <span>+ Aggiungi Dipendente</span>
        </button>
      </div>

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
                  <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => openEditForm(selectedEmp)}>Modifica</button>
                  <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => handleDelete(selectedEmp.id)}>Elimina</button>
                </div>
              </div>

              {/* Sub Navigation del Fascicolo */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px' }}>
                <button
                  onClick={() => setActiveSubTab('contract')}
                  style={{
                    padding: '8px 0',
                    border: 'none',
                    background: 'transparent',
                    borderBottom: activeSubTab === 'contract' ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeSubTab === 'contract' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  📄 Dati Contrattuali
                </button>
                <button
                  onClick={() => setActiveSubTab('assets')}
                  style={{
                    padding: '8px 0',
                    border: 'none',
                    background: 'transparent',
                    borderBottom: activeSubTab === 'assets' ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeSubTab === 'assets' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  💻 Asset e Dotazione ({selectedEmp.assets?.length || 0})
                </button>
                <button
                  onClick={() => setActiveSubTab('deadlines')}
                  style={{
                    padding: '8px 0',
                    border: 'none',
                    background: 'transparent',
                    borderBottom: activeSubTab === 'deadlines' ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeSubTab === 'deadlines' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  🚨 Scadenziere & Adempimenti
                </button>
              </div>

              {/* Contenuto del Tab Selezionato */}
              <div style={{ flexGrow: 1, padding: '4px 0' }}>
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
                        <div><strong>RAL Annuala Lorda:</strong> € {selectedEmp.ral?.toLocaleString('it-IT') || '0'}</div>
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
                        {(!selectedEmp.assets || selectedEmp.assets.length === 0) ? (
                          <tr>
                            <td colSpan="5" style={{ textAlignment: 'center', color: 'var(--text-secondary)', padding: '16px' }}>
                              Nessun bene aziendale assegnato a questo dipendente.
                            </td>
                          </tr>
                        ) : (
                          selectedEmp.assets.map((asset, idx) => (
                            <tr key={idx}>
                              <td><strong>{asset.type}</strong></td>
                              <td>{asset.model}</td>
                              <td><code>{asset.serial}</code></td>
                              <td>{new Date(asset.assignedAt).toLocaleDateString('it-IT')}</td>
                              <td>
                                <button className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '0.65rem' }} onClick={() => handleRemoveAsset(idx)}>Rimuovi</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* Aggiungi Asset Form */}
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
                          placeholder="Seriale / Targa"
                          value={newAssetSerial}
                          onChange={(e) => setNewAssetSerial(e.target.value)}
                          style={{ width: '120px', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                        />
                        <button className="btn btn-primary" style={{ padding: '6px 10px' }} onClick={handleAddAsset}>Assegna</button>
                      </div>
                    </div>
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
              </div>
            </div>
          )}
        </div>
      </div>

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
    </div>
  )
}
