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
npm run verificar # comprueba el copy sobre dist/ (hay que construir antes)
```

## La comprobación de copy

`npm run verificar` lee `dist/index.html` y falla si alguna de las tres
redacciones innegociables (privacidad, cierre de la comparativa y «para quién no
es») no aparece literal, si aparece alguna cadena prohibida, si los metadatos se
salen de sus límites, si hay algún recurso de un dominio ajeno o si falta el
`noindex`. Construye antes: se ejecuta sobre la salida, no sobre el código.

## Revisar los estados del formulario

`?estado=reposo|enviando|error|invalido|exito|duplicado` pinta cada estado sin
necesidad de un endpoint vivo. Es una afordancia de revisión; no afecta a una
visita normal.

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
| `PUBLIC_FORM_ENDPOINT` | URL de destino del formulario de lista de espera. Cambiarla no exige tocar el marcado. | vacío — el formulario avisa de que el alta no está operativa y no envía |

Sin endpoint el formulario **no finge**: se puede leer y revisar, pero el botón
queda deshabilitado y ningún visitante ve un falso «apuntado». El envío nativo
(sin JavaScript) va por `POST` al endpoint y vuelve a `/gracias` mediante el
campo oculto `_next`.

No es un secreto: es una URL pública de envío. **Ninguna clave de proveedor entra en
este repositorio**; si un proveedor exige clave privada, va en secretos del repo y se
inyecta en el workflow, nunca en el código.

Para desplegar la versión de prueba con el formulario activo, define
`PUBLIC_FORM_ENDPOINT` como variable de repositorio (Settings → Secrets and variables
→ Actions → Variables) y expónla en el paso `npm run build` del workflow.

## Qué no se hace sin aprobación humana

Conectar un dominio propio, quitar el `noindex` y desbloquear `robots.txt`, y enviar
emails reales a la lista de espera.
