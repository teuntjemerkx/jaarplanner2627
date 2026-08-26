import { useEffect, useRef } from 'react'
import { PERIODES, VAKKEN } from '../data/curriculum'
import {
  botUrenPerPeriode,
  botUrenPerWeek,
  periodeOpNummer,
  stageUrenPerPeriode,
  stageUrenPerWeek,
  totaalUrenPerWeek,
  uren,
} from '../lib/berekeningen'
import { formatLang, type PeriodeDatums } from '../lib/datum'
import type { Taak } from '../lib/types'
import { Icoon, Merk, Stapelbalk, Vaknaam, periodeStapel } from './Basis'

interface Props {
  nummer: number
  datums: PeriodeDatums[] | null
  keuzedeelNaam: string
  taken: Taak[]
  isNu: boolean
  onSluit: () => void
  onNavigeer: (nummer: number) => void
}

export default function PeriodeDetail({ nummer, datums, keuzedeelNaam, taken, isNu, onSluit, onNavigeer }: Props) {
  const periode = periodeOpNummer(nummer)
  const paneel = useRef<HTMLDivElement>(null)
  const sluitKnop = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    sluitKnop.current?.focus()
    const opToets = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSluit()
    }
    document.addEventListener('keydown', opToets)
    const vorigeOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', opToets)
      document.body.style.overflow = vorigeOverflow
    }
  }, [onSluit])

  if (!periode) return null

  const datum = datums?.find((d) => d.nummer === nummer)
  const week = botUrenPerWeek(periode)
  const totaal = botUrenPerPeriode(periode)
  const stageWeek = stageUrenPerWeek(periode)
  const stageTotaal = stageUrenPerPeriode(periode)
  const regulier = periode.examens.filter((e) => e.kans === 1)
  const herkansingen = periode.examens.filter((e) => e.kans === 2)
  const eigenTaken = taken.filter((t) => t.periodeNummer === nummer)

  return (
    <div
      className="paneel-achter"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onSluit()
      }}
    >
      <div className="paneel" role="dialog" aria-modal="true" aria-labelledby="paneel-titel" ref={paneel}>
        <div className="paneel__kop">
          <Icoon teken={String(nummer)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="paneel__titel" id="paneel-titel">
              Periode {nummer}
              {isNu && (
                <>
                  {' '}
                  <Merk soort="nu">nu</Merk>
                </>
              )}
            </h2>
            <p className="paneel__sub">
              {datum ? `${formatLang(datum.start)} t/m ${formatLang(datum.eind)}` : `${periode.weken} lesweken`}
              {' · '}
              {uren(week)} uur les per week
              {stageWeek > 0 && ` · ${uren(stageWeek)} uur stage`}
            </p>
          </div>
          <button type="button" className="knop knop--stil" onClick={onSluit} ref={sluitKnop} aria-label="Sluit paneel">
            ✕
          </button>
        </div>

        <Stapelbalk delen={periodeStapel(periode)} hoog />
        <p className="hint" style={{ marginTop: 8 }}>
          {uren(week)} lesuren per week × {periode.weken} weken = <strong>{uren(totaal)} uur</strong>
          {stageWeek > 0 && (
            <>
              {' '}
              · plus {uren(stageTotaal)} uur stage ={' '}
              <strong>{uren(totaalUrenPerWeek(periode) * periode.weken)} uur totaal</strong>
            </>
          )}
        </p>

        <h3>Je vakken in deze periode</h3>
        {periode.vakken.map((v) => (
          <div className="regel" key={v.vakId}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="regel__naam">
                <Vaknaam vakId={v.vakId} keuzedeelNaam={keuzedeelNaam} />
              </div>
              <div className="regel__uitleg">{VAKKEN[v.vakId].toelichting}</div>
            </div>
            <div className="regel__uren">
              <b>{uren(v.urenPerWeek)}</b>
              <span>uur per week · {uren(v.urenPerWeek * periode.weken)} uur totaal</span>
            </div>
          </div>
        ))}

        {stageWeek > 0 && (
          <>
            <h3>Je stage</h3>
            <div className="regel regel--stage">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="regel__naam">Stage</div>
                <div className="regel__uitleg">
                  Deze periode loop je stage. Dat doe je naast je lessen op school.
                </div>
              </div>
              <div className="regel__uren">
                <b>{uren(stageWeek)}</b>
                <span>uur per week · {uren(stageTotaal)} uur totaal</span>
              </div>
            </div>
          </>
        )}

        <h3>Examens</h3>
        {regulier.length === 0 && herkansingen.length === 0 ? (
          <div className="melding melding--info">
            <div>
              <strong>Geen examens in deze periode</strong>
              <p>
                In periode {nummer} heb je geen examen. Gebruik deze tijd om alvast vooruit te werken.
              </p>
            </div>
          </div>
        ) : (
          <>
            {regulier.map((e, i) => (
              <div className="regel regel--examen" key={`k1-${i}`}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="regel__naam">{e.naam}</div>
                  <div className="regel__uitleg">
                    {e.soort === 'CE'
                      ? 'Centraal examen. Dit examen is in heel Nederland hetzelfde.'
                      : e.soort === 'IE'
                        ? 'Instellingsexamen. Dit examen maakt Rijn IJssel zelf.'
                        : 'Examen over een werkproces. Je laat zien dat je het werk kunt.'}
                    {e.vakId ? ` · ${VAKKEN[e.vakId].naam}` : ''}
                  </div>
                </div>
                <Merk soort="examen">1e kans</Merk>
              </div>
            ))}
            {herkansingen.map((e, i) => (
              <div className="regel regel--herkansing" key={`k2-${i}`}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="regel__naam">{e.naam}</div>
                  <div className="regel__uitleg">
                    Dit is een herkansing. Je doet dit alleen als je de eerste kans niet gehaald hebt.
                  </div>
                </div>
                <Merk soort="herkansing">2e kans</Merk>
              </div>
            ))}
          </>
        )}

        <h3>Jouw taken in deze periode</h3>
        {eigenTaken.length === 0 ? (
          <p className="hint">
            Je hebt nog geen taken bij periode {nummer} gezet. Dat doe je bij “Mijn planner”.
          </p>
        ) : (
          eigenTaken.map((t) => (
            <div className="regel" key={t.id}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="regel__naam" style={{ textDecoration: t.status === 'klaar' ? 'line-through' : undefined }}>
                  {t.titel}
                </div>
                <div className="regel__uitleg">
                  {t.vakId ? VAKKEN[t.vakId].naam : 'Geen vak'} ·{' '}
                  {t.status === 'klaar' ? 'klaar' : 'nog te doen'}
                </div>
              </div>
              {t.geschatteUren > 0 && (
                <div className="regel__uren">
                  <b>{uren(t.geschatteUren)}</b>
                  <span>uur ingepland</span>
                </div>
              )}
            </div>
          ))
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 26, flexWrap: 'wrap' }}>
          {nummer > 1 && (
            <button type="button" className="knop knop--klein" onClick={() => onNavigeer(nummer - 1)}>
              ← Periode {nummer - 1}
            </button>
          )}
          {nummer < PERIODES.length && (
            <button type="button" className="knop knop--klein" onClick={() => onNavigeer(nummer + 1)}>
              Periode {nummer + 1} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
