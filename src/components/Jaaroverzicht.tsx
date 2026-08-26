import { PERIODES, VAKKEN, WEKEN_PER_PERIODE, type VakId } from '../data/curriculum'
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
import { Cijfer, Icoon, Legenda, Merk, Stapelbalk, periodeStapel } from './Basis'

interface Props {
  datums: PeriodeDatums[] | null
  positie: HuidigePositie | null
  heeftStage: boolean
  taken: Taak[]
  onKiesPeriode: (nummer: number) => void
  onGaNaarInstellingen: () => void
}

export default function Jaaroverzicht({
  datums,
  positie,
  heeftStage,
  taken,
  onKiesPeriode,
  onGaNaarInstellingen,
}: Props) {
  const matrix = bouwVakMatrix()
  const botJaar = totaalBotUrenJaar()
  const stageJaar = totaalStageUrenJaar(heeftStage)
  const nuNummer = positie?.status === 'in' ? positie.periodeNummer : null

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
        : ((positie.periodeNummer - 1) * WEKEN_PER_PERIODE + Math.max(0, positie.weekInPeriode)) /
          (PERIODES.length * WEKEN_PER_PERIODE) *
          100
    : 0

  return (
    <>
      <section className="hero">
        <div className="kaart hero__hoofd">
          <p className="hero__oog">Leerjaar 1 · cohort 2026 · niveau 2</p>
          <h1 className="hero__titel">
            Jouw jaar in <em>één oogopslag</em>
          </h1>
          <p className="hero__onder">
            Acht periodes van {WEKEN_PER_PERIODE} weken. Hieronder zie je precies hoeveel uur je per vak
            hebt in elke periode, wanneer je examens vallen en wanneer je stage begint. Klik op een
            periode voor alle details.
          </p>
          <div className="hero__cijfers">
            <Cijfer waarde={PERIODES.length} label="periodes" />
            <Cijfer waarde={PERIODES.length * WEKEN_PER_PERIODE} label="lesweken" />
            <Cijfer waarde={botJaar} label="uur les op school" />
            <Cijfer waarde={stageJaar} label={heeftStage ? 'uur stage' : 'uur begeleiding'} />
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
                    Start over {positie.dagenTotEind} {positie.dagenTotEind === 1 ? 'dag' : 'dagen'}.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="nu__periode">Alle periodes voorbij</h2>
                  <p className="nu__meta">Het schooljaar zoals ingesteld is afgelopen.</p>
                </>
              )}
              <div className="nu__balk">
                <i style={{ width: `${Math.min(100, Math.max(0, voortgang))}%` }} />
              </div>
              <p className="hint">{Math.round(voortgang)}% van het lesjaar afgelegd</p>
            </>
          ) : (
            <>
              <span className="nu__badge">Nog instellen</span>
              <h2 className="nu__periode">Wanneer start periode 1?</h2>
              <p className="nu__meta">
                De schooldatums staan niet in de backbone van de opleiding. Vul de startdatum één keer
                in, dan weet dit dashboard waar je nu bent en welke deadlines eraan komen.
              </p>
              <button type="button" className="knop knop--primair" onClick={onGaNaarInstellingen}>
                Startdatum invullen
              </button>
            </>
          )}
        </div>
      </section>

      <section className="sectie" aria-labelledby="backbone-titel">
        <div className="sectie__kop">
          <div>
            <h2 className="sectie__titel" id="backbone-titel">
              De backbone van je jaar
            </h2>
            <p className="sectie__uitleg">
              Elk blokje is één periode. De gekleurde balk laat zien hoe je lesuren over de vakken
              verdeeld zijn. Vanaf periode 4 komt de stage erbij.
            </p>
          </div>
          <p className="hint">Klik op een periode →</p>
        </div>

        <div className="rail">
          {PERIODES.map((p, i) => {
            const week = botUrenPerWeek(p)
            const stage = stageUrenPerWeek(p, heeftStage)
            const kans1 = p.examens.filter((e) => e.kans === 1).length
            const kans2 = p.examens.filter((e) => e.kans === 2).length
            const open = openTakenPerPeriode.get(p.nummer) ?? 0
            const isNu = nuNummer === p.nummer
            const isVoorbij = nuNummer != null && p.nummer < nuNummer
            const d = datums?.[i]
            return (
              <button
                type="button"
                key={p.nummer}
                className={`pk${isNu ? ' pk--nu' : ''}${isVoorbij ? ' pk--klaar' : ''}`}
                onClick={() => onKiesPeriode(p.nummer)}
                aria-label={`Periode ${p.nummer} openen. ${uren(week)} lesuren per week${
                  stage > 0 ? `, ${uren(stage)} uur ${heeftStage ? 'stage' : 'begeleiding'}` : ''
                }.`}
              >
                <div className="pk__kop">
                  <span className="pk__nr">
                    {p.nummer}
                    <small> / {PERIODES.length}</small>
                  </span>
                  {isNu && <Merk soort="nu">nu</Merk>}
                </div>
                <span className="pk__datum">{d ? `${formatKort(d.start)} – ${formatKort(d.eind)}` : `${p.weken} weken`}</span>
                <Stapelbalk delen={periodeStapel(p)} />
                <div className="pk__uren">
                  <b>{uren(week)}</b>
                  <span>uur les p/w</span>
                </div>
                <div className="pk__voet">
                  {stage > 0 && (
                    <Merk soort={heeftStage ? 'stage' : 'geenstage'}>
                      {uren(stage)}u {heeftStage ? 'stage' : 'begeleiding'}
                    </Merk>
                  )}
                  {kans1 > 0 && <Merk soort="examen">{kans1} examen{kans1 > 1 ? 's' : ''}</Merk>}
                  {kans2 > 0 && <Merk soort="herkansing">{kans2} herkansing{kans2 > 1 ? 'en' : ''}</Merk>}
                  {open > 0 && <Merk soort="taak">{open} taak{open > 1 ? 'en' : ''}</Merk>}
                </div>
              </button>
            )
          })}
        </div>

        <Legenda vakIds={matrix.map((r) => r.vakId as VakId)} />
      </section>

      <section className="sectie" aria-labelledby="grootste-titel">
        <div className="sectie__kop">
          <div>
            <h2 className="sectie__titel" id="grootste-titel">
              Waar gaat je tijd heen?
            </h2>
            <p className="sectie__uitleg">
              Alle lesuren van het hele leerjaar bij elkaar opgeteld, per vak. Stage staat er los van.
            </p>
          </div>
        </div>
        <div className="kaart" style={{ padding: 'clamp(16px, 2.4vw, 24px)' }}>
          {matrix.map((r) => (
            <div className="regel" key={r.vakId}>
              <Icoon teken={VAKKEN[r.vakId].kort.slice(0, 2)} klein kleur={r.kleur} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="regel__naam">{r.naam}</div>
                <div className="regel__uitleg">
                  {r.aantalPeriodes === PERIODES.length
                    ? 'Alle 8 periodes'
                    : `${r.aantalPeriodes} van de ${PERIODES.length} periodes`}
                </div>
                <div style={{ marginTop: 7 }}>
                  <Stapelbalk
                    delen={[
                      { sleutel: 'vak', label: r.naam, waarde: r.jaarUren, kleur: r.kleur },
                      { sleutel: 'rest', label: 'overig', waarde: Math.max(0, botJaar - r.jaarUren), kleur: 'rgba(215,195,242,0.10)' },
                    ]}
                  />
                </div>
              </div>
              <div className="regel__uren">
                <b>{uren(r.jaarUren)}</b>
                <span>uur dit jaar</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
