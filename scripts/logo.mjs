#!/usr/bin/env node
/* ============================================================================
 *  LOGO INZETTEN
 * ----------------------------------------------------------------------------
 *  Gebruik:
 *      node scripts/logo.mjs pad/naar/logo.svg
 *
 *  Dit script zet het logobestand om naar een data-URI en schrijft die in
 *  src/assets/logo.ts. Meer hoef je niet te doen. Daarna:
 *
 *      npm run build
 *
 *  Weghalen kan ook:
 *      node scripts/logo.mjs --wis
 * ========================================================================== */

import { readFileSync, writeFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'

const DOEL = resolve('src/assets/logo.ts')

const SOORTEN = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

function stop(bericht) {
  console.error('\n  ' + bericht + '\n')
  process.exit(1)
}

/** Leest de verhouding breedte : hoogte uit het bestand zelf. */
function leesVerhouding(buffer, extensie) {
  if (extensie === '.svg') {
    const tekst = buffer.toString('utf8')
    const viewBox = /viewBox\s*=\s*["']\s*[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)/i.exec(tekst)
    if (viewBox) return Number(viewBox[1]) / Number(viewBox[2])
    const b = /\bwidth\s*=\s*["']([\d.]+)/i.exec(tekst)
    const h = /\bheight\s*=\s*["']([\d.]+)/i.exec(tekst)
    if (b && h) return Number(b[1]) / Number(h[1])
    return null
  }
  if (extensie === '.png') {
    // PNG-afmetingen staan in de IHDR-chunk, op vaste posities.
    if (buffer.length > 24 && buffer.toString('ascii', 12, 16) === 'IHDR') {
      return buffer.readUInt32BE(16) / buffer.readUInt32BE(20)
    }
    return null
  }
  return null
}

function schrijf(dataUri, verhouding) {
  const bestaand = readFileSync(DOEL, 'utf8')
  const metUri = bestaand.replace(
    /export const LOGO_DATA_URI: string \| null = .*$/m,
    `export const LOGO_DATA_URI: string | null = ${dataUri === null ? 'null' : JSON.stringify(dataUri)}`,
  )
  const metVerhouding =
    verhouding === null
      ? metUri
      : metUri.replace(
          /export const LOGO_VERHOUDING = .*$/m,
          `export const LOGO_VERHOUDING = ${Math.round(verhouding * 1000) / 1000}`,
        )
  writeFileSync(DOEL, metVerhouding)
}

const argument = process.argv[2]

if (!argument) {
  stop('Geef het pad naar het logobestand mee.\n  Bijvoorbeeld: node scripts/logo.mjs ~/Downloads/rijnijssel.svg')
}

if (argument === '--wis') {
  schrijf(null, null)
  console.log('\n  Logo weggehaald. De app toont het woordmerk weer als tekst.\n')
  process.exit(0)
}

const pad = resolve(argument)
const extensie = extname(pad).toLowerCase()
const soort = SOORTEN[extensie]

if (!soort) {
  stop(`Bestandstype ${extensie || '(geen)'} wordt niet ondersteund.\n  Gebruik een van: ${Object.keys(SOORTEN).join(', ')}`)
}

let bestand
try {
  bestand = readFileSync(pad)
} catch {
  stop(`Kan het bestand niet lezen: ${pad}`)
}

const dataUri = `data:${soort};base64,${bestand.toString('base64')}`
const verhouding = leesVerhouding(bestand, extensie)

// Een data-URI van boven de 400 kB maakt de app onnodig zwaar.
const kb = Math.round(dataUri.length / 1024)
if (kb > 400) {
  stop(`Dit bestand wordt ${kb} kB als data-URI. Dat is te zwaar.\n  Gebruik een SVG, of een kleinere PNG.`)
}

schrijf(dataUri, verhouding)

console.log(`
  Logo ingezet in src/assets/logo.ts
    bestand     ${pad}
    type        ${soort}
    grootte     ${kb} kB
    verhouding  ${verhouding === null ? 'niet gevonden, oude waarde blijft staan' : Math.round(verhouding * 1000) / 1000}

  Draai nu:  npm run build
`)
