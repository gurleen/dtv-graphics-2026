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
    "FT%" |
    "TO"  |
    "PF";

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
    "FT%", 
    "TO",
    "PF"
];

export type TimerOptions = "LastScore" | "LastFG";
export const TimerOptionsValues: TimerOptions[] = ["LastScore", "LastFG"];
export const TimerOptionsSearch = TimerOptionsValues.map(x => ({value: x, label: x}));

export function getTimerOptionDisplayString(option: TimerOptions): string {
    const displayMap: Record<TimerOptions, string> = {
        "LastScore": "SCORING DROUGHT",
        "LastFG": "FG DROUGHT"
    };

    return displayMap[option];
}

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
        "3FG": "THREE POINTERS",
        "3FG%": "THREE POINTER PCT",
        "FT": "FREE THROWS",
        "FT%": "FREE THROW PCT",
        "TO": "TURNOVERS",
        "PF": "PERSONAL FOULS"
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
    case "TO":
      return stats.to;
    case "PF":
      return stats.pf;
    default:
      return 0;
  }
}

function getShootingDisplay(made: number, attempted: number): string {
  return `${made}-${attempted}`;
}

function getShootingPercentage(made: number, attempted: number): string {
  if (attempted === 0) return "0.0%";
  return ((made / attempted) * 100).toFixed(1) + '%';
}

export function getTeamTotal(players: PlayerStats[], stat: StatOptions): string {
  if (players.length === 0) return "0";

  switch (stat) {
    case "FG": {
      const made = players.reduce((sum, p) => sum + p.fgm, 0);
      const attempted = players.reduce((sum, p) => sum + p.fga, 0);
      return getShootingDisplay(made, attempted);
    }
    case "3FG": {
      const made = players.reduce((sum, p) => sum + p.fgm3, 0);
      const attempted = players.reduce((sum, p) => sum + p.fga3, 0);
      return getShootingDisplay(made, attempted);
    }
    case "FT": {
      const made = players.reduce((sum, p) => sum + p.ftm, 0);
      const attempted = players.reduce((sum, p) => sum + p.fta, 0);
      return getShootingDisplay(made, attempted);
    }
    case "FG%": {
      const made = players.reduce((sum, p) => sum + p.fgm, 0);
      const attempted = players.reduce((sum, p) => sum + p.fga, 0);
      return attempted > 0 ? getShootingPercentage(made, attempted) : "0.0%";
    }
    case "3FG%": {
      const made = players.reduce((sum, p) => sum + p.fgm3, 0);
      const attempted = players.reduce((sum, p) => sum + p.fga3, 0);
      return attempted > 0 ? getShootingPercentage(made, attempted) : "0.0%";
    }
    case "FT%": {
      const made = players.reduce((sum, p) => sum + p.ftm, 0);
      const attempted = players.reduce((sum, p) => sum + p.fta, 0);
      return attempted > 0 ? getShootingPercentage(made, attempted) : "0.0%";
    }
    case "PTS":
      return players.reduce((sum, p) => sum + p.tp, 0).toString();
    case "REB":
      return players.reduce((sum, p) => sum + p.treb, 0).toString();
    case "AST":
      return players.reduce((sum, p) => sum + p.ast, 0).toString();
    case "STL":
      return players.reduce((sum, p) => sum + p.stl, 0).toString();
    case "BLK":
      return players.reduce((sum, p) => sum + p.blk, 0).toString();
    case "TO":
      return players.reduce((sum, p) => sum + p.to, 0).toString();
    case "PF":
      return players.reduce((sum, p) => sum + p.pf, 0).toString();
    default:
      return "0";
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

export interface ScoreboardGame {
  game_id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  period: number;
  status: string;
}

export interface Play {
  period: number; // 1 for first half, 2 for second half
  vh: string; // "V" for visitor, "H" for home
  time: string; // game clock time (e.g., "19:32")
  uni: string; // player uniform number
  team: string; // team name
  checkname: string; // player check name
  action: string; // GOOD, MISS, FOUL, TURNOVER, REBOUND, etc.
  type?: string; // JUMPER, 3PTR, LAYUP, FT, etc.
  vscore?: number; // visitor score after play
  hscore?: number; // home score after play
  side?: string; // left or right
  fastb?: string; // Y if fast break
}

export interface LastScoreInfo {
  period: number;
  time: string;
  playIndex: number;
}

export interface TeamLastScores {
  lastPoint: LastScoreInfo | null;
  lastFieldGoal: LastScoreInfo | null;
}

export interface LastScores {
  visitor: TeamLastScores;
  home: TeamLastScores;
}

/**
 * Converts a time string (MM:SS) to total seconds
 */
function timeToSeconds(time: string): number {
  const parts = time.split(":");
  const minutes = parseInt(parts[0] || "0");
  const seconds = parseInt(parts[1] || "0");
  return minutes * 60 + seconds;
}

/**
 * Formats seconds into a duration string (e.g., "2:35" or "0:45")
 */
function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Calculates the elapsed time since a last score
 * @param lastScore - The last score information
 * @param currentPeriod - Current game period
 * @param currentClock - Current game clock (MM:SS format)
 * @returns A duration string representing the scoring drought (e.g., "2:35")
 */
export function getTimeSinceLastScore(
  lastScore: LastScoreInfo | null,
  currentPeriod: number,
  currentClock: string
): string {
  if (!lastScore) {
    return "0:00";
  }

  const currentSeconds = timeToSeconds(currentClock);
  const lastScoreSeconds = timeToSeconds(lastScore.time);

  // If in the same period
  if (lastScore.period === currentPeriod) {
    // In basketball, clock counts down, so elapsed = lastScoreTime - currentTime
    const elapsed = lastScoreSeconds - currentSeconds;
    return formatDuration(Math.max(0, elapsed));
  }

  // If in a later period
  if (currentPeriod > lastScore.period) {
    // Time remaining in the period when the score happened
    const timeRemainingInLastScorePeriod = lastScoreSeconds;

    // Full periods between the last score period and current period
    const periodsBetween = currentPeriod - lastScore.period - 1;
    const fullPeriodsTime = periodsBetween * 20 * 60; // 20 minutes per period

    // Time elapsed in current period (from start of period to current clock)
    const timeElapsedInCurrentPeriod = (20 * 60) - currentSeconds; // 20 min period

    const totalElapsed = timeRemainingInLastScorePeriod + fullPeriodsTime + timeElapsedInCurrentPeriod;
    return formatDuration(totalElapsed);
  }

  // If currentPeriod < lastScore.period (shouldn't happen)
  return "0:00";
}