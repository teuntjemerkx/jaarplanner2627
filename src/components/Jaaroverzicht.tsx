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
  taken: Taak[]
  onKiesPeriode: (nummer: number) => void
  onGaNaarInstellingen: () => void
}

export default function Jaaroverzicht({
  datums,
  positie,
  taken,
  onKiesPeriode,
  onGaNaarInstellingen,
}: Props) {
  const matrix = bouwVakMatrix()
  const botJaar = totaalBotUrenJaar()
  const stageJaar = totaalStageUrenJaar()
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
            Jouw hele jaar <em>op één plek</em>
          </h1>
          <p className="hero__onder">
            Je jaar bestaat uit {PERIODES.length} periodes. Elke periode duurt {WEKEN_PER_PERIODE} weken.
            Hieronder zie je hoeveel uur je per vak hebt. Ook zie je wanneer je examen doet en wanneer je
            stage begint. Klik op een periode voor meer info.
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

      <section className="sectie" aria-labelledby="backbone-titel">
        <div className="sectie__kop">
          <div>
            <h2 className="sectie__titel" id="backbone-titel">
              Je jaar op een rij
            </h2>
            <p className="sectie__uitleg">
              Elk blokje is één periode. De gekleurde balk laat zien hoeveel uur je aan elk vak hebt.
              Vanaf periode 4 ga je ook op stage.
            </p>
          </div>
          <p className="hint">Klik op een periode voor meer info</p>
        </div>

        <div className="rail">
          {PERIODES.map((p, i) => {
            const week = botUrenPerWeek(p)
            const stage = stageUrenPerWeek(p)
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
                  stage > 0 ? `, ${uren(stage)} uur stage` : ''
                }.`}
              >
                <div className="pk__kop">
                  <span className="pk__nr">
                    {p.nummer}
                    <small> / {PERIODES.length}</small>
                  </span>
                  {isNu && <Merk soort="nu">nu</Merk>}
                </div>
                <span className="pk__datum">{d ? `${formatKort(d.start)} t/m ${formatKort(d.eind)}` : `${p.weken} weken`}</span>
                <Stapelbalk delen={periodeStapel(p)} />
                <div className="pk__uren">
                  <b>{uren(week)}</b>
                  <span>uur les p/w</span>
                </div>
                <div className="pk__voet">
                  {stage > 0 && (
                    <Merk soort="stage">{uren(stage)}u stage</Merk>
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
              Waar gaat je tijd naartoe?
            </h2>
            <p className="sectie__uitleg">
              Dit zijn alle lesuren van het hele jaar bij elkaar opgeteld, per vak. De stage telt hier
              niet mee.
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
