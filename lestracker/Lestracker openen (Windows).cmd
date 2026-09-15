@echo off
rem ===========================================================================
rem  Opent de lestracker als een eigen app-venster: geen adresbalk, geen
rem  tabbladen. Zet dit bestand in dezelfde map als waar-is-mijn-klas.html.
rem
rem  Wil je hem in je taakbalk? Rechtsklik op dit bestand en kies
rem  "Aan taakbalk vastmaken".
rem ===========================================================================
setlocal

set "DOEL=file:///%~dp0waar-is-mijn-klas.html"
set "DOEL=%DOEL:\=/%"
set "VENSTER=--app=%DOEL% --window-size=1600,1000"

set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%BROWSER%" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not exist "%BROWSER%" set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%BROWSER%" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%BROWSER%" set "BROWSER=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if exist "%BROWSER%" (
  start "" "%BROWSER%" %VENSTER%
) else (
  echo Edge noch Chrome gevonden. De tracker opent nu in je standaardbrowser.
  start "" "%~dp0waar-is-mijn-klas.html"
)
