import { LOGO_DATA_URI } from '../assets/logo'

/**
 * Het woordmerk van Rijn IJssel, linksboven.
 *
 * Het logo staat op een wit vlak. Dat is geen smaakkeuze: de violette helft
 * van het woordmerk (#610FCA) haalt op de donkere achtergrond van dit
 * dashboard maar 2,08:1 contrast en is daar dus bijna niet te zien. Op wit
 * haalt diezelfde kleur 8,64:1. Het witte vlak houdt bovendien de vrije
 * ruimte rondom het logo aan die het huisstijlhandboek voorschrijft.
 *
 * De kleuren van het woordmerk zelf worden nooit aangepast.
 */
export default function Logo() {
  return (
    <span className="merkplaat">
      {LOGO_DATA_URI ? (
        <img className="merkplaat__logo" src={LOGO_DATA_URI} alt="Rijn IJssel" />
      ) : (
        <span className="woordmerk" aria-label="Rijn IJssel">
          <span>rijn</span>
          <span>IJssel</span>
        </span>
      )}
    </span>
  )
}
