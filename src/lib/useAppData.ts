import { useCallback, useEffect, useRef, useState } from 'react'
import { bewaarData, laadData, LEGE_DATA } from './opslag'
import type { AppData, Instellingen, Taak } from './types'

/**
 * Houdt alle persoonlijke data vast en schrijft die weg naar localStorage.
 * Lukt schrijven niet (prive-venster, geblokkeerde site-data), dan blijft de
 * app gewoon werken en krijgt de student dat te zien via `kanOpslaan`.
 */
export function useAppData() {
  const [data, setData] = useState<AppData>(LEGE_DATA)
  const [geladen, setGeladen] = useState(false)
  const [kanOpslaan, setKanOpslaan] = useState(true)
  const eersteRender = useRef(true)

  useEffect(() => {
    setData(laadData())
    setGeladen(true)
  }, [])

  useEffect(() => {
    if (!geladen) return
    if (eersteRender.current) {
      eersteRender.current = false
      return
    }
    setKanOpslaan(bewaarData(data))
  }, [data, geladen])

  const zetInstellingen = useCallback((wijziging: Partial<Instellingen>) => {
    setData((huidig) => ({ ...huidig, instellingen: { ...huidig.instellingen, ...wijziging } }))
  }, [])

  const voegTaakToe = useCallback((taak: Taak) => {
    setData((huidig) => ({ ...huidig, taken: [taak, ...huidig.taken] }))
  }, [])

  const wijzigTaak = useCallback((id: string, wijziging: Partial<Taak>) => {
    setData((huidig) => ({
      ...huidig,
      taken: huidig.taken.map((t) => (t.id === id ? { ...t, ...wijziging } : t)),
    }))
  }, [])

  const verwijderTaak = useCallback((id: string) => {
    setData((huidig) => ({ ...huidig, taken: huidig.taken.filter((t) => t.id !== id) }))
  }, [])

  const vervangAlles = useCallback((nieuw: AppData) => setData(nieuw), [])

  return { data, geladen, kanOpslaan, zetInstellingen, voegTaakToe, wijzigTaak, verwijderTaak, vervangAlles }
}

export type AppDataApi = ReturnType<typeof useAppData>
