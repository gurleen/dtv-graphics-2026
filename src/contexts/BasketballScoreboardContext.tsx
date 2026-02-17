import { Sport } from "@/data/models";
import { useGlobalSettings } from "./GlobalSettingsContext";
import type { ScoreboardGame } from "@/types/basketball";
import { useSpxObject } from "@/util/spx";
import { createContextFrom } from "@/util/context-factory";

function getScoreboardForSport(sport: Sport) {
    switch (sport) {
        case Sport.MensBasketball:
            return useSpxObject<ScoreboardGame[]>("basketball", "mbb_scoreboard.json");
        case Sport.WomensBasketball:
            return useSpxObject<ScoreboardGame[]>("basketball", "wbb_scoreboard.json");
        default:
            throw new Error(`Unsupported sport: ${sport}`);
    }
}

function getBasketballScoreboard() {
    const { settings } = useGlobalSettings();
    const { sport } = settings;
    const { data: games, refetch: refetchScoreboard } = getScoreboardForSport(sport);

    if (!games) {
        return null;
    }

    return {
        games,
        refetchScoreboard
    };
}

export const { Provider: BasketballScoreboardProvider, useCustomContext: useBasketballScoreboardContext } =
    createContextFrom(getBasketballScoreboard);