#!/bin/bash
# ============================================================================
#  Opent de lestracker als een eigen app-venster: geen adresbalk, geen
#  tabbladen. Zet dit bestand in dezelfde map als waar-is-mijn-klas.html.
#
#  De eerste keer: rechtsklik op dit bestand en kies "Open". macOS vraagt dan
#  eenmalig of je het vertrouwt. Daarna volstaat dubbelklikken.
#  Werkt dubbelklikken niet, draai dan eenmalig in Terminal:
#      chmod +x "Lestracker openen (Mac).command"
# ============================================================================
set -e

map="$(cd "$(dirname "$0")" && pwd)"
pagina="$map/waar-is-mijn-klas.html"

if [ ! -f "$pagina" ]; then
  echo "waar-is-mijn-klas.html staat niet in deze map."
  read -r -p "Druk op enter om te sluiten."
  exit 1
fi

doel="file://$pagina"

for browser in "Google Chrome" "Microsoft Edge" "Brave Browser"; do
  if [ -d "/Applications/$browser.app" ]; then
    open -na "$browser" --args --app="$doel" --window-size=1600,1000
    exit 0
  fi
done

# Geen browser gevonden die een kaal venster kan openen: dan maar gewoon.
open "$pagina"
