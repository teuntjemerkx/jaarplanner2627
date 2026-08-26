import type { CSSProperties, ReactNode } from 'react'
import { VAKKEN, type Periode, type VakId } from '../data/curriculum'
import { rond, uren } from '../lib/berekeningen'

export function Icoon({ teken, klein = false, kleur }: { teken: string; klein?: boolean; kleur?: string }) {
  return (
    <span
      className={klein ? 'icoon icoon--klein' : 'icoon'}
      aria-hidden="true"
      style={kleur ? ({ ['--icoon-kleur' as string]: kleur } as CSSProperties) : undefined}
    >
      <span>{teken}</span>
    </span>
  )
}

export function Merk({ soort, children }: { soort: string; children: ReactNode }) {
  return <span className={`merk merk--${soort}`}>{children}</span>
}

export interface StapelDeel {
  sleutel: string
  label: string
  waarde: number
  kleur: string
}

/**
 * Gestapelde balk: elke vakkleur krijgt een breedte naar rato van de uren.
 * De balk zelf is decoratief; de cijfers staan er altijd ook als tekst bij,
 * zodat kleur nooit de enige drager van informatie is.
 */
export function Stapelbalk({ delen, hoog = false }: { delen: StapelDeel[]; hoog?: boolean }) {
  const totaal = delen.reduce((s, d) => s + d.waarde, 0)
  if (totaal <= 0) return <div className={hoog ? 'stapel stapel--hoog' : 'stapel'} />
  return (
    <div className={hoog ? 'stapel stapel--hoog' : 'stapel'} aria-hidden="true">
      {delen
        .filter((d) => d.waarde > 0)
        .map((d) => (
          <i
            key={d.sleutel}
            style={{ width: `${(d.waarde / totaal) * 100}%`, background: d.kleur }}
            title={`${d.label}: ${uren(d.waarde)} uur`}
          />
        ))}
    </div>
  )
}

export function periodeStapel(periode: Periode): StapelDeel[] {
  return periode.vakken.map((v) => ({
    sleutel: v.vakId,
    label: VAKKEN[v.vakId].naam,
    waarde: v.urenPerWeek,
    kleur: VAKKEN[v.vakId].kleur,
  }))
}

export function Vaknaam({ vakId, keuzedeelNaam }: { vakId: VakId; keuzedeelNaam?: string }) {
  const vak = VAKKEN[vakId]
  const eigen = vakId === 'keuzedelen' && keuzedeelNaam ? ` · ${keuzedeelNaam}` : ''
  return (
    <span className="vaknaam">
      <span className="vaknaam__punt" style={{ background: vak.kleur }} aria-hidden="true" />
      {vak.naam}
      {eigen && <span style={{ color: 'var(--tekst-gedempt)', fontWeight: 400 }}>{eigen}</span>}
    </span>
  )
}

export function Cijfer({ waarde, label, eenheid }: { waarde: string | number; label: string; eenheid?: string }) {
  return (
    <div className="cijfer">
      <span className="cijfer__waarde">
        {typeof waarde === 'number' ? uren(waarde) : waarde}
        {eenheid && <span style={{ fontSize: 'var(--stap-0)', color: 'var(--tekst-gedempt)' }}> {eenheid}</span>}
      </span>
      <span className="cijfer__label">{label}</span>
    </div>
  )
}

export function Legenda({ vakIds }: { vakIds: VakId[] }) {
  return (
    <ul className="legenda" style={{ listStyle: 'none', margin: '16px 0 0', padding: 0 }}>
      {vakIds.map((id) => (
        <li key={id} className="legenda__item">
          <span className="legenda__punt" style={{ background: VAKKEN[id].kleur }} aria-hidden="true" />
          {VAKKEN[id].naam}
        </li>
      ))}
    </ul>
  )
}

export { rond }
