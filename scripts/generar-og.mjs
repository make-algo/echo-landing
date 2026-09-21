#!/usr/bin/env node
/**
 * Genera `public/og.png` (1200×630) capturando `src/pages/og.astro` con
 * Playwright, sobre `astro preview` ya construido (MAK-231). Así la imagen
 * usa exactamente los tokens del sitio y nunca se desincroniza a mano.
 *
 *   npm run build
 *   node scripts/generar-og.mjs
 *   npm run build   (para que dist/ incluya el og.png ya generado)
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { writeFileSync, statSync, existsSync } from 'node:fs'

if (!existsSync('dist/og/index.html')) {
  console.error('No existe dist/og/index.html. Ejecuta antes: npm run build')
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

try {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.goto(`${base}/og`, { waitUntil: 'networkidle' })
  const buffer = await page.screenshot({ type: 'png' })
  writeFileSync('public/og.png', buffer)
  await browser.close()
} finally {
  preview.kill()
}

const { size } = statSync('public/og.png')
console.log(`public/og.png generado: ${(size / 1024).toFixed(1)} KB`)
if (size > 300 * 1024) {
  console.error('El OG supera 300 KB.')
  process.exit(1)
}
