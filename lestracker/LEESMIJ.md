# Waar is mijn klas

Lestracker voor Teun Merkx (docentcode MERTE), Rijn IJssel. Laat zien hoeveel
lessen elke klas per vak gehad heeft, en welke les je dus moet voorbereiden.

Er zijn twee versies van hetzelfde bestand:

| | Waar | Waarvoor |
|---|---|---|
| **Op claude.ai** | [de tracker](https://claude.ai/code/artifact/533a1345-ff26-4559-972b-82ef32375103) | bijwerken met één klik uit Google Agenda; werkt op je Mac, je telefoon en in de browser op je HP |
| **Los bestand** | `waar-is-mijn-klas.html` | je bureaubladachtergrond op de HP |

Beide tonen precies hetzelfde en rekenen hetzelfde. Ze verschillen alleen in hoe
ze aan nieuwe roostergegevens komen.

---

## Bijwerken

Rechtsboven staat **Rooster bijwerken**. Doe dat eens per week. De tracker
onthoudt elke dag die hij ziet, en bouwt zo de geschiedenis op die de roosterfeed
zelf niet heeft: myx levert maar een venster van ongeveer twee weken vooruit, en
niets uit het verleden.

Hij onthoudt ook **dagen zonder lessen**, maar alleen binnen de periode waarover
de agenda echt iets teruggaf. Valt er een les uit en werk je daarna bij, dan telt
die les niet meer mee. Dagen waarover de agenda niets zegt, blijven staan zoals
ze waren.

### Op claude.ai: uit je Google Agenda

Eén knop: **Uit Google Agenda halen**. De pagina leest je agenda *Mijn rooster*
met jouw eigen Google-koppeling. De eerste keer vraagt claude.ai je toestemming.
Je hoeft niets te openen, op te slaan of te delen.

Wat de tracker daar leert, wordt bij je artifact bewaard. Werk je bij op je Mac,
dan klopt het daarna ook op je telefoon.

### In het losse bestand: via myx

Een los bestand op je bureaublad mag van Google je agenda niet lezen, en van myx
meestal ook niet. Daar zijn dus twee handmatige routes:

1. **Adres invullen en op Ophalen klikken.** Plak het adres van je myx-feed in het
   veld. Dat adres blijft op die computer, het komt niet in het bestand. Lukt dit
   één keer, dan werkt de tracker daarna elke zes uur vanzelf bij.
2. **Een bestand kiezen.** Open het adres in een tabblad, sla de pagina op als
   `.ics` en kies dat bestand.

**De makkelijkste weg voor je achtergrond:** werk bij op claude.ai, klik daar op
**Bijgewerkte kopie bewaren**, en zet dat bestand op je bureaublad over het oude
heen. Dan hoef je myx nooit meer te openen.

Staat er meer dan negen dagen niets bijgewerkt, dan verschijnt onderin een oranje
waarschuwing. Een teller die doorrekent op een oud rooster is erger dan geen teller.

### Elke ochtend vanzelf

Er staat een Routine klaar die elke ochtend om 07:12 (Nederlandse tijd) je agenda
leest en het archief bijwerkt, zonder melding. Je vindt hem op claude.ai onder
Routines, als *Lestracker bijwerken uit Mijn rooster*.

Die routine heeft wel toegang tot je Google Agenda nodig. Staat die er niet bij,
dan draait hij elke ochtend voor niets. Zie het antwoord in het gesprek waarin hij
is aangemaakt, of maak hem opnieuw aan vanuit de Routines-pagina zelf: dan krijgt
hij je connectoren wel mee.

Draait de routine, dan is het weekrooster in dit bestand nog maar een vangnet voor
de verre toekomst: alles tot anderhalve maand vooruit komt dan uit je echte agenda.
Ook de stage die in periode 4 begint wordt dan vanzelf goed geteld.

---

## Als app op je bureaublad

Naast de twee versies staat er in deze map een starter per systeem. Zet die in
dezelfde map als `waar-is-mijn-klas.html` en dubbelklik hem: de tracker opent dan
in een eigen venster, zonder adresbalk en zonder tabbladen. Het oogt en werkt als
een programma.

| Systeem | Bestand | De eerste keer |
|---|---|---|
| Windows (HP) | `Lestracker openen (Windows).cmd` | dubbelklikken. Rechtsklik → *Aan taakbalk vastmaken* zet hem naast je andere programma's |
| Mac | `Lestracker openen (Mac).command` | rechtsklik → *Open*, en bevestig. macOS vraagt dat eenmalig bij een script dat je zelf hebt binnengehaald. Daarna volstaat dubbelklikken |

De starter zoekt Edge, Chrome of Brave en opent de pagina met `--app`. Staat geen
van die browsers erop, dan opent hij gewoon in je standaardbrowser; je hebt dan een
tabblad in plaats van een venster, maar alles werkt hetzelfde.

Werkt het dubbelklikken op de Mac niet, draai dan eenmalig in Terminal:

```bash
chmod +x "Lestracker openen (Mac).command"
```

## Als bureaubladachtergrond

**HP (Windows).** Windows kan zelf geen HTML als achtergrond tonen. Installeer
**[Lively Wallpaper](https://www.rocksdanister.com/lively/)** (gratis, Microsoft
Store), klik op de plusknop, kies *Browse* en wijs `waar-is-mijn-klas.html` aan.

Staan je bureaubladpictogrammen in de weg? Kies het bestand dan met `?bureaublad`
erachter; de tracker houdt links een strook vrij.

De klok, de stand en de tijdlijn rekenen zichzelf elke halve minuut door, dus die
lopen altijd mee. Alleen nieuwe roostergegevens moeten er via een bijgewerkte
kopie in.

**Mac.** Dubbelklikken is genoeg. Wil je hem ook als achtergrond:
**[Plash](https://sindresorhus.com/plash)** (gratis, App Store) → *Open URL*.

---

## Wat je ziet

- **Links groot:** de les waar je nu mee bezig bent, of de eerstvolgende. Met het
  lesnummer dat je moet voorbereiden.
- **De kaarten:** elke combinatie van klas en vak. Het grote getal is de volgende
  les, daarnaast hoeveel lessen die klas gehad heeft.
- **De groene of oranje regel:** hoe deze klas ervoor staat ten opzichte van de
  andere klassen met hetzelfde vak. Alleen klassen van dezelfde opleiding die het
  vak even vaak per week hebben worden vergeleken. Rekenen bij LIHS 26A (twee keer
  per week) wordt dus niet afgezet tegen ABS 26C (één keer per week).
- **Onderin:** je dag op een tijdlijn, met een streep op het huidige moment.

---

## Hoe het telt

Geteld wordt vanaf maandag 31 augustus 2026. Weekenden, vakanties en vrije dagen
gaan eraf. Een les telt pas mee als hij is afgelopen. Drie bronnen, in deze
volgorde:

1. **Het archief** — alles wat de tracker zelf uit je rooster gelezen heeft.
2. **Dagen die met de hand zijn vastgelegd** (`UITZONDERINGEN`): de week van
   31 augustus, de introductieweek. Daar vielen door de introductie en
   Kansenmakers veel lessen uit.
3. **Het vaste weekrooster** voor alle andere dagen, uit de weken van 7, 14 en
   21 september 2026, die alle drie precies gelijk waren.

Niet meegeteld als les: introductie, Kansenmakers, Summervibes en teamoverleg.
Die staan wel in de tijdlijn van je dag, maar het zijn geen lessen van een vak.

Een toets telt **wel** mee: de klas was er, en de lesreeks schuift op. Waar het een
toets betreft, staat dat erbij.

---

## Iets aanpassen

Open het bestand in Kladblok of TextEdit. Bovenaan het `<script>`-blok staat
`CONFIG`.

**Klopt een stand niet?** Zet een correctie bij die klas:

```js
correcties: {
  'ABS-26C|Nederlands': -1,   // een les uitgevallen
  'BACS-26A|Slim met AI': 1
}
```

**Andere eerste lesdag?** Pas `eersteLesdag` aan.

**Een dag of week die afwijkt?** Zet die dag in `UITZONDERINGEN` met de lessen die
er wél waren. Een lege lijst (`[]`) betekent: die dag geen enkele les. Meestal hoeft
dit niet — bijwerken doet hetzelfde, automatisch.

**Vakantie erbij of eraf?** Zet een regel in `vrij`.

**Rooster blijvend gewijzigd** (bijvoorbeeld als de stage begint)? Pas
`WEEKROOSTER` aan of vraag Claude erom.

Na een wijziging bouw je beide versies opnieuw:

```bash
node lestracker/bouw.mjs
```

Wil je een los bestand dat meteen klopt, zonder eerst bij te werken? Haal het
archief uit de opslag van de artifact en bak het mee:

```bash
node lestracker/bouw.mjs --archief <map met de json-bestanden>
```

Let op: in dat bestand staat je rooster. Zo'n versie hoort op je eigen computer,
niet in deze repository en niet in een gedeelde map. De versie die hier in de
repository staat heeft altijd een leeg archief.

---

## Waar je op moet letten

- **Je agenda blijft leidend.** Deze tracker is een teller, geen rooster.
- **Vooruit rekent hij op het weekrooster.** Wat na het archief komt is een aanname:
  elke week een normale week.
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

Deze data komen uit openbare overzichten van het vakantierooster van Rijn IJssel.
De website zelf was vanuit deze omgeving niet te bereiken, dus ze zijn niet bij de
bron nagekeken. Zit er een dag fout, dan zie je dat zodra je bijwerkt: het archief
gaat voor.

---

## Privacy

- Het adres van je myx-feed is een sleutel: wie het heeft, kan je hele werkagenda
  lezen. Het staat daarom **niet** in het bestand, maar in de opslag van je browser.
  Ook een bewaarde kopie bevat het niet; dat is nagekeken.
- De versie op claude.ai is privé en gebruikt jouw eigen Google-koppeling. Er gaan
  geen tokens door de pagina heen.
- De agenda-id die in het bestand staat, is geen sleutel: zonder jouw account kan
  niemand er iets mee.
- Zet het losse bestand niet op een openbare plek zodra er een archief in zit. Dan
  staat je rooster erin.

---

## Techniek

Bron is `waar-is-mijn-klas.template.html`; `bouw.mjs` maakt daar de twee versies
van. Geen build-stap verder, geen bibliotheken, geen externe verzoeken behalve het
lezen van je eigen rooster als je daarom vraagt. Het logo zit als data-URI in het
bestand.

De pagina kijkt zelf wat er beschikbaar is: kan hij bij je agenda (`claude.use`),
dan toont hij die knop, anders de handmatige route. Eén bron, twee omgevingen.

Huisstijlkleuren komen uit hetzelfde tokenbestand als de jaarplanner; alle
tekstkleuren halen minimaal 6,9:1 contrast op de donkere achtergrond.
