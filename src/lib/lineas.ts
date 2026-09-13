/**
 * Partir un texto en líneas de anchura fija, para la variante «editor» (/c/).
 *
 * El canal de numeración de un editor no puede mentir: si un bloque de cuatro
 * renglones lleva un solo número, el canal se lee como adorno y se cae la
 * dirección entera. La salida es partir el texto en líneas de origen, como un
 * fichero envuelto a 72 columnas, y numerar una a una.
 *
 * En pantalla ancha cada línea de origen entra en un renglón, así que los
 * números quedan a intervalos iguales. En estrecho las líneas largas se
 * envuelven y la continuación va sin número, que es exactamente lo que hace un
 * editor con el ajuste de línea activado: sigue sin mentir.
 *
 * Se parte SIEMPRE por espacios y se vuelve a unir por espacios, así que
 * concatenar las líneas devuelve el texto original carácter a carácter. De eso
 * depende que el copy aprobado siga apareciendo literal y seguido.
 */
export function lineas(texto: string, ancho = 72): string[] {
  const salida: string[] = []
  let actual = ''
  for (const palabra of texto.split(' ')) {
    if (actual === '') actual = palabra
    else if (actual.length + 1 + palabra.length <= ancho) actual += ' ' + palabra
    else {
      salida.push(actual)
      actual = palabra
    }
  }
  if (actual !== '') salida.push(actual)
  return salida
}
