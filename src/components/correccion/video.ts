/**
 * El vídeo demo: la portada con el botón rojo en vez de los controles nativos, y
 * al pulsar se reproduce con sonido y vuelven los controles. Sin este script, el
 * `<video>` se queda con sus controles de siempre.
 */
export function iniciarVideo(marco: HTMLElement) {
  const video = marco.querySelector('video')
  const boton = marco.querySelector<HTMLButtonElement>('.video-demo__play')
  if (!video || !boton) return
  video.controls = false
  boton.hidden = false
  boton.addEventListener('click', () => {
    boton.hidden = true
    video.controls = true
    void video.play()
    video.focus()
  })
}
