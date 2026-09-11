# Waar is mijn klas

Lestracker voor Teun Merkx (docentcode MERTE), Rijn IJssel. Eén bestand dat laat
zien hoeveel lessen elke klas per vak gehad heeft, en welke les je dus moet
voorbereiden.

Alles zit in `waar-is-mijn-klas.html`. Geen installatie, geen internet, geen
account. Dubbelklikken is genoeg.

---

## Op je bureaublad zetten

**Als gewoon venster.** Zet het bestand op je bureaublad en dubbelklik het. Het
opent in je browser. Wil je het altijd bij de hand hebben: sleep het tabblad naar
een eigen venster en zet dat op een tweede scherm.

**Als echte bureaubladachtergrond.** Windows en macOS kunnen zelf geen HTML als
achtergrond tonen. Daar is een klein gratis programma voor nodig:

| Systeem | Programma | Zo doe je het |
|---|---|---|
| Windows | [Lively Wallpaper](https://www.rocksdanister.com/lively/) (gratis, Microsoft Store) | Lively openen → plusknop → *Browse* → kies `waar-is-mijn-klas.html` |
| macOS | [Plash](https://sindresorhus.com/plash) (gratis, App Store) | Plash openen → *Open URL* → kies het bestand |

**Pictogrammen in de weg?** Open het bestand dan als
`waar-is-mijn-klas.html?bureaublad`. De tracker houdt links een strook vrij, zodat
de pictogrammen op je bureaublad niets bedekken.

De tracker rekent zichzelf elke halve minuut opnieuw door. Je hoeft hem nooit te
verversen.

---

## Wat je ziet

- **Links groot:** de les waar je nu mee bezig bent, of de eerstvolgende les. Met
  het lesnummer dat je moet voorbereiden.
- **De kaarten:** elke combinatie van klas en vak. Het grote getal is de volgende
  les, daarnaast staat hoeveel lessen die klas gehad heeft.
- **De groene of oranje regel:** hoe deze klas ervoor staat ten opzichte van de
  andere klassen met hetzelfde vak. Dit vergelijkt alleen klassen van dezelfde
  opleiding die het vak even vaak per week hebben. Rekenen bij LIHS 26A (twee keer
  per week) wordt dus niet vergeleken met rekenen bij ABS 26C (één keer per week).
- **Onderin:** je dag op een tijdlijn, met een streep op het huidige moment.

---

## Hoe het telt

De tracker telt alle lesmomenten uit je weekrooster vanaf de eerste lesdag van het
studiejaar tot nu. Weekenden, vakanties en vrije dagen gaan eraf. Een les telt pas
mee als hij is afgelopen.

Het weekrooster is overgenomen uit je agenda *Mijn rooster* (de myx-feed), uit de
weken van 14 en 21 september 2026. Die twee weken waren gelijk, dus dat is het
vaste patroon.

### Waarom dit niet rechtstreeks uit je agenda komt

De myx-feed levert maar een klein venster: ongeveer twee weken vooruit en niets uit
het verleden. Op 11 september 2026 bevatte hij geen enkele les van vóór die dag.
Tellen uit de agenda kan daarom niet. Vandaar dat het weekrooster in het bestand
staat en de tracker zelf rekent.

---

## Iets aanpassen

Open het bestand in Kladblok of TextEdit. Bovenaan het `<script>`-blok staat
`CONFIG`. Dat is het enige stuk dat je nodig hebt.

**Klopt een stand niet?** Bijvoorbeeld doordat een les uitviel. Zet dan een
correctie bij die klas:

```js
correcties: {
  'ABS-26C|Nederlands': -1,   // een les uitgevallen
  'ABS-26D|Rekenen': 0
}
```

**Andere eerste lesdag?** Pas `eersteLesdag` aan. De tracker rekent alles opnieuw
door.

**Vakantie erbij of eraf?** Zet een regel in `vrij`, met begindatum, einddatum en
een naam.

**Rooster gewijzigd?** Pas `WEEKROOSTER` aan, of vraag Claude om het bij te werken
uit je agenda.

---

## Waar je op moet letten

- **Je agenda blijft leidend.** Deze tracker is een teller, geen rooster.
- **Het rooster verandert waarschijnlijk per periode.** Vanaf periode 4 gaan
  ABS-studenten op stage. Laat het weekrooster dan bijwerken, anders telt de
  tracker door met een rooster dat niet meer bestaat.
- **Het balkje op elke kaart is een ruwe schatting** van het studiejaar, uitgaande
  van het huidige rooster. Het harde getal is het lesnummer, niet het balkje.
- **Lokalen wisselen soms per week.** Waar dat gebeurde, toont de tracker geen
  lokaal. Kijk dan in je agenda.

---

## Vakanties in dit bestand

Studiejaar 2026-2027, Rijn IJssel:

| | |
|---|---|
| Eerste lesdag | maandag 24 augustus 2026 |
| Herfstvakantie | 19 t/m 23 oktober 2026 |
| Kerstvakantie | 21 december 2026 t/m 1 januari 2027 |
| Voorjaarsvakantie | 8 t/m 12 februari 2027 |
| Goede Vrijdag | 26 maart 2027 |
| Tweede paasdag | 29 maart 2027 |
| Meivakantie | 26 april t/m 7 mei 2027 |
| Tweede pinksterdag | 17 mei 2027 |
| Laatste lesdag | vrijdag 16 juli 2027 |

Deze data komen uit openbare overzichten van het vakantierooster van Rijn IJssel.
De website zelf was vanuit deze omgeving niet te bereiken, dus ze zijn niet bij de
bron nagekeken. Controleer ze één keer tegen het jaarrooster van de school en pas
ze zo nodig aan in `CONFIG.vrij`.

---

## Techniek

Eén HTML-bestand van ongeveer 74 KB. Geen build, geen bibliotheken, geen externe
verzoeken (met een browsertest gecontroleerd: nul verzoeken buiten de pagina zelf).
Het logo zit als data-URI in het bestand. Huisstijlkleuren komen uit hetzelfde
tokenbestand als de jaarplanner; alle tekstkleuren halen minimaal 6,9:1 contrast op
de donkere achtergrond.

`waar-is-mijn-klas.template.html` is de versie zonder logo, met `__LOGO_DATA_URI__`
als plaatshouder. Het eindbestand maak je zo opnieuw:

```bash
node -e "const f=require('fs');const l=f.readFileSync('src/assets/logo.ts','utf8').match(/LOGO_DATA_URI: string \| null = \"([^\"]+)\"/)[1];f.writeFileSync('lestracker/waar-is-mijn-klas.html',f.readFileSync('lestracker/waar-is-mijn-klas.template.html','utf8').replace('__LOGO_DATA_URI__',l))"
```
