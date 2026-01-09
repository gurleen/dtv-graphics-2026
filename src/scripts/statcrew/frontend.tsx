import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

interface PlayerStats {
  name: string;
  shirtNumber: string;
  fgm: number;
  fga: number;
  fgm3: number;
  fga3: number;
  ftm: number;
  fta: number;
  tp: number;
  blk: number;
  stl: number;
  ast: number;
  min: number;
  oreb: number;
  dreb: number;
  treb: number;
  pf: number;
  tf: number;
  to: number;
  dq: number;
  fgpct: number;
  fg3pct: number;
  ftpct: number;
}

interface TeamPlayers {
  team: string;
  teamCode: string;
  vh: string;
  players: PlayerStats[];
}

interface StatsData {
  visitor: TeamPlayers | null;
  home: TeamPlayers | null;
}

interface Play {
  period: number;
  vh: string;
  time: string;
  uni: string;
  team: string;
  checkname: string;
  action: string;
  type?: string;
  vscore?: number;
  hscore?: number;
  side?: string;
  fastb?: string;
}

type TabType = "settings" | "visitor" | "home" | "plays";

function App() {
  const [filePath, setFilePath] = useState("/Users/gurleen/Downloads/bbgame.xml");
  const [isWatching, setIsWatching] = useState(false);
  const [stats, setStats] = useState<StatsData>({ visitor: null, home: null });
  const [plays, setPlays] = useState<Play[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [activeTab, setActiveTab] = useState<TabType>("settings");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(`ws://${window.location.host}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);

      switch (message.type) {
        case "watcher_status":
          setIsWatching(message.isWatching);
          if (message.filePath) {
            setFilePath(message.filePath);
          }
          break;

        case "stats_update":
          setStats(message.data);
          setLastUpdate(message.timestamp);
          break;

        case "plays_update":
          setPlays(message.data);
          break;

        case "error":
          console.error("Error from server:", message.message);
          // alert(message.message);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("disconnected");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnectionStatus("disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const handleStartWatching = () => {
    sendMessage({ type: "start_watching", filePath });
  };

  const handleStopWatching = () => {
    sendMessage({ type: "stop_watching" });
  };

  const handleResetStats = () => {
    if (confirm("Are you sure you want to reset all stats?")) {
      sendMessage({ type: "reset_stats" });
    }
  };

  const renderPlayerRow = (player: PlayerStats, index: number) => (
    <tr
      key={player.shirtNumber}
      className={`border border-gray-300 transition-colors ${
        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
      } hover:bg-blue-50`}
    >
      <td className="px-1 py-0.5 font-bold text-gray-900 border-r border-gray-300 text-xs">{player.shirtNumber}</td>
      <td className="px-1 py-0.5 font-medium text-left border-r border-gray-300 text-xs">{player.name}</td>
      <td className="px-1 py-0.5 text-center font-bold border-r border-gray-300 text-xs" style={{ color: '#1e40af' }}>{player.tp}</td>
      <td className="px-1 py-0.5 text-center tabular-nums border-r border-gray-300 text-xs">{player.fgm}/{player.fga}</td>
      <td className="px-1 py-0.5 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#6b7280' }}>{player.fgpct.toFixed(1)}%</td>
      <td className="px-1 py-0.5 text-center tabular-nums border-r border-gray-300 text-xs">{player.fgm3}/{player.fga3}</td>
      <td className="px-1 py-0.5 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#6b7280' }}>{player.fg3pct.toFixed(1)}%</td>
      <td className="px-1 py-0.5 text-center tabular-nums border-r border-gray-300 text-xs">{player.ftm}/{player.fta}</td>
      <td className="px-1 py-0.5 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#6b7280' }}>{player.ftpct.toFixed(1)}%</td>
      <td className="px-1 py-0.5 text-center font-semibold tabular-nums border-r border-gray-300 text-xs">{player.treb}</td>
      <td className="px-1 py-0.5 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#6b7280' }}>{player.oreb}</td>
      <td className="px-1 py-0.5 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#6b7280' }}>{player.dreb}</td>
      <td className="px-1 py-0.5 text-center font-semibold tabular-nums border-r border-gray-300 text-xs">{player.ast}</td>
      <td className="px-1 py-0.5 text-center tabular-nums border-r border-gray-300 text-xs">{player.stl}</td>
      <td className="px-1 py-0.5 text-center tabular-nums border-r border-gray-300 text-xs">{player.blk}</td>
      <td className="px-1 py-0.5 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#ea580c' }}>{player.to}</td>
      <td className="px-1 py-0.5 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#dc2626' }}>{player.pf}</td>
      <td className="px-1 py-0.5 text-center tabular-nums text-xs" style={{ color: '#6b7280' }}>{player.min}</td>
    </tr>
  );

  const calculateTeamTotals = (players: PlayerStats[]) => {
    return players.reduce((totals, player) => ({
      fgm: totals.fgm + player.fgm,
      fga: totals.fga + player.fga,
      fgm3: totals.fgm3 + player.fgm3,
      fga3: totals.fga3 + player.fga3,
      ftm: totals.ftm + player.ftm,
      fta: totals.fta + player.fta,
      tp: totals.tp + player.tp,
      blk: totals.blk + player.blk,
      stl: totals.stl + player.stl,
      ast: totals.ast + player.ast,
      min: totals.min + player.min,
      oreb: totals.oreb + player.oreb,
      dreb: totals.dreb + player.dreb,
      treb: totals.treb + player.treb,
      pf: totals.pf + player.pf,
      to: totals.to + player.to,
    }), {
      fgm: 0, fga: 0, fgm3: 0, fga3: 0, ftm: 0, fta: 0,
      tp: 0, blk: 0, stl: 0, ast: 0, min: 0,
      oreb: 0, dreb: 0, treb: 0, pf: 0, to: 0
    });
  };

  const renderPlaysTable = () => {
    if (plays.length === 0) {
      return (
        <div>
          <p className="text-gray-500 text-center py-8">No plays available. Start watching a file to see play-by-play data.</p>
        </div>
      );
    }

    // Reverse plays so newest are at the top
    const reversedPlays = [...plays].reverse();

    return (
      <div>
        <h2 className="text-sm font-bold mb-2 pb-1 border-b border-gray-300">
          Play-by-Play <span className="text-gray-500 text-xs">({plays.length} total plays)</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse border border-gray-400">
            <thead style={{ background: 'linear-gradient(to bottom, #1f2937, #374151)' }}>
              <tr>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs sticky top-0">Period</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs sticky top-0">Time</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs sticky top-0">Team</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs sticky top-0">#</th>
                <th className="px-1 py-1 text-left font-bold text-white border-r border-gray-500 text-xs sticky top-0">Player</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs sticky top-0">Action</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs sticky top-0">Type</th>
                <th className="px-1 py-1 text-center font-bold text-white text-xs sticky top-0">Score</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {reversedPlays.map((play, index) => {
                const isScoring = play.action === "GOOD" && (play.type === "JUMPER" || play.type === "3PTR" || play.type === "LAYUP" || play.type === "FT" || play.type === "DUNK" || play.type === "TIPIN");
                const isMiss = play.action === "MISS";
                const isTurnover = play.action === "TURNOVER";
                const isFoul = play.action === "FOUL";
                const rowClass = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';

                return (
                  <tr key={index} className={`border border-gray-300 transition-colors ${rowClass} hover:bg-blue-50`}>
                    <td className="px-1 py-0.5 text-center border-r border-gray-300 text-xs font-semibold">{play.period}</td>
                    <td className="px-1 py-0.5 text-center border-r border-gray-300 text-xs font-mono">{play.time}</td>
                    <td className="px-1 py-0.5 text-center border-r border-gray-300 text-xs font-medium" style={{ color: play.vh === 'V' ? '#dc2626' : '#2563eb' }}>{play.team}</td>
                    <td className="px-1 py-0.5 text-center border-r border-gray-300 text-xs font-bold">{play.uni}</td>
                    <td className="px-1 py-0.5 text-left border-r border-gray-300 text-xs">{play.checkname}</td>
                    <td className={`px-1 py-0.5 text-center border-r border-gray-300 text-xs font-semibold ${
                      isScoring ? 'text-green-700 bg-green-50' :
                      isMiss ? 'text-red-700' :
                      isTurnover ? 'text-orange-700' :
                      isFoul ? 'text-yellow-700' : ''
                    }`}>
                      {play.action}
                      {play.fastb === 'Y' && <span className="ml-1 text-purple-600 font-bold">⚡</span>}
                    </td>
                    <td className="px-1 py-0.5 text-center border-r border-gray-300 text-xs">{play.type || '-'}</td>
                    <td className="px-1 py-0.5 text-center text-xs font-bold">
                      {play.vscore !== undefined && play.hscore !== undefined ? (
                        <span>{play.vscore}-{play.hscore}</span>
                      ) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-2 pt-1 border-t border-gray-200 text-xs text-gray-600 font-medium">
          Total: {plays.length} plays
        </div>
      </div>
    );
  };

  const renderTeamTable = (teamData: TeamPlayers | null, label: string) => {
    if (!teamData) {
      return (
        <div>
          <p className="text-gray-500 text-center py-8">No data available. Start watching a file to see stats.</p>
        </div>
      );
    }

    const totals = calculateTeamTotals(teamData.players);
    const fgPct = totals.fga > 0 ? (totals.fgm / totals.fga * 100) : 0;
    const fg3Pct = totals.fga3 > 0 ? (totals.fgm3 / totals.fga3 * 100) : 0;
    const ftPct = totals.fta > 0 ? (totals.ftm / totals.fta * 100) : 0;

    return (
      <div>
        <h2 className="text-sm font-bold mb-2 pb-1 border-b border-gray-300">
          {label}: <span className="text-blue-700">{teamData.team}</span> <span className="text-gray-500 text-xs">({teamData.teamCode})</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse border border-gray-400">
            <thead style={{ background: 'linear-gradient(to bottom, #1f2937, #374151)' }}>
              <tr>
                <th className="px-1 py-1 text-left font-bold text-white border-r border-gray-500 text-xs">#</th>
                <th className="px-1 py-1 text-left font-bold text-white border-r border-gray-500 text-xs">Name</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">PTS</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">FG</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">FG%</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">3PT</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">3P%</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">FT</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">FT%</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">REB</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">OREB</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">DREB</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">AST</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">STL</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">BLK</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">TO</th>
                <th className="px-1 py-1 text-center font-bold text-white border-r border-gray-500 text-xs">PF</th>
                <th className="px-1 py-1 text-center font-bold text-white text-xs">MIN</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {teamData.players.map((player, index) => renderPlayerRow(player, index))}
              <tr className="bg-yellow-100 font-bold border-t-2 border-gray-800">
                <td className="px-1 py-1 text-left border-r border-gray-300 text-xs" colSpan={2}>TEAM TOTALS</td>
                <td className="px-1 py-1 text-center border-r border-gray-300 text-xs" style={{ color: '#1e40af' }}>{totals.tp}</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs">{totals.fgm}/{totals.fga}</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#6b7280' }}>{fgPct.toFixed(1)}%</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs">{totals.fgm3}/{totals.fga3}</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#6b7280' }}>{fg3Pct.toFixed(1)}%</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs">{totals.ftm}/{totals.fta}</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#6b7280' }}>{ftPct.toFixed(1)}%</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs">{totals.treb}</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#6b7280' }}>{totals.oreb}</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#6b7280' }}>{totals.dreb}</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs">{totals.ast}</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs">{totals.stl}</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs">{totals.blk}</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#ea580c' }}>{totals.to}</td>
                <td className="px-1 py-1 text-center tabular-nums border-r border-gray-300 text-xs" style={{ color: '#dc2626' }}>{totals.pf}</td>
                <td className="px-1 py-1 text-center tabular-nums text-xs" style={{ color: '#6b7280' }}>{totals.min}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-2 pt-1 border-t border-gray-200 text-xs text-gray-600 font-medium">
          Total: {teamData.players.length} players
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Berkeley Mono, Berkeley Mono Variable, monospace' }}>
      <div className="container mx-auto">
        {/* Tabs */}
        <div className="bg-white shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px items-center justify-between">
              <div className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-2 py-1 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === "settings"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Settings
                </button>
                <button
                  onClick={() => setActiveTab("visitor")}
                  className={`px-2 py-1 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === "visitor"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Visitor {stats.visitor && `(${stats.visitor.team})`}
                </button>
                <button
                  onClick={() => setActiveTab("home")}
                  className={`px-2 py-1 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === "home"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Home {stats.home && `(${stats.home.team})`}
                </button>
                <button
                  onClick={() => setActiveTab("plays")}
                  className={`px-2 py-1 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === "plays"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Plays ({plays.length})
                </button>
              </div>

              <div className="flex items-center gap-1 px-2">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-green-500"
                      : connectionStatus === "connecting"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-[10px] text-gray-600">
                  {connectionStatus === "connected"
                    ? "Connected"
                    : connectionStatus === "connecting"
                    ? "Connecting..."
                    : "Disconnected"}
                </span>
              </div>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-2">
            {activeTab === "settings" && (
              <div>
                <h2 className="text-xs font-bold mb-1">File Configuration</h2>

                <div className="mb-2">
                  <label className="block text-xs font-medium mb-1">XML File Path</label>
                  <input
                    type="text"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    disabled={isWatching}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="/path/to/bbgame.xml"
                  />
                </div>

                <div className="flex gap-1">
                  {!isWatching ? (
                    <button
                      onClick={handleStartWatching}
                      disabled={!filePath || connectionStatus !== "connected"}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                      Start Watching
                    </button>
                  ) : (
                    <button
                      onClick={handleStopWatching}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Stop Watching
                    </button>
                  )}

                  <button
                    onClick={handleResetStats}
                    disabled={!isWatching}
                    className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    Reset Stats
                  </button>
                </div>

                {isWatching && (
                  <div className="mt-2 p-1 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-800">
                      <span className="font-medium">Watching:</span> {filePath}
                    </p>
                  </div>
                )}

                {lastUpdate && (
                  <div className="mt-2 text-xs text-gray-600">
                    Last update: {new Date(lastUpdate).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {activeTab === "visitor" && renderTeamTable(stats.visitor, "Visitor Team")}
            {activeTab === "home" && renderTeamTable(stats.home, "Home Team")}
            {activeTab === "plays" && renderPlaysTable()}
          </div>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
