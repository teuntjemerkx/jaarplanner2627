import { useMemo, useState, type FormEvent } from 'react'
import { PERIODES, VAKKEN, type VakId } from '../data/curriculum'
import { uren } from '../lib/berekeningen'
import { dagenTussen, formatMetDag, naarDatum, vandaag, type HuidigePositie } from '../lib/datum'
import { maakId } from '../lib/opslag'
import type { Taak, TaakStatus } from '../lib/types'
import { Cijfer, Merk } from './Basis'

type Filter = 'open' | 'week' | 'klaar' | 'alles'

interface Props {
  taken: Taak[]
  positie: HuidigePositie | null
  keuzedeelNaam: string
  onVoegToe: (taak: Taak) => void
  onWijzig: (id: string, wijziging: Partial<Taak>) => void
  onVerwijder: (id: string) => void
}

const LEEG = {
  titel: '',
  vakId: '' as VakId | '',
  periodeNummer: '' as number | '',
  deadline: '',
  geschatteUren: '',
  notitie: '',
}

export default function Planner({ taken, positie, keuzedeelNaam, onVoegToe, onWijzig, onVerwijder }: Props) {
  const [formulier, setFormulier] = useState({ ...LEEG })
  const [bewerktId, setBewerktId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('open')
  const [fout, setFout] = useState('')

  const nu = vandaag()

  const gesorteerd = useMemo(() => {
    return [...taken].sort((a, b) => {
      if (a.status === 'klaar' !== (b.status === 'klaar')) return a.status === 'klaar' ? 1 : -1
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline)
      if (a.deadline) return -1
      if (b.deadline) return 1
      return b.aangemaaktOp.localeCompare(a.aangemaaktOp)
    })
  }, [taken])

  const zichtbaar = useMemo(() => {
    return gesorteerd.filter((t) => {
      if (filter === 'alles') return true
      if (filter === 'klaar') return t.status === 'klaar'
      if (filter === 'open') return t.status !== 'klaar'
      const d = t.deadline ? naarDatum(t.deadline) : null
      if (!d || t.status === 'klaar') return false
      const verschil = dagenTussen(nu, d)
      return verschil >= 0 && verschil <= 7
    })
  }, [gesorteerd, filter, nu])

  const open = taken.filter((t) => t.status !== 'klaar')
  const urenGepland = open.reduce((s, t) => s + t.geschatteUren, 0)
  const eerstvolgende = open
    .filter((t) => t.deadline)
    .map((t) => naarDatum(t.deadline as string))
    .filter((d): d is Date => d !== null)
    .filter((d) => dagenTussen(nu, d) >= 0)
    .sort((a, b) => a.getTime() - b.getTime())[0]

  function verstuur(e: FormEvent) {
    e.preventDefault()
    const titel = formulier.titel.trim()
    if (!titel) {
      setFout('Geef je taak een naam, anders weet je later niet meer wat je moest doen.')
      return
    }
    const geschat = Number(formulier.geschatteUren)
    if (formulier.geschatteUren !== '' && (!Number.isFinite(geschat) || geschat < 0)) {
      setFout('Vul bij studie-uren een getal van 0 of hoger in.')
      return
    }
    setFout('')

    const velden = {
      titel,
      vakId: formulier.vakId === '' ? null : (formulier.vakId as VakId),
      periodeNummer: formulier.periodeNummer === '' ? null : Number(formulier.periodeNummer),
      deadline: formulier.deadline || null,
      geschatteUren: formulier.geschatteUren === '' ? 0 : geschat,
      notitie: formulier.notitie.trim(),
    }

    if (bewerktId) {
      onWijzig(bewerktId, velden)
      setBewerktId(null)
    } else {
      onVoegToe({ id: maakId(), status: 'todo', aangemaaktOp: new Date().toISOString(), ...velden })
    }
    setFormulier({ ...LEEG })
  }

  function bewerk(t: Taak) {
    setBewerktId(t.id)
    setFout('')
    setFormulier({
      titel: t.titel,
      vakId: t.vakId ?? '',
      periodeNummer: t.periodeNummer ?? '',
      deadline: t.deadline ?? '',
      geschatteUren: t.geschatteUren ? String(t.geschatteUren) : '',
      notitie: t.notitie,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function volgendeStatus(huidig: TaakStatus): TaakStatus {
    return huidig === 'klaar' ? 'todo' : 'klaar'
  }

  return (
    <section className="sectie">
      <div className="sectie__kop">
        <div>
          <h2 className="sectie__titel">Mijn planner</h2>
          <p className="sectie__uitleg">
            Je eigen taken, deadlines en studie-uren. Alles wat je hier invult blijft op deze laptop staan:
            er is geen server, geen account en geen klasgenoot die kan meekijken.
          </p>
        </div>
      </div>

      <div className="hero__cijfers" style={{ marginBottom: 20 }}>
        <Cijfer waarde={open.length} label={open.length === 1 ? 'open taak' : 'open taken'} />
        <Cijfer waarde={urenGepland} label="uur zelf gepland" eenheid="u" />
        <Cijfer
          waarde={eerstvolgende ? formatMetDag(eerstvolgende) : '—'}
          label="eerstvolgende deadline"
        />
        <Cijfer waarde={taken.filter((t) => t.status === 'klaar').length} label="afgerond" />
      </div>

      <div className="planner">
        <form className="kaart taakform" onSubmit={verstuur}>
          <h3 style={{ fontSize: 'var(--stap-1)' }}>{bewerktId ? 'Taak bewerken' : 'Nieuwe taak'}</h3>

          <div className="veld">
            <label htmlFor="t-titel">Wat moet je doen?</label>
            <input
              id="t-titel"
              value={formulier.titel}
              maxLength={140}
              placeholder="Bijv. verslag Business Services afmaken"
              onChange={(e) => setFormulier({ ...formulier, titel: e.target.value })}
            />
          </div>

          <div className="raster">
            <div className="veld">
              <label htmlFor="t-vak">Vak</label>
              <select
                id="t-vak"
                value={formulier.vakId}
                onChange={(e) => setFormulier({ ...formulier, vakId: e.target.value as VakId | '' })}
              >
                <option value="">Geen vak</option>
                {Object.values(VAKKEN).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.id === 'keuzedelen' && keuzedeelNaam ? `${v.naam} · ${keuzedeelNaam}` : v.naam}
                  </option>
                ))}
              </select>
            </div>

            <div className="veld">
              <label htmlFor="t-periode">Periode</label>
              <select
                id="t-periode"
                value={formulier.periodeNummer}
                onChange={(e) =>
                  setFormulier({ ...formulier, periodeNummer: e.target.value === '' ? '' : Number(e.target.value) })
                }
              >
                <option value="">Geen periode</option>
                {PERIODES.map((p) => (
                  <option key={p.nummer} value={p.nummer}>
                    Periode {p.nummer}
                    {positie?.status === 'in' && positie.periodeNummer === p.nummer ? ' (nu)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="raster">
            <div className="veld">
              <label htmlFor="t-deadline">Deadline</label>
              <input
                id="t-deadline"
                type="date"
                value={formulier.deadline}
                onChange={(e) => setFormulier({ ...formulier, deadline: e.target.value })}
              />
            </div>
            <div className="veld">
              <label htmlFor="t-uren">Studie-uren</label>
              <input
                id="t-uren"
                type="number"
                min={0}
                max={200}
                step={0.5}
                inputMode="decimal"
                placeholder="0"
                value={formulier.geschatteUren}
                onChange={(e) => setFormulier({ ...formulier, geschatteUren: e.target.value })}
              />
            </div>
          </div>

          <div className="veld">
            <label htmlFor="t-notitie">Notitie</label>
            <textarea
              id="t-notitie"
              maxLength={600}
              placeholder="Optioneel: waar moet je op letten?"
              value={formulier.notitie}
              onChange={(e) => setFormulier({ ...formulier, notitie: e.target.value })}
            />
          </div>

          {fout && (
            <p className="hint" role="alert" style={{ color: 'var(--accent)' }}>
              {fout}
            </p>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" className="knop knop--primair">
              {bewerktId ? 'Wijziging opslaan' : 'Taak toevoegen'}
            </button>
            {bewerktId && (
              <button
                type="button"
                className="knop knop--stil"
                onClick={() => {
                  setBewerktId(null)
                  setFormulier({ ...LEEG })
                  setFout('')
                }}
              >
                Annuleren
              </button>
            )}
          </div>
        </form>

        <div>
          <div className="filters">
            {(
              [
                ['open', 'Nog te doen'],
                ['week', 'Deze week'],
                ['klaar', 'Afgerond'],
                ['alles', 'Alles'],
              ] as [Filter, string][]
            ).map(([sleutel, label]) => (
              <button
                key={sleutel}
                type="button"
                className="chip"
                aria-pressed={filter === sleutel}
                onClick={() => setFilter(sleutel)}
              >
                {label}
              </button>
            ))}
          </div>

          {zichtbaar.length === 0 ? (
            <div className="leeg">
              <strong>
                {taken.length === 0 ? 'Nog geen taken' : 'Niets in deze weergave'}
              </strong>
              <p>
                {taken.length === 0
                  ? 'Voeg links je eerste taak toe. Begin bijvoorbeeld met de eerstvolgende opdracht die je moet inleveren.'
                  : 'Kies een ander filter om je andere taken te zien.'}
              </p>
            </div>
          ) : (
            <ul className="taken" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {zichtbaar.map((t) => {
                const d = t.deadline ? naarDatum(t.deadline) : null
                const dagen = d ? dagenTussen(nu, d) : null
                const verlopen = dagen !== null && dagen < 0 && t.status !== 'klaar'
                return (
                  <li
                    key={t.id}
                    className={`taak${t.status === 'klaar' ? ' taak--klaar' : ''}${verlopen ? ' taak--verlopen' : ''}`}
                    style={{ ['--vak-kleur' as string]: t.vakId ? VAKKEN[t.vakId].kleur : 'var(--rand-sterk)' }}
                  >
                    <button
                      type="button"
                      className="taak__vink"
                      aria-pressed={t.status === 'klaar'}
                      aria-label={t.status === 'klaar' ? `Markeer "${t.titel}" als niet afgerond` : `Markeer "${t.titel}" als afgerond`}
                      onClick={() => onWijzig(t.id, { status: volgendeStatus(t.status) })}
                    >
                      ✓
                    </button>

                    <div className="taak__lijf">
                      <div className="taak__titel">{t.titel}</div>
                      <div className="taak__meta">
                        {t.vakId && <span>{VAKKEN[t.vakId].naam}</span>}
                        {t.periodeNummer && <span>Periode {t.periodeNummer}</span>}
                        {t.geschatteUren > 0 && <span>{uren(t.geschatteUren)} uur</span>}
                        {d && (
                          <span>
                            {formatMetDag(d)}
                            {t.status !== 'klaar' && dagen !== null && (
                              <>
                                {' · '}
                                {dagen < 0
                                  ? `${Math.abs(dagen)} ${Math.abs(dagen) === 1 ? 'dag' : 'dagen'} te laat`
                                  : dagen === 0
                                    ? 'vandaag'
                                    : dagen === 1
                                      ? 'morgen'
                                      : `over ${dagen} dagen`}
                              </>
                            )}
                          </span>
                        )}
                        {verlopen && <Merk soort="stage">te laat</Merk>}
                      </div>
                      {t.notitie && <p className="taak__notitie">{t.notitie}</p>}
                    </div>

                    <div className="taak__acties">
                      <button type="button" className="knop knop--stil knop--klein" onClick={() => bewerk(t)}>
                        Bewerk
                      </button>
                      <button
                        type="button"
                        className="knop knop--stil knop--klein"
                        onClick={() => {
                          if (window.confirm(`"${t.titel}" definitief verwijderen?`)) onVerwijder(t.id)
                        }}
                      >
                        Wis
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
