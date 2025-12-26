export type StatOptions = 
    "PTS" |
    "REB" |
    "AST" |
    "STL" |
    "BLK" |
    "FG"  |
    "FG%" |
    "3FG" |
    "3FG%" |
    "FT"  |
    "FT%"

export const AvailableStats: StatOptions[] = [
    "PTS",
    "REB",
    "AST",
    "STL",
    "BLK",
    "FG",
    "FG%",
    "3FG",
    "3FG%",
    "FT",
    "FT%"
];

export const AvailableStatsSelect = AvailableStats.map(x => ({ value: x, label: x.toString() }));

export interface TeamBasketballScorebugState {
    timeouts: number;
    bonus: boolean;
}

export interface ComparisonStatState {
    showing: boolean;
    stat: StatOptions
}

export interface BasketballScorebugState {
    homeTeam: TeamBasketballScorebugState;
    awayTeam: TeamBasketballScorebugState;
    comparisonStat: ComparisonStatState;
}