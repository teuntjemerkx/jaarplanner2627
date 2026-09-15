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

let volledig = sjabloon.replace('__LOGO_DATA_URI__', logo[1]);

/* --- desgevraagd het archief meebakken ----------------------------------- */
/* Met --archief <map> worden de roosterdagen uit de opslag van de artifact in
   het bestand gezet, zodat het meteen klopt zonder eerst bij te werken.
   Let op: dan staat je rooster in het bestand. Zo'n versie hoort niet in een
   openbare map of in deze repository, alleen op je eigen computer. */
const archiefVlag = process.argv.indexOf('--archief');
if (archiefVlag !== -1) {
  const map = process.argv[archiefVlag + 1];
  if (!map) { console.error('Geef een map mee na --archief.'); process.exit(1); }
  const dagen = {};
  let bestanden = 0;
  for (const naam of fs.readdirSync(map).sort()) {
    if (!naam.endsWith('.json')) continue;
    const doc = JSON.parse(fs.readFileSync(path.join(map, naam), 'utf8'));
    const inhoud = doc.data || doc;
    Object.assign(dagen, inhoud.dagen || {});
    bestanden++;
  }
  const gesorteerd = {};
  for (const dag of Object.keys(dagen).sort()) gesorteerd[dag] = dagen[dag];
  const json = JSON.stringify(gesorteerd, null, 1).replace(/</g, '\\u003c');
  const blok = /\/\* ARCHIEF-BEGIN \*\/[\s\S]*?\/\* ARCHIEF-EIND \*\//;
  if (!blok.test(volledig)) { console.error('Het archiefblok staat niet in het sjabloon.'); process.exit(1); }
  volledig = volledig.replace(blok, '/* ARCHIEF-BEGIN */\nvar ARCHIEF_INGEBAKKEN = ' + json + ';\n/* ARCHIEF-EIND */');
  console.log('archief      :', Object.keys(gesorteerd).length, 'dagen uit', bestanden, 'bestand(en) meegebakken');
}

/* --- 1. het losse bestand ------------------------------------------------ */
const losPad = path.join(hier, 'waar-is-mijn-klas.html');
fs.writeFileSync(losPad, volledig);

/* --- 2. de versie voor claude.ai ----------------------------------------- */
/* Die krijgt zijn eigen doctype, head en body van het platform, dus die laten
   we hier weg. Titel, stijl en de inhoud van de body blijven. */
const schoon = sjabloon.replace('__LOGO_DATA_URI__', logo[1]);
const kop = schoon.match(/<title>[\s\S]*?<\/style>/);
const romp = schoon.match(/<body>([\s\S]*)<\/body>/);
if (!kop || !romp) { console.error('De opbouw van het sjabloon is veranderd; knippen lukt niet.'); process.exit(1); }

const artifact = kop[0] + '\n' + romp[1].trim() + '\n';
const losArgument = process.argv.slice(2).find((a, i) =>
  !a.startsWith('--') && process.argv[i + 1] !== '--archief');
const artifactPad = losArgument || path.join(hier, 'artifact.html');
fs.mkdirSync(path.dirname(artifactPad), {recursive: true});
fs.writeFileSync(artifactPad, artifact);

/* --- 3. de versie voor je bureaubladachtergrond --------------------------- */
/* Die houdt links een strook vrij voor je bureaubladpictogrammen. Dat kan ook met
   ?bureaublad achter de bestandsnaam, maar een achtergrondprogramma geeft je niet
   altijd de kans om iets achter het pad te typen. Vandaar een eigen bestand. */
const schakelaar = "if (location.search.indexOf('bureaublad') !== -1 || location.hash.indexOf('bureaublad') !== -1){";
if (!volledig.includes(schakelaar)) {
  console.error('De schakelaar voor de bureaubladmodus staat niet meer in het sjabloon.');
  process.exit(1);
}
const achtergrond = volledig.replace(schakelaar, 'if (true){  // vaste bureaubladmodus');
const achtergrondPad = path.join(hier, 'waar-is-mijn-klas-achtergrond.html');
fs.writeFileSync(achtergrondPad, achtergrond);

const kb = (b) => Math.round(b / 1024) + ' KB';
console.log('los bestand :', losPad, kb(Buffer.byteLength(volledig)));
console.log('achtergrond :', achtergrondPad, kb(Buffer.byteLength(achtergrond)));
console.log('claude.ai   :', artifactPad, kb(Buffer.byteLength(artifact)));

for (const [naam, inhoud] of [['los', volledig], ['achtergrond', achtergrond], ['artifact', artifact]]) {
  if (inhoud.includes('__LOGO_DATA_URI__')) { console.error(naam + ': plaatshouder niet vervangen'); process.exit(1); }
  if (!inhoud.includes('ARCHIEF-BEGIN')) { console.error(naam + ': archiefblok ontbreekt'); process.exit(1); }
}
if (/<!doctype|<html[ >]|<head>|<body>/i.test(artifact.slice(0, 400))) {
  console.error('artifact: er zit nog een schil omheen die het platform zelf levert');
  process.exit(1);
}
console.log('gecontroleerd, allebei in orde.');
