import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import KanbanBoard from './components/KanbanBoard'
import JobModal from './components/JobModal'
import CandidateModal from './components/CandidateModal'
import CreateSearch from './components/CreateSearch'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import { Calendar, Users, Briefcase, Video, Trash2, ExternalLink, ShieldAlert, FolderArchive, FileCode } from 'lucide-react'

// --- SEED DATI DEMO DI FALLBACK ---
const DEFAULT_JOBS = [
  {
    id: 'demo-job-1',
    title: 'Senior Frontend Developer (React)',
    department: 'Tech',
    status: 'Open',
    description: 'Siamo alla ricerca di un Senior React Developer per guidare lo sviluppo delle interfacce del nostro portale di gestione HR SaaS. Cerchiamo una risorsa autonoma in grado di scrivere codice pulito, scalabile e performante, lavorando in team con designer e backend engineers.',
    requirements: 'Requisiti chiave:\n- 4+ anni di esperienza nello sviluppo frontend con React\n- Conoscenza avanzata di TypeScript e JavaScript (ES6+)\n- Gestione stato globale tramite Zustand o Redux\n- CSS Variables avanzate, Layout fluidi, HTML semantico',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-job-2',
    title: 'Sales Account Executive B2B',
    department: 'Commerciale',
    status: 'Open',
    description: 'Ricerchiamo una risorsa commerciale per accelerare la penetrazione del nostro software CRM HR nel mercato corporate italiano. Ti occuperai di lead generation, presentazioni e demo commerciali a direttori HR, e gestione delle trattative fino alla firma del contratto.',
    requirements: 'Requisiti chiave:\n- 3+ anni vendite B2B di soluzioni software/SaaS\n- Ottima dialettica e spiccate capacità negoziali\n- Dimestichezza nell\'uso di CRM (es. Salesforce, HubSpot)',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-job-3',
    title: 'Addetto Junior Customer Care',
    department: 'Supporto',
    status: 'Closed', // Inizialmente archiviato!
    description: 'Ricerchiamo addetti all\'assistenza clienti junior per gestire ticket ed e-mail di supporto dei nostri utenti. Gradita esperienza di un anno in call center o ruoli a contatto con il pubblico.',
    requirements: 'Requisiti:\n- Ottimo italiano scritto e parlato\n- Pazienza, attitudine al problem solving\n- Conoscenza pacchetto Office',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const DEFAULT_CANDIDATES = [
  {
    id: 'demo-cand-1',
    job_id: 'demo-job-1',
    name: 'Elena Bianchi',
    email: 'elena.bianchi@esempio.it',
    phone: '+39 333 987 6543',
    stage: 'Colloquio',
    cv_text: 'Curriculum Vitae Elena Bianchi. Sviluppatrice Frontend con 5 anni di esperienza in React e TypeScript...',
    competenze: ['React', 'TypeScript', 'Zustand', 'CSS Grid', 'Git', 'Webpack', 'Jest', 'Agile'],
    esperienze: [
      { ruolo: 'Senior React Developer', azienda: 'CloudTech S.p.A.', periodo: '2022 - Presente', descrizione: 'Responsabile dello sviluppo del frontend dell\'applicazione di analytics.' },
      { ruolo: 'Frontend Engineer', azienda: 'Web Agency S.r.l.', periodo: '2019 - 2022', descrizione: 'Sviluppo di applicazioni web e-commerce customizzate.' }
    ],
    istruzione: [
      { titolo: 'Laurea in Informatica', istituto: 'Università di Bologna', anno: '2019' }
    ],
    fit_score: 92,
    match_analysis: {
      fit_score: 92,
      analisi_fit: 'Profilo eccellente. Elena possiede tutte le competenze chiave richieste dal ruolo, inclusa un\'ottima esperienza specifica con TypeScript e lo stato globale Zustand.',
      punti_forza: ['5 anni di esperienza di sviluppo frontend focalizzato su React', 'Ottimo background accademico in informatica', 'Esperienza in metodologie agili'],
      punti_debolezza: ['Nessuna esperienza esplicita dichiarata con database Supabase'],
      domande_consigliate: ['Puoi farci un esempio di come hai gestito un problema di performance rendering in React?', 'Quali pattern utilizzi per implementare la sicurezza lato client con TypeScript?']
    },
    stato_interazione: 'Primo Colloquio Fissato',
    data_colloquio_1: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-cand-2',
    job_id: 'demo-job-1',
    name: 'Alessandro Neri',
    email: 'alessandro.neri@email.it',
    phone: '+39 349 765 4321',
    stage: 'Screening',
    cv_text: 'Curriculum Vitae Alessandro Neri. Web Developer con focus su JavaScript, Vue.js e React...',
    competenze: ['JavaScript', 'React', 'Vue.js', 'Bootstrap', 'REST APIs', 'Node.js', 'SQL'],
    esperienze: [
      { ruolo: 'Software Developer', azienda: 'Logistica Digitale S.r.l.', periodo: '2021 - Presente', descrizione: 'Manutenzione di portali interni aziendali scritti in React e Vue.' }
    ],
    istruzione: [
      { titolo: 'Diploma Perito Informatico', istituto: 'ITIS Cardano', anno: '2020' }
    ],
    fit_score: 75,
    match_analysis: {
      fit_score: 75,
      analisi_fit: 'Candidato solido ma con profilo mid-level. Possiede esperienza con React ma scarse referenze su TypeScript ed architetture complesse di state management.',
      punti_forza: ['Versatilità nell\'uso sia di React che di Vue.js', 'Competenze di backend (Node/SQL) utili per l\'integrazione'],
      punti_debolezza: ['Manca esperienza consolidata con TypeScript', 'Competenza su gestori di stato globali limitata'],
      domande_consigliate: ['Che differenze trovi nella gestione dei componenti tra React e Vue.js?', 'Hai avuto modo di usare TypeScript in progetti personali o lavorativi?']
    },
    stato_interazione: 'Da contattare',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-cand-3',
    job_id: 'demo-job-2',
    name: 'Sofia Romano',
    email: 'sofia.romano@salesmail.it',
    phone: '+39 328 444 5555',
    stage: 'Proposta',
    cv_text: 'Curriculum Vitae Sofia Romano. Sales Representative con esperienza B2B SaaS...',
    competenze: ['B2B Sales', 'Lead Generation', 'Salesforce', 'Negotiation', 'Account Management', 'CRM'],
    esperienze: [
      { ruolo: 'Inside Sales Specialist', azienda: 'SaaS Solutions S.p.A.', periodo: '2021 - Presente', descrizione: 'Chiusura di accordi commerciali B2B per software gestionali. Superamento costante dei target del 15%.' }
    ],
    istruzione: [
      { titolo: 'Laurea Triennale in Economia e Marketing', istituto: 'Università Luiss Roma', anno: '2020' }
    ],
    fit_score: 89,
    match_analysis: {
      fit_score: 89,
      analisi_fit: 'Ottima candidata commerciale con background specifico in soluzioni software SaaS B2B. Orientata al target con ottime metriche storiche di conversione.',
      punti_forza: ['Esperienza diretta nella vendita di software SaaS', 'Forte orientamento al superamento del target commerciale', 'Ottime capacità comunicative'],
      punti_debolezza: ['Poca dimestichezza con mercati enterprise ad alta scala corporativa'],
      domande_consigliate: ['Qual è stata la tua vendita B2B più difficile e come l\'hai conclusa?', 'Che metodologia di prospecting utilizzi solitamente?']
    },
    stato_interazione: 'Primo Colloquio Effettuato',
    data_colloquio_1: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const DEFAULT_NOTES = [
  {
    id: 'demo-note-1',
    candidate_id: 'demo-cand-1',
    author_email: 'recruiter.demo@azienda.it',
    content: 'Candidata eccellente. Fissato colloquio per lunedì.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const DEFAULT_APPOINTMENTS = [
  {
    id: 'demo-appt-1',
    candidate_id: 'demo-cand-1',
    candidate_name: 'Elena Bianchi',
    job_title: 'Senior Frontend Developer (React)',
    interviewer_email: 'intervistatore.tech@todos.it',
    date_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    meeting_type: 'Teams',
    meeting_link: 'https://teams.microsoft.com/l/meetup-join/mock-link-1',
    notes: 'Verifica approfondita React Hooks e TypeScript.'
  }
]

const DEFAULT_TEMPLATES = [
  {
    id: 'demo-temp-1',
    title: 'Sviluppatore React Standard (Standard Profile)',
    department: 'Tech',
    isTemplate: true,
    description: 'Sviluppo interfacce interattive in React, implementazione chiamate REST, coordinamento con designer.',
    requirements: 'Requisiti standard:\n- 2+ anni esperienza React\n- Conoscenza CSS / Git\n- Buone doti comunicative',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-temp-2',
    title: 'Sales Account Executive (B2B SaaS)',
    department: 'Commerciale',
    isTemplate: true,
    description: 'Pianificazione trattative commerciali, lead generation e presentazioni demo a clienti aziendali.',
    requirements: 'Requisiti:\n- 2+ anni vendite B2B\n- Familiarità CRM\n- Forte orientamento agli obiettivi',
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export default function App() {
  const [user, setUser] = useState(null)
  const [isDemo, setIsDemo] = useState(true)
  const [loading, setLoading] = useState(true)

  // Stati del Database
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [notes, setNotes] = useState([])
  const [appointments, setAppointments] = useState([])
  const [jobTemplates, setJobTemplates] = useState([])

  // Navigazione principale: 'active' (ricerche attive), 'archived' (archivio), 'templates' (anagrafica), 'appointments' (appuntamenti)
  const [navTab, setNavTab] = useState('active')

  // Stati navigazione/interfaccia
  const [selectedJob, setSelectedJob] = useState(null)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)

  // 1. Ascolto stato autenticazione all'avvio
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user)
          setIsDemo(false)
        } else {
          const localDemoUser = localStorage.getItem('demo-user')
          if (localDemoUser) {
            setUser(JSON.parse(localDemoUser))
            setIsDemo(true)
          }
        }
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUser(session.user)
          setIsDemo(false)
        } else {
          const localDemoUser = localStorage.getItem('demo-user')
          if (!localDemoUser) setUser(null)
        }
      })

      return () => subscription.unsubscribe()
    } else {
      const localDemoUser = localStorage.getItem('demo-user')
      if (localDemoUser) {
        setUser(JSON.parse(localDemoUser))
        setIsDemo(true)
      }
      setLoading(false)
    }
  }, [])

  // 2. Caricamento Dati in base a Modalità Demo vs Supabase
  useEffect(() => {
    if (!user) return

    if (isDemo) {
      loadDemoData()
    } else {
      loadSupabaseData()
    }
  }, [user, isDemo])

  // --- CARICAMENTO DATI DEMO (LOCAL STORAGE) ---
  const loadDemoData = () => {
    const localJobs = localStorage.getItem('demo-jobs')
    const localCandidates = localStorage.getItem('demo-candidates')
    const localNotes = localStorage.getItem('demo-notes')
    const localAppointments = localStorage.getItem('demo-appointments')
    const localTemplates = localStorage.getItem('demo-job-templates')

    if (localJobs && localCandidates && localNotes && localAppointments && localTemplates) {
      setJobs(JSON.parse(localJobs))
      setCandidates(JSON.parse(localCandidates))
      setNotes(JSON.parse(localNotes))
      setAppointments(JSON.parse(localAppointments))
      setJobTemplates(JSON.parse(localTemplates))
    } else {
      localStorage.setItem('demo-jobs', JSON.stringify(DEFAULT_JOBS))
      localStorage.setItem('demo-candidates', JSON.stringify(DEFAULT_CANDIDATES))
      localStorage.setItem('demo-notes', JSON.stringify(DEFAULT_NOTES))
      localStorage.setItem('demo-appointments', JSON.stringify(DEFAULT_APPOINTMENTS))
      localStorage.setItem('demo-job-templates', JSON.stringify(DEFAULT_TEMPLATES))

      setJobs(DEFAULT_JOBS)
      setCandidates(DEFAULT_CANDIDATES)
      setNotes(DEFAULT_NOTES)
      setAppointments(DEFAULT_APPOINTMENTS)
      setJobTemplates(DEFAULT_TEMPLATES)
    }
  }

  // --- CARICAMENTO DATI REALI (SUPABASE DB) ---
  const loadSupabaseData = async () => {
    try {
      const { data: dbJobs, error: errJobs } = await supabase
        .from('06app_CRM_HR_jobs')
        .select('*')
        .order('created_at', { ascending: false })
      if (errJobs) throw errJobs
      setJobs(dbJobs || [])

      const { data: dbCandidates, error: errCandidates } = await supabase
        .from('06app_CRM_HR_candidates')
        .select('*')
      if (errCandidates) throw errCandidates
      setCandidates(dbCandidates || [])

      const { data: dbNotes, error: errNotes } = await supabase
        .from('06app_CRM_HR_notes')
        .select('*')
      if (errNotes) throw errNotes
      setNotes(dbNotes || [])

      const { data: dbAppts, error: errAppts } = await supabase
        .from('06app_CRM_HR_appointments')
        .select('*')
        .order('date_time', { ascending: true })
      if (errAppts) throw errAppts
      setAppointments(dbAppts || [])

      const { data: dbTemplates, error: errTemplates } = await supabase
        .from('06app_CRM_HR_job_templates')
        .select('*')
        .order('created_at', { ascending: false })
      if (errTemplates) throw errTemplates
      setJobTemplates(dbTemplates || [])
    } catch (e) {
      console.error('Errore durante il caricamento da Supabase:', e)
      alert('Errore nel sincronizzare i dati da Supabase: ' + e.message)
    }
  }

  // --- AZIONI: LOGIN / LOGOUT ---
  const handleLoginSuccess = (userData, demoStatus) => {
    setUser(userData)
    setIsDemo(demoStatus)
    if (demoStatus) {
      localStorage.setItem('demo-user', JSON.stringify(userData))
    }
  }

  const handleLogout = async () => {
    if (!isDemo && isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem('demo-user')
    setUser(null)
    setJobs([])
    setCandidates([])
    setNotes([])
    setAppointments([])
    setJobTemplates([])
    setSelectedJob(null)
    setSelectedCandidate(null)
    setNavTab('active')
  }

  // --- CRUD POSIZIONI & TEMPLATE (JOBS & TEMPLATES) ---
  const handleSaveJob = async (jobData) => {
    if (jobData.isTemplate) {
      // GESTIONE SALVATAGGIO TEMPLATE ANAGRAFICA
      if (isDemo) {
        let updatedTemplates
        if (jobData.id) {
          updatedTemplates = jobTemplates.map(t => t.id === jobData.id ? { ...t, ...jobData } : t)
        } else {
          const newTemplate = {
            ...jobData,
            id: 'demo-temp-' + Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString()
          }
          updatedTemplates = [newTemplate, ...jobTemplates]
        }
        setJobTemplates(updatedTemplates)
        localStorage.setItem('demo-job-templates', JSON.stringify(updatedTemplates))
      } else {
        try {
          if (jobData.id) {
            const { error } = await supabase
              .from('06app_CRM_HR_job_templates')
              .update({
                title: jobData.title,
                department: jobData.department,
                description: jobData.description,
                requirements: jobData.requirements
              })
              .eq('id', jobData.id)
            if (error) throw error
          } else {
            const { error } = await supabase
              .from('06app_CRM_HR_job_templates')
              .insert([{
                title: jobData.title,
                department: jobData.department,
                description: jobData.description,
                requirements: jobData.requirements
              }])
            if (error) throw error
          }
          await loadSupabaseData()
        } catch (e) {
          alert("Errore nel salvataggio del template su Supabase: " + e.message)
        }
      }
    } else {
      // GESTIONE SALVATAGGIO RICERCA ATTIVA/ARCHIVIATA
      if (isDemo) {
        let updatedJobs
        if (jobData.id) {
          updatedJobs = jobs.map(j => j.id === jobData.id ? { ...j, ...jobData } : j)
        } else {
          const newJob = {
            ...jobData,
            id: 'demo-job-' + Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString()
          }
          updatedJobs = [newJob, ...jobs]
        }
        setJobs(updatedJobs)
        localStorage.setItem('demo-jobs', JSON.stringify(updatedJobs))
        
        if (selectedJob && selectedJob.id === jobData.id) {
          setSelectedJob(updatedJobs.find(j => j.id === jobData.id))
        }
      } else {
        try {
          if (jobData.id) {
            const { data, error } = await supabase
              .from('06app_CRM_HR_jobs')
              .update({
                title: jobData.title,
                department: jobData.department,
                status: jobData.status,
                description: jobData.description,
                requirements: jobData.requirements
              })
              .eq('id', jobData.id)
              .select()
            
            if (error) throw error
            await loadSupabaseData()
            
            if (selectedJob && selectedJob.id === jobData.id) {
              setSelectedJob(data[0])
            }
          } else {
            const { error } = await supabase
              .from('06app_CRM_HR_jobs')
              .insert([{
                title: jobData.title,
                department: jobData.department,
                status: jobData.status,
                description: jobData.description,
                requirements: jobData.requirements
              }])
            if (error) throw error
            await loadSupabaseData()
          }
        } catch (e) {
          alert("Errore nel salvataggio su Supabase: " + e.message)
        }
      }
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (isDemo) {
      const updatedJobs = jobs.filter(j => j.id !== jobId)
      const updatedCandidates = candidates.filter(c => c.job_id !== jobId)
      const updatedAppointments = appointments.filter(a => !updatedCandidates.find(c => c.id === a.candidate_id))
      setJobs(updatedJobs)
      setCandidates(updatedCandidates)
      setAppointments(updatedAppointments)
      localStorage.setItem('demo-jobs', JSON.stringify(updatedJobs))
      localStorage.setItem('demo-candidates', JSON.stringify(updatedCandidates))
      localStorage.setItem('demo-appointments', JSON.stringify(updatedAppointments))
      if (selectedJob?.id === jobId) setSelectedJob(null)
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_jobs')
          .delete()
          .eq('id', jobId)
        if (error) throw error
        await loadSupabaseData()
        if (selectedJob?.id === jobId) setSelectedJob(null)
      } catch (e) {
        alert("Errore nell'eliminazione su Supabase: " + e.message)
      }
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    if (isDemo) {
      const updatedTemplates = jobTemplates.filter(t => t.id !== templateId)
      setJobTemplates(updatedTemplates)
      localStorage.setItem('demo-job-templates', JSON.stringify(updatedTemplates))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_job_templates')
          .delete()
          .eq('id', templateId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'eliminazione del template: " + e.message)
      }
    }
  }

  // AVVIA UNA RICERCA ATTIVA PARTENDO DA UN TEMPLATE ANAGRAFICA
  const handleStartSearchFromTemplate = (template) => {
    const jobFromTemplate = {
      title: template.title,
      department: template.department,
      status: 'Open',
      description: template.description,
      requirements: template.requirements,
      isTemplate: false // Si apre come ricerca attiva!
    }
    setEditingJob(jobFromTemplate)
    setIsJobModalOpen(true)
  }

  // --- CRUD CANDIDATI ---
  const handleAddCandidate = async (candidateData) => {
    const newId = candidateData.id || 'demo-cand-' + Math.random().toString(36).substr(2, 9)
    if (isDemo) {
      const newCand = {
        ...candidateData,
        id: newId,
        created_at: candidateData.created_at || new Date().toISOString()
      }
      const updatedCandidates = [newCand, ...candidates]
      setCandidates(updatedCandidates)
      localStorage.setItem('demo-candidates', JSON.stringify(updatedCandidates))
      return newCand
    } else {
      try {
        const { data, error } = await supabase
          .from('06app_CRM_HR_candidates')
          .insert([candidateData])
          .select()
        if (error) throw error
        await loadSupabaseData()
        return data[0]
      } catch (e) {
        alert("Errore nell'inserimento del candidato su Supabase: " + e.message)
      }
    }
  }

  const handleUpdateCandidateStage = async (candidateId, newStage) => {
    if (isDemo) {
      const updatedCandidates = candidates.map(c => 
        c.id === candidateId ? { ...c, stage: newStage } : c
      )
      setCandidates(updatedCandidates)
      localStorage.setItem('demo-candidates', JSON.stringify(updatedCandidates))
      
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate(updatedCandidates.find(c => c.id === candidateId))
      }
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_candidates')
          .update({ stage: newStage })
          .eq('id', candidateId)
        if (error) throw error
        
        setCandidates(prev => prev.map(c => 
          c.id === candidateId ? { ...c, stage: newStage } : c
        ))
        if (selectedCandidate && selectedCandidate.id === candidateId) {
          setSelectedCandidate(prev => ({ ...prev, stage: newStage }))
        }
      } catch (e) {
        alert("Errore nell'aggiornamento dello stage su Supabase: " + e.message)
      }
    }
  }

  const handleDeleteCandidate = async (candidateId) => {
    if (isDemo) {
      const updatedCandidates = candidates.filter(c => c.id !== candidateId)
      const updatedNotes = notes.filter(n => n.candidate_id !== candidateId)
      const updatedAppointments = appointments.filter(a => a.candidate_id !== candidateId)
      setCandidates(updatedCandidates)
      setNotes(updatedNotes)
      setAppointments(updatedAppointments)
      localStorage.setItem('demo-candidates', JSON.stringify(updatedCandidates))
      localStorage.setItem('demo-notes', JSON.stringify(updatedNotes))
      localStorage.setItem('demo-appointments', JSON.stringify(updatedAppointments))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_candidates')
          .delete()
          .eq('id', candidateId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'eliminazione del candidato: " + e.message)
      }
    }
  }

  // --- GESTIONE APPUNTAMENTI ---
  const handleAddAppointment = async (apptData) => {
    const newId = apptData.id || 'demo-appt-' + Math.random().toString(36).substr(2, 9)
    if (isDemo) {
      const newAppt = { ...apptData, id: newId }
      const updatedAppts = [newAppt, ...appointments]
      setAppointments(updatedAppts)
      localStorage.setItem('demo-appointments', JSON.stringify(updatedAppts))
      return newAppt
    } else {
      try {
        const { data, error } = await supabase
          .from('06app_CRM_HR_appointments')
          .insert([apptData])
          .select()
        if (error) throw error
        await loadSupabaseData()
        return data[0]
      } catch (e) {
        alert("Errore nel pianificare l'appuntamento su Supabase: " + e.message)
      }
    }
  }

  const handleDeleteAppointment = async (apptId) => {
    if (isDemo) {
      const updatedAppts = appointments.filter(a => a.id !== apptId)
      setAppointments(updatedAppts)
      localStorage.setItem('demo-appointments', JSON.stringify(updatedAppts))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_appointments')
          .delete()
          .eq('id', apptId)
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nella cancellazione dell'appuntamento: " + e.message)
      }
    }
  }

  // --- GESTIONE NOTE ---
  const handleAddNote = async (candidateId, noteContent) => {
    const authorEmail = user?.email || 'recruiter@azienda.it'
    
    if (isDemo) {
      const newNote = {
        id: 'demo-note-' + Math.random().toString(36).substr(2, 9),
        candidate_id: candidateId,
        author_email: authorEmail,
        content: noteContent,
        created_at: new Date().toISOString()
      }
      const updatedNotes = [newNote, ...notes]
      setNotes(updatedNotes)
      localStorage.setItem('demo-notes', JSON.stringify(updatedNotes))
    } else {
      try {
        const { error } = await supabase
          .from('06app_CRM_HR_notes')
          .insert([{
            candidate_id: candidateId,
            author_email: authorEmail,
            content: noteContent
          }])
        if (error) throw error
        await loadSupabaseData()
      } catch (e) {
        alert("Errore nell'aggiunta della nota su Supabase: " + e.message)
      }
    }
  }

  // Helpers
  const formatDateTime = (dateStr) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return dateStr
    }
  }

  const isUpcoming = (dateStr) => {
    try {
      return new Date(dateStr) >= new Date()
    } catch (e) {
      return true
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#181615',
        color: '#e7e5e4',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255,255,255,0.1)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%'
        }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Caricamento HR CRM Todos.it...</span>
      </div>
    )
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="app-container">
      
      {/* Header / Navbar con Bottone "Crea Ricerca" */}
      <Header 
        user={user} 
        isDemo={isDemo} 
        onLogout={handleLogout} 
        onOpenJobModal={() => { setSelectedJob(null); setNavTab('create-search'); }}
      />

      {/* 4 Navigation tabs: Active searches, Archived, Templates, and Appointments */}
      <div style={{
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        padding: '0 24px',
        gap: '24px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'active', label: '📋 Ricerche Attive', icon: <Briefcase size={15} /> },
          { id: 'archived', label: '🗄️ Archivio Ricerche', icon: <FolderArchive size={15} /> },
          { id: 'templates', label: '📂 Anagrafica Templates', icon: <FileCode size={15} /> },
          { id: 'appointments', label: '📅 Appuntamenti', icon: <Calendar size={15} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setNavTab(tab.id); setSelectedJob(null); }}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: navTab === tab.id ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              padding: '12px 6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: navTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              transition: 'all 0.12s'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.id === 'appointments' && appointments.filter(a => isUpcoming(a.date_time)).length > 0 && (
              <span style={{
                background: 'var(--primary)',
                color: 'white',
                fontSize: '0.62rem',
                padding: '1px 5px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                marginLeft: '2px'
              }}>
                {appointments.filter(a => isUpcoming(a.date_time)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Render Single Job Kanban Board if selected */}
        {selectedJob ? (
          <KanbanBoard
            job={selectedJob}
            candidates={candidates}
            onBack={() => setSelectedJob(null)}
            onUpdateCandidateStage={handleUpdateCandidateStage}
            onDeleteCandidate={handleDeleteCandidate}
            onAddCandidate={handleAddCandidate}
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            onEditJob={(job) => {
              setEditingJob(job)
              setIsJobModalOpen(true)
            }}
            isDemo={isDemo}
          />
        ) : (
          
          /* Switch between Navigation Views */
          <>
            {navTab === 'create-search' ? (
              <CreateSearch
                onSave={async (jobData) => {
                  await handleSaveJob(jobData)
                  setNavTab(jobData.isTemplate ? 'templates' : 'active')
                }}
                onCancel={() => setNavTab('active')}
              />
            ) : navTab === 'appointments' ? (
              /* APPOINTMENTS CALENDAR TAB VIEW */
              <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  borderBottom: '2px solid var(--border-color)',
                  paddingBottom: '16px',
                  marginBottom: '24px',
                  animation: 'fadeIn 0.15s ease'
                }}>
                  <Calendar size={28} style={{ color: 'var(--primary)' }} />
                  <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      📅 Calendario Appuntamenti Pianificati
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Elenco di tutti i colloqui pianificati con i candidati e i rispettivi intervistatori.
                    </p>
                  </div>
                </div>

                <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', overflow: 'hidden' }}>
                  {appointments.length > 0 ? (
                    <table className="compact-table">
                      <thead>
                        <tr>
                          <th>Data e Ora</th>
                          <th>Candidato</th>
                          <th>Posizione</th>
                          <th>Intervistatore</th>
                          <th>Modalità</th>
                          <th>Note</th>
                          <th style={{ textAlign: 'right' }}>Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appt) => {
                          const upcoming = isUpcoming(appt.date_time)
                          
                          return (
                            <tr key={appt.id}>
                              <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  color: upcoming ? 'var(--primary)' : 'var(--text-secondary)'
                                }}>
                                  <span style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: upcoming ? 'var(--success)' : 'var(--text-muted)'
                                  }} />
                                  {formatDateTime(appt.date_time)}
                                </span>
                              </td>
                              <td style={{ fontWeight: 700 }}>{appt.candidate_name}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{appt.job_title}</td>
                              <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{appt.interviewer_email}</td>
                              <td>
                                <span className={appt.meeting_type === 'Teams' ? "badge badge-primary" : "badge badge-success"} style={{ gap: '4px' }}>
                                  {appt.meeting_type === 'Teams' && <Video size={10} />}
                                  {appt.meeting_type}
                                </span>
                              </td>
                              <td style={{
                                color: 'var(--text-secondary)',
                                maxWidth: '240px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }} title={appt.notes}>
                                {appt.notes || '-'}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  {appt.meeting_link && (
                                    <a 
                                      href={appt.meeting_link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                                    >
                                      <ExternalLink size={12} />
                                      <span>Teams</span>
                                    </a>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (window.confirm("Annullare questo appuntamento?")) {
                                        handleDeleteAppointment(appt.id)
                                      }
                                    }}
                                    className="btn btn-danger"
                                    style={{ padding: '4px 6px' }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      <Calendar size={36} style={{ marginBottom: '12px', opacity: 0.3, color: 'var(--primary)' }} />
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Nessun appuntamento pianificato
                      </h3>
                      <p style={{ fontSize: '0.8rem' }}>
                        Fissa un colloquio nella scheda di un candidato all'interno delle ricerche attive.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* JOBS DASHBOARD VIEWS: ACTIVE, ARCHIVED OR TEMPLATES */
              <Dashboard
                jobs={jobs}
                candidates={candidates}
                jobTemplates={jobTemplates}
                onSelectJob={setSelectedJob}
                onEditJob={(item) => {
                  setEditingJob(item)
                  setIsJobModalOpen(true)
                }}
                onDeleteJob={handleDeleteJob}
                onSaveJob={handleSaveJob}
                onDeleteTemplate={handleDeleteTemplate}
                onStartSearchFromTemplate={handleStartSearchFromTemplate}
                activeTab={navTab} // 'active' | 'archived' | 'templates'
              />
            )}
          </>
        )}
      </main>

      {/* Modale Creazione / Modifica (Ricerche Attive o Template) */}
      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => {
          setIsJobModalOpen(false)
          setEditingJob(null)
        }}
        onSave={handleSaveJob}
        editingJob={editingJob}
      />

      {/* Modale Scheda Candidato (Dettaglio, Note, AI matching, Teams Calendar) */}
      <CandidateModal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
        notes={notes.filter(n => n.candidate_id === selectedCandidate?.id)}
        onAddNote={handleAddNote}
        isDemo={isDemo}
        onUpdateStage={handleUpdateCandidateStage}
        onAddAppointment={handleAddAppointment}
        job={jobs.find(j => j.id === selectedCandidate?.job_id)}
      />
    </div>
  )
}
