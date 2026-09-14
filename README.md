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

## El `base` del sitio

`astro.config.mjs` fija `site: 'https://make-algo.github.io'` y `base: '/echo-landing'`.
Ninguna ruta ni ningún asset puede escribirse absoluto desde la raíz del dominio o se
romperá al publicar. Usa los ayudantes de `src/lib/site.ts`:

```astro
import { url, absoluteUrl } from '../lib/site'
<a href={url('/')}>…</a>              <!-- /echo-landing/ -->
<img src={url('/demo.webp')} />        <!-- /echo-landing/demo.webp -->
```

## La lista de espera

No hay formulario ni backend propio: el botón del alta es un enlace `mailto:` a
`info.makealgo@gmail.com` con el asunto y las dos preguntas ya escritas en el
cuerpo. El envío lo hace el cliente de correo del visitante; esta página no
guarda ni transmite nada, así que no hace falta ninguna variable de entorno.

## Qué no se hace sin aprobación humana

Conectar un dominio propio, quitar el `noindex` y desbloquear `robots.txt`, y enviar
emails reales a la lista de espera.
