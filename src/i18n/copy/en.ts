import type { Copy } from './types'
import { es } from './es'

/**
 * Copy en inglés de la landing (MAK-274: infraestructura de dos idiomas).
 *
 * Provisional: reutiliza el texto en español hasta que la sub-issue 4 traiga
 * la traducción aprobada. Lo que importa de este fichero por ahora no es el
 * VALOR de cada cadena, sino que `en satisfies Copy`: si la sub-issue 4
 * traduce una clave y se deja otra sin tocar, o si `es.ts` gana una clave
 * nueva y esta no la sigue, no compila.
 */
export const en: Copy = { ...es }
