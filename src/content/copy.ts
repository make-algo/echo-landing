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
  subtitulo:
    'Dictado para Mac. La voz se transcribe en tu propio ordenador; el texto lo pule la suscripción de Claude o ChatGPT que ya pagas. Aparece pegado donde estabas escribiendo.',
  cta: 'Descargar echo',
  requisito: {
    aviso: 'Descarga directa, sin cuenta ni formulario. 14 días de prueba completa y, después, suscripción anual.',
    maquina: 'macOS 14 o posterior en Apple Silicon.',
  },
} as const

/**
 * Franja «Se pega donde ya escribes» (MAK-194 / MAK-195). Copy fijado literal
 * en `docs/product/mak-194-carrusel-velocidad-vocabulario.md` §2 del repo
 * privado: iconografía genérica, sin marcas de terceros (CA-CAR-3/CA-CAR-4),
 * y sin multiplicador de velocidad (CA-CAR-6, reutiliza CA-NEG-5).
 */
export const dondeSePega = {
  titulo: 'Se pega donde ya escribes',
  /** CA-CAR-2: seis piezas, en este orden exacto. `icono` es la clave que lee `Icono.astro`. */
  piezas: [
    { icono: 'correo', etiqueta: 'Correo' },
    { icono: 'chat', etiqueta: 'Chat' },
    { icono: 'terminal', etiqueta: 'Terminal' },
    { icono: 'editor', etiqueta: 'Editor de código' },
    { icono: 'notas', etiqueta: 'Notas y documentos' },
    { icono: 'navegador', etiqueta: 'Cualquier web' },
  ],
  /** CA-CAR-5, literal. */
  cuerpo:
    'Correo, chat, terminal, notas, código… Hablas más rápido de lo que tecleas, y el texto aparece limpio esté donde esté el cursor.',
} as const

export const argumentos = {
  rotulo: 'Qué hace distinto',
  lista: [
    {
      titulo: 'Limpia el texto, no solo lo transcribe',
      texto:
        'Quita las muletillas y las repeticiones, aplica las correcciones que dices en voz alta («el martes, no, mejor el jueves») y puntúa sola.',
    },
    {
      titulo: 'Español con inglés técnico en medio',
      texto:
        '«Hacemos el deploy del backend en GitHub» no se convierte en «depploy del Back and and Get Have». echo usa un modelo multilingüe que detecta el idioma solo y aguanta la mezcla dentro de la misma frase. 25 idiomas europeos.',
    },
    {
      titulo: 'Sin cuotas por minuto',
      texto:
        'La transcripción corre en tu Mac, así que no hay servidor que pagar ni minutos que gastar. El pulido lo hace el CLI de Claude Code o el de Codex con tu propia sesión: consume tu cuota, no una nuestra. No te pedimos ninguna API key.',
    },
    {
      titulo: 'Local, sin cuenta y sin guardar nada',
      texto:
        'La voz se transcribe en tu Mac; nunca sale del dispositivo. No hace falta crear ninguna cuenta para descargar ni para usar echo. Y no guardamos ni enviamos a ningún sitio lo que dictas: si activas el pulido, lo único que sale es el texto ya transcrito, hacia tu propia cuenta de Claude o ChatGPT.',
    },
  ],
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
  entradilla:
    'El dictado que trae macOS es bueno, es gratis y ha mejorado. Estas son las cuatro cosas que no hace, y son las cuatro razones por las que existe echo.',
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
    'Tu voz no sale nunca de tu Mac: la transcripción es local. Si activas el pulido, el texto transcrito —no el audio— se envía a Claude o a ChatGPT con tu propia cuenta, igual que si lo hubieras pegado tú en el chat. Si prefieres que no salga nada, desactiva el pulido: echo sigue funcionando.',
  notas: [
    'No tenemos servidores en medio: echo habla con el CLI que ya tienes instalado, no con una API nuestra.',
    'No guardamos ni enviamos a ninguna parte lo que dictas. El audio solo se guarda en tu disco si tú lo activas para hacer pruebas.',
  ],
} as const

export const paraQuien = {
  rotulo: 'Para quién es',
  parrafos: [
    {
      fuerte: 'Te va a servir si',
      resto:
        ' escribes mucho a lo largo del día —prompts, mensajes, issues, correos, documentos— y hablas más rápido de lo que tecleas. Si trabajas en dos idiomas a la vez. Si ya pagas Claude o ChatGPT y te parece bien que hagan una cosa más. Si teclear te duele o te cuesta.',
    },
    {
      /** CA-INT-3 */
      fuerte: 'No te va a servir si',
      resto:
        ' dictas frases sueltas de vez en cuando (el dictado del Mac te sobra), si tu Mac no es Apple Silicon con macOS 26, o si lo que dictas está bajo secreto profesional y no puede salir de tu ordenador ni en texto: para eso hoy tendrías que usar echo con el pulido desactivado, y entonces te falta justo la parte que lo hace interesante.',
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
  legal: {
    titulo: 'Protección de datos:',
    uno: ' el responsable es Make Algo SL. Usamos tu correo solo para leer y contestar tu mensaje, y lo que cuentes solo para entender cómo se usa echo. No te apuntamos a ninguna lista, no te escribimos después y no cedemos nada a terceros. Tu mensaje llega directo a nuestro buzón, sin proveedor de formularios de por medio; los detalles y tus derechos, en la ',
    enlace: 'política de privacidad',
    dos: '. Puedes pedirnos que lo borremos escribiendo a ',
    correo: 'hola@make-algo.com',
    tres: '.',
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
      p: '¿Se envía mi voz a algún sitio?',
      r: 'No, nunca. La transcripción es local. Con el pulido activado sale el texto —no el audio— a tu propia cuenta de Claude o ChatGPT; desactivado, no sale nada.',
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
      r: 'macOS 26 (Tahoe) y Apple Silicon. La primera vez se descarga el modelo de voz, unos 600 MB.',
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
  linea: 'echo es una app de Make Algo SL. Dictado para macOS.',
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
   * Las dos notas de margen que ocupan el hueco del lado derecho a partir de
   * 1024 px (MAK-85, punto 2.4 del pulido): texto real, leído en voz alta
   * igual que el resto, no decoración de relleno.
   */
  margenComparativa: 'cuatro correcciones. cero adivinadas.',
  margenPreguntas: 'la última pregunta',
} as const
