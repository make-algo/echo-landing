import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

// Dominio propio (echo.make-algo.com) configurado en GitHub Pages: sin `base`,
// todo se sirve desde la raíz. `public/CNAME` es lo que hace que ese dominio
// sobreviva al siguiente deploy (si no, GitHub Pages vuelve a *.github.io).
export default defineConfig({
  site: 'https://echo.make-algo.com',
  integrations: [
    // Las dos portadas, una por idioma; el resto (legales, descarga, 404) se
    // indexa si Google llega, pero no se le sugiere.
    sitemap({ filter: (page) => ['https://echo.make-algo.com/', 'https://echo.make-algo.com/en/'].includes(page) }),
  ],
  vite: { plugins: [tailwindcss()] },
})
