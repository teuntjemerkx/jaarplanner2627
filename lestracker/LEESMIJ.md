# Waar is mijn klas

Lestracker voor Teun Merkx (docentcode MERTE), Rijn IJssel. Eén bestand dat laat
zien hoeveel lessen elke klas per vak gehad heeft, en welke les je dus moet
voorbereiden.

Alles zit in `waar-is-mijn-klas.html`. Geen installatie, geen account, geen
internet nodig. Dubbelklikken is genoeg.

---

## Je rooster bijwerken

Rechtsboven staat de knop **Rooster bijwerken**. Doe dat eens per week.

De tracker leest dan je rooster en **onthoudt elke dag die hij ziet**. Zo bouwt hij
zelf de geschiedenis op die de feed niet heeft: myx levert maar een venster van
ongeveer twee weken vooruit, en niets uit het verleden. Hoe vaker je bijwerkt, hoe
completer het beeld.

Belangrijk: hij onthoudt ook **dagen zonder lessen**. Valt er een les uit en werk je
daarna bij, dan telt die les niet mee. Precies wat je wilt.

Er zijn twee manieren:

1. **Adres invullen en op Ophalen klikken.** Plak het adres van je roosterfeed in het
   veld. Het adres blijft op die computer staan, het komt niet in het bestand.
   Lukt dit één keer, dan werkt de tracker daarna **elke zes uur vanzelf bij**.
2. **Een bestand kiezen.** Werkt ophalen niet, dan weigert myx waarschijnlijk
   verzoeken van een pagina op je eigen computer. Open het adres dan in een tabblad,
   sla de pagina op als `.ics` en kies dat bestand. Dat werkt altijd.

Staat er al meer dan negen dagen niets bijgewerkt, dan verschijnt daar onderin een
oranje waarschuwing over. Een teller die doorrekent op een oud rooster is namelijk
erger dan geen teller.

---

## Op je werklaptop (HP): als bureaubladachtergrond

Windows kan zelf geen HTML als achtergrond tonen. Daar is een gratis programma voor:
**[Lively Wallpaper](https://www.rocksdanister.com/lively/)** (ook in de Microsoft
Store).

1. Lively openen, op de plusknop klikken, *Browse* kiezen en `waar-is-mijn-klas.html`
   aanwijzen.
2. Staan je bureaubladpictogrammen in de weg? Kies dan het bestand met
   `?bureaublad` erachter. De tracker houdt links een strook vrij.

**Blijft dat vanzelf actueel?** De klok, de stand en de tijdlijn rekenen zichzelf elke
halve minuut opnieuw door, dus die lopen altijd mee. Voor nieuwe roosterdata vul je
één keer het adres van je feed in in het achtergrondvenster; daarna werkt hij elke
zes uur zelf bij.

Lukt dat ophalen op de HP niet, gebruik dan deze route:

1. Open het bestand in Edge of Chrome, klik **Rooster bijwerken** en lees je rooster in.
2. Klik **Bijgewerkte kopie bewaren**. Je krijgt een nieuw `waar-is-mijn-klas.html`
   met alles erin.
3. Zet dat over het oude bestand heen en herlaad de achtergrond in Lively.

Dat is nodig omdat de achtergrond een eigen geheugen heeft, los van je browser.

---

## Op je eigen Mac

Dubbelklikken is genoeg; hij opent in Safari of Chrome en onthoudt daar alles wat je
bijwerkt. Wil je hem ook als achtergrond: **[Plash](https://sindresorhus.com/plash)**
(gratis, App Store) → *Open URL* → kies het bestand.

---

## Wat je ziet

- **Links groot:** de les waar je nu mee bezig bent, of de eerstvolgende les. Met het
  lesnummer dat je moet voorbereiden.
- **De kaarten:** elke combinatie van klas en vak. Het grote getal is de volgende les,
  daarnaast staat hoeveel lessen die klas gehad heeft.
- **De groene of oranje regel:** hoe deze klas ervoor staat ten opzichte van de andere
  klassen met hetzelfde vak. Dit vergelijkt alleen klassen van dezelfde opleiding die
  het vak even vaak per week hebben. Rekenen bij LIHS 26A (twee keer per week) wordt
  dus niet vergeleken met rekenen bij ABS 26C (één keer per week).
- **Onderin:** je dag op een tijdlijn, met een streep op het huidige moment.

---

## Hoe het telt

Geteld wordt vanaf maandag 31 augustus 2026. Weekenden, vakanties en vrije dagen gaan
eraf. Een les telt pas mee als hij is afgelopen. Er zijn drie bronnen, in deze
volgorde:

1. **Het archief** — alles wat de tracker zelf uit je rooster gelezen heeft. Dit gaat
   altijd voor.
2. **Dagen die met de hand zijn vastgelegd** (`UITZONDERINGEN`). Dat is de week van
   31 augustus, de introductieweek. Daar vielen door de introductie en Kansenmakers
   veel lessen uit, dus die week telt niet als een normale week.
3. **Het vaste weekrooster** voor alle andere dagen. Overgenomen uit de weken van
   7, 14 en 21 september 2026, die alle drie precies gelijk waren.

Wat níét als les meetelt: introductie, Kansenmakers, Summervibes, teamoverleg en
toetsen. Die staan wel in de tijdlijn van je dag, maar je bereidt er geen les voor.

De extra les van BACS 26A staat als correctie in het bestand: die klas had er twee
gehad waar het rooster er één liet zien.

---

## Iets aanpassen

Open het bestand in Kladblok of TextEdit. Bovenaan het `<script>`-blok staat `CONFIG`.

**Klopt een stand niet?** Zet een correctie bij die klas:

```js
correcties: {
  'ABS-26C|Nederlands': -1,   // een les uitgevallen
  'BACS-26A|Slim met AI': 1
}
```

**Een dag of week die afwijkt?** Zet die dag in `UITZONDERINGEN` met de lessen die er
wél waren. Een lege lijst (`[]`) betekent: die dag geen enkele les. Meestal hoeft dit
niet — bijwerken met de knop doet hetzelfde, automatisch.

**Vakantie erbij of eraf?** Zet een regel in `vrij`, met begindatum, einddatum en
een naam.

**Rooster gewijzigd?** Werk bij met de knop. Verandert het weekrooster blijvend
(bijvoorbeeld als de stage begint), pas dan `WEEKROOSTER` aan of vraag Claude erom.

---

## Waar je op moet letten

- **Je agenda blijft leidend.** Deze tracker is een teller, geen rooster.
- **Vooruit rekent hij op het weekrooster.** Wat er ná het archief komt, is een
  aanname: elke week een normale week. Daarom die waarschuwing als je lang niet
  hebt bijgewerkt.
- **Het rooster verandert waarschijnlijk per periode.** Vanaf periode 4 gaan
  ABS-studenten op stage.
- **Het balkje op elke kaart is een ruwe schatting** van het studiejaar. Het harde
  getal is het lesnummer, niet het balkje.
- **Lokalen wisselen soms per week.** Waar dat gebeurde, toont de tracker geen lokaal.

---

## Vakanties in dit bestand

Studiejaar 2026-2027, Rijn IJssel:

| | |
|---|---|
| Eerste lesdag van deze klassen | maandag 31 augustus 2026 |
| Herfstvakantie | 19 t/m 23 oktober 2026 |
| Kerstvakantie | 21 december 2026 t/m 1 januari 2027 |
| Voorjaarsvakantie | 8 t/m 12 februari 2027 |
| Goede Vrijdag | 26 maart 2027 |
| Tweede paasdag | 29 maart 2027 |
| Meivakantie | 26 april t/m 7 mei 2027 |
| Tweede pinksterdag | 17 mei 2027 |
| Laatste lesdag | vrijdag 16 juli 2027 |

De week van 24 augustus was de voorbereidingsweek voor docenten; die telt niet mee.

Deze data komen uit openbare overzichten van het vakantierooster van Rijn IJssel. De
website zelf was vanuit deze omgeving niet te bereiken, dus ze zijn niet bij de bron
nagekeken. Zit er een dag fout, dan zie je dat vanzelf zodra je bijwerkt: het archief
gaat voor.

---

## Privacy

Het adres van je roosterfeed is een sleutel: wie het heeft, kan je hele werkagenda
lezen. Daarom staat het **niet** in het bestand, maar in de opslag van je browser op
die ene computer. Ook een bewaarde kopie bevat het adres niet; dat is nagekeken.

Zet dit bestand niet op een openbare plek zodra er een archief in zit. Dan staat je
rooster erin.

---

## Techniek

Eén HTML-bestand van ongeveer 92 KB. Geen build, geen bibliotheken, geen externe
verzoeken behalve het ophalen van je eigen feed als je daarom vraagt. Het logo zit als
data-URI in het bestand. Huisstijlkleuren komen uit hetzelfde tokenbestand als de
jaarplanner; alle tekstkleuren halen minimaal 6,9:1 contrast op de donkere achtergrond.

`waar-is-mijn-klas.template.html` is de versie zonder logo, met `__LOGO_DATA_URI__` als
plaatshouder. Het eindbestand maak je zo opnieuw:

```bash
node -e "const f=require('fs');const l=f.readFileSync('src/assets/logo.ts','utf8').match(/LOGO_DATA_URI: string \| null = \"([^\"]+)\"/)[1];f.writeFileSync('lestracker/waar-is-mijn-klas.html',f.readFileSync('lestracker/waar-is-mijn-klas.template.html','utf8').replace('__LOGO_DATA_URI__',l))"
```
