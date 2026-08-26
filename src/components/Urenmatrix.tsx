import { PERIODES, VAKKEN, WEKEN_PER_PERIODE } from '../data/curriculum'
import {
  botUrenPerWeek,
  bouwVakMatrix,
  stageUrenPerWeek,
  totaalBotUrenJaar,
  totaalStageUrenJaar,
  uren,
} from '../lib/berekeningen'
import { formatKort, type HuidigePositie, type PeriodeDatums } from '../lib/datum'
import { Vaknaam } from './Basis'

interface Props {
  datums: PeriodeDatums[] | null
  positie: HuidigePositie | null
  heeftStage: boolean
  keuzedeelNaam: string
  onKiesPeriode: (nummer: number) => void
}

/** Zet uren om naar een dekkingsgraad, zodat veel uren visueel zwaarder wegen. */
function vlakStijl(urenPerWeek: number, kleur: string, max: number) {
  if (urenPerWeek <= 0) return undefined
  const sterkte = 0.25 + (urenPerWeek / max) * 0.75
  return { background: kleur, opacity: sterkte }
}

export default function Urenmatrix({ datums, positie, heeftStage, keuzedeelNaam, onKiesPeriode }: Props) {
  const rijen = bouwVakMatrix()
  const nuNummer = positie?.status === 'in' ? positie.periodeNummer : null
  const maxUren = Math.max(...rijen.flatMap((r) => r.perPeriode))

  return (
    <section className="sectie">
      <div className="sectie__kop">
        <div>
          <h2 className="sectie__titel">Urenmatrix</h2>
          <p className="sectie__uitleg">
            Alle uren per vak, per periode — de getallen zijn <strong>lesuren per week</strong>. Eén periode
            duurt {WEKEN_PER_PERIODE} weken, dus vermenigvuldig met {WEKEN_PER_PERIODE} voor het totaal.
            De laatste kolom laat zien hoeveel klokuren je dit leerjaar in totaal aan dat vak besteedt.
          </p>
        </div>
      </div>

      <div className="tabelhoes">
        <table className="matrix">
          <caption className="vh">
            Lesuren per week per vak, uitgesplitst naar de acht periodes van leerjaar 1.
          </caption>
          <colgroup>
            <col />
            {PERIODES.map((p) => (
              <col key={p.nummer} className={nuNummer === p.nummer ? 'nu-kolom' : undefined} />
            ))}
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="vak">
                Vak
              </th>
              {PERIODES.map((p, i) => (
                <th scope="col" key={p.nummer}>
                  <button
                    type="button"
                    className="knop knop--stil knop--klein"
                    onClick={() => onKiesPeriode(p.nummer)}
                    style={{ flexDirection: 'column', gap: 0, color: 'inherit' }}
                  >
                    <span>P{p.nummer}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.68rem', color: 'var(--tekst-gedempt)' }}>
                      {datums?.[i] ? formatKort(datums[i].start) : `${p.weken} wk`}
                    </span>
                  </button>
                </th>
              ))}
              <th scope="col">Jaar</th>
            </tr>
          </thead>
          <tbody>
            {rijen.map((r) => (
              <tr key={r.vakId}>
                <th scope="row" className="vak">
                  <Vaknaam vakId={r.vakId} keuzedeelNaam={keuzedeelNaam} />
                </th>
                {r.perPeriode.map((u, i) => (
                  <td key={i} className={u === 0 ? 'nul' : undefined}>
                    {u === 0 ? (
                      '–'
                    ) : (
                      <span className="waarde" style={vlakStijl(u, r.kleur, maxUren)}>
                        {uren(u)}
                      </span>
                    )}
                  </td>
                ))}
                <td className="totaal">{uren(r.jaarUren)} u</td>
              </tr>
            ))}

            <tr className="som">
              <th scope="row" className="vak">
                Lesuren per week
              </th>
              {PERIODES.map((p) => (
                <td key={p.nummer}>{uren(botUrenPerWeek(p))}</td>
              ))}
              <td>{uren(totaalBotUrenJaar())} u</td>
            </tr>
            <tr>
              <th scope="row" className="vak">
                <span className="vaknaam">
                  <span className="vaknaam__punt" style={{ background: 'var(--ri-oranje)' }} aria-hidden="true" />
                  {heeftStage ? 'Stage (BPV)' : 'Begeleiding zonder stage'}
                </span>
              </th>
              {PERIODES.map((p) => {
                const u = stageUrenPerWeek(p, heeftStage)
                return (
                  <td key={p.nummer} className={u === 0 ? 'nul' : undefined}>
                    {u === 0 ? (
                      '–'
                    ) : (
                      <span className="waarde" style={{ background: 'var(--ri-oranje)', color: '#fff' }}>
                        {uren(u)}
                      </span>
                    )}
                  </td>
                )
              })}
              <td className="totaal">{uren(totaalStageUrenJaar(heeftStage))} u</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="melding melding--info">
        <div>
          <strong>Zo lees je deze tabel</strong>
          <p>
            Een “–” betekent dat het vak in die periode niet op je rooster staat. {VAKKEN.sport.naam} loopt
            alleen in periode 1 en 2, {VAKKEN.keuzedelen.naam} starten in periode 3, en{' '}
            {VAKKEN.projectenabs.naam} en {VAKKEN.sollicitatietraining.naam} stoppen na periode 3. De rij
            “Lesuren per week” is exclusief stage, precies zoals de opleiding het rekent.
          </p>
        </div>
      </div>
    </section>
  )
}
