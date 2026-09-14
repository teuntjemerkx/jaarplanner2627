import { PERIODES, VAKKEN, WEKEN_PER_PERIODE, type Periode } from '../data/curriculum'
import {
  botUrenPerWeek,
  bouwVakMatrix,
  stageUrenPerWeek,
  totaalBotUrenJaar,
  totaalStageUrenJaar,
  uren,
} from '../lib/berekeningen'
import { formatKort, type HuidigePositie, type PeriodeDatums } from '../lib/datum'
import type { Taak } from '../lib/types'
import { Cijfer, Merk } from './Basis'

interface Props {
  datums: PeriodeDatums[] | null
  positie: HuidigePositie | null
  taken: Taak[]
  onKiesPeriode: (nummer: number) => void
  onGaNaarInstellingen: () => void
}

interface Fase {
  titel: string
  uitleg: string
  periodes: Periode[]
  metStage: boolean
}

/**
 * Deelt het jaar op in blokken periodes die hetzelfde werken. Voor leerjaar 1
 * levert dat twee helften op: eerst alleen school, daarna school met stage.
 * De indeling komt uit de data en niet uit vaste getallen, zodat hij vanzelf
 * meeverandert als het rooster wijzigt.
 */
function bepaalFases(): Fase[] {
  const fases: Fase[] = []
  for (const p of PERIODES) {
    const metStage = p.stageUrenPerWeek > 0
    const laatste = fases[fases.length - 1]
    if (laatste && laatste.metStage === metStage) {
      laatste.periodes.push(p)
    } else {
      fases.push({ titel: '', uitleg: '', periodes: [p], metStage })
    }
  }
  return fases.map((f) => {
    const van = f.periodes[0].nummer
    const tot = f.periodes[f.periodes.length - 1].nummer
    const reeks = van === tot ? `Periode ${van}` : `Periode ${van} t/m ${tot}`
    const stage = f.periodes[0].stageUrenPerWeek
    return {
      ...f,
      titel: f.metStage ? `${reeks}: school én stage` : `${reeks}: alleen school`,
      uitleg: f.metStage
        ? `Je gaat naar school én je loopt ${uren(stage)} uur per week stage.`
        : 'Je bent alle dagen op school. Je stage begint later dit jaar.',
    }
  })
}

export default function Jaaroverzicht({ datums, positie, taken, onKiesPeriode, onGaNaarInstellingen }: Props) {
  const matrix = bouwVakMatrix()
  const botJaar = totaalBotUrenJaar()
  const stageJaar = totaalStageUrenJaar()
  const nuNummer = positie?.status === 'in' ? positie.periodeNummer : null
  const fases = bepaalFases()
  const maxJaarUren = Math.max(...matrix.map((r) => r.jaarUren))

  const openTakenPerPeriode = new Map<number, number>()
  for (const t of taken) {
    if (t.status === 'klaar' || t.periodeNummer == null) continue
    openTakenPerPeriode.set(t.periodeNummer, (openTakenPerPeriode.get(t.periodeNummer) ?? 0) + 1)
  }

  const voortgang = positie
    ? positie.status === 'na'
      ? 100
      : positie.status === 'voor' && positie.periodeNummer === 1
        ? 0
        : (((positie.periodeNummer - 1) * WEKEN_PER_PERIODE + Math.max(0, positie.weekInPeriode)) /
            (PERIODES.length * WEKEN_PER_PERIODE)) *
          100
    : 0

  function PeriodeKaart({ p }: { p: Periode }) {
    const week = botUrenPerWeek(p)
    const stage = stageUrenPerWeek(p)
    const kans1 = p.examens.filter((e) => e.kans === 1).length
    const kans2 = p.examens.filter((e) => e.kans === 2).length
    const open = openTakenPerPeriode.get(p.nummer) ?? 0
    const isNu = nuNummer === p.nummer
    const isVoorbij = nuNummer != null && p.nummer < nuNummer
    const d = datums?.find((x) => x.nummer === p.nummer)
    const totaal = week + stage

    return (
      <button
        type="button"
        className={`pk${isNu ? ' pk--nu' : ''}${isVoorbij ? ' pk--klaar' : ''}`}
        onClick={() => onKiesPeriode(p.nummer)}
        aria-label={`Periode ${p.nummer} openen. ${uren(week)} uur les per week${
          stage > 0 ? `, ${uren(stage)} uur stage` : ''
        }.`}
      >
        <div className="pk__kop">
          <span className="pk__nr">Periode {p.nummer}</span>
          {isNu && <Merk soort="nu">nu</Merk>}
        </div>
        <span className="pk__datum">{d ? `${formatKort(d.start)} t/m ${formatKort(d.eind)}` : `${p.weken} weken`}</span>

        <dl className="pk__uren">
          <div>
            <dt>les op school</dt>
            <dd>
              {uren(week)} <span>uur</span>
            </dd>
          </div>
          {stage > 0 && (
            <div>
              <dt>stage</dt>
              <dd>
                {uren(stage)} <span>uur</span>
              </dd>
            </div>
          )}
        </dl>

        {/* Alleen tonen als er echt iets te verdelen valt. Een balk die voor
            100% uit één kleur bestaat draagt geen informatie. */}
        {stage > 0 && (
          <div className="verdeel" aria-hidden="true">
            <i className="verdeel__les" style={{ width: `${(week / totaal) * 100}%` }} />
            <i className="verdeel__stage" style={{ width: `${(stage / totaal) * 100}%` }} />
          </div>
        )}

        <div className="pk__voet">
          {kans1 > 0 && <Merk soort="examen">{kans1} examen{kans1 > 1 ? 's' : ''}</Merk>}
          {kans2 > 0 && <Merk soort="herkansing">{kans2} herkansing{kans2 > 1 ? 'en' : ''}</Merk>}
          {kans1 === 0 && kans2 === 0 && <span className="pk__geen">geen examens</span>}
          {open > 0 && <Merk soort="taak">{open} eigen taak{open > 1 ? 'en' : ''}</Merk>}
        </div>
      </button>
    )
  }

  return (
    <>
      <section className="hero">
        <div className="kaart hero__hoofd">
          <p className="hero__oog">Leerjaar 1 · cohort 2026 · niveau 2</p>
          <h1 className="hero__titel">
            Jouw hele jaar <em>op één plek</em>
          </h1>
          <p className="hero__onder">
            Je jaar bestaat uit {PERIODES.length} periodes van {WEKEN_PER_PERIODE} weken. Klik op een
            periode en je ziet precies welke vakken je hebt, hoeveel uur en welke examens eraan komen.
          </p>
          <div className="hero__cijfers">
            <Cijfer waarde={PERIODES.length} label="periodes" />
            <Cijfer waarde={PERIODES.length * WEKEN_PER_PERIODE} label="lesweken" />
            <Cijfer waarde={botJaar} label="uur les op school" />
            <Cijfer waarde={stageJaar} label="uur stage" />
          </div>
        </div>

        <div className="kaart hero__nu">
          {positie ? (
            <>
              <span className="nu__badge">
                <span className="pols" aria-hidden="true" />
                {positie.status === 'in' ? 'Je bent hier' : positie.status === 'voor' ? 'Bijna zover' : 'Jaar afgerond'}
              </span>
              {positie.status === 'in' ? (
                <>
                  <h2 className="nu__periode">Periode {positie.periodeNummer}</h2>
                  <p className="nu__meta">
                    Week {positie.weekInPeriode} van {WEKEN_PER_PERIODE} ·{' '}
                    {positie.dagenTotEind === 0
                      ? 'laatste dag van deze periode'
                      : `nog ${positie.dagenTotEind} ${positie.dagenTotEind === 1 ? 'dag' : 'dagen'}`}
                  </p>
                </>
              ) : positie.status === 'voor' ? (
                <>
                  <h2 className="nu__periode">Periode {positie.periodeNummer}</h2>
                  <p className="nu__meta">
                    Begint over {positie.dagenTotEind} {positie.dagenTotEind === 1 ? 'dag' : 'dagen'}.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="nu__periode">Je jaar zit erop</h2>
                  <p className="nu__meta">Alle periodes die je hebt ingevuld zijn voorbij.</p>
                </>
              )}
              <div className="nu__balk">
                <i style={{ width: `${Math.min(100, Math.max(0, voortgang))}%` }} />
              </div>
              <p className="hint">Je hebt {Math.round(voortgang)}% van het jaar gehad</p>
            </>
          ) : (
            <>
              <span className="nu__badge">Nog instellen</span>
              <h2 className="nu__periode">Wanneer start periode 1?</h2>
              <p className="nu__meta">
                De datums staan niet in het rooster van de opleiding. Vul de eerste schooldag één keer in.
                Daarna zie je altijd in welke periode je zit.
              </p>
              <button type="button" className="knop knop--primair" onClick={onGaNaarInstellingen}>
                Startdatum invullen
              </button>
            </>
          )}
        </div>
      </section>

      {fases.map((fase, i) => {
        const week = botUrenPerWeek(fase.periodes[0])
        const stage = stageUrenPerWeek(fase.periodes[0])
        return (
          <section className="fase" key={i} aria-labelledby={`fase-${i}`}>
            <div className="fase__kop">
              <span className="fase__stap" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h2 className="fase__titel" id={`fase-${i}`}>
                  {fase.titel}
                </h2>
                <p className="fase__uitleg">{fase.uitleg}</p>
              </div>
              <div className="fase__cijfers">
                <span>
                  <b>{uren(week)}</b> uur les per week
                </span>
                {stage > 0 && (
                  <span>
                    <b>{uren(stage)}</b> uur stage per week
                  </span>
                )}
              </div>
            </div>
            <div className="rail">
              {fase.periodes.map((p) => (
                <PeriodeKaart key={p.nummer} p={p} />
              ))}
            </div>
          </section>
        )
      })}

      <section className="sectie" aria-labelledby="grootste-titel">
        <div className="sectie__kop">
          <div>
            <h2 className="sectie__titel" id="grootste-titel">
              Waar gaat je tijd naartoe?
            </h2>
            <p className="sectie__uitleg">
              Alle lesuren van het hele jaar bij elkaar opgeteld, per vak. De stage telt hier niet mee.
            </p>
          </div>
        </div>
        <div className="kaart ranglijst">
          {matrix.map((r) => (
            <div className="rang" key={r.vakId}>
              <span className="rang__naam">
                <span className="rang__punt" style={{ background: r.kleur }} aria-hidden="true" />
                {VAKKEN[r.vakId].naam}
              </span>
              <span className="rang__balk" aria-hidden="true">
                <i style={{ width: `${(r.jaarUren / maxJaarUren) * 100}%`, background: r.kleur }} />
              </span>
              <span className="rang__uren">
                <b>{uren(r.jaarUren)}</b> uur
              </span>
              <span className="rang__wanneer">
                {r.aantalPeriodes === PERIODES.length
                  ? 'het hele jaar'
                  : `${r.aantalPeriodes} van de ${PERIODES.length} periodes`}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
