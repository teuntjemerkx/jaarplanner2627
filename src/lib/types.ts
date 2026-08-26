import type { VakId } from '../data/curriculum'

export type TaakStatus = 'todo' | 'bezig' | 'klaar'

export interface Taak {
  id: string
  titel: string
  vakId: VakId | null
  periodeNummer: number | null
  /** ISO-datum yyyy-mm-dd, of null als er geen deadline is. */
  deadline: string | null
  geschatteUren: number
  status: TaakStatus
  notitie: string
  aangemaaktOp: string
}

export interface Instellingen {
  /** Startdatum (ISO yyyy-mm-dd) per periode, 8 stuks. Leeg = nog niet ingesteld. */
  periodeStarts: string[]
  /** Zelfgekozen keuzedeel. Blijft lokaal, wordt nergens naartoe gestuurd. */
  keuzedeelNaam: string
  naam: string
}

export interface AppData {
  versie: 1
  instellingen: Instellingen
  taken: Taak[]
}
