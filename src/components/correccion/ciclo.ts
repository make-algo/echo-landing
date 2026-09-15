/**
 * El ciclo del hero: se dicta tecleando, se corrige, se pega (MAK-129).
 *
 * mak-113 fijó «echo pega, no teclea letra a letra» para evitar un efecto de
 * máquina de escribir sobre texto que iba a tacharse encima. Álvaro, viendo el
 * resultado construido, pidió justo ese efecto para la fase de dictado (ver
 * docs/product/mak-128-tecleo-antes-de-corregir.md) — la corrección posterior
 * sigue igual, tal cual.
 *
 * Cada carácter del panel ya está en el DOM desde el primer fotograma (en su
 * propio `.cc`, ver `index.astro`), así que revelarlo es solo alternar
 * opacidad: el bloque nunca cambia de tamaño mientras «teclea» (CLS 0). El
 * resto de fases (corrección, pegado, sostenido) las marca un atributo
 * `data-fase` en la raíz, que es lo que lee `correccion.css`.
 *
 * Sin JavaScript o con `prefers-reduced-motion: reduce`, esta función no
 * arranca nada: el valor por defecto de esas reglas ya es el fotograma final
 * (el mismo `<Escrito />` de siempre), igual que exige mak-113 §4.
 */

const MS_POR_CARACTER = 34 // dentro del rango 30–45 ms/carácter de la spec
const RETRASO_INICIAL = 450 // el panel se asienta antes de que arranque el tecleo
const DURACION_CORRECCION = 2800 // cubre el último `--d` (1.6 s) más su vaivén
const DURACION_PEGADO = 500
const DURACION_SOSTENIDO = 6000
const PAUSA_REINICIO = 500

export function iniciarCiclo(raiz: HTMLElement): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const caracteres = Array.from(raiz.querySelectorAll<HTMLElement>('.ciclo__texto .cc'))
  const marcas = Array.from(raiz.querySelectorAll<HTMLElement>('.ciclo__tach, .ciclo__ins'))
  if (caracteres.length === 0) return

  function teclea(indice: number): void {
    if (indice >= caracteres.length) {
      raiz.dataset.fase = 'correccion'
      for (const m of marcas) m.classList.add('marca-on')
      setTimeout(() => {
        raiz.dataset.fase = 'pegado'
        setTimeout(() => {
          raiz.dataset.fase = 'sostenido'
          setTimeout(reinicia, DURACION_SOSTENIDO)
        }, DURACION_PEGADO)
      }, DURACION_CORRECCION)
      return
    }
    caracteres[indice].classList.add('cc--on')
    setTimeout(() => teclea(indice + 1), MS_POR_CARACTER)
  }

  function reinicia(): void {
    for (const c of caracteres) c.classList.remove('cc--on')
    for (const m of marcas) m.classList.remove('marca-on')
    raiz.dataset.fase = 'reposo'
    setTimeout(arranca, PAUSA_REINICIO)
  }

  function arranca(): void {
    raiz.dataset.fase = 'tecleo'
    setTimeout(() => teclea(0), RETRASO_INICIAL)
  }

  arranca()
}
