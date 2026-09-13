#!/usr/bin/env node
/** Texto visible de un HTML, normalizado. Sirve para comprobar que un refactor
 *  de composición no ha cambiado ni una palabra: `node scripts/texto-visible.mjs dist/index.html` */
import { readFileSync } from 'node:fs'
process.stdout.write(
  readFileSync(process.argv[2], 'utf8')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
    .replace(/&#8212;|&mdash;/g, '—').replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ').replace(/ /g, ' ')
    .replace(/\s+/g, ' ').trim().replace(/\. /g, '.\n') + '\n'
)
