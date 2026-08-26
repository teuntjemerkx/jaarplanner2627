# Jaarplanner ABS — Rijn IJssel

Digitaal dashboard voor studenten **Medewerker ABS, niveau 2, cohort 2026, leerjaar 1**.
Het laat in één oogopslag zien hoeveel uur je per vak hebt in elke periode, wanneer je
examens vallen en wanneer de stage begint. Daarnaast zit er een persoonlijke planner in
die **uitsluitend lokaal** op de laptop van de student draait.

---

## Snel starten

```bash
npm install
npm run dev        # ontwikkelserver op http://localhost:5173
npm run build      # statische build in dist/
npm run build:single   # alles in één bestand: dist-single/index.html
```

De single-file build is één HTML-bestand zonder externe bestanden. Dat kun je op een
USB-stick zetten of naar studenten mailen: dubbelklikken en het werkt, ook offline.

---

## Privacy

Dit is het uitgangspunt van de hele architectuur, niet een belofte achteraf:

- **Geen backend, geen database, geen account.** Er is geen server om data naartoe te sturen.
- **Geen enkel extern netwerkverzoek.** Geen analytics, geen CDN, geen externe fonts.
  Dit is met een browsertest gecontroleerd: nul verzoeken buiten de eigen pagina.
- **Persoonlijke data staat in `localStorage`**, gebonden aan browser én apparaat.
  Student A kan technisch niet bij de planning van student B.
- Studenten kunnen een **back-up downloaden of naar het klembord kopiëren**, en die op een
  andere laptop weer terugzetten. Dat gaat via een bestand dat zij zelf beheren.

Docentmededelingen zijn bewust **niet** ingebouwd: die communicatie loopt al via WhatsApp.

---

## Waar de roosterdata vandaan komt

Alles staat in één bestand: **`src/data/curriculum.ts`**.

| Bron | Wat eruit komt |
|---|---|
| `Backbone_ZMCM_niveau_2_cohort_2026_ABS.xlsx`, tabblad `ABS-26 lj1` | vakken, uren per week, stage, examens, controlegetallen |
| `opleidingsoverzicht_student_ABS_cohort_26.docx` | aanvullende examenomschrijvingen |

**Rooster gewijzigd?** Pas alleen `src/data/curriculum.ts` aan. Alle totalen, balken,
matrices en jaartotalen worden opnieuw berekend. Je hoeft geen andere regel code aan te raken.

### Ingebouwde controle

Het bestand bevat de controlegetallen uit rij 25 en 26 van het bronbestand
(21,5 / 21,5 / 22 / 17 / 17 / 17 / 17 / 17 uur per week; 750 uur totaal). De app telt bij
elke start de vakuren zelf op en vergelijkt die. Wijkt er iets af, dan verschijnt er
**bovenaan het dashboard een zichtbare waarschuwing** in plaats van een stil verkeerd getal.

Huidige stand: berekend 750 uur, bronbestand 750 uur — sluit exact.

### De cijfers

- 8 periodes × 5 lesweken = **40 lesweken**
- **750 uur** begeleide onderwijstijd (exclusief stage, net zoals de opleiding het rekent)
- **400 uur** stage: 16 uur per week in periode 4 t/m 8
- Zonder stageplek: **100 uur** begeleiding (4 uur per week, 2 × 2 uur)

---

## Wat de app doet

| Scherm | Inhoud |
|---|---|
| **Jaaroverzicht** | De backbone: 8 periodekaarten met urenverdeling, examens, stage en je eigen open taken. Plus een "je bent hier"-blok en het jaartotaal per vak. |
| **Urenmatrix** | Volledige tabel vak × periode met lesuren per week en het jaartotaal per vak. |
| **Mijn planner** | Eigen taken met vak, periode, deadline, geschatte studie-uren en notitie. Filters op "nog te doen", "deze week" en "afgerond". |
| **Instellingen** | Periodedatums, stage-schakelaar, eigen keuzedeel, back-up en wissen. |

### Twee routes: met en zonder stage

De backbone kent vanaf periode 4 een tweede route voor studenten zonder stageplek
(4 uur begeleiding in plaats van 16 uur stage). De schakelaar rechtsboven zet het hele
dashboard om, inclusief alle totalen.

### Keuzedelen

Studenten kiezen hun keuzedeel zelf, dus het vak heet in de app "Keuzedelen" (meervoud).
In Instellingen kan een student zijn eigen keuzedeel invullen; die naam verschijnt daarna
overal in het dashboard en blijft lokaal.

### Herkansingen

De backbone kent bij elk examen een kolom "kans". Kans 1 is een regulier examen, kans 2 is
een herkansing die je alleen doet als je gezakt bent. De app toont die twee **niet** als
gelijkwaardig: herkansingen staan gedempt en met de regel *"alleen als je de eerste kans
niet gehaald hebt"*. Anders zou periode 5 er als vier examens uitzien terwijl het er voor de
meeste studenten nul zijn.

---

## Vormgeving

- Huisstijlkleuren 1-op-1 uit het handboek: oranje `#F86800`, violet `#610FCA`,
  donkerpaars `#520DAB`, lichtpaars `#D7C3F2` / `#EEEEFD`, blauw `#209FEA`, groen `#5DD9C1`.
- **Donkere basis (`#1A1033`), bewust.** Op wit haalt huisstijl-oranje maar 3,01:1 contrast
  en blijft daarmee onder de WCAG-eis van 4,5:1 voor normale tekst. Op de donkere basis
  haalt dezelfde kleur 5,98:1. Alle twaalf datakleuren halen minimaal 5,4:1.
- **Lettertype:** Maison is het huisstijllettertype, maar is commercieel en mag niet worden
  meegeleverd of van een externe server geladen. De stack is
  `'Maison Neue', 'Maison', ui-sans-serif, system-ui, …` — staat Maison lokaal geïnstalleerd,
  dan gebruikt de browser het vanzelf; zo niet, dan valt hij netjes terug.
- Kleur is nooit de enige drager van informatie: overal staan de cijfers en labels erbij.
- Werkt met toetsenbord (periodekaarten met Enter, paneel sluit met Escape) en respecteert
  `prefers-reduced-motion`.

---

## Aandachtspunten voor de opleiding

Bij het verwerken van de bronbestanden kwamen vier verschillen naar boven tussen het
Word-document en de Excel-backbone. **De Excel is als leidend aangehouden**, omdat die
intern volledig doorgerekend en consistent is en het Word-document bovenaan nog een
redactionele notitie draagt. Het is goed als de opleiding deze punten nakijkt:

1. **Start keuzedelen.** Word: vanaf LE2. Excel: Sport in periode 1–2, keuzedelen vanaf
   periode 3. Sport komt in het Word-document helemaal niet voor.
2. **Duur van de stage.** Word: BPV in LE4–LE7, LE8 is "(Repair BPV)". Excel: stage in
   periode 4 t/m 8, vijf volle periodes.
3. **Periode 8.** Word: alleen "Repair lessen". Excel: een volledig programma van 17 uur
   per week. De app volgt de Excel.
4. **Datums ontbreken.** Geen van beide bestanden bevat periodedatums. De student vult
   eenmalig de eerste schooldag in; de app rekent 8 × 5 weken door en elke periode is
   daarna los bij te stellen voor vakanties.

Daarnaast, buiten de scope van dit dashboard: in het tabblad *ABS-27 januari-instroom*
telt het blok van cohort 25 de stage-uren mee in "uren per week" (33,5 = 9,5 + 24),
terwijl tabblad `ABS-26 lj1` en `lj2` de stage er juist buiten houden.

---

## Techniek

React 19 · TypeScript (strict) · Vite 7. Geen UI-bibliotheken, geen CSS-frameworks,
geen runtime-afhankelijkheden buiten React zelf.

```
src/
  data/curriculum.ts     ← de enige plek met roosterdata
  lib/berekeningen.ts    ← uren, totalen, matrix, controle op het bronbestand
  lib/datum.ts           ← periodedatums en "waar ben ik nu"
  lib/opslag.ts          ← localStorage, afgeschermd tegen geblokkeerde opslag
  components/            ← Jaaroverzicht, Urenmatrix, Planner, PeriodeDetail, Instellingen
  styles/tokens.css      ← huisstijlkleuren met contrastwaarden in commentaar
```

---

De roosterdata is met zorg overgenomen en nagerekend, maar je docent en de studiewijzer
gaan altijd voor.
