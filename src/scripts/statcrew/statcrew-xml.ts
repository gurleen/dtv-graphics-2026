import type { GameLiveStats, PlayerStats, TeamPlayers } from "@/types/basketball";
import { watch } from "node:fs";
import { parseStringPromise } from "xml2js";

// In-memory storage for parsed player data
let visitorPlayers: TeamPlayers | null = null;
let homePlayers: TeamPlayers | null = null;

function parsePlayerStats(playerXml: any): PlayerStats {
  const stats = playerXml.stats?.[0]?.$;

  return {
    name: playerXml.$.name,
    shirtNumber: playerXml.$.uni,
    fgm: parseInt(stats?.fgm || "0"),
    fga: parseInt(stats?.fga || "0"),
    fgm3: parseInt(stats?.fgm3 || "0"),
    fga3: parseInt(stats?.fga3 || "0"),
    ftm: parseInt(stats?.ftm || "0"),
    fta: parseInt(stats?.fta || "0"),
    tp: parseInt(stats?.tp || "0"),
    blk: parseInt(stats?.blk || "0"),
    stl: parseInt(stats?.stl || "0"),
    ast: parseInt(stats?.ast || "0"),
    min: parseInt(stats?.min || "0"),
    oreb: parseInt(stats?.oreb || "0"),
    dreb: parseInt(stats?.dreb || "0"),
    treb: parseInt(stats?.treb || "0"),
    pf: parseInt(stats?.pf || "0"),
    tf: parseInt(stats?.tf || "0"),
    to: parseInt(stats?.to || "0"),
    dq: parseInt(stats?.dq || "0"),
    fgpct: parseFloat(stats?.fgpct || "0"),
    fg3pct: parseFloat(stats?.fg3pct || "0"),
    ftpct: parseFloat(stats?.ftpct || "0"),
  };
}

function comparePlayerStats(
  oldPlayer: PlayerStats | undefined,
  newPlayer: PlayerStats
): string[] {
  if (!oldPlayer) {
    return [`  +${newPlayer.shirtNumber} ${newPlayer.name} (NEW PLAYER)`];
  }

  const changes: string[] = [];
  const statKeys: (keyof PlayerStats)[] = [
    "tp",
    "fgm",
    "fga",
    "fgm3",
    "fga3",
    "ftm",
    "fta",
    "treb",
    "oreb",
    "dreb",
    "ast",
    "stl",
    "blk",
    "to",
    "pf",
    "min",
  ];

  for (const key of statKeys) {
    const oldVal = oldPlayer[key];
    const newVal = newPlayer[key];
    if (oldVal !== newVal) {
      const diff = (newVal as number) - (oldVal as number);
      const sign = diff > 0 ? "+" : "";
      changes.push(`    ${key}: ${oldVal} → ${newVal} (${sign}${diff})`);
    }
  }

  if (changes.length > 0) {
    changes.unshift(`  #${newPlayer.shirtNumber} ${newPlayer.name}:`);
  }

  return changes;
}

function showTeamDiff(
  oldTeam: TeamPlayers | null,
  newTeam: TeamPlayers,
  label: string
): void {
  if (!oldTeam) {
    console.log(`\n${label}: ${newTeam.team} (INITIAL PARSE)`);
    console.log(`  ${newTeam.players.length} players loaded`);
    return;
  }

  const changes: string[] = [];

  for (const newPlayer of newTeam.players) {
    const oldPlayer = oldTeam.players.find(
      (p) => p.shirtNumber === newPlayer.shirtNumber
    );
    const playerChanges = comparePlayerStats(oldPlayer, newPlayer);
    if (playerChanges.length > 0) {
      changes.push(...playerChanges);
    }
  }

  if (changes.length > 0) {
    console.log(`\n${label}: ${newTeam.team} - CHANGES DETECTED`);
    changes.forEach((change) => console.log(change));
  } else {
    console.log(`\n${label}: ${newTeam.team} - No changes`);
  }
}

async function parseXmlFile(filePath: string): Promise<string[]> {
  const changes: string[] = [];

  try {
    const file = Bun.file(filePath);
    const xmlContent = await file.text();

    const result = await parseStringPromise(xmlContent);

    // Parse both teams
    const teams = result.bbgame?.team;
    if (!teams || teams.length < 2) {
      console.error("Error: Expected 2 teams in XML file");
      return changes;
    }

    // Store old data for comparison
    const oldVisitorPlayers = visitorPlayers;
    const oldHomePlayers = homePlayers;

    // Process visitor team (vh="V")
    const visitorTeam = teams.find((team: any) => team.$.vh === "V");
    if (visitorTeam) {
      const players = visitorTeam.player
        ?.filter((p: any) => p.$.uni !== "TM") // Filter out TEAM entry
        .map(parsePlayerStats) || [];

      const newVisitorPlayers: TeamPlayers = {
        team: visitorTeam.$.name,
        teamCode: visitorTeam.$.id,
        vh: "V",
        players,
      };

      showTeamDiff(oldVisitorPlayers, newVisitorPlayers, "VISITOR");
      visitorPlayers = newVisitorPlayers;

      if (oldVisitorPlayers) {
        changes.push(`VISITOR: ${newVisitorPlayers.team}`);
      }
    }

    // Process home team (vh="H")
    const homeTeam = teams.find((team: any) => team.$.vh === "H");
    if (homeTeam) {
      const players = homeTeam.player
        ?.filter((p: any) => p.$.uni !== "TM") // Filter out TEAM entry
        .map(parsePlayerStats) || [];

      const newHomePlayers: TeamPlayers = {
        team: homeTeam.$.name,
        teamCode: homeTeam.$.id,
        vh: "H",
        players,
      };

      showTeamDiff(oldHomePlayers, newHomePlayers, "HOME");
      homePlayers = newHomePlayers;

      if (oldHomePlayers) {
        changes.push(`HOME: ${newHomePlayers.team}`);
      }
    }

    console.log(
      `\nTotal players in memory: ${
        (visitorPlayers?.players.length || 0) + (homePlayers?.players.length || 0)
      }`
    );
  } catch (error) {
    console.error("Error parsing XML file:", error);
    throw error;
  }

  return changes;
}

async function watchXmlFile(filePath: string): Promise<void> {
  console.log(`Watching for changes to: ${filePath}`);

  // Parse the file initially
  await parseXmlFile(filePath);

  // Watch for changes
  watch(filePath, async (eventType) => {
    if (eventType === "change") {
      console.log(`\n[${new Date().toLocaleTimeString()}] File changed, re-parsing...`);
      await parseXmlFile(filePath);
    }
  });

  // Keep the process running
  console.log("\nWatching for file changes. Press Ctrl+C to exit.\n");
}

// Helper functions for server use
function getStats(): GameLiveStats {
  return {
    visitor: visitorPlayers,
    home: homePlayers,
  };
}

function resetStats() {
  visitorPlayers = null;
  homePlayers = null;
  console.log("Stats reset");
}

// Main execution (only run if this is the main module)
if (import.meta.main) {
  const args = process.argv.slice(2);
  const xmlFilePath = args[0] || "/Users/gurleen/Downloads/bbgame.xml";
  watchXmlFile(xmlFilePath);
}

// Export for potential use in other modules
export {
  type PlayerStats,
  type TeamPlayers,
  visitorPlayers,
  homePlayers,
  parseXmlFile,
  getStats,
  resetStats,
};
