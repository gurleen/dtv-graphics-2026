import { AvailableStatsSelect, type BasketballScorebugState } from "@/types/basketball";
import { useObjectStore } from "@/util/use-object-store";
import { useEffect } from "react";
import { NumberInput } from "@/components/NumberInput";
import { SwitchInput } from "@/components/SwitchInput";
import Select from 'react-select'

export function BasketballSettingsTab() {
    const { bugState, setBugState } = useBasketballBugState();

    if (!bugState) {
        return (
            <div className="flex items-center justify-center">
                <p className="text-red-700">DISCONNECTED!</p>
            </div>
        );
    }

    const selectedComparisonStat = {value: bugState.comparisonStat.stat, label: bugState.comparisonStat.stat.toString()};

    return (
        <div className="flex flex-wrap text-white">
            <div className="w-1/2 border-r-2 border-[#009E67]">
                <div className="grid grid-cols-2 border-b-2 py-2 border-[#009E67]">
                    <p className="ps-2 font-bold">HOME TIMEOUTS</p>
                    <NumberInput value={bugState.homeTeam.timeouts} min={0} max={4} onChange={v => { setBugState(s => s.homeTeam.timeouts = v) }} />
                </div>

                <div className="grid grid-cols-2 border-b-2 py-2 border-[#009E67]">
                    <p className="ps-2 font-bold">HOME BONUS</p>
                    <SwitchInput value={bugState.homeTeam.bonus} onChange={v => setBugState(s => s.homeTeam.bonus = v) } />
                </div>

                <div className="flex gap-2 items-center justify-between border-b-2 p-2 border-[#009E67]">
                    <p className="font-bold">TIME SINCE</p>
                    <Select />
                    <SwitchInput value={false} onChange={console.log} />
                </div>
            </div>

            <div className="w-1/2">
                <div className="grid grid-cols-2 border-b-2 py-2 border-[#009E67]">
                    <p className="ps-2 font-bold">AWAY TIMEOUTS</p>
                    <NumberInput value={bugState.awayTeam.timeouts} min={0} max={4} onChange={v => { setBugState(s => s.awayTeam.timeouts = v) }} />
                </div>

                <div className="grid grid-cols-2 border-b-2 py-2 border-[#009E67]">
                    <p className="ps-2 font-bold">AWAY BONUS</p>
                    <SwitchInput value={bugState.awayTeam.bonus} onChange={v => setBugState(s => s.awayTeam.bonus = v) } />
                </div>

                <div className="grid grid-cols-2 border-b-2 py-2 border-[#009E67]">
                    <p className="ps-2 font-bold">TIME SINCE</p>
                    <SwitchInput value={false} onChange={console.log} />
                </div>
            </div>

            <div className="w-full p-2 border-b-2 border-[#009E67] grid grid-cols-3">
                <div className="flex items-center">
                    <p className="font-bold">COMPARISON STAT</p>
                </div>
                <Select className="text-black" options={AvailableStatsSelect} value={selectedComparisonStat}
                    onChange={v => v && setBugState(s => s.comparisonStat.stat = v.value)} />
                <div className="flex gap-1 justify-center items-center">
                    <SwitchInput value={bugState.comparisonStat.showing} onChange={v => setBugState(s => s.comparisonStat.showing = v)} />
                </div>
            </div>
        </div>
    );
}

function useBasketballBugState() {
    const {
        data,
        subscribe,
        unsubscribe,
        set,
    } = useObjectStore();

    useEffect(() => {
        subscribe('basketball-scorebug-state');
        return () => unsubscribe('basketball-scorebug-state');
    }, []);

    const bugState = data['basketball-scorebug-state'] as BasketballScorebugState | undefined;
    const setBugState = (updater: (draft: BasketballScorebugState) => void) => {
        const draft = { ...bugState! };
        updater(draft);
        set('basketball-scorebug-state', draft);
    }

    return { bugState, setBugState };
}