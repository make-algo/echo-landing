import { es } from './es'
import { en } from './en'
import type { Copy } from './types'

export type { Copy }

/** `es` en la raíz (sin prefijo), `en` en `/en/`. Este orden es el orden de prioridad. */
export const LOCALES = ['es', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'es'

const COPY: Record<Locale, Copy> = { es, en }

export function getCopy(locale: Locale): Copy {
  return COPY[locale]
}
