import { useRef, useState, type ChangeEvent } from 'react'
import { OPLEIDING, PERIODES, WEKEN_PER_PERIODE } from '../data/curriculum'
import { controleerData, totaalBotUrenJaar, uren } from '../lib/berekeningen'
import { berekenPeriodeDatums, formatLang, leidStartsAf, naarIso, plusDagen } from '../lib/datum'
import { LEGE_DATA, wisData } from '../lib/opslag'
import type { AppData, Instellingen as InstellingenType } from '../lib/types'

interface Props {
  data: AppData
  kanOpslaan: boolean
  onZet: (wijziging: Partial<InstellingenType>) => void
  onVervang: (data: AppData) => void
}

export default function Instellingen({ data, kanOpslaan, onZet, onVervang }: Props) {
  const { instellingen } = data
  const [bericht, setBericht] = useState('')
  const [fout, setFout] = useState('')
  const bestandRef = useRef<HTMLInputElement>(null)

  const datums = berekenPeriodeDatums(instellingen.periodeStarts)
  const controle = controleerData()

  function zetEersteStart(iso: string) {
    if (!iso) {
      onZet({ periodeStarts: [] })
      return
    }
    onZet({ periodeStarts: leidStartsAf(iso) })
  }

  function zetPeriodeStart(index: number, iso: string) {
    const starts = [...instellingen.periodeStarts]
    if (starts.length !== PERIODES.length) return
    starts[index] = iso
    onZet({ periodeStarts: starts })
  }

  function exporteer() {
    setFout('')
    const inhoud = JSON.stringify(data, null, 2)
    try {
      const blob = new Blob([inhoud], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `jaarplanner-abs-${naarIso(new Date())}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 0)
      setBericht('Back-up gedownload. Bewaar dit bestand ergens veilig.')
    } catch {
      setFout('Downloaden lukt niet in dit venster. Gebruik hieronder de knop om je gegevens te kopiëren.')
    }
  }

  async function kopieer() {
    setFout('')
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setBericht('Je gegevens staan op het klembord. Plak ze in een tekstbestand om te bewaren.')
    } catch {
      setFout('Kopiëren is geblokkeerd door je browser. Gebruik de downloadknop.')
    }
  }

  function importeer(e: ChangeEvent<HTMLInputElement>) {
    const bestand = e.target.files?.[0]
    if (!bestand) return
    const lezer = new FileReader()
    lezer.onload = () => {
      try {
        const nieuw = JSON.parse(String(lezer.result)) as AppData
        if (nieuw?.versie !== 1 || !Array.isArray(nieuw.taken)) {
          throw new Error('onbekend formaat')
        }
        if (!window.confirm('Dit vervangt je huidige taken en instellingen. Doorgaan?')) return
        onVervang({
          versie: 1,
          instellingen: { ...LEGE_DATA.instellingen, ...nieuw.instellingen },
          taken: nieuw.taken,
        })
        setBericht('Back-up teruggezet.')
        setFout('')
      } catch {
        setFout('Dit bestand kon niet gelezen worden. Kies een back-up die uit deze app komt.')
      }
    }
    lezer.readAsText(bestand)
    e.target.value = ''
  }

  return (
    <section className="sectie">
      <div className="sectie__kop">
        <div>
          <h2 className="sectie__titel">Instellingen</h2>
          <p className="sectie__uitleg">
            Alles hieronder geldt alleen voor jouw laptop. Er wordt niets verstuurd of gedeeld.
          </p>
        </div>
      </div>

      {!kanOpslaan && (
        <div className="melding melding--fout">
          <div>
            <strong>Je browser slaat niets op</strong>
            <p>
              Waarschijnlijk sta je in een privévenster of blokkeert je browser opslag voor deze pagina.
              De app werkt gewoon, maar je taken zijn weg zodra je het tabblad sluit.
            </p>
          </div>
        </div>
      )}

      <div className="kaart" style={{ padding: 'clamp(18px, 2.6vw, 26px)', marginBottom: 18 }}>
        <h3 style={{ fontSize: 'var(--stap-1)', marginBottom: 6 }}>Schooljaar</h3>
        <p className="hint" style={{ marginBottom: 14 }}>
          De backbone van de opleiding bevat geen datums. Vul de eerste schooldag van periode 1 in; de app
          rekent dan {PERIODES.length} periodes van {WEKEN_PER_PERIODE} weken door. Vallen er vakanties
          tussen, dan pas je de betreffende periode daaronder los aan.
        </p>

        <div className="raster" style={{ marginBottom: 16 }}>
          <div className="veld">
            <label htmlFor="start-p1">Eerste schooldag periode 1</label>
            <input
              id="start-p1"
              type="date"
              value={instellingen.periodeStarts[0] ?? ''}
              onChange={(e) => zetEersteStart(e.target.value)}
            />
          </div>
          <div className="veld">
            <label htmlFor="eigen-naam">Je naam (optioneel)</label>
            <input
              id="eigen-naam"
              value={instellingen.naam}
              maxLength={40}
              placeholder="Alleen voor jezelf"
              onChange={(e) => onZet({ naam: e.target.value })}
            />
          </div>
        </div>

        {datums && (
          <>
            <h4 style={{ fontSize: 'var(--stap-0)', margin: '18px 0 8px' }}>Startdatum per periode bijstellen</h4>
            <div className="raster">
              {PERIODES.map((p, i) => (
                <div className="veld" key={p.nummer}>
                  <label htmlFor={`start-${p.nummer}`}>Periode {p.nummer}</label>
                  <input
                    id={`start-${p.nummer}`}
                    type="date"
                    value={instellingen.periodeStarts[i] ?? ''}
                    onChange={(e) => zetPeriodeStart(i, e.target.value)}
                  />
                  <span className="hint">
                    t/m {formatLang(plusDagen(datums[i].start, WEKEN_PER_PERIODE * 7 - 1))}
                  </span>
                </div>
              ))}
            </div>
            <div className="melding melding--info" style={{ marginTop: 16 }}>
              <div>
                <strong>Controleer deze datums met de schooljaarkalender</strong>
                <p>
                  Ze zijn doorgerekend vanaf de datum die jij hebt ingevuld, zonder rekening te houden met
                  vakanties. Klopt er iets niet, corrigeer het dan hierboven.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="kaart" style={{ padding: 'clamp(18px, 2.6vw, 26px)', marginBottom: 18 }}>
        <h3 style={{ fontSize: 'var(--stap-1)', marginBottom: 6 }}>Stage en keuzedeel</h3>
        <div className="raster" style={{ marginTop: 12 }}>
          <div className="veld">
            <label htmlFor="kd">Welk keuzedeel doe je?</label>
            <input
              id="kd"
              value={instellingen.keuzedeelNaam}
              maxLength={60}
              placeholder="Nog te kiezen"
              onChange={(e) => onZet({ keuzedeelNaam: e.target.value })}
            />
            <span className="hint">
              Alleen voor jezelf — dit blijft op je eigen laptop en gaat niet naar de opleiding.
            </span>
          </div>
          <div className="veld">
            <label htmlFor="stage-schakel">Loop je stage vanaf periode 4?</label>
            <div className="schakel" id="stage-schakel">
              <button
                type="button"
                className="schakel__optie"
                aria-pressed={instellingen.heeftStage}
                onClick={() => onZet({ heeftStage: true })}
              >
                Ja, ik loop stage
              </button>
              <button
                type="button"
                className="schakel__optie"
                aria-pressed={!instellingen.heeftStage}
                onClick={() => onZet({ heeftStage: false })}
              >
                Nog geen stageplek
              </button>
            </div>
            <span className="hint">
              Zonder stageplek volg je 4 uur begeleiding per week (2 × 2 uur) in plaats van 16 uur stage.
            </span>
          </div>
        </div>
      </div>

      <div className="kaart" style={{ padding: 'clamp(18px, 2.6vw, 26px)', marginBottom: 18 }}>
        <h3 style={{ fontSize: 'var(--stap-1)', marginBottom: 6 }}>Je gegevens</h3>
        <div className="privacy" style={{ marginTop: 12 }}>
          <div>
            <strong>Waar staat je planning?</strong>
            <p>
              In de opslag van deze browser, op dit apparaat. Er is geen server, geen inlog en geen
              database. Klasgenoten en docenten kunnen er technisch niet bij. Wis je je browsergegevens
              of gebruik je een andere laptop, dan is je planning weg — maak daarom af en toe een back-up.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          <button type="button" className="knop" onClick={exporteer}>
            Back-up downloaden
          </button>
          <button type="button" className="knop" onClick={kopieer}>
            Kopieer naar klembord
          </button>
          <button type="button" className="knop" onClick={() => bestandRef.current?.click()}>
            Back-up terugzetten
          </button>
          <input
            ref={bestandRef}
            type="file"
            accept="application/json,.json"
            onChange={importeer}
            className="vh"
            aria-hidden="true"
            tabIndex={-1}
          />
          <button
            type="button"
            className="knop knop--gevaar"
            onClick={() => {
              if (
                window.confirm(
                  'Alles wissen? Je taken, deadlines en instellingen verdwijnen definitief van dit apparaat.',
                )
              ) {
                wisData()
                onVervang(LEGE_DATA)
                setBericht('Alle gegevens zijn van dit apparaat gewist.')
              }
            }}
          >
            Alles wissen
          </button>
        </div>

        {bericht && (
          <p className="hint" role="status" style={{ marginTop: 12, color: 'var(--ok)' }}>
            {bericht}
          </p>
        )}
        {fout && (
          <p className="hint" role="alert" style={{ marginTop: 12, color: 'var(--accent)' }}>
            {fout}
          </p>
        )}
      </div>

      <div className="kaart" style={{ padding: 'clamp(18px, 2.6vw, 26px)' }}>
        <h3 style={{ fontSize: 'var(--stap-1)', marginBottom: 6 }}>Herkomst van de roosterdata</h3>
        <p className="hint">
          {OPLEIDING.naam}, niveau {OPLEIDING.niveau}, cohort {OPLEIDING.cohort}, leerjaar{' '}
          {OPLEIDING.leerjaar}. Bron: {OPLEIDING.bron}.
        </p>
        {controle.klopt ? (
          <div className="melding" style={{ borderColor: 'rgba(93,217,193,0.4)', background: 'rgba(93,217,193,0.08)' }}>
            <div>
              <strong>Doorgerekend en akkoord</strong>
              <p>
                De uren in dit dashboard tellen exact op tot de controlegetallen uit het bronbestand:{' '}
                {uren(totaalBotUrenJaar())} lesuren over {PERIODES.length} periodes.
              </p>
            </div>
          </div>
        ) : (
          <div className="melding melding--fout">
            <div>
              <strong>Let op: de uren wijken af van het bronbestand</strong>
              <ul>
                {controle.meldingen.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
