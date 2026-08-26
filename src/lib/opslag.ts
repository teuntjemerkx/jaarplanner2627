import type { AppData, Instellingen } from './types'

const SLEUTEL = 'rijnijssel.abs.jaarplanner.v1'

export const STANDAARD_INSTELLINGEN: Instellingen = {
  periodeStarts: [],
  keuzedeelNaam: '',
  naam: '',
}

export const LEGE_DATA: AppData = {
  versie: 1,
  instellingen: STANDAARD_INSTELLINGEN,
  taken: [],
}

/**
 * Alles staat in localStorage van deze browser, op dit apparaat. Er is geen
 * server, geen account en geen synchronisatie: een andere student kan hier
 * technisch niet bij. Elke toegang is afgeschermd, want in een prive-venster
 * of met geblokkeerde site-data gooit de browser een fout.
 */
export function laadData(): AppData {
  try {
    const rauw = localStorage.getItem(SLEUTEL)
    if (!rauw) return LEGE_DATA
    const data = JSON.parse(rauw) as Partial<AppData>
    if (!data || data.versie !== 1) return LEGE_DATA
    return {
      versie: 1,
      instellingen: { ...STANDAARD_INSTELLINGEN, ...(data.instellingen ?? {}) },
      taken: Array.isArray(data.taken) ? data.taken : [],
    }
  } catch {
    return LEGE_DATA
  }
}

export function bewaarData(data: AppData): boolean {
  try {
    localStorage.setItem(SLEUTEL, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function wisData(): void {
  try {
    localStorage.removeItem(SLEUTEL)
  } catch {
    /* niets te doen: er valt dan ook niets te wissen */
  }
}

export function maakId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  }
}
