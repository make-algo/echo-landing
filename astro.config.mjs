import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

// Dominio propio (echo.make-algo.com) configurado en GitHub Pages: sin `base`,
// todo se sirve desde la raíz. `public/CNAME` es lo que hace que ese dominio
// sobreviva al siguiente deploy (si no, GitHub Pages vuelve a *.github.io).
export default defineConfig({
  site: 'https://echo.make-algo.com',
  integrations: [
    // Una sola ruta indexable: el resto (404) no entra en el sitemap.
    sitemap({ filter: (page) => page === 'https://echo.make-algo.com/' }),
  ],
  vite: { plugins: [tailwindcss()] },
})
