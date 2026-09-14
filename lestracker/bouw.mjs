/* ============================================================================
 *  BOUWT DE TWEE VERSIES VAN DE LESTRACKER
 * ----------------------------------------------------------------------------
 *  Bron is waar-is-mijn-klas.template.html. Daar staat alles in: opmaak,
 *  roostergegevens en rekenwerk. Dit script maakt er twee bestanden van.
 *
 *    1. waar-is-mijn-klas.html          het losse bestand voor je bureaublad
 *    2. <scratchpad>/artifact.html      de versie voor claude.ai, die je
 *                                       Google Agenda mag lezen
 *
 *  Het verschil is alleen de schil. De pagina kijkt zelf wat er beschikbaar is:
 *  kan hij bij je agenda, dan toont hij die knop; anders de handmatige route.
 *
 *  Gebruik:  node lestracker/bouw.mjs [pad-voor-de-artifactversie]
 * ========================================================================== */
import fs from 'fs';
import path from 'path';

const hier = path.dirname(new URL(import.meta.url).pathname);
const wortel = path.join(hier, '..');

const sjabloon = fs.readFileSync(path.join(hier, 'waar-is-mijn-klas.template.html'), 'utf8');
const logoBron = fs.readFileSync(path.join(wortel, 'src/assets/logo.ts'), 'utf8');

const logo = logoBron.match(/LOGO_DATA_URI: string \| null = "([^"]+)"/);
if (!logo) { console.error('Het logo staat niet in src/assets/logo.ts.'); process.exit(1); }
if (!sjabloon.includes('__LOGO_DATA_URI__')) { console.error('De plaatshouder voor het logo ontbreekt.'); process.exit(1); }

const volledig = sjabloon.replace('__LOGO_DATA_URI__', logo[1]);

/* --- 1. het losse bestand ------------------------------------------------ */
const losPad = path.join(hier, 'waar-is-mijn-klas.html');
fs.writeFileSync(losPad, volledig);

/* --- 2. de versie voor claude.ai ----------------------------------------- */
/* Die krijgt zijn eigen doctype, head en body van het platform, dus die laten
   we hier weg. Titel, stijl en de inhoud van de body blijven. */
const kop = volledig.match(/<title>[\s\S]*?<\/style>/);
const romp = volledig.match(/<body>([\s\S]*)<\/body>/);
if (!kop || !romp) { console.error('De opbouw van het sjabloon is veranderd; knippen lukt niet.'); process.exit(1); }

const artifact = kop[0] + '\n' + romp[1].trim() + '\n';
const artifactPad = process.argv[2] || path.join(hier, 'artifact.html');
fs.mkdirSync(path.dirname(artifactPad), {recursive: true});
fs.writeFileSync(artifactPad, artifact);

const kb = (b) => Math.round(b / 1024) + ' KB';
console.log('los bestand :', losPad, kb(Buffer.byteLength(volledig)));
console.log('claude.ai   :', artifactPad, kb(Buffer.byteLength(artifact)));

for (const [naam, inhoud] of [['los', volledig], ['artifact', artifact]]) {
  if (inhoud.includes('__LOGO_DATA_URI__')) { console.error(naam + ': plaatshouder niet vervangen'); process.exit(1); }
  if (!inhoud.includes('ARCHIEF-BEGIN')) { console.error(naam + ': archiefblok ontbreekt'); process.exit(1); }
}
if (/<!doctype|<html[ >]|<head>|<body>/i.test(artifact.slice(0, 400))) {
  console.error('artifact: er zit nog een schil omheen die het platform zelf levert');
  process.exit(1);
}
console.log('gecontroleerd, allebei in orde.');
