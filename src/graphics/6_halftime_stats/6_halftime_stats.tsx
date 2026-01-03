import AnimationContainer from '@/components/animation-container';
import { type AppState, type Boxscore, type GameState, type ShotStats, type Team, type TeamGameState } from '@/data/models';
import { currentGameState, useAppState, useBoxscore } from '@/data/teams';
import useAnimation from '@/util/use-animation';
import * as ReactDOM from 'react-dom/client';
import { Rect } from '@/components/rect';
import { ZLayers } from '@/util/layers';

const sponsorLogo = "https://images.dragonstv.io/sponsors/DrexelPT.png";

function animation(timeline: gsap.core.Timeline) {
    timeline.from("#halftime-stats-mask", { duration: 0.5, x: "-=100", opacity: 0, ease: "power3.out" })
        .from("text", { duration: 0.5, x: "-=50", opacity: 0, ease: "power3.out" }, "-=0.4")
        .from("#sponsor-logo", { opacity: 0, y: "-=100", duration: 0.5, ease: "power3.out" })
        .addPause("+=0")
        .to("#container", { duration: 0.3, opacity: 0, ease: "power3.out" })
}


function PageRoot() {
    const appState = useAppState();
    const gameState = currentGameState();
    const boxscore = useBoxscore();

    return (
        <>
            {appState && gameState && boxscore && <HalftimeAdjustments gfx={appState} game={gameState} box={boxscore} />}
        </>
    );
}

function shotStatsDisplay(stats: ShotStats): string {
    return `${stats.made}-${stats.attempted}`;
}

function HalftimeAdjustments({ gfx, game, box }: { gfx: AppState, game: GameState, box: Boxscore }) {
    const container = useAnimation(animation);

    return (
        <div ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex justify-center w-full h-full' id='container'>
                    <ZLayers>
                        <div id="halftime-stats-mask" className='overflow-hidden w-full h-full flex items-center justify-center' style={{ marginTop: -200 }}>
                            <Rect width={1479} height={689} color="#D8D8D8" className='flex justify-center rounded-xl'>
                                <TeamLogoBox team={gfx.awayTeam} />
                                <Rect width={554} height={689}>
                                    <Rect width={554} className='flex items-center justify-center p-2'>
                                        <p className='font-bold text-[81px]'>HALFTIME STATS</p>
                                    </Rect>

                                    <div className='flex'>
                                        <TeamScoreBox name={gfx.awayTeam.info.abbreviation} score={game.awayTeam.score} />
                                        <TeamScoreBox name={gfx.homeTeam.info.abbreviation} score={game.homeTeam.score} />
                                    </div>

                                    <TeamStatsGrid box={box} />
                                </Rect>
                                <TeamLogoBox team={gfx.homeTeam} />
                            </Rect>
                        </div>

                        <img id="sponsor-logo" src={sponsorLogo} style={{ scale: 0.8, marginTop: 100 }} />
                    </ZLayers>
                </div>
            </AnimationContainer>
        </div>
    );
}

function TeamStatsGrid({ box }: {box: Boxscore}) {
    return (
        <Rect className='flex flex-col leading-20' height={396}>
            <TeamStatsRow 
                awayVal={shotStatsDisplay(box.awayTeam.totals.stats.fieldGoals)} 
                stat='FG' 
                homeVal={shotStatsDisplay(box.homeTeam.totals.stats.fieldGoals)} />
            <TeamStatsRow 
                awayVal={shotStatsDisplay(box.awayTeam.totals.stats.threePointers)} 
                stat='3FG' 
                homeVal={shotStatsDisplay(box.homeTeam.totals.stats.threePointers)} />
            <TeamStatsRow 
                awayVal={shotStatsDisplay(box.awayTeam.totals.stats.freeThrows)} 
                stat='FT' 
                homeVal={shotStatsDisplay(box.homeTeam.totals.stats.freeThrows)} />
            <TeamStatsRow
                awayVal={box.awayTeam.totals.stats.rebounds.total}
                stat='REB'
                homeVal={box.homeTeam.totals.stats.rebounds.total} />
            <TeamStatsRow
                awayVal={box.awayTeam.totals.stats.turnovers}
                stat='TO'
                homeVal={box.homeTeam.totals.stats.turnovers} />
        </Rect>
    );
}

function TeamStatsRow({ awayVal, stat, homeVal }: { awayVal: string | number, stat: string, homeVal: string | number }) {
    return (
        <div className='grid grid-cols-3 px-10 text-[69px] tabular-nums'>
            <p className='text-left'>{awayVal}</p>
            <div className='flex items-center justify-center'>
                <Rect width={100} color='#000'>
                    <p className='font-bold text-center text-white'>{stat}</p>
                </Rect>
            </div>
            <p className='text-right'>{homeVal}</p>
        </div>
    );
}

function TeamScoreBox({ name, score }: { name: string, score: number }) {
    return (
        <Rect width={277} height={155} className='flex flex-col items-center justify-between border-2 border-gray-500'>
            <p className='text-[55px] my-[-10px]'>{name}</p>
            <p className='text-[108px] font-bold my-[-40px]'>{score}</p>
        </Rect>
    );
}

function TeamLogoBox({ team }: { team: Team }) {
    return (
        <Rect width={443} height={689} color={team.info.primaryColor} className='flex items-center justify-center'>
            <img src={team.info.knockoutLogoUrl + `?t=${Date.now()}`} style={{ scale: 2 }} />
        </Rect>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);