import { PERIODES, WEKEN_PER_PERIODE } from '../data/curriculum'

/** Maakt een Date op lokale middernacht, zodat er geen tijdzone-verschuiving optreedt. */
export function naarDatum(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

export function naarIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function plusDagen(d: Date, dagen: number): Date {
  const kopie = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  kopie.setDate(kopie.getDate() + dagen)
  return kopie
}

export function vandaag(): Date {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

export function dagenTussen(van: Date, tot: Date): number {
  return Math.round((tot.getTime() - van.getTime()) / 86_400_000)
}

const LANG = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
const KORT = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' })
const MET_DAG = new Intl.DateTimeFormat('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })

export const formatLang = (d: Date) => LANG.format(d)
export const formatKort = (d: Date) => KORT.format(d)
export const formatMetDag = (d: Date) => MET_DAG.format(d)

export interface PeriodeDatums {
  nummer: number
  start: Date
  eind: Date
}

/**
 * Leidt uit een lijst startdatums de begin- en einddatum van elke periode af.
 * Een periode duurt WEKEN_PER_PERIODE lesweken; de einddatum is de zondag
 * waarop die weken aflopen. Ontbreekt een startdatum, dan valt de hele
 * kalenderlaag weg: liever geen datum dan een verzonnen datum.
 */
export function berekenPeriodeDatums(periodeStarts: string[]): PeriodeDatums[] | null {
  if (periodeStarts.length !== PERIODES.length) return null
  const resultaat: PeriodeDatums[] = []
  for (const [i, iso] of periodeStarts.entries()) {
    const start = naarDatum(iso)
    if (!start) return null
    resultaat.push({
      nummer: PERIODES[i].nummer,
      start,
      eind: plusDagen(start, WEKEN_PER_PERIODE * 7 - 1),
    })
  }
  return resultaat
}

/** Vult 8 startdatums aaneengesloten in vanaf één begindatum. */
export function leidStartsAf(eersteStartIso: string): string[] {
  const start = naarDatum(eersteStartIso)
  if (!start) return []
  return PERIODES.map((_, i) => naarIso(plusDagen(start, i * WEKEN_PER_PERIODE * 7)))
}

export interface HuidigePositie {
  periodeNummer: number
  weekInPeriode: number
  dagenTotEind: number
  status: 'voor' | 'in' | 'na'
}

export function bepaalHuidigePositie(datums: PeriodeDatums[] | null, nu = vandaag()): HuidigePositie | null {
  if (!datums || datums.length === 0) return null
  const eerste = datums[0]
  const laatste = datums[datums.length - 1]
  if (nu < eerste.start) {
    return { periodeNummer: eerste.nummer, weekInPeriode: 0, dagenTotEind: dagenTussen(nu, eerste.start), status: 'voor' }
  }
  if (nu > laatste.eind) {
    return { periodeNummer: laatste.nummer, weekInPeriode: WEKEN_PER_PERIODE, dagenTotEind: 0, status: 'na' }
  }
  for (const p of datums) {
    if (nu >= p.start && nu <= p.eind) {
      return {
        periodeNummer: p.nummer,
        weekInPeriode: Math.floor(dagenTussen(p.start, nu) / 7) + 1,
        dagenTotEind: dagenTussen(nu, p.eind),
        status: 'in',
      }
    }
  }
  // Tussen twee periodes in (bijvoorbeeld een vakantie die je zelf hebt ingevoerd).
  const volgende = datums.find((p) => nu < p.start)
  return volgende
    ? { periodeNummer: volgende.nummer, weekInPeriode: 0, dagenTotEind: dagenTussen(nu, volgende.start), status: 'voor' }
    : null
}
