import { useCallback, useMemo, useState } from 'react'
import Jaaroverzicht from './components/Jaaroverzicht'
import PeriodeDetail from './components/PeriodeDetail'
import Planner from './components/Planner'
import Urenmatrix from './components/Urenmatrix'
import Instellingen from './components/Instellingen'
import Logo from './components/Logo'
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
        <p className="hint">Even laden…</p>
      </main>
    )
  }

  return (
    <>
      <header className="kop">
        <div className="omhulsel">
          <div className="kop__binnen">
            <Logo />
            <span className="kop__scheiding" aria-hidden="true" />
            <span className="kop__label">
              <strong>Jaarplanner {OPLEIDING.naam}</strong>
              Niveau {OPLEIDING.niveau} · cohort {OPLEIDING.cohort} · leerjaar {OPLEIDING.leerjaar}
            </span>
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
                De uren in dit dashboard kloppen niet meer met het rooster van de opleiding. Vertel dit
                aan je docent voordat je op deze cijfers vertrouwt.
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
                Deze browser slaat niets op. Dat gebeurt bijvoorbeeld in een privévenster. Je kunt de app
                gewoon gebruiken. Maar als je dit tabblad sluit, ben je je planning kwijt.
              </p>
            </div>
          </div>
        )}

        {weergave === 'overzicht' && (
          <Jaaroverzicht
            datums={datums}
            positie={positie}
            taken={data.taken}
            onKiesPeriode={kiesPeriode}
            onGaNaarInstellingen={() => setWeergave('instellingen')}
          />
        )}

        {weergave === 'matrix' && (
          <Urenmatrix
            datums={datums}
            positie={positie}
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
            De uren komen uit het rooster van de opleiding. Klopt er iets niet met je echte rooster? Dan
            gaan je docent en de studiewijzer altijd voor.
          </span>
          <span>Je eigen planning staat alleen op dit apparaat.</span>
        </footer>
      </main>

      {openPeriode !== null && (
        <PeriodeDetail
          nummer={openPeriode}
          datums={datums}
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
