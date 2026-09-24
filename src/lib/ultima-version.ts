/**
 * La versión que ofrece la web sale del canal de actualizaciones, no de una
 * constante escrita a mano.
 *
 * El problema que resuelve: hasta la 1.0.4, `/descarga` llevaba la versión, el
 * tamaño y el SHA-256 copiados a mano en el propio `.astro`. Publicar una
 * versión actualizaba el canal de Sparkle pero no la página, así que la web
 * ofreció la 1.0.2 durante tres días mientras el canal ya servía la 1.0.4:
 * quien llegaba por la web se descargaba una versión vieja y esperaba a que
 * Sparkle le ofreciera las dos siguientes.
 *
 * Ahora los dos datos vienen de lo que escribe el propio publicador
 * (`scripts/publicar-actualizacion.sh`, en el repo de la app) en este mismo
 * repositorio, en el mismo commit:
 *
 *   - `public/appcast.xml`   el canal de Sparkle: manda. De aquí salen la
 *                            versión, el nombre del instalador y el tamaño.
 *   - `public/descarga.json` lo único que el appcast no lleva: el SHA-256 que
 *                            la página publica para poder comprobar el archivo.
 *
 * Ese commit dispara el despliegue de Pages, así que la web se actualiza sola
 * al publicar. Y como el appcast manda, si el JSON se queda atrás —o alguien lo
 * edita a mano— la compilación falla aquí en vez de publicar un hash que no
 * corresponde al archivo que se descarga.
 */
import { readFileSync } from 'node:fs'

const raiz = new URL('../../', import.meta.url)
const leer = (relativa: string) => readFileSync(new URL(relativa, raiz), 'utf8')

export type VersionPublicada = {
  /** Versión de cara al usuario: «1.0.4». */
  version: string
  /** Número de build de Sparkle; es lo que ordena el canal. */
  build: number
  /** Nombre del instalador tal y como está publicado: «echo-1.0.4.dmg». */
  archivo: string
  bytes: number
  /** El tamaño como se escribe en la página: «13,1». */
  mb: string
  sha256: string
}

/** Las entradas del appcast, de la más nueva a la más vieja. */
function delAppcast() {
  const xml = leer('public/appcast.xml')
  const entradas = xml.split('<item>').slice(1).map((item) => {
    // Cada entrada trae el .dmg completo y sus deltas; el completo es el único
    // `enclosure` sin `sparkle:deltaFrom`.
    const completo = [...item.matchAll(/<enclosure\b[^>]*>/g)]
      .map(([e]) => e)
      .find((e) => !e.includes('sparkle:deltaFrom'))
    return {
      build: Number(item.match(/<sparkle:version>(\d+)</)?.[1]),
      version: item.match(/<sparkle:shortVersionString>([^<]+)</)?.[1],
      archivo: completo?.match(/url="([^"]+)"/)?.[1]?.split('/').pop(),
      bytes: Number(completo?.match(/length="(\d+)"/)?.[1]),
    }
  })
  if (!entradas.length) throw new Error('public/appcast.xml no tiene ninguna entrada <item>')
  return entradas.sort((a, b) => b.build - a.build)
}

/** La versión que la web debe ofrecer: la más nueva del canal de actualizaciones. */
export function ultimaVersion(): VersionPublicada {
  const [nueva] = delAppcast()
  if (!nueva.version || !nueva.archivo || !Number.isFinite(nueva.build) || !nueva.bytes)
    throw new Error(
      `public/appcast.xml: la entrada más nueva está incompleta (${JSON.stringify(nueva)})`
    )

  const manifiesto = JSON.parse(leer('public/descarga.json'))
  if (manifiesto.version !== nueva.version)
    throw new Error(
      `public/descarga.json va por la ${manifiesto.version} y el canal ya sirve la ` +
        `${nueva.version}: el SHA-256 no sería del archivo que se descarga. Los escribe ` +
        '`scripts/publicar-actualizacion.sh` (repo de la app) en el mismo commit; si has ' +
        'subido el appcast a mano, actualiza también el JSON.'
    )
  if (!/^[0-9a-f]{64}$/.test(manifiesto.sha256 ?? ''))
    throw new Error(`public/descarga.json: sha256 no parece un SHA-256: ${manifiesto.sha256}`)

  return {
    version: nueva.version,
    build: nueva.build,
    archivo: nueva.archivo,
    bytes: nueva.bytes,
    mb: (nueva.bytes / 1024 / 1024).toFixed(1).replace('.', ','),
    sha256: manifiesto.sha256,
  }
}
