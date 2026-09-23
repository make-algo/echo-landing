#!/usr/bin/env node
/**
 * Comprueba que el CTA «Descargar echo» del héroe queda por encima del
 * pliegue a 1280×800 sin scroll (MAK-244, revisión — decisión de Álvaro).
 *
 * Arranca `astro preview` sobre `dist/` ya construido y mide con Playwright
 * el `boundingBox()` real del botón, igual que `scripts/generar-og.mjs`
 * arranca el servidor para capturar `/og`.
 *
 *   npm run build
 *   node scripts/verificar-pliegue.mjs
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

if (!existsSync('dist/index.html')) {
  console.error('No existe dist/index.html. Ejecuta antes: npm run build')
  process.exit(1)
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

const fallos = []
try {
  const browser = await chromium.launch()

  // El criterio en sí: a 1280×800 el botón entero está por encima de y=800.
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await page.goto(`${base}/`, { waitUntil: 'networkidle' })
    const box = await page.locator('a.btn').first().boundingBox()
    const fin = box.y + box.height
    if (fin > 800)
      fallos.push(`CTA a 1280×800: termina en y=${fin.toFixed(1)}px, por debajo del pliegue (800px)`)
    else console.log(`ok  CTA a 1280×800 · termina en y=${fin.toFixed(1)}px, dentro del pliegue`)
    await page.close()
  }

  // Los bordes del tramo tocado (1024 y 1439 px) tienen que seguir dentro,
  // y 1440 px queda fuera del recorte: el héroe no puede haber cambiado ahí.
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto(`${base}/`, { waitUntil: 'networkidle' })
    const fontSize = await page.evaluate(() => getComputedStyle(document.querySelector('.sucio')).fontSize)
    if (fontSize !== '67.84px')
      fallos.push(`MAK-244: a 1440px el tamaño de .sucio cambió (${fontSize}) — el recorte se salió del tramo 1024–1439px`)
    else console.log('ok  1440px · .sucio sigue en su tamaño original, fuera del tramo recortado')
    await page.close()
  }

  await browser.close()
} finally {
  preview.kill()
}

if (fallos.length) {
  console.error('\nFALLA la comprobación del pliegue:\n' + fallos.map((f) => `  ✗ ${f}`).join('\n'))
  process.exit(1)
}

console.log('\nTodo correcto.')
