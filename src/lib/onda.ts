/**
 * La envolvente de la grabación que organiza la variante «onda» (/a/).
 *
 * La página ES una grabación: una sesión de dictado de 42 segundos con sus
 * ráfagas y sus silencios. La pista de la izquierda dibuja esa envolvente a lo
 * largo de TODO el documento, el margen izquierdo de cada bloque de texto sale
 * de la amplitud en su punto, y los silencios entre secciones están medidos en
 * segundos de esa misma sesión. Un solo reloj para toda la página.
 *
 * Las barras NO son ruido. La envolvente se construye como se construye el habla
 * de verdad: frases con sus ataques y caídas, moduladas a ritmo silábico
 * (4,5 Hz), separadas por pausas reales. No es una grabación real —no tenemos
 * una— pero tampoco es aleatorio: el perfil es el de una voz, y las pausas están
 * donde estarían.
 */

/** Duración de la sesión, en segundos. El reloj de toda la página. */
export const DURACION = 47

/**
 * Las frases de la sesión: [inicio, fin, intensidad]. Cada frase es una sección
 * de la página y cada hueco entre dos frases es un silencio de verdad, que es lo
 * que se rotula entre sección y sección. La segunda es la que la demo transcribe:
 * dura 6,4 s, que es exactamente lo que se tarda en decir la frase del correo.
 */
const FRASES: Array<[number, number, number]> = [
  [1.6, 4.2, 0.55], //  apertura
  [6.1, 12.5, 1.0], //  la demo: la frase que se ve transcrita
  [14.3, 18.9, 0.72], // qué hace distinto
  [21.5, 25.4, 0.66], // qué pasa cuando sueltas la tecla
  [27.7, 32.6, 0.83], // la comparativa
  [34.3, 37.4, 0.6], //  privacidad y para quién
  [40.3, 44.1, 0.5], //  el alta y las preguntas
]

/** Instante en el que arranca la frase que la demo transcribe. */
export const INICIO_DICTADO = FRASES[1][0]

/**
 * Los siete tramos del dictado, en segundos desde que arranca la frase. Salen de
 * la misma envolvente: cuando suena una palabra hay amplitud, y en las pausas
 * entre tramos no la hay.
 */
const OFFSETS = [0.4, 1.1, 2.0, 4.3, 5.2, 5.9, 6.4]

/** Las marcas de tiempo de la transcripción, en el reloj de la sesión. */
export const TIEMPOS_DICTADO = OFFSETS.map((o) => INICIO_DICTADO + o)

/**
 * Los silencios entre frases, en orden. Son huecos reales de la envolvente, no
 * un espaciado elegido a ojo: por eso el blanco de esta página tiene unidad.
 */
export function silencios(): Array<{ desde: number; dur: number }> {
  const huecos = []
  for (let i = 1; i < FRASES.length; i++)
    huecos.push({ desde: FRASES[i - 1][1], dur: +(FRASES[i][0] - FRASES[i - 1][1]).toFixed(1) })
  huecos.push({ desde: FRASES[FRASES.length - 1][1], dur: +(DURACION - FRASES[FRASES.length - 1][1]).toFixed(1) })
  return huecos
}

/** Amplitud 0-1 en el segundo `t`. Cero fuera de las frases: eso es un silencio. */
function amplitud(t: number): number {
  for (const [inicio, fin, fuerza] of FRASES) {
    if (t < inicio || t > fin) continue
    const dentro = (t - inicio) / (fin - inicio)
    // Ataque rápido y caída larga, como una frase hablada.
    const sobre = Math.min(1, dentro / 0.06) * Math.min(1, (1 - dentro) / 0.18)
    // Modulación silábica: ~4,5 sílabas por segundo, que es el ritmo del
    // castellano hablado a velocidad normal.
    const silabas = 0.62 + 0.38 * Math.abs(Math.sin(Math.PI * 4.5 * (t - inicio)))
    // Acentos de palabra, más lentos, para que no salgan todas las sílabas iguales.
    const acento = 0.78 + 0.22 * Math.sin(Math.PI * 1.3 * (t - inicio) + fuerza)
    return Math.max(0, fuerza * sobre * silabas * acento)
  }
  return 0
}

/** `n` muestras de la envolvente, de 0 a 1, repartidas por toda la sesión. */
export function envolvente(n = 220): number[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * DURACION
    // Cada barra es el pico de su ventana, no una muestra suelta: así una
    // ráfaga corta no desaparece por caer entre dos muestras.
    const paso = DURACION / (n - 1) / 4
    return Math.max(amplitud(t - paso), amplitud(t), amplitud(t + paso))
  })
}

/** `00:04,3` — el formato de las marcas de tiempo de la pista. */
export function marca(t: number): string {
  // Se redondea a la décima ANTES de partir: 6,1 + 1,1 en coma flotante es
  // 7,199999… y sin esto la marca diría 00:07,1 donde la pista dice 00:07,2.
  const r = Math.round(t * 10) / 10
  const m = Math.floor(r / 60)
  const s = r - m * 60
  const entero = Math.floor(s)
  const decima = Math.round((s - entero) * 10)
  return `${String(m).padStart(2, '0')}:${String(entero).padStart(2, '0')},${decima}`
}

/** `00:04` — sin décimas, para el cabezal. */
export function marcaCorta(t: number): string {
  const m = Math.floor(t / 60)
  const s = Math.floor(t - m * 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
