import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

// El sitio de prueba se publica en GitHub Pages bajo /echo-landing/.
// Si algún día se sirve en dominio propio, cambia `site` y quita `base`.
export default defineConfig({
  site: 'https://make-algo.github.io',
  base: '/echo-landing',
  vite: { plugins: [tailwindcss()] },
})
