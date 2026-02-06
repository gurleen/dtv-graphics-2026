import { AvailableStatsSelect, type GameLiveStats, TimerOptionsSearch, type BasketballScorebugState, type TeamBasketballScorebugState, getStatDisplayString, getTeamTotal, type StatOptions, type PlayerInfo, type StatsSource, getPlayerStat, getPlayerSeasonStat } from "@/types/basketball";
import { NumberInput } from "@/components/NumberInput";
import { SwitchInput } from "@/components/SwitchInput";
import Select from 'react-select'
import { Sport, type TeamSide } from "@/data/models";
import { useBasketballBugState } from "@/hooks/use-basketball-bug-state";
import { useObjectStoreContext } from "@/contexts/ObjectStoreContext";
import { useState, useMemo, useEffect } from "react";
import { useSpxObject } from "@/util/spx";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";

interface ComparisonSliderStateProps {
    selectedComparisonStat: { value: StatOptions; label: string };
    homeValue: string;
    awayValue: string;
    showing: boolean;
    setBugState: (updater: (draft: BasketballScorebugState) => void) => void;
}

function ComparisonSliderState({ selectedComparisonStat, homeValue, awayValue, showing, setBugState }: ComparisonSliderStateProps) {
    return (
        <div className="w-full p-2 border-b-2 border-[#009E67] grid grid-cols-4">
            <div className="flex items-center">
                <p className="font-bold">COMPARISON STAT</p>
            </div>
            <Select className="text-black" options={AvailableStatsSelect} value={selectedComparisonStat}
                onChange={v => v && setBugState(s => s.comparisonStat.stat = v.value)} />
            <div className="flex flex-col text-center">
                <p className="text-sm">HOME: {homeValue}</p>
                <p className="text-sm">AWAY: {awayValue}</p>
            </div>
            <div className="flex gap-1 justify-center items-center">
                <SwitchInput value={showing} onChange={v => setBugState(s => s.comparisonStat.showing = v)} />
            </div>
        </div>
    );
}

export function BasketballSettingsTab() {
    const { bugState, setBugState } = useBasketballBugState();
    const [stats] = useObjectStoreContext<GameLiveStats>('basketball-live-stats');

    if (!bugState || !stats || !stats.home || !stats.visitor) {
        return (
            <div className="flex items-center justify-center">
                <p className="text-red-700">DISCONNECTED!</p>
            </div>
        );
    }

    const homeValue = getTeamTotal(stats.home.players, bugState.comparisonStat.stat);
    const awayValue = getTeamTotal(stats.visitor.players, bugState.comparisonStat.stat);

    const selectedComparisonStat = { value: bugState.comparisonStat.stat, label: bugState.comparisonStat.stat.toString() };

    return (
        <div className="flex flex-wrap text-white">
            <TeamBugState teamBugState={bugState.homeTeam} setBugState={setBugState} side="Home" />

            <TeamBugState teamBugState={bugState.awayTeam} setBugState={setBugState} side="Away" />

            <ComparisonSliderState 
                selectedComparisonStat={selectedComparisonStat}
                homeValue={homeValue}
                awayValue={awayValue}
                showing={bugState.comparisonStat.showing}
                setBugState={setBugState}
            />
        </div>
    );
}

interface TeamBugStateProps {teamBugState: TeamBasketballScorebugState, setBugState: (updater: (draft: BasketballScorebugState) => void) => void, side: TeamSide}
type TeamBugStateUpdateFunc = (draft: TeamBasketballScorebugState) => void;

function TeamBugState({ teamBugState, setBugState, side }: TeamBugStateProps) {
    const sideText = side.toString().toUpperCase();

    const setTeamBugState = (updateFunc: TeamBugStateUpdateFunc) => {
        setBugState(d => {
            if(side == "Home") { updateFunc(d.homeTeam); }
            else if(side == "Away") { updateFunc(d.awayTeam) }
        })
    }

    return (
        <div className={`w-1/2 ${side == "Home" ? "border-r-2 border-[#009E67]" : ""}`}>
            <div className="grid grid-cols-2 border-b-2 py-2 border-[#009E67]">
                <p className="ps-2 font-bold">{sideText} TIMEOUTS</p>
                <NumberInput value={teamBugState.timeouts} min={0} max={4} onChange={v => { setTeamBugState(s => s.timeouts = v) }} />
            </div>

            <div className="grid grid-cols-2 border-b-2 py-2 border-[#009E67]">
                <p className="ps-2 font-bold">{sideText} BONUS</p>
                <SwitchInput value={teamBugState.bonus} onChange={v => setTeamBugState(s => s.bonus = v)} />
            </div>

            <div className="flex gap-2 items-center justify-between border-b-2 p-2 border-[#009E67]">
                <p className="font-bold">TIMER</p>
                <Select className="text-black" options={TimerOptionsSearch} onChange={v => v && setTeamBugState(s => s.timer.type = v.value)} />
                <SwitchInput value={teamBugState.timer.showing} onChange={v => setTeamBugState(s => s.timer.showing = v)} />
            </div>

            <div className="flex gap-2 items-center justify-between py-2 px-2 border-[#009E67]">
                <p className="font-bold w-1/12">PLAYER</p>
                <input className="bg-slate-700 w-15 px-2 py-1" type="number" value={teamBugState.player.number} onChange={e => setTeamBugState(s => s.player.number = parseInt(e.target.value))} />
                <div className="flex gap-0.5">
                    <label className="font-bold me-2">LIVE</label>
                    <SwitchInput value={teamBugState.player.kind == "live"} onChange={v => setTeamBugState(s => s.player.kind = v ? "live" : "season")} />
                </div>
                {/* <Select isMulti options={AvailableStatsSelect} className="text-black w-72" onChange={v => setTeamBugState(s => s.player.stats = v.map(option => option.value))} /> */}
                <SwitchInput value={teamBugState.player.showing} onChange={v => setTeamBugState(s => s.player.showing = v)} />
            </div>
            <div className="border-b-2 border-[#009E67]">
                <PlayerStatsRow side={side} playerNumber={teamBugState.player.number} statsSource={teamBugState.player.kind} setTeamBugState={setTeamBugState} />
            </div>
        </div>
    );
}


function getStatsBySource(kind: StatsSource): StatOptions[] {
    switch (kind) {
        case "live":
            return ["PTS", "REB", "AST", "STL", "BLK", "FG", "FG%", "3FG", "3FG%", "FT", "FT%", "TO", "PF"];
        case "season":
            return ["PPG", "RPG", "APG", "SPG", "BPG", "TO", "PF", "FG%", "3FG%", "FT%"];
    }
}


function PlayerStatsRow({ side, playerNumber, statsSource, setTeamBugState }: { side: TeamSide, playerNumber: number, statsSource: StatsSource, setTeamBugState: (updateFunc: TeamBugStateUpdateFunc) => void }) {
    const globalState = useGlobalSettings();
    const teamId = side == "Home" ? globalState.homeTeam.team_id : globalState.awayTeam.team_id;
    const { settings } = useGlobalSettings();
    const playersFile = settings?.sport === Sport.MensBasketball ? 'mbb_players.json' : 'wbb_players.json';
    const {data: players} = useSpxObject<PlayerInfo[]>('basketball', playersFile);
    const currentPlayer = useMemo(() => {
        return players?.find(p => p.jersey === playerNumber?.toString() && p.team_id == teamId);
    }, [players, playerNumber, teamId]);
    const [stats] = useObjectStoreContext<GameLiveStats>('basketball-live-stats');
    const [selectedStats, setSelectedStats] = useState<StatOptions[]>([]);

    const statHeaders = getStatsBySource(statsSource);

    const toggleStat = (stat: StatOptions) => {
        setSelectedStats(prev => 
            prev.includes(stat) 
                ? prev.filter(s => s !== stat) 
                : [...prev, stat]
        );
    };

    useEffect(() => setSelectedStats([]), [statsSource, playerNumber]);
    useEffect(() => {
        setTeamBugState(s => {
            s.player.stats = selectedStats
        })
    }, [selectedStats]);

    if(!currentPlayer || !stats) {
        return (
            <p className="text-red-700 text-center p-2">PLAYER NOT FOUND</p>
        );
    }

    const getStat = (stat: StatOptions) => {
        if(statsSource == "live") {
            const teamStats = side == "Home" ? stats.home : stats.visitor;
            if(!teamStats) return "-";
            const playerStats = teamStats.players.find(p => p.shirtNumber == playerNumber.toString());
            if(!playerStats) return "-";
            return getPlayerStat(playerStats, stat);
        }
        else if(statsSource == "season") {
            return getPlayerSeasonStat(currentPlayer, stat);
        }
        return "-";
    }
    
    return (
        <table className="table-auto w-full text-center">
            <thead>
                <tr>
                    <th className="border px-2" colSpan={statHeaders.length}>
                        <div className="flex w-full items-center justify-center gap-6 text-2xl">
                            <p>{currentPlayer.first_name} {currentPlayer.last_name}</p>
                            <p>#{currentPlayer.jersey}</p>
                            <p>{currentPlayer.position_display}</p>
                        </div>
                    </th>
                </tr>
                <tr>
                    {statHeaders.map(stat => (
                        <th className="border px-2" key={stat}>{stat}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                <tr>
                    {statHeaders.map(stat => (
                        <td 
                            className={`border px-2 cursor-pointer ${selectedStats.includes(stat) ? 'bg-white text-black' : ''}`} 
                            key={stat}
                            onClick={() => toggleStat(stat)}
                        >
                            {getStat(stat)}
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    );
}