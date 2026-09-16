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
  ['microcopy del alta', 'Te escribimos cuando abramos tu tanda y nada más. Sin newsletter.'],
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
    `Te escribimos cuando abramos tu tanda y nada más. Sin newsletter. Te puedes borrar
     respondiendo a cualquier correo.`,
  ],
  [
    'CA-INT-3 · para quién NO es',
    `No te va a servir si dictas frases sueltas de vez en cuando (el dictado del Mac te sobra), si
     tu Mac no es Apple Silicon con macOS 26, o si lo que dictas está bajo secreto profesional y no
     puede salir de tu ordenador ni en texto: para eso hoy tendrías que usar echo con el pulido
     desactivado, y entonces te falta justo la parte que lo hace interesante.`,
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
]

// --- Criterios negativos: lo que no puede aparecer en la página.
const PROHIBIDAS = [
  ['CA-PRIV-4', ['100% privado', '100 % privado', 'totalmente local', 'totalmente privado']],
  ['CA-NEG-4/7 · competidores', ['Wispr', 'Superwhisper', 'Aqua Voice', 'Trustpilot']],
  ['CA-NEG-5 · múltiplos de velocidad', ['10x', '3x', 'x3', 'veces más rápido']],
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

  // --- Metadatos (CA-META-1, CA-META-2). Las variantes son pieles de la misma
  //     página: el título y la descripción aprobados son los mismos en las cuatro.
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''
  if (title !== 'echo — Dictado para Mac que escribe limpio')
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
  if (h2s.length !== 7) mal(ruta, `tiene ${h2s.length} <h2> y hacen falta siete`)
  const ROTULOS_H2 = [
    'qué hace distinto',
    'qué pasa cuando sueltas la tecla',
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

const paginas = ficheros('dist', '.html')
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
