// La versión de prueba se sirve bajo /echo-landing/ en GitHub Pages, así que ninguna
// ruta ni ningún asset puede escribirse como absoluto desde la raíz del dominio.
// `BASE_URL` ya viene con la barra final que fija astro.config.mjs.
const BASE = import.meta.env.BASE_URL

/** Ruta interna respetando el `base` del sitio: url('/favicon.svg') → '/echo-landing/favicon.svg' */
export function url(path: string): string {
  return `${BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

/** La misma ruta, absoluta. Necesaria en Open Graph y en el canonical. */
export function absoluteUrl(path: string): string {
  return new URL(url(path), import.meta.env.SITE).href
}

export const site = {
  // Copy literal de docs/gtm/02-propuesta-valor.md §6 (repo privado). No se reescribe.
  title: 'echo — Dictado para Mac que escribe limpio',
  description:
    'Hablas y el texto aparece escrito y puntuado donde estabas escribiendo. Transcripción local; el pulido usa tu suscripción de Claude o ChatGPT.',
} as const
