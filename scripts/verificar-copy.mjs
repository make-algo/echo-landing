#!/usr/bin/env node
/**
 * Comprobación automática del copy sobre el HTML generado (CA-INT-5, CA-NEG-*).
 *
 * Mira `dist/index.html`: desde MAK-85 la landing en corrección es la única
 * ruta, ganadora de las direcciones de MAK-82 por decisión de Álvaro en MAK-71.
 *
 * Falla si alguna de las redacciones innegociables no aparece literal, si
 * aparece alguna de las cadenas prohibidas, o si el esqueleto de encabezados se
 * rompe (la regresión que la v1 de MAK-85 encontró en la dirección editor: se
 * reutiliza aquí la misma comprobación sobre la ruta que de verdad se publica).
 * Es lo que hace que esto no dependa de que alguien se acuerde en la revisión.
 *
 *   npm run build && npm run verificar
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const RUTAS = [['landing /', 'dist/index.html']]

const faltan = RUTAS.filter(([, f]) => !existsSync(f))
if (faltan.length) {
  console.error(`No existen ${faltan.map(([, f]) => f).join(', ')}. Ejecuta primero: npm run build`)
  process.exit(1)
}

/** Texto visible, sin etiquetas ni comentarios, con los espacios normalizados. */
const visible = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const norm = (s) => s.replace(/\s+/g, ' ').trim()

const VACIAS = new Set(['br', 'img', 'input', 'hr', 'meta', 'link', 'source', 'col', 'wbr'])

/**
 * El mismo texto visible, pero SIN las capas decorativas: se tira todo subárbol
 * con `aria-hidden="true"`. Es lo que oye quien usa un lector de pantalla.
 *
 * Hace falta porque las variantes pintan encima capas sucias —la onda, el
 * dictado tachado— y la promesa tiene que llegar primera y entera en voz
 * alta, no segunda y descuartizada.
 */
function accesible(html) {
  let salida = ''
  let i = 0
  while (i < html.length) {
    const abre = html.indexOf('<', i)
    if (abre < 0) {
      salida += html.slice(i)
      break
    }
    salida += html.slice(i, abre)
    const cierra = html.indexOf('>', abre)
    if (cierra < 0) break
    const etiqueta = html.slice(abre, cierra + 1)
    const nombre = etiqueta.match(/^<\/?([a-zA-Z0-9-]+)/)?.[1]?.toLowerCase()
    i = cierra + 1
    if (!nombre || VACIAS.has(nombre) || etiqueta.startsWith('</') || etiqueta.endsWith('/>')) {
      salida += ' '
      continue
    }
    if (!/aria-hidden="true"/.test(etiqueta)) {
      salida += ' '
      continue
    }
    // Saltar el subárbol entero, contando anidamientos de la misma etiqueta.
    let hondo = 1
    const re = new RegExp(`<\\/?${nombre}\\b[^>]*>`, 'gi')
    re.lastIndex = i
    let m
    while ((m = re.exec(html))) {
      if (m[0].startsWith('</')) hondo--
      else if (!m[0].endsWith('/>')) hondo++
      if (hondo === 0) break
    }
    i = m ? re.lastIndex : html.length
    salida += ' '
  }
  return visible(salida)
}

/**
 * El copy aprobado tiene que llegar entero, seguido y EN ORDEN a quien no ve la
 * página. Esto no lo garantiza la comprobación de arriba: una variante puede
 * tener las frases sueltas por el documento y en otro orden y seguir pasándola.
 */
const ORDEN = [
  ['titular', 'Habla y aparece escrito. Sin muletillas, sin dictar la puntuación y sin cambiar de idioma.'],
  ['subtítulo', 'Dictado para Mac. La voz se transcribe en tu propio ordenador'],
  ['entradilla de la comparativa', 'Estas son las cuatro cosas que no hace'],
  ['cierre de la comparativa', 'Si dictas frases sueltas y el dictado del Mac te vale, quédate con él. echo es para cuando dictas párrafos y te cansa editarlos después.'],
  ['párrafo de privacidad', 'Tu voz no sale nunca de tu Mac: la transcripción es local.'],
  ['para quién NO es', 'No te va a servir si dictas frases sueltas de vez en cuando'],
  ['microcopy del alta', 'No hay lista ni newsletter: no te vamos a escribir.'],
]

// --- Las redacciones innegociables: copy aprobado que va literal o no va.
//     Se exigen SEGUIDAS, así que ninguna composición puede partirlas en dos
//     cajas con otra cosa en medio.
const INNEGOCIABLES = [
  [
    'CA-INT-1 · párrafo de privacidad',
    `Tu voz no sale nunca de tu Mac: la transcripción es local. Si activas el pulido, el texto
     transcrito —no el audio— se envía a Claude o a ChatGPT con tu propia cuenta, igual que si lo
     hubieras pegado tú en el chat. Si prefieres que no salga nada, desactiva el pulido: echo sigue
     funcionando.`,
  ],
  [
    'CA-INT-2 · cierre de la comparativa',
    `Si dictas frases sueltas y el dictado del Mac te vale, quédate con él. echo es para cuando
     dictas párrafos y te cansa editarlos después.`,
  ],
  [
    'CA-FORM-6 · microcopy bajo el botón',
    `No hay lista ni newsletter: no te vamos a escribir. Guardamos tu correo solo mientras haga
     falta para contestarte.`,
  ],
  [
    'CA-INT-3 · para quién NO es',
    `No te va a servir si dictas frases sueltas de vez en cuando (el dictado del Mac te sobra), si
     tu Mac no es Apple Silicon con macOS 14 o posterior, o si lo que dictas está bajo secreto
     profesional y no puede salir de tu ordenador ni en texto: para eso hoy tendrías que usar echo
     con el pulido desactivado, y entonces te falta justo la parte que lo hace interesante.`,
  ],
  [
    'titular · literal y entero',
    `Habla y aparece escrito. Sin muletillas, sin dictar la puntuación y sin cambiar de idioma.`,
  ],
  [
    'entradilla de la comparativa · anuncia cuatro',
    `El dictado que trae macOS es bueno, es gratis y ha mejorado. Estas son las cuatro cosas que no
     hace, y son las cuatro razones por las que existe echo.`,
  ],
  [
    'CA-CAR-5 · cuerpo de «Se pega donde ya escribes»',
    `Correo, chat, terminal, notas, código… Hablas más rápido de lo que tecleas, y el texto aparece
     limpio esté donde esté el cursor.`,
  ],
  [
    'CA-NEG-5/CA-QUIEN-5 · «para quién es» con el multiplicador',
    `escribes mucho a lo largo del día —prompts, mensajes, issues, correos, documentos— y hablas 4
     veces más rápido de lo que tecleas.`,
  ],
  [
    'CA-NEG-5/CA-QUIEN-5 · nota con las dos cifras de referencia',
    `4 veces más rápido que teclear: habla conversacional, ~150 palabras por minuto, frente a
     tecleo de un adulto sin formación, ~40 palabras por minuto (medias de referencia).`,
  ],
  [
    'CA-VOC-2 · cuerpo de «Vocabulario personal»',
    `echo aprende cómo escribes tú. En Ajustes le enseñas nombres propios, marcas y tono por app
     —«escribe make-algo así», «trata Álvaro como nombre propio», «en Slack, tono informal»— y
     Claude lo aplica cada vez que pule tu dictado.`,
  ],
  [
    'CA-ARG-5 · cuarto bloque de «Qué hace distinto»',
    `La voz se transcribe en tu Mac; nunca sale del dispositivo. No hace falta crear ninguna cuenta
     para descargar ni para usar echo. Y no guardamos ni enviamos a ningún sitio lo que dictas: si
     activas el pulido, lo único que sale es el texto ya transcrito, hacia tu propia cuenta de
     Claude o ChatGPT.`,
  ],
]

// --- Criterios negativos: lo que no puede aparecer en la página.
const PROHIBIDAS = [
  [
    'CA-PRIV-4',
    [
      '100% privado',
      '100 % privado',
      '100% local',
      '100 % local',
      'totalmente local',
      'totalmente privado',
      'privacidad total',
    ],
  ],
  ['CA-NEG-4/7 · competidores', ['Wispr', 'Superwhisper', 'Aqua Voice', 'Trustpilot']],
  // CA-NEG-5: multiplicadores genéricos siguen fuera. El único permitido, «4
  // veces más rápido» en «para quién es» (MAK-217, docs/gtm/02-propuesta-valor.md
  // §4/§5.7/§5.11 y docs/gtm/03-alcance-landing.md CA-NEG-5/CA-QUIEN-5 del repo
  // privado), se comprueba abajo como INNEGOCIABLE, con su cifra de referencia
  // visible al lado. La franja «Se pega donde ya escribes» sigue prohibiéndolo
  // del todo (CA-CAR-6), comprobado más abajo solo sobre esa sección.
  ['CA-NEG-5 · múltiplos de velocidad', ['10x', '3x', 'x3']],
  [
    'CA-NEG-8 · palabras prohibidas por el tono',
    [
      'revolucionario',
      'potenciado por IA',
      'sin esfuerzo',
      'game changer',
      'el mejor',
      'la forma más rápida de',
    ],
  ],
  ['CA-NEG-3 · contadores', ['personas en la lista', 'plazas restantes']],
  ['CA-FORM-6b · correo de baja sin fijar', ['correo por definir']],
  [
    'CA-FAQ-1 · FAQ de la lista de espera retirada',
    ['beta privada por tandas', 'condiciones de early-bird', 'todavía no está decidido'],
  ],
  // CA-NEG-1 · la comparativa no vuelve a hablar de precio. «Por anunciar» era
  // la mitad nuestra de aquella fila y no aparece en ningún otro sitio del
  // copy, así que se puede prohibir en toda la página; «Gratis» no, porque «el
  // dictado que trae macOS es bueno, es gratis y ha mejorado» es copy aprobado.
  ['CA-NEG-1 · precio en la comparativa', ['Por anunciar']],
]

// --- Los cuatro criterios de la comparativa. Ni tres ni cinco: la entradilla
//     anuncia «las cuatro cosas que no hace».
const COMPARATIVA = [
  ['Muletillas y repeticiones', 'Las transcribe tal cual', 'Las quita'],
  ['Puntuación', 'La dictas tú, palabra por palabra', 'La pone sola'],
  ['Idiomas mezclados', 'Un idioma fijo por sesión', 'Detecta y mezcla, 25 idiomas'],
  ['Formato según la app', 'No lo cambia', 'Correo, chat o terminal, distinto'],
]

const fallos = []
const mal = (ruta, mensaje) => fallos.push(`${ruta}: ${mensaje}`)

for (const [ruta, fichero] of RUTAS) {
  const html = readFileSync(fichero, 'utf8')
  const texto = visible(html)
  const bajo = texto.toLowerCase()
  const errores = fallos.length

  for (const [nombre, esperado] of INNEGOCIABLES) {
    if (!texto.includes(norm(esperado))) mal(ruta, `${nombre}: NO aparece literal`)
  }

  for (const [nombre, cadenas] of PROHIBIDAS) {
    const encontradas = cadenas.filter((c) => bajo.includes(c.toLowerCase()))
    if (encontradas.length)
      mal(ruta, `${nombre}: aparece ${encontradas.map((c) => `«${c}»`).join(', ')}`)
  }

  // --- CA-CAR-3/CA-CAR-7: la franja «Se pega donde ya escribes» son seis
  //     piezas icono+etiqueta, sin ninguna marca de tercero. La búsqueda de
  //     marcas va SOLO sobre esta sección (no sobre todo el HTML): el
  //     ejemplo de vocabulario personal («en Slack, tono informal», CA-VOC-2)
  //     nombra Slack a propósito y no puede hacer fallar este criterio.
  const franja = html.match(/<section class="acto" id="donde-se-pega"[\s\S]*?<\/section>/)?.[0]
  if (!franja) mal(ruta, 'CA-CAR-1: no existe la sección #donde-se-pega')
  else {
    const MARCAS = ['Slack', 'Notion', 'VS Code', 'Visual Studio', 'Gmail', 'Outlook', 'iMessage', 'WhatsApp', 'Chrome', 'Safari']
    const marcasEncontradas = MARCAS.filter((m) => franja.toLowerCase().includes(m.toLowerCase()))
    if (marcasEncontradas.length)
      mal(ruta, `CA-CAR-3: la franja nombra una marca de tercero: ${marcasEncontradas.join(', ')}`)
    const piezas = (franja.match(/class="carrusel__pieza"/g) ?? []).length
    if (piezas !== 6) mal(ruta, `CA-CAR-2: la franja tiene ${piezas} piezas y hacen falta seis`)
    // CA-CAR-6: esta franja no lleva multiplicador de velocidad, ni siquiera
    // el «4 veces» aprobado para «para quién es» — spec propia, sin excepción.
    if (/\d+\s*x\b|veces\s+más\s+rápido/i.test(visible(franja)))
      mal(ruta, 'CA-CAR-6: la franja «Se pega donde ya escribes» lleva un multiplicador de velocidad')
    const ETIQUETAS = ['Correo', 'Chat', 'Terminal', 'Editor de código', 'Notas y documentos', 'Cualquier web']
    let desdeEtiqueta = -1
    for (const etiqueta of ETIQUETAS) {
      const donde = franja.indexOf(etiqueta)
      if (donde < 0) mal(ruta, `CA-CAR-2: falta la etiqueta «${etiqueta}» en la franja`)
      else if (donde < desdeEtiqueta) mal(ruta, `CA-CAR-2: «${etiqueta}» llega fuera de orden en la franja`)
      else desdeEtiqueta = donde
    }
  }

  // --- Metadatos (CA-META-1, CA-META-2). Las variantes son pieles de la misma
  //     página: el título y la descripción aprobados son los mismos en las cuatro.
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''
  if (title !== 'echo, dictado para Mac que escribe limpio')
    mal(ruta, `CA-META-1: el <title> no es el aprobado (es «${title}»)`)
  else if (title.length > 60) mal(ruta, `CA-META-1: el <title> supera 60 caracteres (${title.length})`)
  if (description.length === 0 || description.length > 155)
    mal(ruta, `CA-META-2: la meta description mide ${description.length} caracteres`)

  // --- La comparativa: cuatro filas y las cuatro aprobadas. El marcado lo
  //     declara con `data-fila-comparativa`, porque cada variante compone la
  //     comparativa de una forma distinta y ya no hay siempre una <table>.
  const filas = (html.match(/data-fila-comparativa/g) ?? []).length
  if (filas !== 4) mal(ruta, `la comparativa tiene ${filas} filas y la entradilla anuncia cuatro`)
  for (const [criterio, macos, echo] of COMPARATIVA) {
    for (const celda of [criterio, macos, echo])
      if (!texto.includes(celda)) mal(ruta, `falta la celda «${celda}» de la comparativa`)
  }

  // --- El árbol de accesibilidad: sin las capas decorativas, el copy aprobado
  //     sigue entero, seguido y en el orden del argumento.
  const oido = accesible(html)
  let desde = -1
  for (const [nombre, frase] of ORDEN) {
    const donde = oido.indexOf(frase)
    if (donde < 0) mal(ruta, `${nombre}: no llega entero al árbol de accesibilidad`)
    else if (donde < desde) mal(ruta, `${nombre}: llega fuera de orden en el árbol de accesibilidad`)
    else desde = donde
  }

  // --- MAK-85 · el esqueleto de encabezados no puede perderse. Los cinco
  //     rótulos de sección tienen que seguir siendo <h2> para quien navega
  //     saltando por encabezados, sea cual sea su vestido visual.
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(([, inner]) =>
    visible(inner).toLowerCase()
  )
  if (h2s.length !== 9) mal(ruta, `tiene ${h2s.length} <h2> y hacen falta nueve`)
  const ROTULOS_H2 = [
    'se pega donde ya escribes',
    'qué hace distinto',
    'qué pasa cuando sueltas la tecla',
    'vocabulario personal',
    'qué sale de tu mac y qué no',
    'para quién es',
    'preguntas',
  ]
  for (const rotulo of ROTULOS_H2) {
    if (!h2s.some((h) => h.includes(rotulo))) mal(ruta, `el rótulo «${rotulo}» no es un <h2>`)
  }

  // --- El alta es un mailto directo: nada de formulario, y al buzón correcto.
  if (!/href="mailto:hola@make-algo\.com\?/.test(html))
    mal(ruta, 'el enlace de la lista de espera no apunta a hola@make-algo.com')
  if (/<form\b/i.test(html)) mal(ruta, 'sigue habiendo un <form> en la página del alta')

  // --- MAK-188: el CTA principal lleva a descargas, y el mailto queda detrás
  //     de un enlace secundario que no compite en estilo con ese CTA.
  if (!/<a class="btn" href="\/descarga">/.test(html))
    mal(ruta, 'el CTA principal no apunta a /descarga')
  if (/class="btn[^"]*"\s+href="mailto:/.test(html))
    mal(ruta, 'el enlace mailto sigue vestido como el botón CTA primario')

  // --- El sitio no puede contradecirse sobre quién procesa el formulario.
  if (/proveedor por (decidir|confirmar)/.test(html))
    mal(ruta, 'el formulario sigue diciendo que el proveedor está sin decidir')

  if (fallos.length === errores) console.log(`ok  ${ruta} · copy, metadatos, comparativa, alta y árbol de accesibilidad`)
}

// --- Sin recursos de terceros (CA-NEG-9), en TODAS las páginas construidas y en
//     el CSS. Se miran solo los atributos de CARGA: un <a href> a un dominio ajeno
//     es un enlace navegable legítimo —la política enlaza a www.aepd.es— y no una
//     petición que el navegador haga al pintar la página.
function ficheros(dir, ext) {
  return readdirSync(dir).flatMap((n) => {
    const ruta = join(dir, n)
    if (statSync(ruta).isDirectory()) return ficheros(ruta, ext)
    return n.endsWith(ext) ? [ruta] : []
  })
}

const PROPIO = 'https://echo.make-algo.com/'
const ajeno = (u) => /^https?:\/\//.test(u) && !u.startsWith(PROPIO)

/** Cargas declaradas en un documento o una hoja de estilos. */
function cargas(texto) {
  const urls = []
  for (const m of texto.matchAll(/\ssrc="([^"]+)"/g)) urls.push(m[1])
  for (const m of texto.matchAll(/<link\b[^>]*>/g)) {
    // `rel="canonical"` y `rel="alternate"` no cargan nada; el resto sí.
    if (/rel="(canonical|alternate)"/.test(m[0])) continue
    const href = m[0].match(/href="([^"]+)"/)
    if (href) urls.push(href[1])
  }
  for (const m of texto.matchAll(/url\(\s*['"]?([^'")]+)/g)) urls.push(m[1])
  for (const m of texto.matchAll(/@import\s+(?:url\()?['"]([^'"]+)/g)) urls.push(m[1])
  return urls
}

// `/og` no es una ruta de la landing: es el molde que `generar-og.mjs` capta
// para `public/og.png` (MAK-231), no lleva `<Base>` y por tanto no lleva ni el
// beacon de medición ni nada que dependa de esa capa. Fuera de las comprobaciones
// que asumen que toda página construida es una página que alguien visita.
const paginas = ficheros('dist', '.html').filter((f) => f !== 'dist/og/index.html')
const hojas = ficheros('dist', '.css')
const terceros = []
for (const f of [...paginas, ...hojas]) {
  for (const u of cargas(readFileSync(f, 'utf8'))) if (ajeno(u)) terceros.push(`${f}: ${u}`)
}

if (terceros.length) fallos.push(`CA-NEG-9: recursos de dominios ajenos: ${terceros.join(', ')}`)
else
  console.log(
    `ok  CA-NEG-9 · ningún recurso de terceros (${paginas.length} páginas, ${hojas.length} hojas de estilo)`
  )

// --- La marca se escribe «echo», en minúscula, en todas partes.
//
//     Es una sola marca: la misma en la prosa, en el `<title>`, en `og:site_name`
//     y en el Mac de quien la instala. La única «Echo» con mayúscula que queda
//     hoy es el nombre del instalador ya publicado (`Echo-1.0.1.dmg`), y por eso
//     va exceptuado aquí. Ese no se renombra —renombrar un asset publicado rompe
//     el enlace que circula y el canal de actualizaciones de quien todavía no se
//     ha actualizado—: la próxima versión sale ya como `echo-X.Y.Z.dmg`, y tanto
//     esta página como el `/descargar` del Worker deciden el nombre por versión,
//     así que las dos conviven. Cuando la 1.0.1 deje de ofrecerse, fuera excepción.
const ARTEFACTO_PUBLICADO = /Echo-\d+\.\d+\.\d+\.dmg/g
const conMayuscula = paginas.filter((f) =>
  /\bEcho\b/.test(readFileSync(f, 'utf8').replace(ARTEFACTO_PUBLICADO, ''))
)
if (conMayuscula.length)
  fallos.push(`la marca va en minúscula y aparece «Echo» en: ${conMayuscula.join(', ')}`)
else console.log(`ok  marca · «echo» en minúscula en las ${paginas.length} páginas`)

// --- El requisito de macOS, uno solo en todo el sitio.
//
//     Ninguna comprobación de copy literal pilla esto: cada página decía una
//     versión distinta —el hero y /descarga, 14; la FAQ y «para quién no es»,
//     26— y cada frase era correcta por separado, así que pasaban las dos. El
//     mínimo real es el objetivo de despliegue de la app: macOS 14. El motor de
//     Apple sí pide 26, pero es opcional y no es el de serie (Parakeet funciona
//     igual en 14, 15 y 26), así que en la web no se anuncia como requisito.
const MACOS_MINIMO = '14'
const requisitos = []
for (const f of paginas) {
  for (const [, version] of visible(readFileSync(f, 'utf8')).matchAll(/macOS\s*(\d+)/g)) {
    if (version !== MACOS_MINIMO) requisitos.push(`${f}: «macOS ${version}»`)
  }
}
if (requisitos.length)
  fallos.push(
    `el requisito de macOS no es el mismo en todo el sitio (el mínimo es ${MACOS_MINIMO}): ${requisitos.join(', ')}`
  )
else console.log(`ok  requisito · las ${paginas.length} páginas piden macOS ${MACOS_MINIMO} y ninguna otra versión`)

// --- El precio, junto al primer botón.
//
//     Doce euros al año —no al mes— es lo que más convence de toda la página, y
//     estaba solo en la FAQ, a varias pantallas del botón. Si vuelve a caerse de
//     ahí se pierde en silencio: la página sigue entera y deja de decirlo donde
//     se decide.
const portada = readFileSync('dist/index.html', 'utf8')
const desdeCTA = portada.indexOf('<a class="btn" href="/descarga">')
if (desdeCTA < 0) fallos.push('no hay CTA de descarga en el hero: no se puede comprobar el precio')
else if (!/12\s*€\s*al año/.test(visible(portada.slice(desdeCTA, desdeCTA + 800))))
  fallos.push('el precio ya no aparece junto al primer botón (se habrá quedado solo en la FAQ)')
else console.log('ok  precio · «12 € al año» va junto al CTA del hero')

// --- La medición es nuestra y de nadie más.
//
//     Dos piezas que se pierden en silencio si alguien las toca sin saber para
//     qué estaban —la página sigue funcionando igual, solo que ya no cuenta
//     nada—, así que se comprueban aquí en vez de confiar en la revisión:
//
//     1. El beacon de visitas, inline y contra nuestro propio servidor. Por eso
//        CA-NEG-9 sigue pasando ahí arriba: no hay nada que cargar de fuera.
//     2. El botón de descarga, que pasa por el contador. Si vuelve a apuntar
//        directo a GitHub se pierde el único dato de descargas reales que hay,
//        porque el contador de GitHub suma además cada actualización de Sparkle
//        (el appcast apunta al mismo .dmg) y las dos cifras quedan sumadas sin
//        poder separarlas.
const SERVIDOR = 'https://echo-licencias.make-algo.com'

const sinBeacon = paginas.filter((f) => !readFileSync(f, 'utf8').includes(`${SERVIDOR}/v1/visita`))
if (sinBeacon.length) fallos.push(`la medición de visitas no llega a: ${sinBeacon.join(', ')}`)
else console.log(`ok  medición · las ${paginas.length} páginas cuentan su visita en nuestro servidor`)

const DESCARGA = 'dist/descarga/index.html'
if (!existsSync(DESCARGA)) fallos.push(`no existe ${DESCARGA}`)
else if (!readFileSync(DESCARGA, 'utf8').includes(`<a class="btn" href="${SERVIDOR}/descargar?v=`))
  fallos.push('el botón de /descarga no pasa por el contador: las descargas dejarían de medirse')
else console.log('ok  medición · el botón de descarga pasa por el contador')

// Y que no se cuele una analítica de terceros por la puerta de atrás: la
// comprobación de arriba mira atributos de carga, y un fragmento de Google
// Analytics pegado en línea no tiene `src` que mirar.
const ANALITICAS = [
  'google-analytics.com',
  'googletagmanager.com',
  'cloudflareinsights.com',
  'plausible.io',
  'umami.is',
  'posthog.com',
  'segment.com',
  'hotjar.com',
  'matomo',
  'mixpanel',
  'clarity.ms',
]
const conAnalitica = []
for (const f of paginas) {
  const html = readFileSync(f, 'utf8').toLowerCase()
  for (const a of ANALITICAS) if (html.includes(a)) conAnalitica.push(`${f}: ${a}`)
}
if (conAnalitica.length)
  fallos.push(`CA-NEG-9: analítica de terceros en la página: ${conAnalitica.join(', ')}`)
else console.log('ok  CA-NEG-9 · ninguna analítica de terceros')

// --- Indexable desde el 15-09-2026 (decisión humana explícita en MAK-71): ninguna
//     página lleva `noindex`. Si alguien lo reintroduce sin que el humano lo pida
//     otra vez, el despliegue se cae aquí igual que antes se caía por lo contrario.
const conNoindex = paginas.filter(
  (f) => /<meta name="robots" content="noindex/.test(readFileSync(f, 'utf8'))
)
if (conNoindex.length) fallos.push(`noindex no debería estar en: ${conNoindex.join(', ')}`)
else console.log(`ok  sin noindex en las ${paginas.length} páginas construidas`)

// --- Y el robots.txt ya no bloquea el sitio. Volver a bloquearlo es una decisión
//     humana, así que si alguien lo toca sin pedirlo el despliegue se cae aquí.
const robots = readFileSync('dist/robots.txt', 'utf8')
if (/Disallow:\s*\/\s*$/m.test(robots))
  fallos.push('el robots.txt vuelve a bloquear el sitio')
else console.log('ok  robots.txt · el sitio es indexable')

// --- La imagen de Open Graph, en todas las rutas publicadas (MAK-231). Sin
//     ella cualquier enlace a echo en Slack, WhatsApp o X sale como una
//     tarjeta de texto gris. `/og` es el molde que genera la imagen, no una
//     ruta de la landing, así que queda fuera de esta comprobación.
const RUTAS_OG = ['dist/index.html', 'dist/descarga/index.html', 'dist/privacidad/index.html',
  'dist/aviso-legal/index.html', 'dist/condiciones/index.html', 'dist/404.html']
const sinOgImage = RUTAS_OG.filter((f) => !/<meta property="og:image" content="[^"]+"/.test(readFileSync(f, 'utf8')))
if (sinOgImage.length) fallos.push(`falta og:image en: ${sinOgImage.join(', ')}`)
else console.log(`ok  og:image · presente en las ${RUTAS_OG.length} rutas publicadas`)

// `/og` sí se construye y se publica, y el `robots.txt` del sitio permite
// todo: sin un `noindex` propio, el molde de la tarjeta acabaría indexado como
// si fuera una página de echo. El sitemap no basta — no es una lista de lo
// permitido, solo de lo sugerido.
const ogHtml = readFileSync('dist/og/index.html', 'utf8')
if (!/<meta name="robots" content="noindex/.test(ogHtml))
  fallos.push('dist/og/index.html se publica sin noindex: el molde de la tarjeta es indexable')
else console.log('ok  /og · el molde de la tarjeta lleva noindex y no se indexa')

if (!existsSync('public/og.png') && !existsSync('public/og.jpg'))
  fallos.push('no existe public/og.png (ni public/og.jpg)')
else {
  const ogFichero = existsSync('public/og.png') ? 'public/og.png' : 'public/og.jpg'
  const { size: ogSize } = statSync(ogFichero)
  if (ogSize > 300 * 1024) fallos.push(`${ogFichero} supera 300 KB (${(ogSize / 1024).toFixed(1)} KB)`)
  else console.log(`ok  ${ogFichero} · ${(ogSize / 1024).toFixed(1)} KB, por debajo de 300 KB`)
}

// --- Una sola URL indexable: el resto de páginas (404, gracias, legales) no
//     entran en el sitemap.
const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8')
const enSitemap = (sitemap.match(/<loc>([^<]*)<\/loc>/g) ?? []).length
if (enSitemap !== 1) fallos.push(`el sitemap tiene ${enSitemap} URL y debería tener una`)
else console.log('ok  sitemap · una sola URL')

if (fallos.length) {
  console.error('\nFALLA la comprobación de copy:\n' + fallos.map((f) => `  ✗ ${f}`).join('\n'))
  process.exit(1)
}

console.log('\nTodo correcto.')
