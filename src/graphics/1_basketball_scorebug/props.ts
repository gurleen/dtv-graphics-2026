import type { ScorebugState } from "@/data/models"

export interface BasketballScorebugProps {
    homeTeam: string
    awayTeam: string
}

export interface BasketballScorebugData {
    homeTeam: TeamInfo
    awayTeam: TeamInfo
    info: GameInfo
    scorebug: ScorebugState
}

export interface GameInfo {
    clock: string
    period: string
    shotClock: number
}

export interface TeamInfo {
    abbreviation: string
    color: string
    score: number
    logoUrl: string
    bonus: boolean
    timeouts: number
}


export function getDefaultProps(): BasketballScorebugData {
    return {
        homeTeam: {
            abbreviation: 'DREX',
            color: '#07294D',
            score: 10,
            logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Drexel_Dragons_logo.svg/1280px-Drexel_Dragons_logo.svg.png',
            bonus: true,
            timeouts: 4
        },
        awayTeam: {
            abbreviation: 'PENN',
            color: '#990000',
            score: 3,
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Penn_Quakers_logo.svg',
            bonus: false,
            timeouts: 2
        },
        info: {
            clock: "",
            shotClock: 0,
            period: ""
        },
        scorebug: {
            homeSlider: {
                playerNumber: 0,
                playing: false
            },
            awaySlider: {
                playerNumber: 0,
                playing: false
            }
        }
    }
}