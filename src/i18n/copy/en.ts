import type { Copy } from './types'

/**
 * Copy en inglés de la landing (MAK-272, aprobado — docs/product/landing-copy-en.md
 * del repo privado `echo`). Va literal, sin tocar una coma, igual que `es.ts`.
 *
 * `/en/` se indexa desde el 25-09-2026. La descarga no tiene ruta inglesa
 * propia a propósito: `/descarga` sirve los dos idiomas en la misma URL
 * (métricas por ruta); `/invitacion` y la 404 siguen solo en español.
 *
 * La nota de la fila «Mixed languages» (ver `comparativa.filas`) lleva el
 * resultado real del reconocedor de Apple en inglés; cómo se obtuvo, junto a
 * la propia nota.
 */
export const en: Copy = {
  demo: {
    ventana: {
      barra: 'New Message',
      para: { etiqueta: 'To:', valor: 'team@' },
      asunto: { etiqueta: 'Subject:', valor: 'This week’s deploy' },
      cuerpo: 'We’re deploying the backend on GitHub on Thursday and we’ll go over it at stand-up.',
    },
    barra: {
      tecla: '⌥ space',
      grabando: 'Listening',
      puliendo: 'Polishing',
      unidad: 's',
      tiempos: ['0.0', '0.6', '1.2', '1.8', '1.8'],
    },
  },

  cabecera: {
    marca: 'echo',
    cta: 'Download echo',
    idioma: 'Language',
  },

  sugerenciaIdioma: {
    texto: 'This page is also available in English.',
    cambiar: 'Switch to English',
    quedarse: 'Keep Spanish',
  },

  apertura: {
    titular: [
      'Talk, and it’s written.',
      'No filler words, no dictating punctuation,',
      'no switching languages.',
    ],
    tagline: 'Dictation for Mac. You talk, and clean text appears right where you were.',
    cta: 'Download echo',
    requisito: {
      aviso: [
        { dato: true, texto: '14 days free' },
        { dato: false, texto: ', then €12 a year or €3 a month.' },
      ],
      maquina: 'Mac with Apple Silicon and macOS 14 or later.',
    },
  },

  dondeSePega: {
    titulo: 'Pastes wherever you already write',
    piezas: [
      { icono: 'gmail', etiqueta: 'Email' },
      { icono: 'slack', etiqueta: 'Team chat' },
      { icono: 'github', etiqueta: 'Issues and PRs' },
      { icono: 'vscode', etiqueta: 'Code editor' },
      { icono: 'notion', etiqueta: 'Notes and docs' },
      { icono: 'linear', etiqueta: 'Product management' },
    ],
    cuerpo: [
      { texto: 'And in your tone for each one: in Settings you tell it “casual in Slack” or “spell ', enfasis: false },
      { texto: 'make-algo', enfasis: true },
      { texto: ' like this”, and it does it every time.', enfasis: false },
    ],
  },

  velocidad: {
    filas: [
      { modo: 'Typing', ppm: '~40 words per minute' },
      { modo: 'Talking', ppm: '~150 words per minute' },
    ],
    fuente: 'Reference averages: conversational speech versus an adult with no typing training.',
  },

  pasos: {
    rotulo: 'What happens when you let go of the key',
    lista: [
      {
        titulo: 'Transcribed on your Mac.',
        partes: [
          { dato: true, texto: 'Tenths of a second,' },
          { dato: false, texto: ' offline.' },
        ],
      },
      {
        titulo: 'Polished with your subscription.',
        partes: [
          { dato: false, texto: 'Claude or ChatGPT, signed in as you: ' },
          { dato: true, texto: '1.5 to 2.5 seconds,' },
          { dato: false, texto: ' and only when the text needs it.' },
        ],
      },
      {
        titulo: 'Pasted where you were.',
        partes: [{ dato: false, texto: 'Into the active app, formatted the way that app needs.' }],
      },
    ],
  },

  comparativa: {
    titulo: 'Mac dictation transcribes. echo writes.',
    entradilla: 'macOS dictation is good, and it’s free. It doesn’t do these four things.',
    columnas: { criterio: 'What', macos: 'macOS Dictation', echo: 'echo' },
    filas: [
      {
        criterio: 'Filler words and repetitions',
        macos: 'Types them as they come',
        echo: 'Takes them out',
      },
      {
        criterio: 'Punctuation',
        macos: 'You dictate it, mark by mark',
        echo: 'Adds it for you',
      },
      {
        criterio: 'Mixed languages',
        macos: 'One fixed language per session',
        echo: 'Detects and mixes 25 languages',
        /**
         * Resultado real del reconocedor de Apple en en-US (25-09-2026), por el
         * mismo método con el que se obtuvo el ejemplo español («depploy del
         * Back and and Get Have»): la frase sintetizada con `say -v Samantha` y
         * transcrita con `echo --transcribe <aiff> en-US` (motor Apple). No es
         * una persona dictando en macOS; si alguien lo dicta de verdad y sale
         * otra cosa, se cambia por eso.
         */
        nota: '«the demo with Iñaki is on jueves», not «the demo with Vineke is on Juebes».',
      },
      {
        criterio: 'Formatting for each app',
        macos: 'Always the same',
        echo: 'Email, chat or terminal, each its own way',
      },
    ],
    cierre: {
      concesion: 'If you dictate the odd sentence and Mac dictation does the job, stick with it.',
      afirmacion: 'echo is for when you dictate whole paragraphs and you’re tired of fixing them afterwards.',
    },
  },

  privacidad: {
    rotulo: 'What leaves your Mac, and what doesn’t',
    principal:
      'Your voice never leaves your Mac. If you turn on polishing, the text —never the audio— goes to your own Claude or ChatGPT account. With polishing off, nothing leaves. What you dictate never goes through our servers, and we don’t keep it.',
  },

  contacto: {
    texto: 'Questions, or something not working? ',
    boton: 'Email us',
    destino: 'hola@make-algo.com',
    asunto: 'echo',
  },

  preguntas: {
    rotulo: 'Questions',
    lista: [
      {
        p: 'How much does it cost?',
        r: 'A 14-day full trial, no card needed. Then you choose: €12 a year or €3 a month, VAT included, for up to three Macs. You pay from inside the app, and you can switch plans or cancel whenever you like.',
      },
      {
        p: 'Do I need to pay for Claude?',
        r: 'Claude Pro or Max works, and so does ChatGPT Plus: something you already pay for does one more thing. Without either, echo still works with polishing off: local transcription, and you say the punctuation out loud.',
      },
      {
        p: 'What if Claude fails or I’m offline?',
        r: 'The raw transcript gets pasted and the menu tells you why. You never lose what you dictated.',
      },
      {
        p: 'Which Mac do I need?',
        r: 'macOS 14 (Sonoma) or later on Apple Silicon. The first time, echo downloads the speech model, about 600 MB.',
      },
    ],
  },

  meta: {
    titulo: 'echo, dictation for Mac that writes it clean',
    descripcion:
      'echo, dictation for Mac: you talk and the text appears written and punctuated where you were. Local transcription, polished by your Claude or ChatGPT.',
    nombre: 'echo, dictation for Mac',
    ogImageAlt: 'echo, dictation for Mac that writes it clean',
  },

  imagenes: {
    pildoraEscuchando: 'The echo pill listening, with the voice waveform and the counter at 0:07.',
    pildoraPuliendo:
      'The echo pill with the terracotta waveform, a sparkles icon and the text “Polishing with Claude…”.',
  },

  pie: {
    linea: 'echo, dictation for Mac. An app by Make Algo SL.',
    descargar: 'Download',
    avisoLegal: 'Legal notice',
    condiciones: 'Terms',
    privacidad: 'Privacy',
  },

  saltar: 'Skip to content',

  correccion: {
    capaSucia: 'raw dictation · unedited',
    capaLimpia: 'pasted into your app · already edited',
    insercion: 'no dictating punctuation',
  },

  heroSucio: {
    segmentos: [
      { texto: 'um…', tachado: true },
      { texto: ' you talk and it’s written', tachado: false },
      { texto: ', like', tachado: true },
      { texto: ', no filler words, ', tachado: false },
      { texto: 'saying comma, period,', tachado: true },
      { insercion: true },
      { texto: ' ', tachado: false },
      { texto: 'and uh,', tachado: true },
      { texto: ' no switching languages', tachado: false },
    ],
  },
}
