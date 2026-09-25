import type { Copy } from './types'

/**
 * Copy en español de la landing (MAK-82, propagada a la raíz en MAK-85).
 * Todo el texto visible de `/` sale de aquí.
 *
 * Reglas al tocar este fichero:
 * - El texto es de echo-launch y va literal. Ni una coma.
 * - Los espacios duros van como ` ` dentro de la cadena, no como entidad:
 *   así el texto es una sola cadena comparable y `scripts/verificar-copy.mjs`
 *   puede exigirlo literal.
 * - Donde la composición parte una frase en dos elementos (el cierre),
 *   la frase vive aquí entera y partida en trozos contiguos.
 *   Ninguna composición puede meter nada entre ellos: la comprobación de
 *   copy exige la frase seguida en el HTML generado.
 */
export const es: Copy = {
  demo: {
    ventana: {
      barra: 'Nuevo mensaje',
      para: { etiqueta: 'Para:', valor: 'equipo@' },
      asunto: { etiqueta: 'Asunto:', valor: 'Deploy de la semana' },
      cuerpo: 'Hacemos el deploy del backend en GitHub el jueves y lo comentamos en la daily.',
    },
    barra: {
      tecla: '⌥ espacio',
      grabando: 'Grabando',
      puliendo: 'Puliendo',
      unidad: 's',
      tiempos: ['0,0', '0,6', '1,2', '1,8', '1,8'],
    },
  },

  cabecera: {
    marca: 'echo',
    cta: 'Descargar echo',
  },

  apertura: {
    titular: [
      'Habla y aparece escrito.',
      'Sin muletillas, sin dictar la puntuación',
      'y sin cambiar de idioma.',
    ],
    tagline: 'Dictado para Mac. Hablas, y aparece escrito limpio donde estabas.',
    cta: 'Descargar echo',
    requisito: {
      aviso: [
        { dato: true, texto: '14 días gratis' },
        { dato: false, texto: ', luego 12 € al año o 3 € al mes.' },
      ],
      maquina: 'Mac con Apple Silicon y macOS 14 o posterior.',
    },
  },

  dondeSePega: {
    titulo: 'Se pega donde ya escribes',
    piezas: [
      { icono: 'gmail', etiqueta: 'Correo' },
      { icono: 'slack', etiqueta: 'Chat de equipo' },
      { icono: 'github', etiqueta: 'Issues y PRs' },
      { icono: 'vscode', etiqueta: 'Editor de código' },
      { icono: 'notion', etiqueta: 'Notas y documentos' },
      { icono: 'linear', etiqueta: 'Gestión de producto' },
    ],
    cuerpo: [
      { texto: 'Y con tu tono en cada una: en Ajustes le dices «en Slack, informal» o «escribe ', enfasis: false },
      { texto: 'make-algo', enfasis: true },
      { texto: ' así», y lo aplica cada vez.', enfasis: false },
    ],
  },

  velocidad: {
    filas: [
      { modo: 'Tecleando', ppm: '~40 palabras por minuto' },
      { modo: 'Hablando', ppm: '~150 palabras por minuto' },
    ],
    fuente: 'Medias de referencia: habla conversacional frente a tecleo de un adulto sin formación.',
  },

  pasos: {
    rotulo: 'Qué pasa cuando sueltas la tecla',
    lista: [
      {
        titulo: 'Se transcribe en tu Mac.',
        partes: [
          { dato: true, texto: 'Décimas de segundo,' },
          { dato: false, texto: ' sin conexión.' },
        ],
      },
      {
        titulo: 'Se pule con tu suscripción.',
        partes: [
          { dato: false, texto: 'Claude o ChatGPT, con tu sesión: ' },
          { dato: true, texto: '1,5 a 2,5 segundos,' },
          { dato: false, texto: ' y solo cuando el texto lo necesita.' },
        ],
      },
      {
        titulo: 'Se pega donde estabas.',
        partes: [{ dato: false, texto: 'En la app activa, con el formato que le toca.' }],
      },
    ],
  },

  comparativa: {
    titulo: 'El dictado del Mac transcribe. echo escribe.',
    entradilla: 'El dictado de macOS es bueno y gratis. Estas cuatro cosas no las hace.',
    columnas: { criterio: 'Criterio', macos: 'Dictado de macOS', echo: 'echo' },
    filas: [
      {
        criterio: 'Muletillas y repeticiones',
        macos: 'Las transcribe tal cual',
        echo: 'Las quita',
      },
      {
        criterio: 'Puntuación',
        macos: 'La dictas tú, palabra por palabra',
        echo: 'La pone sola',
      },
      {
        criterio: 'Idiomas mezclados',
        macos: 'Un idioma fijo por sesión',
        echo: 'Detecta y mezcla, 25 idiomas',
        nota: '«deploy del backend en GitHub», no «depploy del Back and and Get Have».',
      },
      {
        criterio: 'Formato según la app',
        macos: 'No lo cambia',
        echo: 'Correo, chat o terminal, distinto',
      },
    ],
    cierre: {
      concesion: 'Si dictas frases sueltas y el dictado del Mac te vale, quédate con él.',
      afirmacion: 'echo es para cuando dictas párrafos y te cansa editarlos después.',
    },
  },

  privacidad: {
    rotulo: 'Qué sale de tu Mac y qué no',
    principal:
      'Tu voz no sale nunca de tu Mac. Si activas el pulido, sale el texto —no el audio— hacia tu propia cuenta de Claude o ChatGPT. Sin pulido, no sale nada. No tenemos servidores ni guardamos lo que dictas.',
  },

  contacto: {
    texto: '¿Dudas o algo que no funciona? ',
    boton: 'Escríbenos',
    destino: 'hola@make-algo.com',
    asunto: 'echo',
  },

  preguntas: {
    rotulo: 'Preguntas',
    lista: [
      {
        p: '¿Cuánto cuesta?',
        r: '14 días de prueba completa, sin tarjeta. Después eliges: 12 € al año o 3 € al mes, IVA incluido, para hasta tres Macs. Se paga desde la propia app, puedes cambiar de modalidad cuando quieras y se cancela cuando quieras.',
      },
      {
        p: '¿Necesito pagar Claude?',
        r: 'Vale Claude Pro o Max, y también ChatGPT Plus: lo que ya pagas hace una cosa más. Sin ninguna de las dos, echo sigue funcionando con el pulido desactivado: transcripción local y puntuación por voz.',
      },
      {
        p: '¿Y si falla Claude o no tengo conexión?',
        r: 'Se pega la transcripción en bruto y el menú te dice por qué. No pierdes el dictado.',
      },
      {
        p: '¿Qué Mac necesito?',
        r: 'macOS 14 (Sonoma) o posterior y Apple Silicon. La primera vez se descarga el modelo de voz, unos 600 MB.',
      },
    ],
  },

  pie: {
    linea: 'echo, dictado para Mac. Una app de Make Algo SL.',
    avisoLegal: 'Aviso legal',
    condiciones: 'Condiciones',
    privacidad: 'Privacidad',
  },

  saltar: 'Saltar al contenido',

  correccion: {
    capaSucia: 'dictado en bruto · sin editar',
    capaLimpia: 'pegado en tu app · ya editado',
    insercion: 'sin dictar la puntuación',
  },

  heroSucio: {
    segmentos: [
      { texto: 'eh…', tachado: true },
      { texto: ' hablas y aparece escrito', tachado: false },
      { texto: ', o sea', tachado: true },
      { texto: ', sin muletillas, ', tachado: false },
      { texto: 'sin ir diciendo coma, punto,', tachado: true },
      { insercion: true },
      { texto: ' ', tachado: false },
      { texto: 'y eh,', tachado: true },
      { texto: ' sin cambiar de idioma', tachado: false },
    ],
  },
}
