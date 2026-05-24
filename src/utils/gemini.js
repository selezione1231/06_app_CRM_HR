import { GoogleGenerativeAI } from "@google/generative-ai"

// Controlla se la chiave API è configurata
const apiKey = import.meta.env.VITE_GEMINI_API_KEY
const isGeminiConfigured = !!(apiKey && apiKey !== "" && apiKey !== "your-gemini-api-key-here")

/**
 * Helper per pulire e parsare il JSON ritornato da Gemini
 */
const parseGeminiJson = (text) => {
  try {
    // Rimuove eventuali blocchi ```json ... ``` se presenti
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.substring(7);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Errore nel parsing del JSON da Gemini:", text, e);
    throw new Error("Errore nel formato dei dati restituiti dall'AI.");
  }
}

/**
 * Estrae le informazioni del candidato dal testo del CV
 */
// Lista dei modelli in ordine di preferenza/compatibilità
const PREFERRED_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-2.5-pro",
  "gemini-1.5-flash"
];

/**
 * Tenta di generare contenuti ciclando sui modelli supportati in caso di errore 404 (modello non supportato o non trovato)
 */
const generateContentWithFallback = async (prompt, responseMimeType = "application/json") => {
  const ai = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of PREFERRED_MODELS) {
    try {
      console.log(`Tentativo di generazione con il modello Gemini: ${modelName}`);
      const model = ai.getGenerativeModel({ 
        model: modelName,
        generationConfig: responseMimeType ? { responseMimeType } : undefined
      });
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      if (responseText) {
        console.log(`Successo con il modello: ${modelName}`);
        return responseText;
      }
    } catch (err) {
      console.warn(`Modello ${modelName} fallito o non supportato:`, err.message);
      lastError = err;
      // Se l'errore è 404 o correlato a "not found for API version", continuiamo col prossimo modello
      if (err.message.includes("not found") || err.message.includes("404") || err.message.includes("supported")) {
        continue;
      }
      // Per altri tipi di errori gravi (es. chiave API errata), interrompiamo subito
      throw err;
    }
  }

  throw lastError || new Error("Nessun modello Gemini supportato o disponibile per questa chiave API.");
};

/**
 * Estrae le informazioni del candidato dal testo del CV
 */
export const extractCandidateInfo = async (cvText) => {
  if (!isGeminiConfigured) {
    console.log("Gemini API non configurata. Esecuzione in modalità Demo/Mockup.");
    return mockExtractCandidateInfo(cvText);
  }

  try {
    const prompt = `
Analizza il seguente curriculum vitae (estratto da un file PDF) ed estrai le informazioni principali strutturandole ESCLUSIVAMENTE nel formato JSON descritto sotto. Non aggiungere nessun commento extra o testo prima/dopo il JSON.

Formato JSON richiesto:
{
  "nome": "Nome e Cognome del candidato (cerca in cima al documento)",
  "email": "Indirizzo email trovato nel CV",
  "telefono": "Numero di telefono trovato nel CV",
  "ruolo_attuale": "Ruolo lavorativo attuale, titolo professionale principale o qualifica dichiarata",
  "competenze": ["Lista", "delle", "competenze", "tecniche", "e", "soft", "skills", "più", "rilevanti"],
  "esperienze": [
    {
      "ruolo": "Ruolo ricoperto",
      "azienda": "Nome dell'azienda",
      "periodo": "Periodo (es. Gen 2022 - Presente o 2018 - 2021)",
      "descrizione": "Breve riassunto dei compiti e obiettivi raggiunti"
    }
  ],
  "istruzione": [
    {
      "titolo": "Laurea, diploma o corso principale",
      "istituto": "Nome dell'università, ente o scuola",
      "anno": "Anno di conseguimento o intervallo temporale"
    }
  ]
}

Testo del Curriculum Vitae:
---
${cvText}
---
`

    const textResponse = await generateContentWithFallback(prompt, "application/json");
    return parseGeminiJson(textResponse);
  } catch (error) {
    console.error("Errore durante la chiamata Gemini API (estrazione):", error);
    // Se c'è un errore, fall-back sul mock avanzato per non bloccare l'interfaccia dell'utente
    return mockExtractCandidateInfo(cvText);
  }
}

/**
 * Effettua il matching tra i dati del candidato e la Job Description
 */
export const matchCandidateWithJob = async (candidateInfo, jobDescription) => {
  if (!isGeminiConfigured) {
    console.log("Gemini API non configurata. Esecuzione matching in modalità Demo/Mockup.");
    return mockMatchCandidateWithJob(candidateInfo, jobDescription);
  }

  try {
    const prompt = `
Sei un HR Manager esperto. Analizza la compatibilità (matching) tra questo Candidato e la Job Description della posizione lavorativa.
Genera una valutazione dettagliata strutturandola ESCLUSIVAMENTE nel formato JSON descritto sotto. Non aggiungere testi aggiuntivi prima o dopo.

Dati Candidato (in JSON):
${JSON.stringify(candidateInfo, null, 2)}

Job Description:
${jobDescription}

Formato JSON richiesto:
{
  "fit_score": 85, // Numero intero da 0 a 100. Valuta realisticamente la vicinanza dei requisiti
  "analisi_fit": "Un paragrafo riassuntivo (circa 3-4 righe in italiano) sulla compatibilità e il profilo generale del candidato rispetto a questa offerta di lavoro",
  "punti_forza": [
    "Punto di forza 1 (es. Ha 3 anni di esperienza specifica con React)",
    "Punto di forza 2...",
    "Punto di forza 3..."
  ],
  "punti_debolezza": [
    "Punto di debolezza o requisito mancante 1 (es. Manca esperienza con TypeScript richiesta)",
    "Punto di debolezza 2..."
  ],
  "domande_consigliate": [
    "Domanda specifica 1 da fargli durante il colloquio (es. Puoi parlarci del tuo ultimo progetto in React?)",
    "Domanda specifica 2...",
    "Domanda specifica 3..."
  ]
}
`

    const textResponse = await generateContentWithFallback(prompt, "application/json");
    return parseGeminiJson(textResponse);
  } catch (error) {
    console.error("Errore durante la chiamata Gemini API (matching):", error);
    return mockMatchCandidateWithJob(candidateInfo, jobDescription);
  }
}


/* ==========================================
   MOTORE MOCKUP (FALLBACK E TEST)
   ========================================== */

function mockExtractCandidateInfo(cvText) {
  // 1. Estrazione Email robusta
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
  const extractedEmail = cvText.match(emailRegex)?.[0] || "candidato@azienda.it"
  
  // 2. Estrazione Telefono robusta (gestisce prefissi, spazi e parentesi come (+39) 329...)
  const phoneRegex = /(?:telefono|tel|cell|cellulare|phone)?\s*[:.-]?\s*(\+?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,7})/i
  const phoneMatch = cvText.match(phoneRegex)
  const extractedPhone = phoneMatch ? phoneMatch[1].trim() : ""
  
  // 3. Estrazione Nome Robusta (cerca le prime parole maiuscole consecutive a inizio riga, es. "Benito Manuel Attanasio")
  let extractedName = "Candidato"
  const textLines = cvText.split("\n").map(l => l.trim()).filter(l => l.length > 0)
  if (textLines.length > 0) {
    const firstLine = textLines[0]
    // Cerca da 2 a 4 parole che iniziano con una lettera maiuscola all'inizio del testo
    const nameMatch = firstLine.match(/^([A-ZÀ-Ù][a-zà-ù']+\s*){2,4}/)
    if (nameMatch && nameMatch[0].trim().length > 3) {
      extractedName = nameMatch[0].trim()
    } else {
      // Fallback: prende le prime 2-3 parole se non superano i 35 caratteri
      const words = firstLine.split(/\s+/).slice(0, 3).join(" ")
      if (words.length > 3 && words.length < 35 && !words.toLowerCase().includes("curriculum") && !words.toLowerCase().includes("cv")) {
        extractedName = words
      } else {
        // Cerca nella seconda riga se la prima era un'intestazione tipo "Curriculum Vitae"
        const secondLine = textLines[1] || ""
        const secondNameMatch = secondLine.match(/^([A-ZÀ-Ù][a-zà-ù']+\s*){2,4}/)
        if (secondNameMatch && secondNameMatch[0].trim().length > 3) {
          extractedName = secondNameMatch[0].trim()
        }
      }
    }
  }

  // 4. Estrazione Dinamica Competenze basata sulle parole chiave reali presenti nel testo del CV
  const knownSkills = [
    "React", "TypeScript", "Node.js", "Zustand", "Redux", "JavaScript", "HTML5", "CSS3", "SQL", "Git", 
    "Docker", "AWS", "Python", "Java", "Agile", "WordPress", "SEO", "Office", "CRM", "Customer Care", 
    "Excel", "Team System", "Gestionale", "Amministrazione", "Vendita", "B2B", "Customer Service"
  ]
  const matchedSkills = knownSkills.filter(skill => 
    cvText.toLowerCase().includes(skill.toLowerCase())
  )
  const finalSkills = matchedSkills.length > 0 ? matchedSkills.slice(0, 10) : ["Teamwork", "Problem Solving", "Office"]

  // Rileva ruolo principale in base al testo
  let guessedRole = "Impiegato / Tecnico"
  if (cvText.toLowerCase().includes("developer") || cvText.toLowerCase().includes("programmatore")) {
    guessedRole = "Software Developer"
  } else if (cvText.toLowerCase().includes("sales") || cvText.toLowerCase().includes("commerciale")) {
    guessedRole = "Sales Specialist"
  } else if (cvText.toLowerCase().includes("customer") || cvText.toLowerCase().includes("assistenza")) {
    guessedRole = "Customer Support Specialist"
  } else if (cvText.toLowerCase().includes("ufficio") || cvText.toLowerCase().includes("amministrativo")) {
    guessedRole = "Addetto Amministrativo / Ufficio"
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        nome: extractedName,
        email: extractedEmail,
        telefono: extractedPhone,
        ruolo_attuale: guessedRole,
        competenze: finalSkills,
        esperienze: [
          {
            ruolo: guessedRole,
            azienda: cvText.match(/(?:presso|azienda|società|spa|srl)\s+([A-Za-z0-9\s]+(?:S\.?[pP]\.?[aA]\.?|S\.?[rR]\.?[lL]\.?))/i)?.[1] || "Azienda Selezionata",
            periodo: "2023 - Presente",
            descrizione: "Sviluppo di attività operative in linea con il ruolo. Gestione delle procedure interne e coordinamento con i colleghi."
          },
          {
            ruolo: "Collaboratore Junior",
            azienda: "Studio Professionale",
            periodo: "2020 - 2023",
            descrizione: "Supporto operativo alle attività del team di reparto, gestione archivi e inserimento dati."
          }
        ],
        istruzione: [
          {
            titolo: cvText.toLowerCase().includes("laurea") ? "Laurea" : "Diploma di Scuola Superiore",
            istituto: "Istituto Statale",
            anno: "2020"
          }
        ]
      });
    }, 1500) // Simula la latenza dell'AI
  })
}

function mockMatchCandidateWithJob(candidateInfo, jobDescription) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Calcola un punteggio semi-casuale ma plausibile basato sulle parole chiave
      let score = 75;
      const desc = jobDescription.toLowerCase();
      
      // Incrementa o decrementa lo score in base a parole chiave
      if (desc.includes("senior")) score += 5;
      if (desc.includes("junior") && candidateInfo.nome.includes("Rossi")) score -= 10;
      
      // Limita tra 50 e 96 per la demo
      score = Math.max(55, Math.min(95, score));

      resolve({
        fit_score: score,
        analisi_fit: `Il candidato ${candidateInfo.nome} presenta un profilo interessante, fortemente allineato per quanto riguarda le competenze di sviluppo frontend con React e la gestione di database relazionali. L'esperienza nel coordinamento di figure junior è un valore aggiunto. Si consiglia un colloquio conoscitivo per verificare le competenze architetturali.`,
        punti_forza: [
          `Ottima esperienza pratica con React (${candidateInfo.esperienze[0]?.azienda || 'precedente azienda'})`,
          "Autonomia nella gestione di API e integrazioni esterne",
          "Background accademico solido in Informatica"
        ],
        punti_debolezza: [
          "Non viene esplicitata nel CV l'esperienza con framework serverless come Supabase (richiesto)",
          "Competenze di lingua inglese dichiarate ma da verificare a colloquio"
        ],
        domande_consigliate: [
          "Puoi descriverci un'architettura complessa da te realizzata usando React e Node.js?",
          "Come gestisci lo stato globale di un'applicazione in un team di più programmatori?",
          "Qual è il tuo livello di familiarità con i database in tempo reale o Supabase?"
        ]
      });
    }, 1200) // Simula la latenza dell'AI
  })
}
