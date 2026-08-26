import {
  PERIODES,
  PERIODE_CONTROLE,
  VAKKEN,
  type Periode,
  type VakId,
} from '../data/curriculum'

/** Rondt af op 1 decimaal en haalt drijvende-komma-ruis weg (1.5 + 1.5 + ...). */
export const rond = (n: number) => Math.round(n * 10) / 10

/** Nederlandse notatie: 21,5 in plaats van 21.5. */
export const uren = (n: number) => rond(n).toLocaleString('nl-NL')

/** Begeleide onderwijstijd per week, exclusief stage - net als in het bronbestand. */
export function botUrenPerWeek(periode: Periode): number {
  return rond(periode.vakken.reduce((som, v) => som + v.urenPerWeek, 0))
}

export function botUrenPerPeriode(periode: Periode): number {
  return rond(botUrenPerWeek(periode) * periode.weken)
}

export function stageUrenPerWeek(periode: Periode): number {
  return periode.stageUrenPerWeek
}

export function stageUrenPerPeriode(periode: Periode): number {
  return rond(stageUrenPerWeek(periode) * periode.weken)
}

export function totaalUrenPerWeek(periode: Periode): number {
  return rond(botUrenPerWeek(periode) + stageUrenPerWeek(periode))
}

export function urenVoorVak(periode: Periode, vakId: VakId): number {
  return periode.vakken.find((v) => v.vakId === vakId)?.urenPerWeek ?? 0
}

export interface VakRegel {
  vakId: VakId
  naam: string
  kleur: string
  /** Uren per week, per periode. 0 = dit vak loopt die periode niet. */
  perPeriode: number[]
  /** Totaal aantal klokuren over het hele leerjaar. */
  jaarUren: number
  /** Aantal periodes waarin dit vak voorkomt. */
  aantalPeriodes: number
}

/** De volledige matrix vak x periode: het hart van "hoeveel uur heb ik waar". */
export function bouwVakMatrix(): VakRegel[] {
  const ids = Object.keys(VAKKEN) as VakId[]
  return ids
    .map((vakId) => {
      const perPeriode = PERIODES.map((p) => urenVoorVak(p, vakId))
      const jaarUren = rond(
        PERIODES.reduce((som, p, i) => som + perPeriode[i] * p.weken, 0),
      )
      return {
        vakId,
        naam: VAKKEN[vakId].naam,
        kleur: VAKKEN[vakId].kleur,
        perPeriode,
        jaarUren,
        aantalPeriodes: perPeriode.filter((u) => u > 0).length,
      }
    })
    .filter((r) => r.jaarUren > 0)
    .sort((a, b) => b.jaarUren - a.jaarUren)
}

export function totaalBotUrenJaar(): number {
  return rond(PERIODES.reduce((som, p) => som + botUrenPerPeriode(p), 0))
}

export function totaalStageUrenJaar(): number {
  return rond(PERIODES.reduce((som, p) => som + stageUrenPerPeriode(p), 0))
}

export interface Controle {
  klopt: boolean
  meldingen: string[]
}

/**
 * Rekent de ingevoerde vakuren na tegen de controlegetallen uit het bronbestand.
 * Wijkt er iets af, dan laat het dashboard dat zien in plaats van het stil te
 * verbergen: liever een zichtbare fout dan een verkeerd getal dat betrouwbaar oogt.
 */
export function controleerData(): Controle {
  const meldingen: string[] = []

  PERIODES.forEach((p, i) => {
    const week = botUrenPerWeek(p)
    const verwachtWeek = PERIODE_CONTROLE.urenPerWeek[i]
    if (week !== verwachtWeek) {
      meldingen.push(
        `Periode ${p.nummer}: berekend ${uren(week)} uur per week, bronbestand zegt ${uren(verwachtWeek)}.`,
      )
    }
    const totaal = botUrenPerPeriode(p)
    const verwachtTotaal = PERIODE_CONTROLE.urenPerPeriode[i]
    if (totaal !== verwachtTotaal) {
      meldingen.push(
        `Periode ${p.nummer}: berekend ${uren(totaal)} uur totaal, bronbestand zegt ${uren(verwachtTotaal)}.`,
      )
    }
  })

  const jaar = totaalBotUrenJaar()
  if (jaar !== PERIODE_CONTROLE.totaalBotUren) {
    meldingen.push(
      `Jaartotaal: berekend ${uren(jaar)} uur, bronbestand zegt ${uren(PERIODE_CONTROLE.totaalBotUren)}.`,
    )
  }

  return { klopt: meldingen.length === 0, meldingen }
}

export function periodeOpNummer(nummer: number): Periode | undefined {
  return PERIODES.find((p) => p.nummer === nummer)
}
