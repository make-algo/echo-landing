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
    /** Nombre accesible del selector de idioma. */
    idioma: string
  }
  /**
   * Aviso que ofrece ESTE idioma a quien llega a la página en el otro y tiene
   * el sistema en este: va escrito en el idioma que se ofrece, no en el de la
   * página. `quedarse` deja la página como está y lo recuerda.
   */
  sugerenciaIdioma: {
    texto: string
    cambiar: string
    quedarse: string
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
  /** Pestaña, buscadores y Open Graph de la portada. `nombre` es el `og:site_name`. */
  meta: {
    titulo: string
    descripcion: string
    nombre: string
    ogImageAlt: string
  }
  /** El vídeo demo bajo la apertura (repo privado `echo`, `video/`). */
  video: {
    titulo: string
    reproducir: string
    descripcion: string
  }
  /** Texto alternativo de las capturas de la píldora. */
  imagenes: {
    pildoraEscuchando: string
    pildoraPuliendo: string
  }
  pie: {
    linea: string
    descargar: string
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
  /**
   * MAK-274 (revisión, tras el comentario del copy aprobado en inglés): la
   * línea sucia del héroe estaba escrita a mano dos veces en `Landing.astro`
   * (`segmentosCiclo` y el `<p class="sucio">`) y solo en español. Un
   * segmento con `insercion: true` no lleva `texto`: el renderer pone ahí
   * `correccion.insercion`, que es donde vive ese trozo — así no se duplica.
   */
  heroSucio: {
    segmentos: ({ texto: string; tachado: boolean; insercion?: false } | { insercion: true })[]
  }
}
