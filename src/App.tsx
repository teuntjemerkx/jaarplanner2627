import { useCallback, useMemo, useState } from 'react'
import Jaaroverzicht from './components/Jaaroverzicht'
import PeriodeDetail from './components/PeriodeDetail'
import Planner from './components/Planner'
import Urenmatrix from './components/Urenmatrix'
import Instellingen from './components/Instellingen'
import { OPLEIDING, PERIODES } from './data/curriculum'
import { controleerData } from './lib/berekeningen'
import { bepaalHuidigePositie, berekenPeriodeDatums } from './lib/datum'
import { useAppData } from './lib/useAppData'

type Weergave = 'overzicht' | 'matrix' | 'planner' | 'instellingen'

const TABBLADEN: { sleutel: Weergave; label: string }[] = [
  { sleutel: 'overzicht', label: 'Jaaroverzicht' },
  { sleutel: 'matrix', label: 'Urenmatrix' },
  { sleutel: 'planner', label: 'Mijn planner' },
  { sleutel: 'instellingen', label: 'Instellingen' },
]

export default function App() {
  const api = useAppData()
  const { data, geladen, kanOpslaan } = api
  const [weergave, setWeergave] = useState<Weergave>('overzicht')
  const [openPeriode, setOpenPeriode] = useState<number | null>(null)

  const datums = useMemo(
    () => berekenPeriodeDatums(data.instellingen.periodeStarts),
    [data.instellingen.periodeStarts],
  )
  const positie = useMemo(() => bepaalHuidigePositie(datums), [datums])
  const controle = useMemo(() => controleerData(), [])

  const openTaken = data.taken.filter((t) => t.status !== 'klaar').length
  const nuNummer = positie?.status === 'in' ? positie.periodeNummer : null

  const kiesPeriode = useCallback((nummer: number) => {
    if (nummer >= 1 && nummer <= PERIODES.length) setOpenPeriode(nummer)
  }, [])

  if (!geladen) {
    return (
      <main className="omhulsel" style={{ paddingTop: 80 }}>
        <p className="hint">Bezig met laden…</p>
      </main>
    )
  }

  return (
    <>
      <header className="kop">
        <div className="omhulsel">
          <div className="kop__binnen">
            <span className="woordmerk" aria-label="Rijn IJssel">
              <span>rijn</span>
              <span>IJssel</span>
            </span>
            <span className="kop__scheiding" aria-hidden="true" />
            <span className="kop__label">
              <strong>Jaarplanner {OPLEIDING.naam}</strong>
              Niveau {OPLEIDING.niveau} · cohort {OPLEIDING.cohort} · leerjaar {OPLEIDING.leerjaar}
            </span>
            <div className="kop__rechts">
              <div className="schakel" role="group" aria-label="Loop je stage?">
                <button
                  type="button"
                  className="schakel__optie"
                  aria-pressed={data.instellingen.heeftStage}
                  onClick={() => api.zetInstellingen({ heeftStage: true })}
                >
                  Met stage
                </button>
                <button
                  type="button"
                  className="schakel__optie"
                  aria-pressed={!data.instellingen.heeftStage}
                  onClick={() => api.zetInstellingen({ heeftStage: false })}
                >
                  Zonder stage
                </button>
              </div>
            </div>
          </div>
          <nav className="nav" aria-label="Hoofdmenu">
            {TABBLADEN.map((t) => (
              <button
                key={t.sleutel}
                type="button"
                className="nav__knop"
                aria-current={weergave === t.sleutel ? 'page' : undefined}
                onClick={() => setWeergave(t.sleutel)}
              >
                {t.label}
                {t.sleutel === 'planner' && openTaken > 0 && <span className="nav__telling">{openTaken}</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="omhulsel">
        {!controle.klopt && (
          <div className="melding melding--fout">
            <div>
              <strong>De roosterdata klopt niet met het bronbestand</strong>
              <p>
                Er is iets aangepast in <code>src/data/curriculum.ts</code> waardoor de uren niet meer
                optellen tot de controlegetallen uit de backbone. Meld dit bij je docent voordat je op deze
                cijfers vertrouwt.
              </p>
              <ul>
                {controle.meldingen.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!kanOpslaan && weergave !== 'instellingen' && (
          <div className="melding">
            <div>
              <strong>Je taken worden niet bewaard</strong>
              <p>
                Deze browser blokkeert opslag (bijvoorbeeld in een privévenster). Je kunt alles gewoon
                gebruiken, maar bij het sluiten van het tabblad ben je je planning kwijt.
              </p>
            </div>
          </div>
        )}

        {weergave === 'overzicht' && (
          <Jaaroverzicht
            datums={datums}
            positie={positie}
            heeftStage={data.instellingen.heeftStage}
            taken={data.taken}
            onKiesPeriode={kiesPeriode}
            onGaNaarInstellingen={() => setWeergave('instellingen')}
          />
        )}

        {weergave === 'matrix' && (
          <Urenmatrix
            datums={datums}
            positie={positie}
            heeftStage={data.instellingen.heeftStage}
            keuzedeelNaam={data.instellingen.keuzedeelNaam}
            onKiesPeriode={kiesPeriode}
          />
        )}

        {weergave === 'planner' && (
          <Planner
            taken={data.taken}
            positie={positie}
            keuzedeelNaam={data.instellingen.keuzedeelNaam}
            onVoegToe={api.voegTaakToe}
            onWijzig={api.wijzigTaak}
            onVerwijder={api.verwijderTaak}
          />
        )}

        {weergave === 'instellingen' && (
          <Instellingen
            data={data}
            kanOpslaan={kanOpslaan}
            onZet={api.zetInstellingen}
            onVervang={api.vervangAlles}
          />
        )}

        <footer className="voet">
          <span>
            Roosterdata: {OPLEIDING.bron}. Wijkt er iets af van je echte rooster? Je docent en de
            studiewijzer gaan altijd voor.
          </span>
          <span>Je persoonlijke planning staat alleen op dit apparaat.</span>
        </footer>
      </main>

      {openPeriode !== null && (
        <PeriodeDetail
          nummer={openPeriode}
          datums={datums}
          heeftStage={data.instellingen.heeftStage}
          keuzedeelNaam={data.instellingen.keuzedeelNaam}
          taken={data.taken}
          isNu={nuNummer === openPeriode}
          onSluit={() => setOpenPeriode(null)}
          onNavigeer={kiesPeriode}
        />
      )}
    </>
  )
}
