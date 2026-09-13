# echo — landing

Landing standalone de [echo](https://github.com/make-algo/echo), la app de dictado
por voz para macOS con transcripción local.

Este repositorio es **público** únicamente porque GitHub Pages lo exige en el plan
gratuito. El código de la app vive en el repo privado `make-algo/echo`, y ahí se
quedan la estrategia, el pricing y cualquier documento interno. Aquí no va ningún
secreto: ni claves, ni tokens, ni datos de clientes.

- **Versión de prueba**: https://make-algo.github.io/echo-landing/ — con `noindex`
  y `robots.txt` bloqueado: no se difunde el enlace hasta que haya lanzamiento.
- **Stack**: Astro 5 + Tailwind 4 (`@tailwindcss/vite`), salida estática, cero
  JavaScript de cliente salvo donde haga falta.
- **Despliegue**: automático en cada push a `main` vía GitHub Actions
  (`.github/workflows/pages.yml`).

## Levantar y construir

```bash
npm install
npm run dev      # desarrollo en http://localhost:4321/echo-landing/
npm run build    # salida estática en dist/
npm run preview  # sirve dist/ como lo verá Pages
```

## El `base` del sitio

`astro.config.mjs` fija `site: 'https://make-algo.github.io'` y `base: '/echo-landing'`.
Ninguna ruta ni ningún asset puede escribirse absoluto desde la raíz del dominio o se
romperá al publicar. Usa los ayudantes de `src/lib/site.ts`:

```astro
import { url, absoluteUrl } from '../lib/site'
<a href={url('/')}>…</a>              <!-- /echo-landing/ -->
<img src={url('/demo.webp')} />        <!-- /echo-landing/demo.webp -->
```

## Variables de entorno

Copia `.env.example` a `.env` y rellena lo que necesites. Solo hay una:

| Variable | Qué es | Por defecto |
|---|---|---|
| `PUBLIC_FORM_ENDPOINT` | URL de destino del formulario de lista de espera. Cambiarla no exige tocar el marcado. | vacío — el formulario no envía nada |

No es un secreto: es una URL pública de envío. **Ninguna clave de proveedor entra en
este repositorio**; si un proveedor exige clave privada, va en secretos del repo y se
inyecta en el workflow, nunca en el código.

Para desplegar la versión de prueba con el formulario activo, define
`PUBLIC_FORM_ENDPOINT` como variable de repositorio (Settings → Secrets and variables
→ Actions → Variables) y expónla en el paso `npm run build` del workflow.

## Qué no se hace sin aprobación humana

Conectar un dominio propio, quitar el `noindex` y desbloquear `robots.txt`, y enviar
emails reales a la lista de espera.
