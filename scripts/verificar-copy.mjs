#!/usr/bin/env node
/**
 * Comprobación automática del copy sobre el HTML generado (CA-INT-5, CA-NEG-*).
 *
 * Falla si alguna de las tres redacciones innegociables no aparece literal en `/`,
 * o si aparece alguna de las cadenas prohibidas. Es lo que hace que esto no dependa
 * de que alguien se acuerde en la revisión.
 *
 *   npm run build && npm run verificar
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const HTML = 'dist/index.html'

if (!existsSync(HTML)) {
  console.error(`No existe ${HTML}. Ejecuta primero: npm run build`)
  process.exit(1)
}

/** Texto visible, sin etiquetas ni comentarios, con los espacios normalizados. */
const texto = readFileSync(HTML, 'utf8')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&laquo;/g, '«')
  .replace(/&raquo;/g, '»')
  .replace(/&#8212;|&mdash;/g, '—')
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const norm = (s) => s.replace(/\s+/g, ' ').trim()

// --- Las tres redacciones innegociables: copy aprobado que va literal o no va.
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
    'pie de la demo · una sola línea',
    `Mantienes una tecla, hablas, la sueltas. Recreación de la interfaz; el vídeo real llega con la
     beta.`,
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

]

const fallos = []

for (const [nombre, esperado] of INNEGOCIABLES) {
  if (!texto.includes(norm(esperado))) fallos.push(`${nombre}: NO aparece literal en ${HTML}`)
  else console.log(`ok  ${nombre}`)
}

const bajo = texto.toLowerCase()
for (const [nombre, cadenas] of PROHIBIDAS) {
  const encontradas = cadenas.filter((c) => bajo.includes(c.toLowerCase()))
  if (encontradas.length) fallos.push(`${nombre}: aparece ${encontradas.map((c) => `«${c}»`).join(', ')}`)
  else console.log(`ok  ${nombre}`)
}

// --- Metadatos (CA-META-1, CA-META-2)
const html = readFileSync(HTML, 'utf8')
const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''

if (title !== 'echo — Dictado para Mac que escribe limpio')
  fallos.push(`CA-META-1: el <title> no es el aprobado (es «${title}»)`)
else if (title.length > 60) fallos.push(`CA-META-1: el <title> supera 60 caracteres (${title.length})`)
else console.log(`ok  CA-META-1 · title (${title.length} caracteres)`)

if (description.length === 0 || description.length > 155)
  fallos.push(`CA-META-2: la meta description mide ${description.length} caracteres`)
else console.log(`ok  CA-META-2 · description (${description.length} caracteres)`)

// --- CA-NEG-1 · ningún precio dentro de la comparativa. Se mira la tabla, no
//     la página: «el dictado que trae macOS es bueno, es gratis y ha mejorado»
//     es copy aprobado sobre el rival y tiene que seguir pasando. Lo que no
//     puede volver es la fila «Precio — Gratis / Por anunciar», que enfrentaba
//     un hecho del rival con un interrogante nuestro en la única pieza cuya
//     función es ganar.
const tabla = html.match(/<table[\s\S]*?<\/table>/)?.[0] ?? ''
const precios = ['Precio', 'Gratis', 'Por anunciar'].filter((c) => tabla.includes(c))
if (precios.length)
  fallos.push(`CA-NEG-1: la comparativa vuelve a hablar de precio (${precios.join(', ')})`)
else console.log('ok  CA-NEG-1 · ningún precio en la comparativa')

// --- La entradilla anuncia «las cuatro cosas que no hace»: la tabla tiene que
//     tener exactamente cuatro filas. Si se añade una quinta, hay que cambiar
//     también el número de la entradilla, y hasta entonces esto falla.
const filas = (html.match(/<tr[^>]*>\s*<th[^>]*scope="row"/g) ?? []).length
if (filas !== 4) fallos.push(`La comparativa tiene ${filas} filas y la entradilla anuncia cuatro`)
else console.log('ok  comparativa · cuatro filas, como dice la entradilla')

// --- CA-ENV-3 · el honeypot tiene que llamarse como el campo nativo del
//     proveedor. Con otro nombre el antispam no hace nada y no se nota hasta
//     que llega el spam.
if (!/name="_gotcha"/.test(html)) fallos.push('CA-ENV-3: el honeypot no se llama _gotcha')
else console.log('ok  CA-ENV-3 · honeypot con el nombre que lee el proveedor')

// --- El sitio no puede contradecirse sobre quién procesa el formulario.
if (/proveedor por (decidir|confirmar)/.test(html))
  fallos.push('El formulario sigue diciendo que el proveedor está sin decidir')
else console.log('ok  un solo relato sobre quién procesa el formulario')

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

const PROPIO = 'https://make-algo.github.io/'
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

// --- Ninguna página de la versión de prueba se indexa
const sinNoindex = paginas.filter(
  (f) => !/<meta name="robots" content="noindex/.test(readFileSync(f, 'utf8'))
)
if (sinNoindex.length) fallos.push(`Falta el noindex en: ${sinNoindex.join(', ')}`)
else console.log(`ok  noindex en las ${paginas.length} páginas construidas`)

if (fallos.length) {
  console.error('\nFALLA la comprobación de copy:\n' + fallos.map((f) => `  ✗ ${f}`).join('\n'))
  process.exit(1)
}

console.log('\nTodo correcto.')
