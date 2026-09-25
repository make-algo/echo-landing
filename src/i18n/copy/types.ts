/**
 * Forma del copy de la landing, independiente de idioma (MAK-274).
 *
 * `es.ts` y `en.ts` declaran su constante como `Copy`: si a `en.ts` le falta
 * una clave, o le sobra, o cambia la forma de un campo, no compila. Es
 * deliberado que los VALORES no estén fijados aquí (serían literales de
 * `es.ts` calcados) — lo único que se exige igual es la forma.
 */
export interface Copy {
  demo: {
    ventana: {
      barra: string
      para: { etiqueta: string; valor: string }
      asunto: { etiqueta: string; valor: string }
      cuerpo: string
    }
    barra: {
      tecla: string
      grabando: string
      puliendo: string
      unidad: string
      tiempos: string[]
    }
  }
  cabecera: {
    marca: string
    cta: string
  }
  apertura: {
    titular: string[]
    tagline: string
    cta: string
    requisito: {
      aviso: { dato: boolean; texto: string }[]
      maquina: string
    }
  }
  dondeSePega: {
    titulo: string
    piezas: { icono: string; etiqueta: string }[]
    cuerpo: { texto: string; enfasis: boolean }[]
  }
  velocidad: {
    filas: { modo: string; ppm: string }[]
    fuente: string
  }
  pasos: {
    rotulo: string
    lista: {
      titulo: string
      partes: { dato: boolean; texto: string }[]
    }[]
  }
  comparativa: {
    titulo: string
    entradilla: string
    columnas: { criterio: string; macos: string; echo: string }
    filas: {
      criterio: string
      macos: string
      echo: string
      nota?: string
    }[]
    cierre: { concesion: string; afirmacion: string }
  }
  privacidad: {
    rotulo: string
    principal: string
  }
  contacto: {
    texto: string
    boton: string
    destino: string
    asunto: string
  }
  preguntas: {
    rotulo: string
    lista: { p: string; r: string }[]
  }
  pie: {
    linea: string
    avisoLegal: string
    condiciones: string
    privacidad: string
  }
  saltar: string
  correccion: {
    capaSucia: string
    capaLimpia: string
    insercion: string
  }
}
