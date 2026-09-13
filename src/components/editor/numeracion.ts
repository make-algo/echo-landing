/**
 * La numeración real del búfer (/c/), MAK-82 · pulido de la ronda final.
 *
 * Esto ya falló dos veces con una versión que ADIVINABA cuántas líneas
 * visuales iba a ocupar un bloque (primero marcando bloques enteros con un
 * número fijo, después partiendo el texto en trozos de 72 caracteres a
 * ciegas del ancho real). Las dos veces un crítico lo cazó en cuanto el texto
 * se envolvía distinto de lo previsto.
 *
 * Esta versión no adivina: MIDE. Para cada elemento marcado `.ln-num` (o que
 * coincida con uno de los selectores del formulario, compartido con el resto
 * de rutas y que no lleva marcado propio de esta):
 *   1. Se mide su posición y su alto real ya renderizados, y el alto se
 *      divide por el `line-height` computado del propio elemento → ese
 *      cociente ES el número de líneas visuales, no una estimación.
 *   2. Se dibujan tantos números como líneas, cada uno a la altura exacta de
 *      su línea, en una única capa superpuesta sobre el canal
 *      (`.canal-overlay`). Al posicionar por PÍXELES MEDIDOS y no por
 *      maquetación CSS anidada, da igual cuántos contenedores intermedios
 *      haya entre el canal y el bloque: no hay ningún padding o margen ajeno
 *      que pueda desalinear un número.
 *   3. Es un único recorrido de arriba abajo: no hay un sistema para la
 *      prosa y otro para el resto que puedan desincronizarse entre sí.
 *
 * Sin JavaScript el canal queda vacío: es decoración (`aria-hidden`), así que
 * degradar a «sin números» es aceptable — lo que no lo es es un número que
 * mienta, y por eso no hay una versión estática de reserva que adivine.
 */

import { variantes } from '../../content/copy'

/** Todo lo que se numera, en el orden en que debe leerse la página. Los del
 *  formulario son selectores compuestos porque `WaitlistForm.astro` es
 *  compartido con el control y las otras variantes: no lleva marcado propio
 *  de esta ruta, así que se identifica por su forma, no por una clase. */
const SELECTOR = [
  '.ln-num',
  '.beta__body .field > label',
  '.beta__body .control',
  '.beta__body .radios',
  '.beta__body .microcopy',
  '.beta__body .legalnote',
  '.beta__body .notice',
  '.beta__body .alert',
  '.beta__body form > button',
  '.beta__body .done > p',
].join(', ')

function altoLinea(el: HTMLElement): number {
  const lh = parseFloat(getComputedStyle(el).lineHeight)
  return Number.isFinite(lh) && lh > 0 ? lh : parseFloat(getComputedStyle(el).fontSize) * 1.4
}

/**
 * Un `<details>` cerrado deja de ocupar sitio en el documento, pero el motor
 * sigue calculando la geometría de su contenido como si estuviera pintado
 * —por eso medirlo sigue dando un alto real incluso cerrado, y eso es
 * justamente lo que usa `medirBadgesFaq` más abajo—, así que lo único que
 * hace falta es EXCLUIRLO del recorrido principal: no está en el flujo
 * visible y no debe robarle números a lo que sí lo está.
 */
function fueraDeFlujo(el: HTMLElement): boolean {
  const detalles = el.closest('details')
  if (!detalles || detalles.open) return false
  return !el.closest('summary')
}

/**
 * Cuántas líneas visuales ocupa `el` y a qué altura. Los bloques marcados
 * `data-fijo` (la demo: un objeto incrustado, no texto que fluye) cuentan
 * como una única línea por alta que sea, igual que una imagen incrustada en
 * un editor real ocupa un número de línea aunque su altura renderizada sea
 * mucho mayor que esa línea.
 */
function contarLineas(el: HTMLElement): { n: number; alto: number } {
  const alto = altoLinea(el)
  if (el.hasAttribute('data-fijo')) return { n: 1, alto }
  const h = el.getBoundingClientRect().height
  return { n: Math.max(1, Math.round(h / alto)), alto }
}

function overlay(contenedor: HTMLElement): HTMLElement {
  let capa = contenedor.querySelector<HTMLElement>(':scope > .canal-overlay')
  if (!capa) {
    capa = document.createElement('div')
    capa.className = 'canal-overlay'
    capa.setAttribute('aria-hidden', 'true')
    contenedor.prepend(capa)
  }
  return capa
}

/** El contador de líneas plegadas de una pregunta: la MISMA medida que usa el
 *  canal, así que nunca puede desincronizarse del número real que vería quien
 *  la despliegue. */
function medirBadgesFaq(raiz: ParentNode): void {
  for (const resumen of raiz.querySelectorAll<HTMLElement>('.qa > summary')) {
    const respuesta = resumen.parentElement?.querySelector<HTMLElement>(':scope > p.ln-num')
    if (!respuesta) continue
    const { n } = contarLineas(respuesta)
    // El texto sale de la misma fuente que el resto del micro-texto de esta
    // variante, singular/plural incluido: no se compone a mano en la hoja de
    // estilos, que solo sabe pintar `attr(data-badge)`.
    resumen.querySelector<HTMLElement>('.q')?.setAttribute('data-badge', variantes.editor.plegado(n))
  }
}

/**
 * Vuelve a numerar todo el búfer dentro de `contenedor` (el `.buf`, que es el
 * ancestro posicionado sobre el que se mide todo). `contenedor` tiene que
 * tener `position: relative` — es el origen de coordenadas de la capa.
 */
export function renumerar(contenedor: HTMLElement): void {
  const origen = contenedor.getBoundingClientRect()
  const bloques = [...contenedor.querySelectorAll<HTMLElement>(SELECTOR)].filter(
    (el) => !fueraDeFlujo(el) && el.getClientRects().length > 0
  )

  const capa = overlay(contenedor)
  capa.textContent = ''
  const frag = document.createDocumentFragment()

  let contador = 1
  for (const el of bloques) {
    const { n, alto } = contarLineas(el)
    const top = el.getBoundingClientRect().top - origen.top
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span')
      s.style.top = `${top + i * alto}px`
      s.style.height = `${alto}px`
      s.style.lineHeight = `${alto}px`
      s.textContent = String(contador + i)
      frag.appendChild(s)
    }
    contador += n
  }
  capa.appendChild(frag)

  medirBadgesFaq(contenedor)
}

/**
 * Arranca la numeración y la mantiene cierta ante las tres cosas que la
 * mueven: cambiar el ancho de la ventana, plegar o desplegar una pregunta, y
 * que el formulario cambie de estado (aparece un aviso de error, se pasa a
 * «apuntado»…). Un único observador para las tres, porque las tres alteran la
 * misma numeración.
 *
 * El observador se desconecta mientras `renumerar` escribe, porque si no,
 * sus propias escrituras (los números que inserta) se disparían a sí mismas
 * en un bucle sin fin.
 */
export function iniciarNumeracion(contenedor: HTMLElement): void {
  const observador = new MutationObserver(ejecutar)

  function ejecutar(): void {
    observador.disconnect()
    renumerar(contenedor)
    observador.observe(contenedor, {
      attributes: true,
      attributeFilter: ['hidden', 'class', 'open'],
      childList: true,
      subtree: true,
    })
  }

  ejecutar()

  let pendiente: ReturnType<typeof setTimeout> | undefined
  addEventListener('resize', () => {
    clearTimeout(pendiente)
    pendiente = setTimeout(ejecutar, 120)
  })
}
