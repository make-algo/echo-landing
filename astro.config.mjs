import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

// El sitio de prueba se publica en GitHub Pages bajo /echo-landing/.
// Si algún día se sirve en dominio propio, cambia `site` y quita `base`.
export default defineConfig({
  site: 'https://make-algo.github.io',
  base: '/echo-landing',
  integrations: [
    // Una sola ruta indexable: el resto (404) no entra en el sitemap.
    sitemap({ filter: (page) => page === 'https://make-algo.github.io/echo-landing/' }),
  ],
  vite: { plugins: [tailwindcss()] },
})
