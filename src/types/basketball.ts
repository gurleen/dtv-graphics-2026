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

export type TimerOptions = "LastScore" | "LastFG";
export const TimerOptionsValues: TimerOptions[] = ["LastScore", "LastFG"];
export const TimerOptionsSearch = TimerOptionsValues.map(x => ({value: x, label: x}));

export const AvailableStatsSelect = AvailableStats.map(x => ({ value: x, label: x.toString() }));

export function getStatDisplayString(stat: StatOptions): string {
    const displayMap: Record<StatOptions, string> = {
        "PTS": "POINTS",
        "REB": "REBOUNDS",
        "AST": "ASSISTS",
        "STL": "STEALS",
        "BLK": "BLOCKS",
        "FG": "FIELD GOALS",
        "FG%": "FIELD GOAL PCT",
        "3FG": "3-POINTERS",
        "3FG%": "THREE POINTER PCT",
        "FT": "FREE THROWS",
        "FT%": "FREE THROW PCT"
    };

    return displayMap[stat];
}

export interface TeamTimerState {
    showing: boolean;
    type: TimerOptions;
}

export interface TeamBasketballScorebugState {
    timeouts: number;
    bonus: boolean;
    timer: TeamTimerState;
}

export interface ComparisonStatState {
    showing: boolean;
    stat: StatOptions
}

export interface TextSliderState {
    showing: boolean;
    title: string;
    subtitle: string;
}

export interface BasketballScorebugState {
    homeTeam: TeamBasketballScorebugState;
    awayTeam: TeamBasketballScorebugState;
    comparisonStat: ComparisonStatState;
    textSlider: TextSliderState;
}

export interface PlayerStats {
  name: string;
  shirtNumber: string;
  // Shooting stats
  fgm: number; // field goals made
  fga: number; // field goals attempted
  fgm3: number; // 3-pointers made
  fga3: number; // 3-pointers attempted
  ftm: number; // free throws made
  fta: number; // free throws attempted
  tp: number; // total points
  // Other stats
  blk: number; // blocks
  stl: number; // steals
  ast: number; // assists
  min: number; // minutes
  oreb: number; // offensive rebounds
  dreb: number; // defensive rebounds
  treb: number; // total rebounds
  pf: number; // personal fouls
  tf: number; // technical fouls
  to: number; // turnovers
  dq: number; // disqualifications
  // Percentages
  fgpct: number; // field goal percentage
  fg3pct: number; // 3-point percentage
  ftpct: number; // free throw percentage
}

export function getPlayerStat(stats: PlayerStats, stat: StatOptions): number {
  switch (stat) {
    case "PTS":
      return stats.tp;
    case "REB":
      return stats.treb;
    case "AST":
      return stats.ast;
    case "STL":
      return stats.stl;
    case "BLK":
      return stats.blk;
    case "FG":
      return stats.fgm;
    case "FG%":
      return stats.fgpct;
    case "3FG":
      return stats.fgm3;
    case "3FG%":
      return stats.fg3pct;
    case "FT":
      return stats.ftm;
    case "FT%":
      return stats.ftpct;
    default:
      return 0;
  }
}

export interface TeamPlayers {
  team: string;
  teamCode: string;
  vh: string; // visitor or home
  players: PlayerStats[];
}

export interface GameLiveStats { visitor: TeamPlayers | null; home: TeamPlayers | null; };

export interface TeamStandingsRecord {
  team_id: number;
  conference_id: number;
  wins: number;
  home_wins: number;
  road_wins: number;
  conf_wins: number;
  home_games: number;
  road_games: number;
  conf_games: number;
  total_games: number;
  losses: number;
  home_losses: number;
  road_losses: number;
  conf_losses: number;
  overall_display: string;
  home_display: string;
  road_display: string;
  conf_display: string;
  win_pct: number;
  conf_win_pct: number;
}