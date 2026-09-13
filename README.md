# echo — landing

Landing standalone de [echo](https://github.com/make-algo/echo), la app de dictado
por voz para macOS con transcripción local.

Este repositorio es **público** únicamente porque GitHub Pages lo exige en el plan
gratuito. El código de la app vive en el repo privado `make-algo/echo`.

- **Versión de prueba**: https://make-algo.github.io/echo-landing/ — con `noindex`
  y `robots.txt` bloqueado: no se difunde el enlace hasta que haya lanzamiento.
- **Stack**: Astro + Tailwind, salida estática.
- **Despliegue**: automático en cada push a `main` vía GitHub Actions.

```bash
npm install
npm run dev      # desarrollo
npm run build    # salida estática en dist/
```

No se publica nada en dominio propio ni se envían emails reales sin aprobación humana.
