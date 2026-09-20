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
  /**
   * Copy aprobado; lo único que se toca aquí es cómo se NOMBRA el producto.
   *
   * Siempre «echo, dictado para Mac», y siempre en minúscula. Dos reglas que
   * van juntas: el descriptor porque «echo» a secas compite en búsqueda con el
   * altavoz de Amazon y esa pelea no se gana; la minúscula porque es el
   * logotipo, es como se llama la app en el Mac de quien la instala y es el
   * copy aprobado de toda la página. Una marca, escrita igual en todas partes.
   */
  title: 'echo, dictado para Mac que escribe limpio',
  description:
    'echo, dictado para Mac: hablas y el texto aparece escrito y puntuado donde estabas. Transcripción local y pulido con tu suscripción de Claude o ChatGPT.',
} as const

/**
 * Nuestro servidor (el Worker de licencias). La landing lo usa para dos cosas: el botón de compra
 * y la medición —visitas y descargas—, que vive ahí y no en una analítica de terceros porque esta
 * web promete que no carga nada de fuera y `npm run verificar` lo comprueba en cada build.
 */
export const servidor = 'https://echo-licencias.make-algo.com'
