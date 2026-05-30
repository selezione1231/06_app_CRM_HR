import React, { useState } from 'react'
import { Trash2, CheckCircle, FileText, Send, Download, Sparkles, Receipt, RefreshCw } from 'lucide-react'

export default function ExpensesTab({
  employees = [],
  expenses = [],
  onSaveExpense,
  onUpdateExpenseStatus,
  onDeleteExpense
}) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Pasti')
  const [notes, setNotes] = useState('')
  const [receiptName, setReceiptName] = useState('')

  // Stati per la simulazione OCR
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState(null) // 'selecting' | 'scanning' | 'done'
  const [selectedReceiptModel, setSelectedReceiptModel] = useState(null)

  // Filtri Tabella
  const [statusFilter, setStatusFilter] = useState('All') // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [empFilter, setEmpFilter] = useState('All')

  // Modelli di scontrini simulati per l'OCR
  const RECEIPT_MODELS = [
    {
      id: 'rc-1',
      title: '🍕 Cena di Lavoro (Da Mario)',
      amount: '42.50',
      merchant: 'Ristorante Da Mario',
      category: 'Pasti',
      notes: 'Cena con cliente per rinnovo contratto Todos Select',
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

  // Gestione simulatore OCR
  const handleSelectReceiptModel = (model) => {
    setSelectedReceiptModel(model)
    setIsScanning(true)
    setScanStep('scanning')

    // Simula scansione con effetto laser ritardato
    setTimeout(() => {
      setScanStep('done')
      setAmount(model.amount)
      setMerchant(model.merchant)
      setCategory(model.category)
      setNotes(model.notes)
      setReceiptName(model.fileName)
      setIsScanning(false)
    }, 2200)
  }

  const handleResetForm = () => {
    setMerchant('')
    setAmount('')
    setCategory('Pasti')
    setNotes('')
    setReceiptName('')
    setSelectedReceiptModel(null)
    setScanStep(null)
  }

  // Invia nota spesa
  const handleSubmitExpense = async (e) => {
    e.preventDefault()
    if (!selectedEmpId || !merchant.trim() || !amount || parseFloat(amount) <= 0) {
      alert("Compila tutti i campi obbligatori (Dipendente, Esercente, Importo valido).")
      return
    }

    const employeeObj = employees.find(emp => emp.id === selectedEmpId)
    if (!employeeObj) return

    const expenseData = {
      employee_id: selectedEmpId,
      employee_name: employeeObj.name,
      expense_date: expenseDate,
      merchant: merchant,
      amount: parseFloat(amount),
      category: category,
      receipt_name: receiptName || 'Inserito Manualmente',
      status: 'Pending',
      notes: notes
    }

    if (onSaveExpense) {
      await onSaveExpense(expenseData)
      handleResetForm()
    }
  }

  // Calcoli Widget Finanziari
  const approvedExpenses = expenses.filter(e => e.status === 'Approved')
  const pendingExpenses = expenses.filter(e => e.status === 'Pending')

  const totalApproved = approvedExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
  const totalPending = pendingExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)

  // Spese per categoria
  const categoriesCount = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount || 0)
    return acc
  }, {})

  // Filtra spese tabella
  const filteredExpenses = expenses.filter(e => {
    const matchStatus = statusFilter === 'All' || e.status === statusFilter
    const matchEmp = empFilter === 'All' || e.employee_id === empFilter
    return matchStatus && matchEmp
  })

  // Esporta in CSV
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      alert("Nessuna spesa disponibile da esportare.")
      return
    }
    const headers = ['ID', 'Dipendente', 'Data Spesa', 'Esercente', 'Importo (€)', 'Categoria', 'Allegato', 'Stato', 'Note']
    const rows = expenses.map(e => [
      e.id,
      e.employee_name,
      e.expense_date,
      e.merchant,
      e.amount.toFixed(2),
      e.category,
      e.receipt_name || 'Nessuno',
      e.status,
      e.notes || ''
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `rimborsi_contabili_todos_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Icone e colori categorie
  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Pasti': return { icon: '🍕', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
      case 'Trasporti': return { icon: '🚄', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' }
      case 'Alloggio': return { icon: '🏨', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' }
      case 'Attrezzatura': return { icon: '💻', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
      default: return { icon: '📦', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' }
    }
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Intestazione */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', margin: 0 }}>
            💼 Gestione Note Spese & Rimborsi
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Hub intelligente per tracciare le spese del personale, simulare la scansione OCR ed esportare i report contabili.
          </p>
        </div>

        <button 
          onClick={handleExportCSV} 
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
        >
          <Download size={15} />
          <span>Esporta Report Contabilità (CSV)</span>
        </button>
      </div>

      {/* Widget KPI Finanziari */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
              Rimborsi Approvati
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
              € {totalApproved.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.1)',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <RefreshCw size={22} className={pendingExpenses.length > 0 ? "spinner" : ""} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
              Richieste Pendenti
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)' }}>
              € {totalPending.toFixed(2)} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>({pendingExpenses.length})</span>
            </span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
            Distribuzione Categorie Spesa
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {Object.entries(categoriesCount).map(([cat, val]) => {
              const conf = getCategoryBadge(cat)
              return (
                <span key={cat} style={{
                  fontSize: '0.7rem',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: conf.bg,
                  color: conf.color,
                  fontWeight: 700
                }}>
                  {conf.icon} {cat}: € {val.toFixed(0)}
                </span>
              )
            })}
            {Object.keys(categoriesCount).length === 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nessuna spesa caricata.</span>
            )}
          </div>
        </div>
      </div>

      {/* Sezione Principale a Due Colonne */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) 2fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* COLONNA A: Scanner OCR & Form Inserimento */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card Scanner OCR */}
          <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>📸 Scanner Scontrini AI OCR</h3>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Seleziona uno scontrino modello per simulare la lettura intelligente tramite Gemini AI OCR:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {RECEIPT_MODELS.map(model => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleSelectReceiptModel(model)}
                  disabled={isScanning}
                  className="btn btn-secondary"
                  style={{
                    justifyContent: 'flex-start',
                    fontSize: '0.75rem',
                    padding: '8px 12px',
                    borderColor: selectedReceiptModel?.id === model.id ? 'var(--primary)' : 'var(--border-color)',
                    background: selectedReceiptModel?.id === model.id ? 'rgba(217, 4, 41, 0.05)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <span>{model.title}</span>
                </button>
              ))}
            </div>

            {/* Visualizzazione Scanner laser */}
            {selectedReceiptModel && (
              <div style={{
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                background: 'rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '110px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}>
                {/* Effetto laser di scansione */}
                {scanStep === 'scanning' && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    width: '100%',
                    height: '3px',
                    background: '#10b981',
                    boxShadow: '0 0 10px #10b981, 0 0 20px #10b981',
                    animation: 'scan 1.2s ease-in-out infinite',
                    zIndex: 2
                  }} />
                )}

                {scanStep === 'scanning' ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#10b981' }} />
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.05em' }}>
                      GEMINI OCR SCANNING...
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                      Analisi scontrino ed estrazione entità in corso
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={24} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>
                      SCANSIONE COMPLETATA!
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                      Autocompilati: **€ {selectedReceiptModel.amount}** da **{selectedReceiptModel.merchant}**
                    </span>
                    <button 
                      type="button" 
                      onClick={handleResetForm}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '4px',
                        textDecoration: 'underline'
                      }}
                    >
                      Cancella e resetta form
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Form manuale o revisione */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Receipt size={16} />
              <span>Nuovo Rimborso Spesa</span>
            </h3>

            <form onSubmit={handleSubmitExpense} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Dipendente Richiedente *
                </label>
                <select
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(e.target.value)}
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
                  <option value="" disabled style={{ background: '#1c1917' }}>Seleziona dipendente...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} style={{ background: '#1c1917' }}>{emp.name} ({emp.department})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Data Spesa *
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
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
                    Importo (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Esercente / Fornitore *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome ristorante, hotel, taxi, ecc."
                  value={merchant}
                  onChange={e => setMerchant(e.target.value)}
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
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
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
                  <option value="Pasti" style={{ background: '#1c1917' }}>🍕 Pasti & Vitto</option>
                  <option value="Trasporti" style={{ background: '#1c1917' }}>🚄 Trasporti & Carburante</option>
                  <option value="Alloggio" style={{ background: '#1c1917' }}>🏨 Hotel & Alloggio</option>
                  <option value="Attrezzatura" style={{ background: '#1c1917' }}>💻 Strumenti & Ufficio</option>
                  <option value="Altro" style={{ background: '#1c1917' }}>📦 Altro</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Descrizione / Note
                </label>
                <textarea
                  rows="2"
                  placeholder="Scopo della spesa, nome cliente, ecc..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {receiptName && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)'
                }}>
                  <FileText size={13} style={{ color: 'var(--primary)' }} />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flexGrow: 1 }}>
                    {receiptName}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', padding: '10px' }}
              >
                <Send size={14} />
                <span>Richiedi Rimborso</span>
              </button>

            </form>
          </div>

        </div>

        {/* COLONNA B: Registro & Workflow Approvativo */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '520px' }}>
          
          {/* Barra Filtri */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '14px'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>📋 Registro Note Spese</h3>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Filtro Dipendenti */}
              <select
                value={empFilter}
                onChange={e => setEmpFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              >
                <option value="All" style={{ background: '#1c1917' }}>Tutti i dipendenti</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} style={{ background: '#1c1917' }}>{emp.name}</option>
                ))}
              </select>

              {/* Filtro Stato */}
              <div style={{
                display: 'inline-flex',
                background: 'rgba(255,255,255,0.03)',
                padding: '3px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    style={{
                      background: statusFilter === status ? 'var(--primary)' : 'none',
                      color: statusFilter === status ? 'white' : 'var(--text-secondary)',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {status === 'All' ? 'Tutte' : status === 'Pending' ? 'Pendenti' : status === 'Approved' ? 'Approvate' : 'Rifiutate'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabella Rimborsi */}
          <div style={{ overflowX: 'auto', flexGrow: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Dipendente</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Data</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Dettagli Spesa</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Categoria</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'right' }}>Importo</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'center' }}>Stato</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'center' }}>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(expense => {
                  const conf = getCategoryBadge(expense.category)
                  return (
                    <tr key={expense.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {expense.employee_name}
                      </td>
                      
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                        {new Date(expense.expense_date).toLocaleDateString('it-IT')}
                      </td>
                      
                      <td style={{ padding: '12px 8px', maxWidth: '180px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{expense.merchant}</div>
                        {expense.notes && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {expense.notes}
                          </div>
                        )}
                        {expense.receipt_name && (
                          <span style={{ fontSize: '0.62rem', color: 'var(--primary)', display: 'block', marginTop: '2px' }}>
                            📎 {expense.receipt_name}
                          </span>
                        )}
                      </td>
                      
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: conf.bg,
                          color: conf.color,
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}>
                          {conf.icon} {expense.category}
                        </span>
                      </td>
                      
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        € {expense.amount.toFixed(2)}
                      </td>
                      
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-xs)',
                          fontWeight: 700,
                          background: expense.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : expense.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: expense.status === 'Approved' ? 'var(--success)' : expense.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)',
                          border: `1px solid ${expense.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : expense.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                        }}>
                          {expense.status === 'Approved' ? 'Approvata' : expense.status === 'Rejected' ? 'Rifiutata' : 'Pendente'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                          {expense.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => onUpdateExpenseStatus(expense.id, 'Approved')}
                                className="btn btn-primary"
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '4px 8px',
                                  background: 'var(--success)',
                                  borderColor: 'var(--success)'
                                }}
                              >
                                Approva
                              </button>
                              <button
                                onClick={() => onUpdateExpenseStatus(expense.id, 'Rejected')}
                                className="btn btn-secondary"
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '4px 8px',
                                  color: 'var(--danger)',
                                  borderColor: 'rgba(239,68,68,0.2)',
                                  background: 'rgba(239,68,68,0.05)'
                                }}
                              >
                                Rifiuta
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              if (confirm("Cancellare definitivamente questa richiesta di rimborso?")) {
                                onDeleteExpense(expense.id)
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nessuna nota spesa trovata per i filtri selezionati.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Stile aggiuntivo localizzato per l'effetto laser di scansione */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.02) !important;
        }
      ` }} />

    </div>
  )
}
