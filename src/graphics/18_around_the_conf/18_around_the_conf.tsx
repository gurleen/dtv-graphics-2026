import AnimationContainer from '@/components/animation-container';
import type { ScoreboardGame, TeamStandingsRecord } from '@/types/basketball';
import { useSpxObject, useTeamData } from '@/util/spx';
import useAnimation from '@/util/use-animation';
import { isDefined } from '@/util/utils';
import * as ReactDOM from 'react-dom/client';
import { createContext, useContext } from 'react';
import { getTeamKnockoutLogo, type TeamInfo } from '@/types/team';
import { Rect } from '@/components/rect';
import _ from 'lodash';


const confLogo = "https://images.dragonstv.io/sponsors/CAAWhite.png";
const boxFullWidth = 1920;
const boxFullHeight = 1080;
const ratio = 0.30;
const boxWidth = boxFullWidth * ratio;
const boxHeight = boxFullHeight * ratio;
const boxHalfWidth = boxWidth / 2;
const box80Height = boxHeight * 0.8;
const box20Height = boxHeight * 0.2;

interface PageContextType {
    teams: TeamInfo[];
    games: ScoreboardGame[];
}

const PageContext = createContext<PageContextType | null>(null);

export function usePageContext() {
    const context = useContext(PageContext);
    if (!context) {
        throw new Error('usePageContext must be used within PageContext.Provider');
    }
    return context;
}

function animation(timeline: gsap.core.Timeline) {
    timeline
        .delay(0.5)
        .from("#graphic", { opacity: 0, duration: 0.75, ease: 'expo.out' })
        .addPause()
        .to("#graphic", { opacity: 0, duration: 0.5, ease: 'expo.out' });
}

function PageRoot() {
    const teams = useTeamData();
    const { data: records } = useSpxObject<ScoreboardGame[]>("basketball", "scoreboard.json");

    if (!isDefined(records) || !isDefined(teams)) { return null; }

    return (
        <PageContext.Provider value={{ teams, games: records }}>
            <AroundTheConf />
        </PageContext.Provider>
    );
}

function AroundTheConf() {
    const container = useAnimation(animation);
    const { games, teams } = usePageContext();

    return (
        <div id="container" ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div id="graphic">
                    <Rect width={1920} height={150} color='#131313' className='flex items-center justify-center'>
                        <p className='text-white font-bold text-8xl text-shadow-white/60'>AROUND THE CONFERENCE</p>
                    </Rect>
                    <div className='flex flex-wrap gap-14 max-h-full py-6 items-center justify-center bg-gray-700/80'>
                        {games.map(game => (
                            <div key={game.game_id} className='m-2'>
                                <TeamBox game={game} />
                            </div>
                        ))}
                    </div>
                    <Rect height={150} width={1920} color='#131313' className='flex gap-10 py-5 items-center justify-center'>
                        {_.range(0, 6).map(i => (
                            <img src={confLogo} alt="Conference Logo" className={`max-h-[80%] ${i % 2 === 0 ? 'opacity-70' : 'opacity-100'}`} />
                        ))}
                    </Rect>
                </div>
            </AnimationContainer>
        </div>
    );
}


function TeamBox({ game }: { game: ScoreboardGame }) {
    const { teams } = usePageContext();
    const homeTeam = teams.find(t => t.team_id.toString() === game.home_team_id)!;
    const awayTeam = teams.find(t => t.team_id.toString() === game.away_team_id)!;

    const homeLogo = getTeamKnockoutLogo(homeTeam);
    const awayLogo = getTeamKnockoutLogo(awayTeam);

    return (
        <Rect width={boxWidth} height={boxHeight} className='flex flex-wrap w-full h-full text-white'>
            <Rect width={boxHalfWidth} height={box80Height} color={homeTeam.color} className='flex flex-col items-center justify-center'>
                <img src={homeLogo} alt={homeTeam.short_name} className='max-h-[70%] max-w-[70%]' />
                <p className='text-6xl font-bold text-shadow-lg/60'>{game.home_score}</p>
            </Rect>
            <Rect width={boxHalfWidth} height={box80Height} color={awayTeam.color} className='flex flex-col items-center justify-center'>
                <img src={awayLogo} alt={awayTeam.short_name} className='max-h-[70%] max-w-[70%] mx-auto' />
                <p className='text-6xl font-bold text-shadow-lg/60'>{game.away_score}</p>
            </Rect>
            <Rect width={boxWidth} height={box20Height} color='#131313' className='flex px-2 items-center justify-center'>
                <p className='text-white font-semibold text-4xl'>{game.status}</p>
            </Rect>
        </Rect>
    );
}


const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);