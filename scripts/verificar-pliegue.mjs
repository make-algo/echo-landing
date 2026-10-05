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

  // Desde el 05-10-2026 la apertura es una sola columna y el producto de la
  // primera pantalla es la demo (la ventana de correo en bucle): a 1440×900
  // tiene que empezar dentro del pliegue, para que se vea que hay producto.
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto(`${base}/`, { waitUntil: 'networkidle' })
    const box = await page.locator('.demo').boundingBox()
    if (box.y > 900 - 120)
      fallos.push(`demo a 1440×900: empieza en y=${box.y.toFixed(1)}px y no asoma en la primera pantalla`)
    else console.log(`ok  demo a 1440×900 · empieza en y=${box.y.toFixed(1)}px, asoma en la primera pantalla`)
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
