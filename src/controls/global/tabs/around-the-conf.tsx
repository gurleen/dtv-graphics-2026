import { SwitchInput } from "@/components/SwitchInput";
import { useAroundTheConfStreams } from "@/hooks/misc";
import type { ScoreboardGame } from "@/types/basketball";
import type { GameVideoFeed } from "@/types/misc";
import type { TeamInfo } from "@/types/team";
import { getTeamKnockoutLogo, getTeamLogo } from "@/types/team";
import { useTeamData, useSpxObject } from "@/util/spx";
import { isDefined } from "@/util/utils";

interface GameRowProps {
    game: ScoreboardGame;
    homeTeam: TeamInfo;
    awayTeam: TeamInfo;
    feed: GameVideoFeed | undefined;
    setSingleStream: (stream: GameVideoFeed) => void;
}

function GameRow({ game, homeTeam, awayTeam, feed, setSingleStream }: GameRowProps) {
    const showingFeed = feed ? feed.showing : false;
    const updateUrl = (newUrl: string) => {
        const updatedFeed: GameVideoFeed = {
            game_id: game.game_id,
            url: newUrl,
            showing: feed?.showing || false,
        };
        setSingleStream(updatedFeed);
    }
    const updateShowing = (showing: boolean) => {
        const updatedFeed: GameVideoFeed = {
            game_id: game.game_id,
            url: feed?.url || '',
            showing: showing,
        };
        setSingleStream(updatedFeed);
    }

    return (
        <tr key={game.game_id}>
            <td className="border border-white">
                <div className="flex items-center gap-2">
                    <img src={getTeamLogo(homeTeam)} alt={homeTeam.short_name} className="w-8 h-auto" />
                    {homeTeam.short_name} ({game.home_score})
                </div>
            </td>
            <td className="border border-white">
                <div className="flex items-center gap-2">
                    <img src={getTeamLogo(awayTeam)} alt={awayTeam.short_name} className="w-8 h-auto" />
                    {awayTeam.short_name} ({game.away_score})
                </div>
            </td>
            <td className="border border-white">
                {game.status}
            </td>
            <td>
                <input
                    type="text"
                    className="w-full bg-gray-800 text-white border border-white p-1"
                    value={feed ? feed.url : ''}
                    placeholder="Enter stream URL..."
                    onChange={e => updateUrl(e.target.value)}
                />
            </td>
            <td>
                <SwitchInput value={showingFeed} onChange={v => updateShowing(v)} />
            </td>
        </tr>
    );
}

export function AroundTheConfTab() {
    const teams = useTeamData();
    const { data: records } = useSpxObject<ScoreboardGame[]>("basketball", "scoreboard.json");
    const {streams, setSingleStream } = useAroundTheConfStreams();

    if (!isDefined(records) || !isDefined(teams) || !isDefined(streams)) { return (
        <div className="flex items-center justify-center">
            <p className="text-white">LOADING...</p>
        </div>
    ); }

    return (
        <div className="flex text-white">
            <table className="w-full table-auto border-collapse border border-white">
                <thead>
                    <tr>
                        <th className="border border-white">Home Team</th>
                        <th className="border border-white">Away Team</th>
                        <th className="border border-white">Status</th>
                        <th className="border border-white">Stream URL</th>
                        <th className="border border-white">Showing</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map(game => {
                        const homeTeam = teams.find(t => t.team_id.toString() === game.home_team_id);
                        const awayTeam = teams.find(t => t.team_id.toString() === game.away_team_id);
                        const gameStream = streams.find(s => s.game_id === game.game_id);

                        if (!homeTeam || !awayTeam) { return null; }

                        return (
                            <GameRow
                                key={game.game_id}
                                game={game}
                                homeTeam={homeTeam}
                                awayTeam={awayTeam}
                                feed={gameStream}
                                setSingleStream={setSingleStream}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    )
}