/**
 * El tachado medido de corrección (MAK-85 · pulido de la propagación).
 *
 * Un `<span>` tachado con `text-decoration: line-through` se rompe en cuanto la
 * frase envuelve línea, y un `line-through` sí resuelve eso — pero un crítico a
 * ciegas lo leyó como «CSS de manual, no intención editorial». La jugada que ya
 * salvó la numeración de editor (MAK-82) se repite aquí: MEDIR el rectángulo
 * real ya renderizado —`getClientRects()`, un rect por línea visual, nunca
 * `getBoundingClientRect()`— y dibujar el trazo ahí, con una imperfección
 * orgánica determinista por palabra (misma palabra, mismo trazo siempre; si no,
 * cada resize redibuja un tachado tembloroso).
 *
 * Progresivo, nunca todo o nada: `text-decoration: line-through` es la base en
 * CSS y sigue viéndose si JavaScript no corre. Solo cuando el trazo medido
 * termina de dibujarse, el elemento recibe `.tach--medido`, que es lo único que
 * apaga el `text-decoration` nativo.
 */

const SELECTOR = '.tach, .corr .mal'

/** PRNG determinista de 32 bits (mulberry32). */
function mulberry32(semilla: number): () => number {
  let a = semilla
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Semilla estable a partir del propio texto: la misma palabra, el mismo trazo. */
function semillaDe(texto: string): number {
  let h = 0
  for (let i = 0; i < texto.length; i++) h = (Math.imul(h, 31) + texto.charCodeAt(i)) | 0
  return h
}

/** El ancestro sobre el que se miden las coordenadas: el bloque de composición
 *  más cercano, no el body entero. */
function raizDe(el: HTMLElement): HTMLElement {
  return (el.closest('.acto, .apertura') as HTMLElement) ?? (el.parentElement as HTMLElement)
}

function capaDe(raiz: HTMLElement): SVGSVGElement {
  let capa = raiz.querySelector<SVGSVGElement>(':scope > svg.tachado-overlay')
  if (!capa) {
    capa = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement
    capa.setAttribute('class', 'tachado-overlay')
    capa.setAttribute('aria-hidden', 'true')
    raiz.prepend(capa)
  }
  return capa
}

/** Un trazo por rect: curva cuadrática con el punto de control desplazado y una
 *  ligera rotación sobre su propio eje — la imperfección de un filete real, no
 *  una línea recta perfecta, pero anclada a coordenadas medidas. */
function trazo(rect: DOMRect, origen: DOMRect, azar: () => number): SVGPathElement {
  const x0 = rect.left - origen.left
  const x1 = rect.right - origen.left
  // 55–60 % de la altura: la posición óptica de un tachado, no el centro exacto.
  const y = rect.top - origen.top + rect.height * (0.55 + azar() * 0.05)
  const centro = { x: (x0 + x1) / 2, y }
  const ctrl = {
    x: x0 + (x1 - x0) * (0.3 + azar() * 0.4),
    y: y + (azar() - 0.5) * 4,
  }
  const rot = ((azar() - 0.5) * 3 * Math.PI) / 180 // ±1,5°
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)
  const girar = (px: number, py: number): [number, number] => {
    const dx = px - centro.x
    const dy = py - centro.y
    return [centro.x + dx * cos - dy * sin, centro.y + dx * sin + dy * cos]
  }
  const [gx0, gy0] = girar(x0, y)
  const [gx1, gy1] = girar(x1, y)
  const [gcx, gcy] = girar(ctrl.x, ctrl.y)

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', `M ${gx0.toFixed(1)} ${gy0.toFixed(1)} Q ${gcx.toFixed(1)} ${gcy.toFixed(1)} ${gx1.toFixed(1)} ${gy1.toFixed(1)}`)
  path.setAttribute('stroke-width', (2.5 + azar()).toFixed(2))
  return path
}

function dibujar(el: HTMLElement): void {
  const raiz = raizDe(el)
  if (!raiz) return
  if (getComputedStyle(raiz).position === 'static') raiz.style.position = 'relative'
  const capa = capaDe(raiz)
  const origen = raiz.getBoundingClientRect()
  capa.setAttribute('width', String(origen.width))
  capa.setAttribute('height', String(origen.height))
  capa.setAttribute('viewBox', `0 0 ${origen.width} ${origen.height}`)

  const azar = mulberry32(semillaDe(el.textContent ?? ''))
  for (const rect of el.getClientRects()) {
    if (rect.width === 0 || rect.height === 0) continue
    capa.appendChild(trazo(rect, origen, azar))
  }
  el.classList.add('tach--medido')
}

function limpiarCapas(contenedor: HTMLElement): void {
  for (const capa of contenedor.querySelectorAll('svg.tachado-overlay')) capa.remove()
}

function repintar(contenedor: HTMLElement): void {
  for (const el of contenedor.querySelectorAll<HTMLElement>(SELECTOR)) el.classList.remove('tach--medido')
  limpiarCapas(contenedor)
  for (const el of contenedor.querySelectorAll<HTMLElement>(SELECTOR)) dibujar(el)
}

/** Arranca el tachado medido y lo mantiene cierto ante lo que mueve el ancho de
 *  las palabras: la carga de la fuente real, el redimensionado de ventana y
 *  el propio contenido cambiando de alto bajo el trazo (la demo del ciclo
 *  bruto/final, la píldora que carga tarde). */
export function iniciarTachado(contenedor: HTMLElement): void {
  repintar(contenedor)
  document.fonts?.ready.then(() => repintar(contenedor))

  let pendiente: ReturnType<typeof setTimeout> | undefined
  const repintarConDebounce = () => {
    clearTimeout(pendiente)
    pendiente = setTimeout(() => repintar(contenedor), 120)
  }

  addEventListener('resize', repintarConDebounce)

  if (typeof ResizeObserver !== 'undefined') {
    const observador = new ResizeObserver(repintarConDebounce)
    for (const raiz of contenedor.querySelectorAll<HTMLElement>('.acto, .apertura')) {
      observador.observe(raiz)
    }
    if (contenedor.matches('.acto, .apertura')) observador.observe(contenedor)
  }
}
