import { AvailableStatsSelect, type GameLiveStats, TimerOptionsSearch, type BasketballScorebugState, type TeamBasketballScorebugState, getStatDisplayString, getTeamTotal } from "@/types/basketball";
import { NumberInput } from "@/components/NumberInput";
import { SwitchInput } from "@/components/SwitchInput";
import Select from 'react-select'
import type { TeamSide } from "@/data/models";
import { useBasketballBugState } from "@/hooks/use-basketball-bug-state";
import { useObjectStoreContext } from "@/contexts/ObjectStoreContext";

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
                    <SwitchInput value={bugState.comparisonStat.showing} onChange={v => setBugState(s => s.comparisonStat.showing = v)} />
                </div>
            </div>
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
        </div>
    );
}