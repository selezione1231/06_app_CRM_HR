import React, { useState } from 'react'

export default function AbsencesTab({ employees, leaves, onAddLeave, onUpdateLeaveStatus, onDeleteLeave }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()) // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false)
  
  // Campi del form
  const [formEmployeeId, setFormEmployeeId] = useState(employees[0]?.id || '')
  const [formType, setFormType] = useState('Ferie')
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0])
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().split('T')[0])
  const [formHours, setFormHours] = useState('')
  const [formNotes, setFormNotes] = useState('')

  // Lista mesi in italiano
  const MONTHS = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ]

  // Ottieni i giorni del mese corrente
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const numDays = getDaysInMonth(selectedMonth, selectedYear)
  const daysArray = Array.from({ length: numDays }, (_, i) => i + 1)

  // Calcola statistiche utili
  const pendingRequests = leaves.filter(l => l.status === 'Pending')
  
  const todayStr = new Date().toISOString().split('T')[0]
  const todayAbsentCount = leaves.filter(l => {
    if (l.status !== 'Approved') return false
    return todayStr >= l.start_date && todayStr <= l.end_date
  }).length

  const approvedThisMonth = leaves.filter(l => {
    if (l.status !== 'Approved') return false
    const start = new Date(l.start_date)
    return start.getMonth() === selectedMonth && start.getFullYear() === selectedYear
  })

  const totalDaysApproved = approvedThisMonth.reduce((acc, curr) => {
    const start = new Date(curr.start_date)
    const end = new Date(curr.end_date)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return acc + diffDays
  }, 0)

  // Trova le assenze approvate per un dipendente in un giorno specifico
  const getDayLeave = (employeeId, day) => {
    // Genera stringa data per il confronto YYYY-MM-DD
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    return leaves.find(l => {
      if (l.employee_id !== employeeId || l.status !== 'Approved') return false
      return dateStr >= l.start_date && dateStr <= l.end_date
    })
  }

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(prev => prev - 1)
    } else {
      setSelectedMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(prev => prev + 1)
    } else {
      setSelectedMonth(prev => prev + 1)
    }
  }

  const handleOpenForm = () => {
    if (employees.length === 0) {
      alert("Nessun dipendente censito nel database. Aggiungi prima un dipendente nel tab Anagrafica.")
      return
    }
    setFormEmployeeId(employees[0].id)
    setFormType('Ferie')
    setFormStartDate(new Date().toISOString().split('T')[0])
    setFormEndDate(new Date().toISOString().split('T')[0])
    setFormHours('')
    setFormNotes('')
    setIsRequestFormOpen(true)
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    if (!formEmployeeId) return

    const selectedEmp = employees.find(emp => emp.id === formEmployeeId)
    if (!selectedEmp) return

    const leaveData = {
      employee_id: formEmployeeId,
      employee_name: selectedEmp.name,
      type: formType,
      start_date: formStartDate,
      end_date: formEndDate,
      hours: formHours ? parseFloat(formHours) : null,
      notes: formNotes,
      status: 'Pending'
    }

    await onAddLeave(leaveData)
    setIsRequestFormOpen(false)
  }

  const handleUpdateStatus = async (id, newStatus) => {
    await onUpdateLeaveStatus(id, newStatus)
  }

  const handleDelete = async (id) => {
    if (confirm("Sei sicuro di voler eliminare questa richiesta?")) {
      await onDeleteLeave(id)
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', minHeight: 'calc(100vh - 120px)' }}>
      {/* Intestazione del Tab */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem' }}>🗓️ Gestione Ferie, Permessi & Presenze</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Workflow di approvazione assenze e calendario presenze consolidato del personale</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenForm}>
          <span>+ Nuova Richiesta Assenza</span>
        </button>
      </div>

      {/* Widget/Metriche in alto */}
      <div className="grid grid-cols-3" style={{ gap: '16px' }}>
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '2rem' }}>🕒</div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Richieste in Attesa</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: pendingRequests.length > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
              {pendingRequests.length} pendenza/e
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '2rem' }}>🌴</div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Giorni Approvati nel Mese</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
              {totalDaysApproved} giorni
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '2rem' }}>🚪</div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Dipendenti Assenti Oggi</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: todayAbsentCount > 0 ? 'var(--primary)' : 'var(--text-primary)' }}>
              {todayAbsentCount} dipendente/i
            </div>
          </div>
        </div>
      </div>

      {/* Sezione 1: Calendario Mensile Grafico delle Presenze */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>
            📅 Tabellone Presenze Mensile
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={handlePrevMonth}>◀</button>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', width: '130px', textAlignment: 'center' }}>
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
            <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={handleNextMonth}>▶</button>
          </div>
        </div>

        {/* Griglia Calendario dei Dipendenti */}
        {employees.length === 0 ? (
          <div style={{ padding: '40px', textAlignment: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Nessun dipendente presente per popolare il tabellone. Aggiungi il personale nella scheda Anagrafica!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-app)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '8px', textAlignment: 'left', minWidth: '150px', fontWeight: 800 }}>Dipendente</th>
                  {daysArray.map(day => (
                    <th key={day} style={{ padding: '8px 4px', textAlignment: 'center', minWidth: '24px', fontWeight: 800 }}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)', height: '36px' }}>
                    <td style={{ padding: '8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {emp.name}
                      <div style={{ fontSize: '0.65rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>{emp.department}</div>
                    </td>
                    {daysArray.map(day => {
                      const leave = getDayLeave(emp.id, day)
                      let bg = 'transparent'
                      let border = 'none'
                      let title = ''

                      if (leave) {
                        if (leave.type === 'Ferie') {
                          bg = 'rgba(34, 197, 94, 0.25)'
                          border = '1px solid rgb(34, 197, 94)'
                          title = 'Ferie Approvate'
                        } else if (leave.type === 'Permesso') {
                          bg = 'rgba(234, 179, 8, 0.25)'
                          border = '1px solid rgb(234, 179, 8)'
                          title = `Permesso Approvato (${leave.hours || 8} ore)`
                        } else if (leave.type === 'Malattia') {
                          bg = 'rgba(239, 68, 68, 0.25)'
                          border = '1px solid rgb(239, 68, 68)'
                          title = 'Malattia Approvata'
                        }
                      }

                      return (
                        <td
                          key={day}
                          title={title}
                          style={{
                            padding: '2px',
                            textAlignment: 'center',
                            background: bg,
                            border: border,
                            borderRight: '1px solid var(--border-color)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {leave && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {leave.type.substring(0, 1)}
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Legenda */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.7rem', color: 'var(--text-secondary)', paddingLeft: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'rgba(34, 197, 94, 0.25)', border: '1px solid rgb(34, 197, 94)', borderRadius: '2px' }} />
                <span>F (Ferie)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'rgba(234, 179, 8, 0.25)', border: '1px solid rgb(234, 179, 8)', borderRadius: '2px' }} />
                <span>P (Permesso)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgb(239, 68, 68)', borderRadius: '2px' }} />
                <span>M (Malattia)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sezione 2: Workflow Approvazione Richieste Pendenti */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          📑 Richieste di Assenza in Sospeso
        </h3>

        <table className="compact-table">
          <thead>
            <tr>
              <th>Dipendente</th>
              <th>Tipo</th>
              <th>Periodo</th>
              <th>Dettagli / Ore</th>
              <th>Note Dipendente</th>
              <th>Stato</th>
              <th style={{ width: '180px', textAlignment: 'right' }}>Azioni Amministratore</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlignment: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                  Nessuna richiesta di assenza attualmente in sospeso. Ottimo lavoro!
                </td>
              </tr>
            ) : (
              pendingRequests.map(req => {
                const start = new Date(req.start_date).toLocaleDateString('it-IT')
                const end = new Date(req.end_date).toLocaleDateString('it-IT')
                
                return (
                  <tr key={req.id}>
                    <td><strong>{req.employee_name}</strong></td>
                    <td>
                      <span className={`badge ${req.type === 'Ferie' ? 'badge-success' : req.type === 'Permesso' ? 'badge-warning' : 'badge-danger'}`}>
                        {req.type}
                      </span>
                    </td>
                    <td>{start} - {end}</td>
                    <td>{req.hours ? `${req.hours} Ore` : 'Giornata Intera'}</td>
                    <td style={{ fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.notes}>
                      {req.notes || '-'}
                    </td>
                    <td>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>IN ATTESA</span>
                    </td>
                    <td style={{ textAlignment: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => handleUpdateStatus(req.id, 'Approved')}>Approva</button>
                        <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => handleUpdateStatus(req.id, 'Rejected')}>Rifiuta</button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sezione 3: Storico delle Richieste Trattate (Approvate/Rifiutate) */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          🗄️ Storico Richieste Gestite (Ultime 10)
        </h3>

        <table className="compact-table">
          <thead>
            <tr>
              <th>Dipendente</th>
              <th>Tipo</th>
              <th>Periodo</th>
              <th>Ore</th>
              <th>Note</th>
              <th>Esito</th>
              <th style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {leaves.filter(l => l.status !== 'Pending').slice(0, 10).length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlignment: 'center', color: 'var(--text-secondary)', padding: '16px' }}>
                  Nessuna richiesta archiviata nello storico.
                </td>
              </tr>
            ) : (
              leaves.filter(l => l.status !== 'Pending').slice(0, 10).map(req => (
                <tr key={req.id}>
                  <td>{req.employee_name}</td>
                  <td><strong>{req.type}</strong></td>
                  <td>{new Date(req.start_date).toLocaleDateString('it-IT')} - {new Date(req.end_date).toLocaleDateString('it-IT')}</td>
                  <td>{req.hours ? `${req.hours} Ore` : 'Giornata Intera'}</td>
                  <td>{req.notes || '-'}</td>
                  <td>
                    <span className={`badge ${req.status === 'Approved' ? 'badge-success' : 'badge-danger'}`}>
                      {req.status === 'Approved' ? 'APPROVATA' : 'RIFIUTATA'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '0.65rem' }} onClick={() => handleDelete(req.id)}>Rimuovi</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FORM DI INSERIMENTO NUOVA RICHIESTA ASSENZA */}
      {isRequestFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ background: 'var(--bg-card)', maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                🌴 Registra Nuova Assenza / Permesso
              </h3>
              <button style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-primary)' }} onClick={() => setIsRequestFormOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitRequest}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Seleziona Dipendente *</label>
                  <select
                    required
                    value={formEmployeeId}
                    onChange={e => setFormEmployeeId(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2" style={{ gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tipo Assenza</label>
                    <select
                      value={formType}
                      onChange={e => setFormType(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    >
                      <option value="Ferie">Ferie</option>
                      <option value="Permesso">Permesso Lavorativo</option>
                      <option value="Malattia">Malattia</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Ore (solo per permessi parziali)</label>
                    <input
                      type="number"
                      placeholder="es. 4 (lascia vuoto per intero)"
                      value={formHours}
                      onChange={e => setFormHours(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2" style={{ gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Data Inizio *</label>
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={e => setFormStartDate(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Data Fine *</label>
                    <input
                      type="date"
                      required
                      value={formEndDate}
                      onChange={e => setFormEndDate(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Note / Motivazione</label>
                  <textarea
                    rows="3"
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder="Dettagli aggiuntivi per l'approvazione..."
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'none' }}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsRequestFormOpen(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">Invia Richiesta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
