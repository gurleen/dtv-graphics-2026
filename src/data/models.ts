export interface TeamGameState {
    score: number
    timeouts: number
    fouls: number
    bonus: boolean
}

export enum Sport {
    MensBasketball = 0,
    WomensBasketball = 1,
    Wrestling = 2
}

export interface GameState {
    sport: Sport
    clock: number
    clockDisplay: string
    shotClock: number
    period: number
    fullPeriodName: string
    periodDisplay: string
    homeTeam: TeamGameState
    awayTeam: TeamGameState
}

export interface CurrentGameState {
    period: number
    timeRemaining: string
    shotClock: number
    homeScore: number
    awayScore: number
    clock: string
    fullPeriodName: string
}

export interface TeamInfo {
    id: string
    schoolName: string
    teamName: string
    abbreviation: string
    teamLogo: string
    primaryColor: string
    secondaryColor: string
    primaryTextColor: string
    secondaryTextColor: string
    fullLogoUrl: string
    knockoutLogoUrl: string
}

export interface Team {
    info: TeamInfo
}

export interface AppState {
    homeTeam: Team
    awayTeam: Team
}

export interface Record {
    wins: number
    losses: number
    games: number
    winPercentage: number
    recordDisplay: string
    winPercentageDisplay: string
}

export interface TeamRecords {
    overall: Record
    conference: Record
    home: Record
    away: Record
}

export interface Player {
    id: string
    teamId: string
    sport: number
    firstName: string
    lastName: string
    fullName: string
    jerseyNumber: string
    position: string
    experience: string
    height: string
    hometown: string
}

export function getShortCodeForSport(sport: Sport) {
    if(sport == Sport.MensBasketball) return 'mbb';
    if(sport == Sport.WomensBasketball) return 'wbb';
    if(sport == Sport.Wrestling) return 'wrest';
    return '';
}

export function getPlayerHeadshot(teamId: string, sport: Sport, jerseyNumber: string) {
    const shortCode = getShortCodeForSport(sport);
    return `https://images.dragonstv.io/headshots/${teamId}/${shortCode}/${jerseyNumber}.png`;
}

export interface TeamData {
    stats: TeamRecords
    players: Player[]
}


export interface Boxscore {
    homeTeam: TeamBoxscore
    awayTeam: TeamBoxscore
}

export interface Venue {
    officials: string[]
}

export interface TeamBoxscore {
    lineScore: Linescore[]
    totals: TeamStats
}

export interface TeamStats {
    stats: Stats
}

export interface Linescore {
    period: number
    score: number
}

export interface ShotStats {
    made: number
    attempted: number
    percentage: number
    percentageDisplay: number
}

export interface ReboundStats {
    offensive: number
    defensive: number
    total: number
}

export interface FoulStats {
    personal: number
    team: number
}

export interface Stats {
    fieldGoals: ShotStats
    threePointers: ShotStats
    freeThrows: ShotStats
    rebounds: ReboundStats
    fouls: FoulStats
    blocks: number
    steals: number
    assists: number
    turnovers: number
    minutes: number
}