import { Sport } from "@/data/models";
import { useGlobalSettings } from "./GlobalSettingsContext";
import type { TeamStandingsRecord } from "@/types/basketball";
import { useSpxObject } from "@/util/spx";
import { createContextFrom } from "@/util/context-factory";


function getStandingsForSport(sport: Sport) {
    switch (sport) {
        case Sport.MensBasketball:
            return useSpxObject<TeamStandingsRecord[]>("basketball", "wbb_records.json");
        case Sport.WomensBasketball:
            return useSpxObject<TeamStandingsRecord[]>("basketball", "wbb_records.json");
        default:
            throw new Error(`Unsupported sport: ${sport}`);
    }
}


function getConfStandingsData() {
    const { settings } = useGlobalSettings();
    const sport = settings.sport;
    const { data: records } = getStandingsForSport(sport);

    if (!records) {
        return null;
    }

    return {
        records
    };
}

export const { Provider: ConfStandingsDataProvider, useCustomContext: useConfStandingsContext } =
    createContextFrom(getConfStandingsData);