#!/usr/bin/env node
/**
 * Genera las imágenes de Open Graph (1200×630) capturando cada molde de `src/pages/og*.astro`
 * con Playwright, sobre `astro preview` ya construido (MAK-231, extendido en MAK-264 a más de un
 * molde). Cada imagen usa exactamente los tokens del sitio y nunca se desincroniza a mano.
 *
 *   npm run build
 *   node scripts/generar-og.mjs
 *   npm run build   (para que dist/ incluya las imágenes ya generadas)
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { writeFileSync, statSync, existsSync } from 'node:fs'

const MOLDES = [
  { ruta: '/og', salida: 'public/og.png' },
  { ruta: '/og-invitacion', salida: 'public/og-invitacion.png' },
]

for (const { ruta, salida } of MOLDES) {
  const fichero = `dist${ruta}/index.html`
  if (!existsSync(fichero)) {
    console.error(`No existe ${fichero}. Ejecuta antes: npm run build`)
    process.exit(1)
  }
}

const preview = spawn('npx', ['astro', 'preview', '--port', '4321'], { stdio: 'pipe' })
let base = ''
await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('astro preview no arrancó a tiempo')), 20000)
  preview.stdout.on('data', (chunk) => {
    const texto = chunk.toString()
    const m = texto.match(/(https?:\/\/localhost:\d+)\//)
    if (m) {
      base = m[1]
      clearTimeout(timeout)
      resolve()
    }
  })
  preview.stderr.on('data', (chunk) => process.stderr.write(chunk))
})

try {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  for (const { ruta, salida } of MOLDES) {
    await page.goto(`${base}${ruta}`, { waitUntil: 'networkidle' })
    const buffer = await page.screenshot({ type: 'png' })
    writeFileSync(salida, buffer)
    const { size } = statSync(salida)
    console.log(`${salida} generado: ${(size / 1024).toFixed(1)} KB`)
    if (size > 300 * 1024) {
      console.error(`${salida} supera 300 KB.`)
      process.exitCode = 1
    }
  }
  await browser.close()
} finally {
  preview.kill()
}
