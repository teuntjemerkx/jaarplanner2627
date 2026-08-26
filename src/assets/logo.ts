/* ============================================================================
 *  LOGO RIJN IJSSEL
 * ----------------------------------------------------------------------------
 *  HIER ZET JE HET OFFICIELE LOGOBESTAND IN. Dat is de enige plek die je
 *  hoeft aan te passen.
 *
 *  Stap 1. Vraag het logo op bij Marketing, Instroom en Communicatie, of pak
 *          het uit Docufiller. Een SVG met doorzichtige achtergrond is het
 *          beste, een PNG met doorzichtige achtergrond kan ook.
 *  Stap 2. Draai vanuit de map van het project:
 *
 *            node scripts/logo.mjs pad/naar/logo.svg
 *            npm run build
 *
 *          Het script zet het bestand om naar een data-URI, schrijft die
 *          hieronder weg en leest de verhouding uit het bestand zelf.
 *          Weghalen kan met: node scripts/logo.mjs --wis
 *
 *  Waarom een data-URI en geen los bestand? Omdat de app dan een enkel
 *  bestand blijft dat offline werkt en geen enkel extern verzoek doet.
 *
 *  Staat hier null, dan toont de app het woordmerk als tekst. De app blijft
 *  dus altijd werken.
 * ========================================================================== */

export const LOGO_DATA_URI: string | null = null

/**
 * Verhouding breedte : hoogte van het logobestand.
 * 3,241 komt uit de metadata van "RIJ logo oranje-paars rgb" (183,72 x 56,69 px).
 * Het script scripts/logo.mjs leest deze waarde zelf uit het bestand dat je erin zet.
 */
export const LOGO_VERHOUDING = 3.241
