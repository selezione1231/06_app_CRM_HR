import React, { useState, useEffect } from 'react'
import { X, Mail, Phone, Calendar, User, Clipboard, Plus, ShieldAlert, BadgeCheck, MessageSquare, BookOpen, Briefcase, FileText, Video, Send, Cloud, ExternalLink } from 'lucide-react'

export default function CandidateModal({ isOpen, onClose, candidate, notes, onAddNote, isDemo, onUpdateStage, onAddAppointment, job, onAddEmployee }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [newNote, setNewNote] = useState('')

  // Stati per tracciamento date interazione
  const [statoInterazione, setStatoInterazione] = useState('Da contattare')
  const [dataChiamata, setDataChiamata] = useState('')
  const [dataColloquio1, setDataColloquio1] = useState('')
  const [dataColloquio2, setDataColloquio2] = useState('')

  // Stati per pianificazione appuntamento Teams
  const [interviewerEmail, setInterviewerEmail] = useState('')
  const [meetingDateTime, setMeetingDateTime] = useState('')
  const [meetingType, setMeetingType] = useState('Teams')
  const [meetingLink, setMeetingLink] = useState('')
  const [meetingNotes, setMeetingNotes] = useState('')

  // Stati per simulazione invio Mail
  const [sendingMail, setSendingMail] = useState(false)
  const [mailStep, setMailStep] = useState(0)
  const [mailSuccess, setMailSuccess] = useState(false)

  // Effetto per sincronizzare i dati locali del candidato quando viene aperto
  useEffect(() => {
    if (candidate) {
      setStatoInterazione(candidate.stato_interazione || 'Da contattare')
      setDataChiamata(candidate.data_chiamata ? candidate.data_chiamata.substring(0, 16) : '')
      setDataColloquio1(candidate.data_colloquio_1 ? candidate.data_colloquio_1.substring(0, 16) : '')
      setDataColloquio2(candidate.data_colloquio_2 ? candidate.data_colloquio_2.substring(0, 16) : '')
      
      // Valori predefiniti per appuntamento
      setInterviewerEmail('')
      setMeetingDateTime('')
      setMeetingType('Teams')
      setMeetingLink(`https://teams.microsoft.com/l/meetup-join/todos-colloquio-${Math.random().toString(36).substr(2, 9)}`)
      setMeetingNotes('')
      setMailSuccess(false)
      setSendingMail(false)
    }
  }, [candidate, isOpen])

  if (!isOpen || !candidate) return null

  // Gestione aggiunta nota manuale
  const handleAddNoteSubmit = (e) => {
    e.preventDefault()
    if (!newNote.trim()) return
    onAddNote(candidate.id, newNote)
    setNewNote('')
  }

  // Aggiorna date interazione nel database locale/reale
  const handleUpdateInteractions = () => {
    // Sincronizza lo stato di interazione nel record candidato
    candidate.stato_interazione = statoInterazione
    candidate.data_chiamata = dataChiamata
    candidate.data_colloquio_1 = dataColloquio1
    candidate.data_colloquio_2 = dataColloquio2
    
    // Aggiorna lo stage se cambia lo stato di interazione
    let targetStage = candidate.stage
    if (statoInterazione === 'Prima Chiamata Fissata' || statoInterazione === 'Prima Chiamata Effettuata') {
      targetStage = 'Prima Chiamata'
    } else if (statoInterazione === 'Primo Colloquio Fissato' || statoInterazione === 'Primo Colloquio Effettuato') {
      targetStage = 'Primo Colloquio'
    } else if (statoInterazione === 'Secondo Colloquio Fissato' || statoInterazione === 'Secondo Colloquio Effettuato') {
      targetStage = 'Secondo Colloquio'
    } else if (statoInterazione === 'Proposta Inviata') {
      targetStage = 'Proposta'
    }
    
    onUpdateStage(candidate.id, targetStage)
    alert("Date e stati interazione salvati con successo!")
  }

  // Funzione per generare e scaricare il file .ics per il calendario Outlook/Teams
  const downloadIcsCalendar = (cName, jTitle, dateTimeStr, interviewer, link, notesText) => {
    try {
      const dateObj = new Date(dateTimeStr)
      const start = dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      const end = new Date(dateObj.getTime() + 45 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' // 45 minuti
      
      const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Todos.it HR Suite//NONSGML Colloquio//IT',
        'BEGIN:VEVENT',
        `UID:colloquio_${candidate.id}@todos.it`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:Colloquio Selezione: ${cName} - ${jTitle}`,
        `LOCATION:${meetingType === 'Teams' ? link : 'Sede Presenza Todos.it'}`,
        `DESCRIPTION:Colloquio pianificato con ${cName} per la posizione di ${jTitle}.\\nIntervistatore: ${interviewer}\\nLink Teams: ${link}\\nNote HR: ${notesText}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ]

      const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(blob)
      downloadLink.download = `colloquio_${cName.replace(/\s+/g, '_')}.ics`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (e) {
      console.error("Impossibile generare file ICS:", e)
    }
  }

  // SIMULAZIONE INVIO AUTOMATICO EMAIL + PIANIFICAZIONE
  const handleScheduleAndSendMail = async (e) => {
    e.preventDefault()
    if (!interviewerEmail.trim() || !meetingDateTime.trim()) return

    setSendingMail(true)
    setMailStep(1)

    // Step 1: Connessione al server di posta Todos.it
    await new Promise(r => setTimeout(r, 600))
    setMailStep(2)

    // Step 2: Caricamento e allegato del CV del candidato
    await new Promise(r => setTimeout(r, 800))
    setMailStep(3)

    // Step 3: Generazione del link Teams e credenziali calendar
    await new Promise(r => setTimeout(r, 600))
    setMailStep(4)

    // Step 4: Invio finale
    await new Promise(r => setTimeout(r, 500))
    
    // Registra appuntamento nello stato/DB
    const jobTitle = job ? job.title : 'Posizione Aperta'
    const appt = {
      candidate_id: candidate.id,
      candidate_name: candidate.name,
      job_title: jobTitle,
      interviewer_email: interviewerEmail,
      date_time: new Date(meetingDateTime).toISOString(),
      meeting_type: meetingType,
      meeting_link: meetingType === 'Teams' ? meetingLink : '',
      notes: meetingNotes
    }

    await onAddAppointment(appt)

    // Scrivi nota automatica nello storico candidato
    const noteText = `📅 COLLOQUIO PIANIFICATO\nFissato colloquio (${meetingType}) per il ${new Date(meetingDateTime).toLocaleString('it-IT')}.\nIntervistatore: ${interviewerEmail}.\nInviata e-mail automatica con CV allegato e note.`
    await onAddNote(candidate.id, noteText)

    // Avanza automaticamente lo stage del candidato in base al tipo di colloquio fissato
    let nextStage = 'Primo Colloquio'
    let nextStatoInt = 'Primo Colloquio Fissato'
    
    if (statoInterazione === 'Primo Colloquio Effettuato' || candidate.stage === 'Primo Colloquio') {
      nextStage = 'Secondo Colloquio'
      nextStatoInt = 'Secondo Colloquio Fissato'
      setDataColloquio2(meetingDateTime)
    } else {
      setDataColloquio1(meetingDateTime)
    }

    setStatoInterazione(nextStatoInt)
    await onUpdateStage(candidate.id, nextStage)

    setMailStep(5)
    setMailSuccess(true)
  }

  const handleFinishAppointment = () => {
    // Scarica l'ICS per Outlook
    const jobTitle = job ? job.title : 'Posizione Aperta'
    downloadIcsCalendar(candidate.name, jobTitle, meetingDateTime, interviewerEmail, meetingLink, meetingNotes)
    
    setSendingMail(false)
    setMailSuccess(false)
    setActiveTab('profile') // Torna al profilo per vedere la nota inserita
  }

  // Colore del Match score badge
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'score-high'
    if (score >= 60) return 'score-medium'
    return 'score-low'
  }

  const analysis = candidate.match_analysis || {}
  const strengths = analysis.punti_forza || []
  const weaknesses = analysis.punti_debolezza || []
  const questions = analysis.domande_consigliate || []

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '850px', height: '88vh', position: 'relative' }}>
        
        {/* SIMULATED EMAIL DISPATCH OVERLAY */}
        {sendingMail && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-card)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px',
            animation: 'fadeIn 0.2s ease'
          }}>
            {!mailSuccess ? (
              /* PROGRESS COMPILER */
              <div style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                <div className="spinner" style={{
                  width: '50px',
                  height: '50px',
                  border: '4px solid rgba(227, 6, 19, 0.1)',
                  borderTopColor: 'var(--primary)',
                  borderRadius: '50%',
                  margin: '0 auto 20px auto'
                }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px' }}>
                  Invio Invito in Corso...
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  {[
                    { step: 1, label: 'Collegamento al mail server Todos.it...' },
                    { step: 2, label: `Caricamento ed allegato: ${candidate.name}_CV.pdf...` },
                    { step: 3, label: 'Generazione stanza virtuale Microsoft Teams...' },
                    { step: 4, label: 'Registrazione calendario eventi Outlook...' }
                  ].map(s => {
                    const isDone = mailStep > s.step
                    const isCurrent = mailStep === s.step
                    
                    return (
                      <div key={s.step} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.8rem',
                        color: isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: isCurrent || isDone ? 600 : 400
                      }}>
                        <span>{isDone ? '✓' : isCurrent ? '⚡' : '○'}</span>
                        <span>{s.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* SUCCESS RECEIPT REPORT */
              <div style={{ maxWidth: '600px', width: '100%', animation: 'fadeIn 0.25s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--success-light)',
                    color: 'var(--success)',
                    marginBottom: '12px'
                  }}>
                    <BadgeCheck size={36} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Invito Automatico Spedito!
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    L'email è stata inoltrata con successo al collega tramite il mail server aziendale.
                  </p>
                </div>

                {/* Email content representation */}
                <div className="glass-panel" style={{
                  background: 'rgba(0,0,0,0.01)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  fontSize: '0.8rem',
                  lineHeight: '1.45',
                  marginBottom: '24px',
                  border: '1.5px solid var(--border-color)',
                  maxHeight: '260px',
                  overflowY: 'auto'
                }}>
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                    <strong>A:</strong> {interviewerEmail}<br />
                    <strong>Oggetto:</strong> Colloquio Selezione: {candidate.name} - {job ? job.title : 'Candidato'}<br />
                    <strong>Allegati:</strong> 📄 {candidate.name}_CV.pdf (CV originale)
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                    Ciao Collega,<br /><br />
                    Ti inoltro la pianificazione per il colloquio di selezione con <strong>{candidate.name}</strong> per la posizione di <strong>{job ? job.title : 'Ricerca Aperta'}</strong>.<br /><br />
                    📅 <strong>Data e Ora:</strong> {new Date(meetingDateTime).toLocaleString('it-IT')}<br />
                    🔗 <strong>Link Microsoft Teams:</strong> <a href={meetingLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{meetingLink}</a><br /><br />
                    <strong>Note HR/Colloquio:</strong><br />
                    {meetingNotes || 'Nessuna nota aggiuntiva fornita.'}<br /><br />
                    ---<br />
                    <strong>Valutazione AI Todos.it:</strong><br />
                    - Compatibilità generale: <strong>{candidate.fit_score}%</strong><br />
                    - Competenze principali estratte dal CV: {candidate.competenze?.slice(0, 6).join(', ')}<br />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={handleFinishAppointment} style={{ padding: '10px 24px' }}>
                    Chiudi e Scarica Calendario (.ics)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                {candidate.name}
              </h2>
              <span className="badge badge-primary">{candidate.stage}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {candidate.fit_score !== undefined && (
              <div className={`match-score-badge ${getScoreColorClass(candidate.fit_score)}`}>
                {candidate.fit_score}%
              </div>
            )}
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Banner Assunzione */}
        {candidate.stage === 'Assunto' && onAddEmployee && (
          <div style={{
            background: 'var(--success-light)',
            borderBottom: '1px solid rgba(15, 159, 110, 0.2)',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--success)',
            fontWeight: 600
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎉 Il candidato è stato assunto! Desideri attivare il suo Fascicolo Digitale di Dipendente?
            </span>
            <button 
              className="btn btn-primary"
              style={{
                background: 'var(--success)',
                borderColor: 'var(--success)',
                padding: '4px 10px',
                fontSize: '0.75rem',
                color: '#fff',
                boxShadow: 'none'
              }}
              onClick={async () => {
                const empData = {
                  name: candidate.name,
                  email: candidate.email || `${candidate.name.toLowerCase().replace(/\s+/g, '.')}@azienda.it`,
                  phone: candidate.telefono || candidate.phone || '',
                  department: job?.department || 'Tech',
                  role: candidate.ruolo_attuale || job?.title || 'Collaboratore',
                  contract_type: 'Tempo Indeterminato',
                  ral: 30000,
                  hire_date: new Date().toISOString().split('T')[0]
                }
                const added = await onAddEmployee(empData)
                if (added) {
                  alert(`Fascicolo Digitale di ${candidate.name} creato con successo! Lo trovi nella scheda Dipendenti.`);
                }
              }}
            >
              Crea Anagrafica Dipendente
            </button>
          </div>
        )}

        {/* Tabs navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(0,0,0,0.01)',
          padding: '0 20px'
        }}>
          {[
            { id: 'profile', label: 'Profilo & Esperienze', icon: <Briefcase size={14} /> },
            { id: 'ai-matching', label: 'Valutazione AI Todos', icon: <BadgeCheck size={14} /> },
            { id: 'schedule', label: 'Pianifica & Invio Teams', icon: <Calendar size={14} /> },
            { id: 'notes', label: `Storico Note (${notes.length})`, icon: <MessageSquare size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 14px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                background: 'none',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.15s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="modal-body">
          
          {/* TAB 1: PROFILE & DATES */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Contact Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
                background: 'rgba(0,0,0,0.01)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span>{candidate.email || 'Email non disponibile'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span>{candidate.phone || 'Telefono non disponibile'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span>Caricato il: {new Date(candidate.created_at).toLocaleDateString('it-IT')}</span>
                </div>
              </div>

              {/* DATE INTERAZIONE & STATO SELEZIONE */}
              <div className="glass-panel" style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)'
              }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--primary)' }}>
                  ⚙️ TRACCIAMENTO AVANZAMENTO SELEZIONE
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Stato Interazione
                    </label>
                    <select
                      value={statoInterazione}
                      onChange={(e) => setStatoInterazione(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        fontSize: '0.78rem'
                      }}
                    >
                      <option value="Da contattare">Da contattare</option>
                      <option value="Prima Chiamata Fissata">Prima Chiamata Fissata</option>
                      <option value="Prima Chiamata Effettuata">Prima Chiamata Effettuata</option>
                      <option value="Primo Colloquio Fissato">Primo Colloquio Fissato</option>
                      <option value="Primo Colloquio Effettuato">Primo Colloquio Effettuato</option>
                      <option value="Secondo Colloquio Fissato">Secondo Colloquio Fissato</option>
                      <option value="Secondo Colloquio Effettuato">Secondo Colloquio Effettuato</option>
                      <option value="Proposta Inviata">Proposta Inviata</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Data Prima Chiamata
                    </label>
                    <input
                      type="datetime-local"
                      value={dataChiamata}
                      onChange={(e) => setDataChiamata(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Data Colloquio I
                    </label>
                    <input
                      type="datetime-local"
                      value={dataColloquio1}
                      onChange={(e) => setDataColloquio1(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Data Colloquio II
                    </label>
                    <input
                      type="datetime-local"
                      value={dataColloquio2}
                      onChange={(e) => setDataColloquio2(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem'
                      }}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleUpdateInteractions}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                >
                  Aggiorna Stati & Date
                </button>
              </div>

              {/* Competenze */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>
                  Competenze Principali
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {candidate.competenze && candidate.competenze.length > 0 ? (
                    candidate.competenze.map((skill, index) => (
                      <span key={index} className="badge badge-primary" style={{ textTransform: 'none', fontWeight: 600 }}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Nessuna competenza estratta.</span>
                  )}
                </div>
              </div>

              {/* Lavori */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>
                  Esperienze Lavorative
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {candidate.esperienze && candidate.esperienze.length > 0 ? (
                    candidate.esperienze.map((exp, index) => (
                      <div key={index} style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px',
                        background: 'var(--bg-card)',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{exp.ruolo}</strong>
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{exp.periodo}</span>
                        </div>
                        <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem', marginBottom: '4px' }}>
                          {exp.azienda}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                          {exp.descrizione}
                        </p>
                      </div>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Nessuna esperienza estratta.</span>
                  )}
                </div>
              </div>

              {/* Raw text */}
              <details style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card)',
                fontSize: '0.8rem'
              }}>
                <summary style={{ padding: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} />
                  Testo CV Estratto (PDF Originale)
                </summary>
                <div style={{
                  padding: '10px',
                  borderTop: '1px solid var(--border-color)',
                  background: 'rgba(0,0,0,0.02)',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {candidate.cv_text}
                </div>
              </details>

            </div>
          )}

          {/* TAB 2: VALUTAZIONE AI */}
          {activeTab === 'ai-matching' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Compatibilità Generale */}
              <div style={{
                background: 'var(--primary-light)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(227, 6, 19, 0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <BadgeCheck size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
                    REPORT DI COMPATIBILITÀ AI
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', lineHeight: '1.45', color: 'var(--text-secondary)' }}>
                  {analysis.analisi_fit || 'L\'analisi di matching non è stata ancora caricata.'}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px' }}>
                    <BadgeCheck size={16} />
                    <span>Punti di Forza</span>
                  </div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none', paddingLeft: 0, fontSize: '0.78rem' }}>
                    {strengths.map((str, idx) => (
                      <li key={idx} style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--success)' }}>✓</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px' }}>
                    <ShieldAlert size={16} />
                    <span>Requisiti da Approfondire</span>
                  </div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none', paddingLeft: 0, fontSize: '0.78rem' }}>
                    {weaknesses.map((weak, idx) => (
                      <li key={idx} style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--primary)' }}>⚠</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Domande Consigliate */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>
                  Domande Consigliate per il Colloquio
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {questions.map((quest, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      gap: '8px',
                      background: 'rgba(0,0,0,0.01)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.78rem',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '0.7rem'
                      }}>
                        {index + 1}
                      </span>
                      <span style={{ color: 'var(--text-primary)' }}>{quest}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PIANIFICA & INVIO TEAMS */}
          {activeTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div className="glass-panel" style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Send size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Pianifica Colloquio & Invito Automatico
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Compila i campi sotto. Cliccando su <strong>Invia e Pianifica</strong>, il mail server invierà automaticamente una mail al collega intervistatore con il <strong>CV allegato</strong>, le tue note sul candidato, la compatibilità AI ed il link Teams di riunione.
                </p>

                <form onSubmit={handleScheduleAndSendMail} style={{ display: 'grid', gap: '12px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Email del Collega (Intervistatore) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="collega.tecnico@todos.it"
                        value={interviewerEmail}
                        onChange={(e) => setInterviewerEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'rgba(0,0,0,0.01)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Data e Ora Appuntamento *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={meetingDateTime}
                        onChange={(e) => setMeetingDateTime(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'rgba(0,0,0,0.01)',
                          color: 'var(--text-primary)',
                          fontSize: '0.78rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Tipo di Incontro
                      </label>
                      <select
                        value={meetingType}
                        onChange={(e) => setMeetingType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          outline: 'none',
                          height: '35px'
                        }}
                      >
                        <option value="Teams">Microsoft Teams</option>
                        <option value="Presenza">Di Presenza (Ufficio)</option>
                        <option value="Telefonico">Chiamata Telefonica</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Link Microsoft Teams
                      </label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="text"
                          disabled={meetingType !== 'Teams'}
                          value={meetingType === 'Teams' ? meetingLink : 'Non richiesto'}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          style={{
                            flexGrow: 1,
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            background: 'rgba(0,0,0,0.03)',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Note di Preparazione per il Collega
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Aggiungi dettagli o note specifiche per l'intervistatore (es. focalizzarsi sul problem solving, verificare la pretesa economica...)"
                      value={meetingNotes}
                      onChange={(e) => setMeetingNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'rgba(0,0,0,0.01)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        outline: 'none',
                        resize: 'none',
                        lineHeight: '1.4'
                      }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', justifySelf: 'end', gap: '8px' }}>
                    <Send size={14} />
                    <span>Invia Mail e Pianifica</span>
                  </button>

                </form>
              </div>

            </div>
          )}

          {/* TAB 4: NOTES */}
          {activeTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <form onSubmit={handleAddNoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea
                  rows={2}
                  required
                  placeholder="Scrivi una nota interna su questo candidato..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(0,0,0,0.01)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'none',
                    fontSize: '0.8rem'
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '6px 12px', fontSize: '0.75rem' }}>
                  <Plus size={12} />
                  Aggiungi Nota
                </button>
              </form>

              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notes && notes.length > 0 ? (
                    notes.slice().sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).map((note) => (
                      <div key={note.id} style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.7rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            👤 {note.author_email}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {new Date(note.created_at).toLocaleString('it-IT')}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                          {note.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                      Non ci sono ancora note per questo candidato.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '6px 14px' }}>
            Chiudi
          </button>
        </div>

      </div>
    </div>
  )
}
