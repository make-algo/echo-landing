// Dominio propio servido desde la raíz (sin `base` en astro.config.mjs), pero
// ninguna ruta ni ningún asset se escribe como absoluto a mano: si el sitio
// vuelve a moverse (a un subdirectorio, a otro dominio), esto es lo único que
// hay que tocar. `BASE_URL` ya viene con la barra final que fija Astro.
const BASE = import.meta.env.BASE_URL

/** Ruta interna respetando el `base` del sitio: url('/privacidad') → '/privacidad' */
export function url(path: string): string {
  return `${BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

/** La misma ruta, absoluta. Necesaria en Open Graph y en el canonical. */
export function absoluteUrl(path: string): string {
  return new URL(url(path), import.meta.env.SITE).href
}

export const site = {
  // Copy aprobado. No se reescribe.
  title: 'echo — Dictado para Mac que escribe limpio',
  description:
    'Hablas y el texto aparece escrito y puntuado donde estabas escribiendo. Transcripción local; el pulido usa tu suscripción de Claude o ChatGPT.',
} as const
