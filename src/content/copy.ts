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
    /** MAK-263: se añade el mensual junto al anual (experimento D1). «12 €
     * al año» sigue siendo la cifra que más convence y no se retira de aquí. */
    aviso: [
      { dato: true, texto: '14 días gratis' },
      { dato: false, texto: ', luego 3 € al mes o 12 € al año.' },
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
 *
 * MAK-250: `cuerpo` funde aquí lo que antes era la sección «Vocabulario
 * personal» (CA-VOC-*), que se retira. Segmentado como `pasos.lista[].partes`
 * para poner `make-algo` en cursiva sin romper la frase única y seguida que
 * exige CA-CAR-5 en el HTML generado.
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
  cuerpo: [
    { texto: 'Y con tu tono en cada una: en Ajustes le dices «en Slack, informal» o «escribe ', enfasis: false },
    { texto: 'make-algo', enfasis: true },
    { texto: ' así», y lo aplica cada vez.', enfasis: false },
  ],
} as const

/**
 * MAK-230: el «4 veces más rápido» sube a pieza visual en el hero, en el
 * mismo lenguaje de corrección que ya usa la página (tachado/limpio).
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
        { dato: true, texto: 'Décimas de segundo,' },
        { dato: false, texto: ' sin conexión.' },
      ],
    },
    {
      titulo: 'Se pule con tu suscripción.',
      partes: [
        { dato: false, texto: 'Claude o ChatGPT, con tu sesión: ' },
        { dato: true, texto: '1,5 a 2,5 segundos,' },
        { dato: false, texto: ' y solo cuando el texto lo necesita.' },
      ],
    },
    {
      titulo: 'Se pega donde estabas.',
      partes: [{ dato: false, texto: 'En la app activa, con el formato que le toca.' }],
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

/**
 * MAK-243: sustituye a la sección «Escríbenos» de seis piezas (título,
 * entradilla, formulario, microcopy, aviso legal y confirmación) por un
 * único enlace `mailto:` sin cuerpo prerrellenado. `destino` y `asunto`
 * están aquí porque son la parte literal exigida por
 * `scripts/verificar-copy.mjs`, no porque haya más lógica que envolver.
 */
export const contacto = {
  texto: '¿Dudas o algo que no funciona? ',
  boton: 'Escríbenos',
  destino: 'hola@make-algo.com',
  asunto: 'echo',
} as const

export const preguntas = {
  rotulo: 'Preguntas',
  /**
   * MAK-263: cinco preguntas, no cuatro — se añade la del programa de
   * invitaciones (E7). `scripts/verificar-copy.mjs` comprueba el conteo.
   */
  lista: [
    {
      p: '¿Cuánto cuesta?',
      r: '14 días de prueba completa, sin tarjeta. Después, 3 € al mes o 12 € al año, IVA incluido, para hasta tres Macs: eliges la modalidad y puedes cambiarla cuando quieras desde la propia app. Se cancela cuando quieras, y el primer cobro con importe tiene 14 días de garantía de devolución.',
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
      r: 'macOS 14 (Sonoma) o posterior y Apple Silicon. La primera vez se descarga el modelo de voz, unos 600 MB.',
    },
    {
      p: '¿Cómo funciona el programa de invitaciones?',
      r: 'Con suscripción activa, invitas con tu propio código: quien se suscribe con él tiene 3 € de descuento en su primer cobro, y tú recibes 3 € de saldo en Stripe por cada invitado que llega a pagar, hasta un tope de 12 € al año. El saldo se descuenta solo de tu próxima factura.',
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
} as const
