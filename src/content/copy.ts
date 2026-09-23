/**
 * Fuente única del copy de la landing (MAK-82, propagada a la raíz en MAK-85).
 *
 * Todo el texto visible de `/` sale de aquí.
 *
 * Reglas al tocar este fichero:
 * - El texto es de echo-launch y va literal. Ni una coma.
 * - Los espacios duros van como ` ` dentro de la cadena, no como entidad:
 *   así el texto es una sola cadena comparable y `scripts/verificar-copy.mjs`
 *   puede exigirlo literal.
 * - Donde la composición parte una frase en dos elementos (el cierre),
 *   la frase vive aquí entera y partida en trozos contiguos.
 *   Ninguna composición puede meter nada entre ellos: la comprobación de
 *   copy exige la frase seguida en el HTML generado.
 */

/** Micro-texto de interfaz recreada dentro de la demo. No es copy de página. */
export const demo = {
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
} as const

export const cabecera = {
  marca: 'echo',
  cta: 'Descargar echo',
} as const

export const apertura = {
  /** Tres tramos: el control mete un salto manual entre ellos a partir de 1024 px. */
  titular: [
    'Habla y aparece escrito.',
    'Sin muletillas, sin dictar la puntuación',
    'y sin cambiar de idioma.',
  ],
  /**
   * MAK-230: la línea que dice qué es esto, en grande, inmediatamente debajo
   * del bloque limpio. No sustituye al titular ni al subtítulo: se añade.
   * Copy literal, aprobado en la issue — no se reescribe.
   */
  tagline: 'Dictado para Mac. Hablas, y aparece escrito limpio donde estabas.',
  cta: 'Descargar echo',
  /**
   * MAK-244: el subtítulo se borra — lo que contaba ya lo cuenta «Qué pasa
   * cuando sueltas la tecla», con más detalle — y las condiciones bajo el CTA
   * bajan de 35 palabras a una línea. «Hasta tres Macs», «IVA incluido» y
   * «sin cuenta ni formulario» ya están en la FAQ de precio.
   */
  requisito: {
    /**
     * Segmentado como `pasos.lista[].partes` y por lo mismo: el precio es la
     * cifra que decide la comparación —doce euros al año, no al mes— y en el
     * gris del resto de la línea no se lee, así que sube a tinta plena. La
     * frase sigue siendo una y seguida en el HTML: nada se mete en medio.
     */
    aviso: [
      { dato: true, texto: '14 días gratis' },
      { dato: false, texto: ', luego 12 € al año.' },
    ],
    maquina: 'Mac con Apple Silicon y macOS 14 o posterior.',
  },
} as const

/**
 * Franja «Se pega donde ya escribes» (MAK-194 / MAK-195, logos reales fijados
 * en MAK-212 — deroga la decisión A de MAK-194 §1, sin tocar el resto). Copy
 * y tabla de marcas en `docs/product/mak-212-logos-reales-carrusel.md` del
 * repo privado (PR #58): seis logos reales curados, sin multiplicador de
 * velocidad (CA-CAR-6, reutiliza CA-NEG-5).
 */
export const dondeSePega = {
  titulo: 'Se pega donde ya escribes',
  /** CA-LOGO-1: seis piezas, en este orden exacto. `icono` es la clave que lee `Icono.astro`. */
  piezas: [
    { icono: 'gmail', etiqueta: 'Correo' },
    { icono: 'slack', etiqueta: 'Chat de equipo' },
    { icono: 'github', etiqueta: 'Issues y PRs' },
    { icono: 'vscode', etiqueta: 'Editor de código' },
    { icono: 'notion', etiqueta: 'Notas y documentos' },
    { icono: 'linear', etiqueta: 'Gestión de producto' },
  ],
  /** CA-CAR-5, literal. */
  cuerpo:
    'Correo, chat, terminal, notas, código… Hablas más rápido de lo que tecleas, y el texto aparece limpio esté donde esté el cursor.',
} as const

/**
 * MAK-230: el «4 veces más rápido» sube de la sección «Para quién es» a
 * pieza visual en el hero, en el mismo lenguaje de corrección que ya usa la
 * página (tachado/limpio). La cifra y su fuente se mueven juntas — se
 * quitan de `paraQuien` para no repetirse.
 */
export const velocidad = {
  filas: [
    { modo: 'Tecleando', ppm: '~40 palabras por minuto' },
    { modo: 'Hablando', ppm: '~150 palabras por minuto' },
  ],
  /**
   * MAK-244: ya no repite las dos cifras de las filas justo encima; se deja
   * solo la fuente de la comparación.
   */
  fuente: 'Medias de referencia: habla conversacional frente a tecleo de un adulto sin formación.',
} as const

export const pasos = {
  rotulo: 'Qué pasa cuando sueltas la tecla',
  lista: [
    {
      titulo: 'Se transcribe en tu Mac.',
      /** `dato` es la cifra que el escéptico viene a buscar: sube a tinta plena. */
      partes: [
        { dato: true, texto: 'Décimas de segundo.' },
        { dato: false, texto: ' Modelo local, sin conexión.' },
      ],
    },
    {
      titulo: 'Se pule con tu suscripción.',
      partes: [
        { dato: false, texto: 'El texto transcrito pasa por Claude o ChatGPT, con tu sesión. ' },
        { dato: true, texto: 'De 1,5 a 2,5 segundos.' },
        {
          dato: false,
          texto:
            ' Puedes dejarlo en «solo cuando haga falta», que es como viene: los dictados que ya salen limpios se pegan al instante.',
        },
      ],
    },
    {
      titulo: 'Se pega donde estabas.',
      partes: [
        {
          dato: false,
          texto:
            'En la app activa, con el formato que le corresponda. Y se queda en el portapapeles por si lo quieres pegar otra vez.',
        },
      ],
    },
  ],
} as const

/**
 * Sección «Vocabulario personal» (MAK-194 / MAK-195). Copy fijado literal en
 * `docs/product/mak-194-carrusel-velocidad-vocabulario.md` §2, que a su vez
 * reutiliza literalmente los tres ejemplos de `README.md` (sección Uso,
 * Ajustes ⌘,) del repo privado — CA-VOC-3 (nada del CLI de pruebas, sin
 * inventar un cuarto ejemplo).
 *
 * `cuerpo` va en segmentos, como `pasos.lista[].partes`, para poder poner
 * `make-algo` y `Álvaro` en cursiva sin romper la frase única y seguida que
 * exige CA-VOC-2 en el HTML generado.
 */
export const vocabulario = {
  titulo: 'Vocabulario personal',
  cuerpo: [
    {
      texto:
        'echo aprende cómo escribes tú. En Ajustes le enseñas nombres propios, marcas y tono por app —«escribe ',
      enfasis: false,
    },
    { texto: 'make-algo', enfasis: true },
    { texto: ' así», «trata ', enfasis: false },
    { texto: 'Álvaro', enfasis: true },
    {
      texto: ' como nombre propio», «en Slack, tono informal»— y Claude lo aplica cada vez que pule tu dictado.',
      enfasis: false,
    },
  ],
} as const

export const comparativa = {
  titulo: 'El dictado del Mac transcribe. echo escribe.',
  entradilla: 'El dictado de macOS es bueno y gratis. Estas cuatro cosas no las hace.',
  columnas: { criterio: 'Criterio', macos: 'Dictado de macOS', echo: 'echo' },
  /** Cuatro filas, y el número no es casual: la entradilla anuncia cuatro. */
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
      /**
       * Rescatado de la sección «Qué hace distinto» (borrada en MAK-245): el
       * único ejemplo que no vive en ningún otro sitio del copy.
       */
      nota: '«deploy del backend en GitHub», no «depploy del Back and and Get Have».',
    },
    {
      criterio: 'Formato según la app',
      macos: 'No lo cambia',
      echo: 'Correo, chat o terminal, distinto',
    },
  ],
  /**
   * CA-INT-2. Va literal y seguido. Partido en dos porque B compone la segunda
   * mitad en tinta plena, pero las dos mitades son contiguas en el HTML.
   */
  cierre: {
    concesion: 'Si dictas frases sueltas y el dictado del Mac te vale, quédate con él.',
    afirmacion: 'echo es para cuando dictas párrafos y te cansa editarlos después.',
  },
} as const

export const privacidad = {
  rotulo: 'Qué sale de tu Mac y qué no',
  /** CA-INT-1 */
  principal:
    'Tu voz no sale nunca de tu Mac. Si activas el pulido, sale el texto —no el audio— hacia tu propia cuenta de Claude o ChatGPT. Sin pulido, no sale nada. No tenemos servidores ni guardamos lo que dictas.',
} as const

export const paraQuien = {
  rotulo: 'Para quién es',
  parrafos: [
    {
      /**
       * MAK-230: el «4 veces más rápido» y su cifra suben al hero como
       * pieza visual (ver `velocidad`); esta prosa ya no lo repite.
       */
      fuerte: 'Te va a servir si',
      resto:
        ' escribes mucho a lo largo del día: prompts, mensajes, issues, correos, documentos. Si trabajas en dos idiomas a la vez. Si ya pagas Claude o ChatGPT y te parece bien que hagan una cosa más. Si teclear te duele o te cuesta.',
    },
    {
      /** CA-INT-3 */
      fuerte: 'No te va a servir si',
      resto:
        ' dictas frases sueltas de vez en cuando (el dictado del Mac te sobra), si tu Mac no es Apple Silicon con macOS 14 o posterior, o si lo que dictas está bajo secreto profesional y no puede salir de tu ordenador ni en texto: para eso hoy tendrías que usar echo con el pulido desactivado, y entonces te falta justo la parte que lo hace interesante.',
    },
  ],
} as const

export const beta = {
  titulo: 'Escríbenos',
  entradilla:
    'La descarga ya está arriba. Si la pruebas y quieres contarnos qué tal te va —o qué te falla—, escríbenos. Lo leemos todo.',
  uso: {
    etiqueta: '¿Para qué lo usas?',
  },
  sub: {
    etiqueta: '¿Tienes Claude o ChatGPT de pago?',
    opciones: ['Claude', 'ChatGPT', 'Las dos', 'Ninguna'],
  },
  boton: 'Escríbenos por email',
  /** CA-FORM-6 · texto aprobado, exigido literal por scripts/verificar-copy.mjs — no tocar sin pasar por pm. */
  microcopy:
    'No hay lista ni newsletter: no te vamos a escribir. Guardamos tu correo solo mientras haga falta para contestarte.',
  /** Frase de primera capa (art. 13 RGPD), aprobada por asesor-legal en MAK-227: no se reescribe sin pasar por ahí. El resto del art. 13 vive en /privacidad. */
  legal: {
    titulo: 'Protección de datos:',
    uno: ' el responsable es Make Algo SL y usaremos tu correo solo para leer y contestar tu mensaje. Los detalles y tus derechos, en la ',
    enlace: 'política de privacidad',
    dos: '.',
  },
  ok: {
    texto:
      'Se abre tu programa de correo con el asunto y las preguntas ya escritas: rellénalas y dale a enviar.',
    extra: 'Si quieres acelerar: cuéntanos cómo dictas hoy y qué te falla. Se lee todo.',
  },
} as const

export const preguntas = {
  rotulo: 'Preguntas',
  lista: [
    {
      p: '¿Necesito pagar Claude?',
      r: 'Vale Claude Pro o Max, y también ChatGPT Plus: lo que ya pagas hace una cosa más. Sin ninguna de las dos, echo sigue funcionando con el pulido desactivado: transcripción local y puntuación por voz.',
    },
    {
      p: '¿Cuánto tarda?',
      r: 'La transcripción, décimas de segundo. El pulido, entre 1,5 y 2,5 segundos con Claude. Por defecto solo se pule cuando hace falta, así que la mayoría de los dictados se pegan al instante.',
    },
    {
      p: '¿Y si falla Claude o no tengo conexión?',
      r: 'Se pega la transcripción en bruto y el menú te dice por qué. No pierdes el dictado.',
    },
    {
      p: '¿Qué Mac necesito?',
      r: 'macOS 14 (Sonoma) o posterior y Apple Silicon. La primera vez se descarga el modelo de voz, unos 600 MB.',
    },
    {
      p: '¿En qué idiomas funciona?',
      r: '25 idiomas europeos, con detección automática y mezcla dentro de la misma frase.',
    },
    {
      p: '¿Cuánto cuesta?',
      r: '14 días de prueba completa, sin tarjeta. Después, 12 € al año con IVA incluido, para hasta tres Macs. Se paga desde la propia app y se cancela cuando quieras.',
    },
    {
      p: '¿Cuándo puedo descargarlo?',
      r: 'Ya. La descarga está arriba, sin lista de espera ni invitación: 14 días de prueba completa y después decides.',
    },
  ],
} as const

export const pie = {
  linea: 'echo, dictado para Mac. Una app de Make Algo SL.',
  avisoLegal: 'Aviso legal',
  condiciones: 'Condiciones',
  privacidad: 'Privacidad',
} as const

export const saltar = 'Saltar al contenido'

/**
 * Micro-texto de interfaz que la idea organizadora de la landing —una galerada
 * que se limpia sola según bajas— necesita y que el copy de producto no tiene.
 * Ninguno sustituye copy aprobado: todos se añaden.
 */
export const correccion = {
  capaSucia: 'dictado en bruto · sin editar',
  capaLimpia: 'pegado en tu app · ya editado',
  /** La corrección que la mano escribe encima del dictado de la apertura. */
  insercion: 'sin dictar la puntuación',
  /**
   * Nota de margen que ocupa el hueco del lado derecho a partir de 1024 px
   * (MAK-85, punto 2.4 del pulido): texto real, leído en voz alta igual que
   * el resto, no decoración de relleno.
   */
  margenPreguntas: 'la última pregunta',
} as const
