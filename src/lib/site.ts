import { DEFAULT_LOCALE, type Locale } from '../i18n/copy'

// Dominio propio servido desde la raíz (sin `base` en astro.config.mjs), pero
// ninguna ruta ni ningún asset se escribe como absoluto a mano: si el sitio
// vuelve a moverse (a un subdirectorio, a otro dominio), esto es lo único que
// hay que tocar. `BASE_URL` ya viene con la barra final que fija Astro.
const BASE = import.meta.env.BASE_URL

/**
 * Ruta interna respetando el `base` del sitio y, si se pasa, el idioma:
 * `url('/privacidad')` → `/privacidad` (español, en la raíz), `url('/', 'en')`
 * → `/en/`. Sin segundo argumento se comporta exactamente como antes de
 * MAK-274 — así ningún enlace a una página que todavía no existe en inglés
 * (descarga, privacidad, condiciones…) cambia de sitio por accidente.
 */
export function url(path: string, lang: Locale = DEFAULT_LOCALE): string {
  const prefijo = lang === DEFAULT_LOCALE ? '' : `${lang}/`
  return `${BASE.replace(/\/$/, '')}/${prefijo}${path.replace(/^\//, '')}`
}

/**
 * Las páginas legales, una ruta por idioma (sin el prefijo de idioma: se pasan
 * a `url(ruta, lang)`). Las inglesas son traducciones literales de las
 * españolas; existen para que todo lo que enlaza la web en inglés esté en
 * inglés, legales incluidas (los directorios internacionales lo exigen: TAAFT
 * devolvió la primera ficha por eso).
 */
export const RUTAS_LEGALES: Record<Locale, { avisoLegal: string; condiciones: string; privacidad: string }> = {
  es: { avisoLegal: '/aviso-legal', condiciones: '/condiciones', privacidad: '/privacidad' },
  en: { avisoLegal: '/legal-notice', condiciones: '/terms', privacidad: '/privacy' },
}

/** La misma ruta, absoluta. Necesaria en Open Graph y en el canonical. */
export function absoluteUrl(path: string, lang: Locale = DEFAULT_LOCALE): string {
  return new URL(url(path, lang), import.meta.env.SITE).href
}

/**
 * Nuestro servidor (el Worker de licencias). La landing lo usa para dos cosas: el botón de compra
 * y la medición —visitas y descargas—, que vive ahí y no en una analítica de terceros porque esta
 * web promete que no carga nada de fuera y `npm run verificar` lo comprueba en cada build.
 */
export const servidor = 'https://echo-licencias.make-algo.com'
