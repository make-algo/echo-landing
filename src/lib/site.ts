// La versión de prueba se sirve bajo /echo-landing/ en GitHub Pages, así que ninguna
// ruta ni ningún asset puede escribirse como absoluto desde la raíz del dominio.
// `BASE_URL` ya viene con la barra final que fija astro.config.mjs.
const BASE = import.meta.env.BASE_URL

/** Ruta interna respetando el `base` del sitio: url('/gracias') → '/echo-landing/gracias' */
export function url(path: string): string {
  return `${BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

/** La misma ruta, absoluta. Necesaria en Open Graph, en el canonical y en el `_next` del formulario. */
export function absoluteUrl(path: string): string {
  return new URL(url(path), import.meta.env.SITE).href
}

export const site = {
  // Copy aprobado. No se reescribe.
  title: 'echo — Dictado para Mac que escribe limpio',
  description:
    'Hablas y el texto aparece escrito y puntuado donde estabas escribiendo. Transcripción local; el pulido usa tu suscripción de Claude o ChatGPT.',
} as const

/**
 * Destino del formulario de lista de espera. No es un secreto: es una URL pública
 * de envío, y por eso puede ser `PUBLIC_`. La cuenta la crea un humano, porque es
 * un contrato con un encargado del tratamiento.
 *
 * Sin endpoint configurado el formulario NO finge: valida, muestra sus estados y
 * avisa de que todavía no está operativo. Nunca dice «apuntado» sin haber guardado
 * nada.
 */
export const formEndpoint: string = import.meta.env.PUBLIC_FORM_ENDPOINT ?? ''
