/* ============================================================================
 *  LOGO RIJN IJSSEL
 * ----------------------------------------------------------------------------
 *  HIER ZET JE HET OFFICIELE LOGOBESTAND IN. Dat is de enige plek die je
 *  hoeft aan te passen.
 *
 *  Stap 1. Vraag het logo op bij Marketing, Instroom en Communicatie, of pak
 *          het uit Docufiller. Een SVG met doorzichtige achtergrond is het
 *          beste, een PNG met doorzichtige achtergrond kan ook.
 *  Stap 2. Zet het bestand om naar een data-URI, bijvoorbeeld zo:
 *
 *            base64 -w0 logo.svg
 *
 *          en plak de uitkomst achter het juiste voorvoegsel:
 *
 *            SVG : data:image/svg+xml;base64,PLAK_HIER
 *            PNG : data:image/png;base64,PLAK_HIER
 *
 *  Stap 3. Vervang null hieronder door die tekst tussen quotes.
 *
 *  Waarom een data-URI en geen los bestand? Omdat de app dan een enkel
 *  bestand blijft dat offline werkt en geen enkel extern verzoek doet.
 *
 *  Staat hier null, dan toont de app het woordmerk als tekst. De app blijft
 *  dus altijd werken.
 * ========================================================================== */

export const LOGO_DATA_URI: string | null = null

/** Verhouding breedte : hoogte van het logobestand. Nodig om te schalen. */
export const LOGO_VERHOUDING = 1516 / 460
