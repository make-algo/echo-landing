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
  ['tagline · MAK-230', 'Dictado para Mac. Hablas, y aparece escrito limpio donde estabas.'],
  // El espacio antes de la coma es el hueco que deja `visible()` al quitar el
  // `</strong>` que cierra «14 días gratis» — no hay hueco real en el HTML.
  ['condiciones bajo el CTA · MAK-244', '14 días gratis , luego 12 € al año. Mac con Apple Silicon y macOS 14 o posterior.'],
  ['comparación de velocidad · Tecleando', 'Tecleando ~40 palabras por minuto'],
  ['comparación de velocidad · Hablando', 'Hablando ~150 palabras por minuto'],
  ['entradilla de la comparativa', 'Estas cuatro cosas no las hace'],
  ['cierre de la comparativa', 'Si dictas frases sueltas y el dictado del Mac te vale, quédate con él. echo es para cuando dictas párrafos y te cansa editarlos después.'],
  ['párrafo de privacidad', 'Tu voz no sale nunca de tu Mac.'],
  ['línea de contacto', '¿Dudas o algo que no funciona? Escríbenos'],
]

// --- Las redacciones innegociables: copy aprobado que va literal o no va.
//     Se exigen SEGUIDAS, así que ninguna composición puede partirlas en dos
//     cajas con otra cosa en medio.
const INNEGOCIABLES = [
  [
    'CA-INT-1 · párrafo de privacidad',
    `Tu voz no sale nunca de tu Mac. Si activas el pulido, sale el texto —no el audio— hacia tu
     propia cuenta de Claude o ChatGPT. Sin pulido, no sale nada. No tenemos servidores ni
     guardamos lo que dictas.`,
  ],
  [
    'CA-INT-2 · cierre de la comparativa',
    `Si dictas frases sueltas y el dictado del Mac te vale, quédate con él. echo es para cuando
     dictas párrafos y te cansa editarlos después.`,
  ],
  [
    'MAK-243 · línea de contacto',
    `¿Dudas o algo que no funciona? Escríbenos`,
  ],
  [
    'titular · literal y entero',
    `Habla y aparece escrito. Sin muletillas, sin dictar la puntuación y sin cambiar de idioma.`,
  ],
  [
    'MAK-230 · tagline debajo del bloque limpio',
    `Dictado para Mac. Hablas, y aparece escrito limpio donde estabas.`,
  ],
  [
    'entradilla de la comparativa · anuncia cuatro',
    `El dictado de macOS es bueno y gratis. Estas cuatro cosas no las hace.`,
  ],
  [
    'MAK-245 · ejemplo del deploy, rescatado bajo «Idiomas mezclados»',
    `«deploy del backend en GitHub», no «depploy del Back and and Get Have».`,
  ],
  [
    'CA-CAR-5 · cuerpo de «Se pega donde ya escribes»',
    `Y con tu tono en cada una: en Ajustes le dices «en Slack, informal» o «escribe make-algo así», y
     lo aplica cada vez.`,
  ],
  [
    'MAK-230 · comparación de velocidad, fila «Tecleando»',
    `Tecleando ~40 palabras por minuto`,
  ],
  [
    'MAK-230 · comparación de velocidad, fila «Hablando»',
    `Hablando ~150 palabras por minuto`,
  ],
  [
    'MAK-244 · fuente de la comparación de velocidad',
    `Medias de referencia: habla conversacional frente a tecleo de un adulto sin formación.`,
  ],
  [
    // Mismo hueco artificial de `visible()` explicado junto a `ORDEN` arriba.
    'MAK-244 · condiciones en una línea bajo el CTA',
    `14 días gratis , luego 12 € al año. Mac con Apple Silicon y macOS 14 o posterior.`,
  ],
  [
    'MAK-247 · paso 1 «Se transcribe en tu Mac»',
    `Décimas de segundo, sin conexión.`,
  ],
  [
    'MAK-247 · paso 2 «Se pule con tu suscripción»',
    `Claude o ChatGPT, con tu sesión: 1,5 a 2,5 segundos, y solo cuando el texto lo necesita.`,
  ],
  [
    'MAK-247 · paso 3 «Se pega donde estabas»',
    `En la app activa, con el formato que le toca.`,
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
  // veces más rápido», vivía en prosa en «para quién es» (MAK-217) y desde
  // MAK-230 es la pieza visual del hero (comparación Tecleando/Hablando), con
  // su cifra de referencia (docs/gtm/02-propuesta-valor.md §4/§5.7/§5.11 y
  // docs/gtm/03-alcance-landing.md CA-NEG-5/CA-QUIEN-5 del repo privado)
  // siempre pegada, comprobada abajo como INNEGOCIABLE. La franja «Se pega
  // donde ya escribes» sigue prohibiéndolo del todo (CA-CAR-6), comprobado
  // más abajo solo sobre esa sección.
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
  [
    'MAK-243 · restos de la sección «Escríbenos» con formulario',
    [
      'No hay lista ni newsletter',
      '¿Para qué lo usas?',
      'rellénalas y dale a enviar',
      'Se lee todo',
    ],
  ],
  // CA-NEG-1 · la comparativa no vuelve a hablar de precio. «Por anunciar» era
  // la mitad nuestra de aquella fila y no aparece en ningún otro sitio del
  // copy, así que se puede prohibir en toda la página; «Gratis» no, porque «el
  // dictado de macOS es bueno y gratis» es copy aprobado.
  ['CA-NEG-1 · precio en la comparativa', ['Por anunciar']],
  // MAK-245 · «Qué hace distinto» se borra entera: la comparativa pasa a ser
  // la única sección de diferenciación de la página.
  ['MAK-245 · sección «Qué hace distinto» borrada', ['Qué hace distinto']],
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

  // --- CA-LOGO-1..5 (MAK-212, deroga CA-CAR-3/CA-CAR-4 de MAK-194): la franja
  //     «Se pega donde ya escribes» son seis piezas icono+etiqueta, y desde
  //     MAK-212 el icono es el logo real de la marca, no un dibujo genérico.
  const franja = html.match(/<section class="acto" id="donde-se-pega"[\s\S]*?<\/section>/)?.[0]
  if (!franja) mal(ruta, 'CA-CAR-1: no existe la sección #donde-se-pega')
  else {
    const piezas = (franja.match(/class="carrusel__pieza"/g) ?? []).length
    if (piezas !== 6) mal(ruta, `CA-LOGO-1: la franja tiene ${piezas} piezas y hacen falta seis`)
    // CA-CAR-6: esta franja no lleva multiplicador de velocidad, ni siquiera
    // el «4 veces» aprobado para «para quién es» — spec propia, sin excepción.
    if (/\d+\s*x\b|veces\s+más\s+rápido/i.test(visible(franja)))
      mal(ruta, 'CA-CAR-6: la franja «Se pega donde ya escribes» lleva un multiplicador de velocidad')
    // CA-LOGO-1: las seis piezas, en este orden exacto, con la etiqueta de
    // categoría (contenido accesible) y el nombre de marca exacto en el
    // `<title>` del SVG (decorativo, aria-hidden — CA-LOGO-5).
    const PIEZAS = [
      ['Gmail', 'Correo'],
      ['Slack', 'Chat de equipo'],
      ['GitHub', 'Issues y PRs'],
      ['VS Code', 'Editor de código'],
      ['Notion', 'Notas y documentos'],
      ['Linear', 'Gestión de producto'],
    ]
    let desdeEtiqueta = -1
    for (const [marca, etiqueta] of PIEZAS) {
      const donde = franja.indexOf(etiqueta)
      if (donde < 0) mal(ruta, `CA-LOGO-1: falta la etiqueta «${etiqueta}» en la franja`)
      else if (donde < desdeEtiqueta) mal(ruta, `CA-LOGO-1: «${etiqueta}» llega fuera de orden en la franja`)
      else desdeEtiqueta = donde
      if (!franja.includes(`<title>${marca}</title>`))
        mal(ruta, `CA-LOGO-1: falta el <title>${marca}</title> del logo en la franja`)
    }
    // CA-LOGO-3: ningún logo procede del CDN de un competidor.
    const CDN_COMPETIDORES = ['typeless', 'wisprflow', 'superwhisper', 'aquavoice']
    const cdnEncontrados = CDN_COMPETIDORES.filter((c) => franja.toLowerCase().includes(c))
    if (cdnEncontrados.length)
      mal(ruta, `CA-LOGO-3: la franja referencia un CDN de competidor: ${cdnEncontrados.join(', ')}`)
    // CA-LOGO-4: ninguna de las seis piezas nombra ni muestra un competidor de
    // dictado o un asistente de IA generalista.
    const COMPETIDORES_IA = ['ChatGPT', 'OpenAI', 'Claude', 'Perplexity', 'Copilot', 'Wispr', 'Superwhisper', 'Aqua Voice']
    const iaEncontrados = COMPETIDORES_IA.filter((c) => franja.toLowerCase().includes(c.toLowerCase()))
    if (iaEncontrados.length)
      mal(ruta, `CA-LOGO-4: la franja nombra un competidor/asistente de IA: ${iaEncontrados.join(', ')}`)
    // CA-LOGO-5: cada logo sigue siendo decorativo, con la etiqueta de texto
    // como único contenido accesible (hereda CA-CAR-8, sin cambio).
    const iconos = franja.match(/<svg class="carrusel__icono"[^>]*>/g) ?? []
    const sinAriaHidden = iconos.filter((s) => !/aria-hidden="true"/.test(s))
    if (iconos.length !== 6) mal(ruta, `CA-LOGO-1: hay ${iconos.length} logos y hacen falta seis`)
    if (sinAriaHidden.length) mal(ruta, `CA-LOGO-5: ${sinAriaHidden.length} logo(s) sin aria-hidden="true"`)
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

  // --- MAK-249: cuatro preguntas frecuentes, ni una más.
  const preguntas = (html.match(/<details class="qa">/g) ?? []).length
  if (preguntas !== 4) mal(ruta, `las preguntas frecuentes son ${preguntas} y hacen falta cuatro`)

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
  if (h2s.length !== 5) mal(ruta, `tiene ${h2s.length} <h2> y hacen falta cinco`)
  const ROTULOS_H2 = [
    'se pega donde ya escribes',
    'qué pasa cuando sueltas la tecla',
    'qué sale de tu mac y qué no',
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

// --- MAK-230/MAK-244 · la cifra y su fuente siguen juntas, y las dos en el hero.
//
//     Si la fuente vuelve a mudarse de sección, tiene que mudarse con la
//     cifra — y las dos filas de la comparación (Tecleando/Hablando) tienen
//     que seguir viviendo dentro del primer acto (el hero), no más abajo en
//     el scroll.
{
  const heroFin = portada.indexOf('id="donde-se-pega"')
  const desdeHablando = portada.indexOf('Hablando')
  if (heroFin < 0) fallos.push('MAK-230: no se encuentra el final del hero (#donde-se-pega)')
  else if (desdeHablando < 0 || desdeHablando > heroFin)
    fallos.push('MAK-230: la comparación de velocidad ya no vive dentro del hero')
  else {
    const entreFilaYFuente = visible(portada.slice(desdeHablando, desdeHablando + 600))
    if (!entreFilaYFuente.includes('Medias de referencia: habla conversacional frente a tecleo de un adulto sin formación.'))
      fallos.push('MAK-244: la fuente de la comparación de velocidad se separó de la cifra')
    else console.log('ok  MAK-230/MAK-244 · comparación de velocidad en el hero, cifra y fuente juntas')
  }
}

// --- MAK-244 · «donde estabas» aparece una sola vez en el héroe. Con el
//     subtítulo fuera, solo puede quedar en el tagline; si vuelve a
//     duplicarse es la sobreexplicación que prohíbe `tics-de-ia`.
{
  const heroFin = portada.indexOf('id="donde-se-pega"')
  if (heroFin < 0) fallos.push('MAK-244: no se encuentra el final del hero (#donde-se-pega)')
  else {
    const heroTexto = visible(portada.slice(0, heroFin))
    const apariciones = heroTexto.match(/donde estabas/g) ?? []
    if (apariciones.length !== 1)
      fallos.push(`MAK-244: «donde estabas» aparece ${apariciones.length} veces en el héroe y debe aparecer una sola`)
    else console.log('ok  MAK-244 · «donde estabas» aparece una sola vez en el héroe')
  }
}

// --- MAK-230 (revisión) · `.tach` nunca sobre un elemento `display: block`.
//
//     `correccion/tachado.ts` mide con `getClientRects()`: sobre un elemento
//     en línea da un rect POR LÍNEA VISUAL; sobre un bloque da un único rect,
//     el de toda la caja — el tachado sale mal (ancho de caja, no de texto;
//     altura de toda la caja, no de cada línea). Así se rompió la primera
//     vez: `.tach` iba sobre `.veloc__valor`, que es `display: block`. Esta
//     comprobación es estructural, no geométrica de verdad (este script no
//     abre un navegador) — la verificación de píxeles real se hizo a mano
//     con Chrome headless vía CDP antes de entregar; esto solo evita que la
//     misma combinación de clases vuelva a colarse en silencio.
if (/class="[^"]*\bveloc__valor\b[^"]*\btach\b[^"]*"|class="[^"]*\btach\b[^"]*\bveloc__valor\b[^"]*"/.test(portada))
  fallos.push('MAK-230: `.tach` va en el mismo elemento que `.veloc__valor` (display: block) — el tachado medido da un único rect por caja, no uno por línea')
else console.log('ok  MAK-230 · `.tach` de la comparación de velocidad va en un <span> en línea, no en el bloque')

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

// --- MAK-229 · la píldora real, en sus dos sitios, y sin que un refactor se
//     la lleve por delante en silencio: cada una en <picture> con AVIF/WebP
//     además del PNG, con width/height explícitos (CLS 0), y la del héroe con
//     fetchpriority="high" (no bloquea el render) mientras la del paso de
//     pulido va loading="lazy". El fichero tiene que existir de verdad en
//     dist/ (public/producto/ copiado tal cual al build) en los tres formatos.
{
  const PILDORAS = [
    {
      nombre: 'héroe · listening',
      slug: 'hud_listening',
      alt: 'La píldora de echo escuchando, con la onda de voz y el contador en 0:07.',
      carga: /fetchpriority="high"/,
    },
    {
      nombre: 'paso «Se pule con tu suscripción» · polishing',
      slug: 'hud_polishing',
      alt: 'Puliendo con Claude',
      carga: /loading="lazy"/,
    },
  ]
  for (const { nombre, slug, alt, carga } of PILDORAS) {
    const bloque = portada.match(new RegExp(`<picture[^>]*>[\\s\\S]*?${slug}\\.png[\\s\\S]*?</picture>`))?.[0]
    if (!bloque) {
      fallos.push(`MAK-229: no se encuentra el <picture> de ${nombre} (${slug}.png) en la portada`)
      continue
    }
    if (!bloque.includes(`${slug}.avif`)) fallos.push(`MAK-229: ${nombre} no tiene fuente AVIF`)
    if (!bloque.includes(`${slug}.webp`)) fallos.push(`MAK-229: ${nombre} no tiene fuente WebP`)
    if (!/width="\d+"/.test(bloque) || !/height="\d+"/.test(bloque))
      fallos.push(`MAK-229: ${nombre} no lleva width/height explícitos`)
    if (!bloque.includes(alt)) fallos.push(`MAK-229: ${nombre} no lleva el alt esperado («${alt}…»)`)
    if (!carga.test(bloque)) fallos.push(`MAK-229: ${nombre} no lleva el atributo de carga esperado (${carga})`)
    for (const ext of ['png', 'avif', 'webp']) {
      const ruta = `dist/producto/${slug}.${ext}`
      if (!existsSync(ruta)) fallos.push(`MAK-229: falta ${ruta}`)
    }
  }
  if (!fallos.some((f) => f.startsWith('MAK-229')))
    console.log('ok  MAK-229 · la píldora real está en el héroe y en el paso de pulido, con AVIF/WebP/PNG')
}

// --- MAK-247 · los tres pasos de «Qué pasa cuando sueltas la tecla», cada uno
//     en una línea: el cuerpo de cada paso (sin el título) no puede pasar de
//     20 palabras, y los dos tiempos («Décimas de segundo», «1,5 a 2,5
//     segundos») aparecen una sola vez en toda la página — antes se repetían
//     en la FAQ «¿Cuánto tarda?», que por eso se retiró.
{
  const pasosBloque = portada.match(/<h2[^>]*id="como-funciona"[\s\S]*?<\/ol>/)?.[0]
  if (!pasosBloque) fallos.push('MAK-247: no se encuentra la sección «Qué pasa cuando sueltas la tecla»')
  else {
    const cuerpos = [...pasosBloque.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(([, inner]) => visible(inner))
    if (cuerpos.length !== 3) fallos.push(`MAK-247: hay ${cuerpos.length} pasos y hacen falta tres`)
    for (const [i, cuerpo] of cuerpos.entries()) {
      const palabras = cuerpo.split(' ').filter(Boolean).length
      if (palabras > 20) fallos.push(`MAK-247: el paso ${i + 1} tiene ${palabras} palabras de cuerpo (máximo 20)`)
    }
    if (!fallos.some((f) => f.startsWith('MAK-247') && f.includes('palabras')))
      console.log('ok  MAK-247 · ningún paso pasa de 20 palabras de cuerpo')
  }

  const textoPortada = visible(portada)
  for (const tiempo of ['Décimas de segundo', '1,5 a 2,5 segundos']) {
    const veces = textoPortada.split(tiempo).length - 1
    if (veces !== 1) fallos.push(`MAK-247: «${tiempo}» aparece ${veces} veces en la página y debería aparecer una`)
  }
  if (!fallos.some((f) => f.startsWith('MAK-247') && f.includes('aparece')))
    console.log('ok  MAK-247 · los tiempos aparecen una sola vez en la página')
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
