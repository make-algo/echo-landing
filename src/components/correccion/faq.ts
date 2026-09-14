/**
 * `aria-expanded` verificable de verdad en el DOM para cada pregunta plegable
 * (MAK-85). `<details>/<summary>` ya da teclado y estado plegado al árbol de
 * accesibilidad; lo único que el navegador no refleja como atributo es
 * `aria-expanded`, así que se sincroniza aquí — comprobable leyendo el HTML
 * servido, no solo la captura.
 */
export function iniciarFaq(contenedor: HTMLElement): void {
  for (const detalles of contenedor.querySelectorAll<HTMLDetailsElement>('.qa')) {
    const resumen = detalles.querySelector<HTMLElement>(':scope > summary')
    if (!resumen) continue
    const reflejar = () => resumen.setAttribute('aria-expanded', String(detalles.open))
    reflejar()
    detalles.addEventListener('toggle', reflejar)
  }
}
