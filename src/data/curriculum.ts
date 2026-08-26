/* ============================================================================
 *  BRON VAN WAARHEID - ROOSTERDATA ABS NIVEAU 2, COHORT 2026, LEERJAAR 1
 * ----------------------------------------------------------------------------
 *  Overgenomen uit: Backbone_ZMCM_niveau_2_cohort_2026_ABS.xlsx, tabblad
 *  "ABS-26 lj1". Examenomschrijvingen aangevuld uit
 *  opleidingsoverzicht_student_ABS_cohort_26.docx.
 *
 *  WIJZIGT HET ROOSTER? Pas ALLEEN dit bestand aan. De rest van de app leest
 *  hieruit en rekent zelf alle totalen opnieuw uit. Je hoeft geen enkele
 *  andere regel code aan te raken.
 *
 *  CONTROLE: de app rekent bij het opstarten na of de weekuren per periode
 *  optellen tot de waarden in PERIODE_CONTROLE hieronder. Klopt dat niet,
 *  dan verschijnt er een zichtbare waarschuwing in het dashboard.
 * ========================================================================== */

export type VakId =
  | 'nederlands'
  | 'rekenen'
  | 'engels'
  | 'businessservices'
  | 'msoffice'
  | 'burgerschap'
  | 'lbc'
  | 'sport'
  | 'keuzedelen'
  | 'projectenabs'
  | 'sollicitatietraining'

export type VakCategorie = 'taal' | 'rekenen' | 'beroep' | 'loopbaan' | 'burgerschap' | 'keuze'

export interface Vak {
  id: VakId
  naam: string
  /** Korte weergave voor smalle kolommen en balkjes. */
  kort: string
  categorie: VakCategorie
  /** Datakleur. Alle kleuren zijn gecontroleerd op WCAG-contrast, zie styles/tokens.css */
  kleur: string
  /** Eén zin die een student uitlegt waar dit vak over gaat. */
  toelichting: string
}

export const VAKKEN: Record<VakId, Vak> = {
  nederlands: {
    id: 'nederlands',
    naam: 'Nederlands',
    kort: 'NL',
    categorie: 'taal',
    kleur: '#FF7A1A',
    toelichting: 'Lezen, luisteren, schrijven en praten. Je werkt naar niveau 2F.',
  },
  rekenen: {
    id: 'rekenen',
    naam: 'Rekenen',
    kort: 'REK',
    categorie: 'rekenen',
    kleur: '#209FEA',
    toelichting: 'Rekenen oefenen. Je werkt naar het centraal examen rekenen.',
  },
  engels: {
    id: 'engels',
    naam: 'Engels',
    kort: 'ENG',
    categorie: 'taal',
    kleur: '#5DD9C1',
    toelichting: 'Lezen en luisteren op niveau A2. Praten en schrijven op niveau A1.',
  },
  businessservices: {
    id: 'businessservices',
    naam: 'Business Services',
    kort: 'BS',
    categorie: 'beroep',
    kleur: '#C79BFF',
    toelichting: 'Hier leer je het echte werk van de medewerker ABS. Dit is je grootste vak.',
  },
  msoffice: {
    id: 'msoffice',
    naam: 'MS Office',
    kort: 'MSO',
    categorie: 'beroep',
    kleur: '#7BE0FF',
    toelichting: 'Werken met Word, Excel, Outlook en PowerPoint. Dat heb je op kantoor nodig.',
  },
  burgerschap: {
    id: 'burgerschap',
    naam: 'Burgerschap',
    kort: 'BUR',
    categorie: 'burgerschap',
    kleur: '#FFC44D',
    toelichting: 'Over jouw plek in de maatschappij. Denk aan werk, gezondheid en meedoen.',
  },
  lbc: {
    id: 'lbc',
    naam: 'LBC',
    kort: 'LBC',
    categorie: 'loopbaan',
    kleur: '#FF9BD2',
    toelichting: 'Gesprekken over hoe het met je gaat en wat je later wilt doen.',
  },
  sport: {
    id: 'sport',
    naam: 'Sport',
    kort: 'SPO',
    categorie: 'burgerschap',
    kleur: '#A8E063',
    toelichting: 'Sporten en bewegen. Alleen in periode 1 en 2.',
  },
  keuzedelen: {
    id: 'keuzedelen',
    naam: 'Keuzedelen',
    kort: 'KD',
    categorie: 'keuze',
    kleur: '#D7C3F2',
    toelichting: 'Extra vak dat je zelf uitkiest. Het begint in periode 3.',
  },
  projectenabs: {
    id: 'projectenabs',
    naam: 'Projecten ABS',
    kort: 'PRO',
    categorie: 'beroep',
    kleur: '#9B8CFF',
    toelichting: 'Opdrachten waarin je meerdere vakken tegelijk gebruikt. Alleen in periode 1, 2 en 3.',
  },
  sollicitatietraining: {
    id: 'sollicitatietraining',
    naam: 'Sollicitatietraining',
    kort: 'SOL',
    categorie: 'loopbaan',
    kleur: '#FFB199',
    toelichting: 'Je leert een cv en brief maken. Zo vind je straks een stageplek.',
  },
}

export type ExamenSoort = 'CE' | 'IE' | 'WP'

export interface Examen {
  /** Naam exact zoals in de backbone. */
  naam: string
  soort: ExamenSoort
  /** 1 = reguliere kans, 2 = herkansing (alleen als kans 1 niet gehaald is). */
  kans: 1 | 2
  vakId?: VakId
}

export interface PeriodeVak {
  vakId: VakId
  urenPerWeek: number
}

export interface Periode {
  nummer: number
  weken: number
  vakken: PeriodeVak[]
  examens: Examen[]
  /** Uren stage per week voor studenten MET stageplek. 0 = geen stage deze periode. */
  stageUrenPerWeek: number
  /** Uren begeleiding per week voor studenten ZONDER stageplek. */
  zonderStageUrenPerWeek: number
  zonderStageToelichting?: string
}

/** Elke periode telt 5 lesweken. 8 periodes x 5 weken = 40 lesweken. */
export const WEKEN_PER_PERIODE = 5

const BASIS_P1_P2: PeriodeVak[] = [
  { vakId: 'nederlands', urenPerWeek: 3 },
  { vakId: 'rekenen', urenPerWeek: 1 },
  { vakId: 'engels', urenPerWeek: 1 },
  { vakId: 'lbc', urenPerWeek: 2 },
  { vakId: 'msoffice', urenPerWeek: 2 },
  { vakId: 'burgerschap', urenPerWeek: 1 },
  { vakId: 'sport', urenPerWeek: 1.5 },
  { vakId: 'sollicitatietraining', urenPerWeek: 2 },
  { vakId: 'businessservices', urenPerWeek: 6 },
  { vakId: 'projectenabs', urenPerWeek: 2 },
]

const BASIS_P3: PeriodeVak[] = [
  { vakId: 'nederlands', urenPerWeek: 3 },
  { vakId: 'rekenen', urenPerWeek: 1 },
  { vakId: 'engels', urenPerWeek: 1 },
  { vakId: 'lbc', urenPerWeek: 2 },
  { vakId: 'msoffice', urenPerWeek: 2 },
  { vakId: 'burgerschap', urenPerWeek: 1 },
  { vakId: 'keuzedelen', urenPerWeek: 2 },
  { vakId: 'sollicitatietraining', urenPerWeek: 2 },
  { vakId: 'businessservices', urenPerWeek: 6 },
  { vakId: 'projectenabs', urenPerWeek: 2 },
]

/** Vanaf periode 4 gaat LBC van 2 naar 1 uur en vervallen sollicitatietraining en projecten. */
const BASIS_P4_P8: PeriodeVak[] = [
  { vakId: 'nederlands', urenPerWeek: 3 },
  { vakId: 'rekenen', urenPerWeek: 1 },
  { vakId: 'engels', urenPerWeek: 1 },
  { vakId: 'lbc', urenPerWeek: 1 },
  { vakId: 'msoffice', urenPerWeek: 2 },
  { vakId: 'burgerschap', urenPerWeek: 1 },
  { vakId: 'keuzedelen', urenPerWeek: 2 },
  { vakId: 'businessservices', urenPerWeek: 6 },
]

const ZONDER_STAGE = 'Heb je nog geen stageplek? Dan krijg je 4 uur begeleiding per week. Dat is 2 keer 2 uur.'

export const PERIODES: Periode[] = [
  {
    nummer: 1,
    weken: WEKEN_PER_PERIODE,
    vakken: BASIS_P1_P2,
    examens: [],
    stageUrenPerWeek: 0,
    zonderStageUrenPerWeek: 0,
  },
  {
    nummer: 2,
    weken: WEKEN_PER_PERIODE,
    vakken: BASIS_P1_P2,
    examens: [
      { naam: 'IE Nederlands Gesprekken voeren 2F', soort: 'IE', kans: 1, vakId: 'nederlands' },
      { naam: 'CE Nederlands', soort: 'CE', kans: 1, vakId: 'nederlands' },
    ],
    stageUrenPerWeek: 0,
    zonderStageUrenPerWeek: 0,
  },
  {
    nummer: 3,
    weken: WEKEN_PER_PERIODE,
    vakken: BASIS_P3,
    examens: [
      { naam: 'Engels lezen/luisteren A2', soort: 'CE', kans: 1, vakId: 'engels' },
      { naam: 'CE Rekenen (examenperiode 2)', soort: 'CE', kans: 1, vakId: 'rekenen' },
      { naam: 'Engels spreken en gesprekken A1', soort: 'IE', kans: 1, vakId: 'engels' },
    ],
    stageUrenPerWeek: 0,
    zonderStageUrenPerWeek: 0,
  },
  {
    nummer: 4,
    weken: WEKEN_PER_PERIODE,
    vakken: BASIS_P4_P8,
    examens: [
      { naam: 'Basisdeel WP 3 en WP 4', soort: 'WP', kans: 1, vakId: 'businessservices' },
      { naam: 'Engels schrijven A1', soort: 'IE', kans: 1, vakId: 'engels' },
      { naam: 'IE Nederlands Spreken 2F', soort: 'IE', kans: 1, vakId: 'nederlands' },
    ],
    stageUrenPerWeek: 16,
    zonderStageUrenPerWeek: 4,
    zonderStageToelichting: ZONDER_STAGE,
  },
  {
    nummer: 5,
    weken: WEKEN_PER_PERIODE,
    vakken: BASIS_P4_P8,
    examens: [
      { naam: 'Basisdeel WP 3 en WP 4', soort: 'WP', kans: 2, vakId: 'businessservices' },
      { naam: 'CE Rekenen (examenperiode 4)', soort: 'CE', kans: 2, vakId: 'rekenen' },
      { naam: 'Engels lezen/luisteren A2', soort: 'CE', kans: 2, vakId: 'engels' },
      { naam: 'CE Nederlands', soort: 'CE', kans: 2, vakId: 'nederlands' },
    ],
    stageUrenPerWeek: 16,
    zonderStageUrenPerWeek: 4,
    zonderStageToelichting: ZONDER_STAGE,
  },
  {
    nummer: 6,
    weken: WEKEN_PER_PERIODE,
    vakken: BASIS_P4_P8,
    examens: [
      { naam: 'Profiel WP 1 en 2', soort: 'WP', kans: 1, vakId: 'businessservices' },
      { naam: 'Engels schrijven A1', soort: 'IE', kans: 2, vakId: 'engels' },
      { naam: 'IE Nederlands Schrijven 2F', soort: 'IE', kans: 1, vakId: 'nederlands' },
    ],
    stageUrenPerWeek: 16,
    zonderStageUrenPerWeek: 4,
    zonderStageToelichting: ZONDER_STAGE,
  },
  {
    nummer: 7,
    weken: WEKEN_PER_PERIODE,
    vakken: BASIS_P4_P8,
    examens: [
      { naam: 'Profiel WP 1 en 2', soort: 'WP', kans: 2, vakId: 'businessservices' },
      { naam: 'Engels spreken en gesprekken A1', soort: 'IE', kans: 2, vakId: 'engels' },
      { naam: 'IE Nederlands Schrijven 2F', soort: 'IE', kans: 2, vakId: 'nederlands' },
      { naam: 'Nederlands spreken en gesprekken', soort: 'IE', kans: 2, vakId: 'nederlands' },
    ],
    stageUrenPerWeek: 16,
    zonderStageUrenPerWeek: 4,
    zonderStageToelichting: ZONDER_STAGE,
  },
  {
    nummer: 8,
    weken: WEKEN_PER_PERIODE,
    vakken: BASIS_P4_P8,
    examens: [],
    stageUrenPerWeek: 16,
    zonderStageUrenPerWeek: 4,
    zonderStageToelichting: ZONDER_STAGE,
  },
]

/**
 * Controlewaarden, letterlijk overgenomen uit rij 25 en 26 van het bronbestand.
 * De app rekent de vakken zelf op en vergelijkt met deze getallen.
 */
export const PERIODE_CONTROLE = {
  urenPerWeek: [21.5, 21.5, 22, 17, 17, 17, 17, 17],
  urenPerPeriode: [107.5, 107.5, 110, 85, 85, 85, 85, 85],
  totaalBotUren: 750,
} as const

export const OPLEIDING = {
  naam: 'Medewerker ABS',
  niveau: 2,
  cohort: '2026',
  leerjaar: 1,
  bron: 'Backbone ZMCM niveau 2 cohort 2026 ABS',
} as const
