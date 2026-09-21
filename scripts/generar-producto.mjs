#!/usr/bin/env node
/**
 * Redimensiona y comprime la píldora real de echo para servirla en la landing
 * (MAK-229). Las fuentes son los PNG en bruto que deja `--hud-preview` del
 * repo privado (MAK-228): fondo transparente, pero a 3x y sin comprimir —
 * pensados para mirarlos en desarrollo, no para servirlos.
 *
 * Genera, para cada pieza, AVIF + WebP + un PNG ya comprimido a la resolución
 * de pantalla retina (2x del tamaño con el que se pinta en la página) y
 * SOBREESCRIBE el PNG de origen con esa versión: el PNG que vive en
 * `public/producto/` a partir de aquí es el que se sirve, no el bruto de
 * `--hud-preview`. Si hace falta reprocesar con otro tamaño, hay que volver a
 * partir del PNG en bruto (rama `assets/pildora-mak229`, o regenerarlo con
 * `--hud-preview` en el repo privado) — de un PNG ya reducido no se puede
 * volver a subir la resolución.
 *
 *   node scripts/generar-producto.mjs
 */
import sharp from 'sharp'
import { statSync } from 'node:fs'

const DIR = 'public/producto'

/** anchoCss × altoCss: el tamaño con el que la imagen se pinta en la página
 *  (los atributos width/height del <img>, y de ahí sale su aspect-ratio). Se
 *  genera el archivo a 2x ese ancho para pantallas retina. */
const PIEZAS = [
  { slug: 'hud_listening', anchoCss: 320 },
  { slug: 'hud_polishing', anchoCss: 280 },
]

let totalKB = 0

for (const { slug, anchoCss } of PIEZAS) {
  const origen = `${DIR}/${slug}.png`
  const meta = await sharp(origen).metadata()
  const alto = Math.round((meta.height / meta.width) * anchoCss)
  const anchoArchivo = anchoCss * 2
  const altoArchivo = Math.round((meta.height / meta.width) * anchoArchivo)

  const base = sharp(origen).resize({ width: anchoArchivo })

  await base.clone().png({ compressionLevel: 9, effort: 10 }).toFile(`${DIR}/${slug}.png.tmp`)
  await base.clone().webp({ quality: 82, effort: 6 }).toFile(`${DIR}/${slug}.webp`)
  await base.clone().avif({ quality: 55, effort: 6 }).toFile(`${DIR}/${slug}.avif`)

  const { rename } = await import('node:fs/promises')
  await rename(`${DIR}/${slug}.png.tmp`, origen)

  for (const ext of ['png', 'webp', 'avif']) {
    const { size } = statSync(`${DIR}/${slug}.${ext}`)
    totalKB += size / 1024
    console.log(`${DIR}/${slug}.${ext}  ${anchoArchivo}×${altoArchivo}px  ${(size / 1024).toFixed(1)} KB`)
  }
  console.log(`  → en página: ${anchoCss}×${alto}px (width/height del <img>)`)
}

console.log(`\nTotal: ${totalKB.toFixed(1)} KB`)
