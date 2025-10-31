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


export function getPlayerHeadshot(teamId: string, sport: Sport, jerseyNumber: string) {
    return `https://images.dragonstv.io/headshots/${teamId}/${sport}/${jerseyNumber}.png`;
}

export interface TeamData {
    stats: TeamRecords
    players: Player[]
}