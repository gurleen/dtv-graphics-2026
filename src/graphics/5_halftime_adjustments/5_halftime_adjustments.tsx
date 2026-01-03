import AnimationContainer from '@/components/animation-container';
import Squares from '@/components/react-bits/Squares';
import { Rect } from '@/components/rect';
import { type AppState, type CurrentGameState, type GameState, type Team, type TeamGameState } from '@/data/models';
import { currentGameState, useAppState } from '@/data/teams';
import { ZLayers } from '@/util/layers';
import useAnimation from '@/util/use-animation';
import { useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';
import type { HalftimeAdjustmentsProps } from './props';
import useProps from '@/util/use-props';

const sponsorLogo = "https://images.dragonstv.io/sponsors/Rothman-transparent.png";

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#top-bar", { y: 250, duration: 0.5, ease: 'circ.out' })
        .from("#content-area", { y: -500, duration: 0.5, ease: 'circ.out' }, "<0.3")
        .from("#home-name", { x: 50, opacity: 0, duration: 0.5, ease: 'circ.out' }, "<0.3")
        .from("#away-name", { x: -50, opacity: 0, duration: 0.5, ease: 'circ.out' }, "<")
        .from("#home-adjustment", { x: 50, opacity: 0, duration: 0.5, ease: 'circ.out' }, "<0.1")
        .from("#away-adjustment", { x: -50, opacity: 0, duration: 0.5, ease: 'circ.out' }, "<")
        .addPause()
        .to("#halftime-adjustments-mask", { duration: 0.5, opacity: 0, ease: 'circ.out' })
}

function GetTestProps(): HalftimeAdjustmentsProps {
    return {
        homeAdjustment: "THIS IS THE HOME ADJUSTMENT",
        awayAdjustment: "THIS IS THE AWAY ADJUSTMENT"
    }
}

function PageRoot() {
    const appState = useAppState();
    const gameState = currentGameState();
    const props = useProps<HalftimeAdjustmentsProps>();

    return (
        <>
            {appState && gameState && props && <HalftimeAdjustments gfx={appState} game={gameState} props={props} />}
        </>
    );
}

function HalftimeAdjustments({ gfx, game, props }: { gfx: AppState, game: GameState, props: HalftimeAdjustmentsProps }) {
    return (
        <>
            {<MainArea appState={gfx} game={game} props={props} />}
        </>
    );
}

function MainArea({ appState, game, props }: { appState: AppState, game: GameState, props: HalftimeAdjustmentsProps }) {
    const container = useAnimation(animation);

    return (
        <div ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex justify-center w-full h-full'>
                    <div id="halftime-adjustments-mask" className='overflow-hidden' style={{ marginTop: 550 }}>
                        <TopBar />
                        <ContentArea appState={appState} game={game} props={props} />
                    </div>
                </div>
            </AnimationContainer>
        </div>
    );
}

function ContentArea({ appState, game, props }: { appState: AppState, game: GameState, props: HalftimeAdjustmentsProps }) {
    return (
        <div id="content-area-mask" className='overflow-hidden'>
            <Rect id='content-area' width={1500} height={300} color='#131313' className='text-white flex'>
                <TeamBox team={appState.awayTeam} game={game.awayTeam} />

                <Rect width={900} height={300} className='flex flex-col'>
                    <TeamAdjustmentBox team={appState.awayTeam} isHome={false} text={props.awayAdjustment} />
                    <TeamAdjustmentBox team={appState.homeTeam} isHome={true} text={props.homeAdjustment} />
                </Rect>

                <TeamBox team={appState.homeTeam} game={game.homeTeam} />
            </Rect>
        </div>
    );
}

function TeamAdjustmentBox({ team, isHome, text }: { team: Team, isHome: boolean, text: string }) {
    const align = useMemo(() => isHome ? 'items-end' : '', [isHome]);
    const idPrefix = useMemo(() => isHome ? 'home' : 'away', [isHome]);

    return (
        <Rect width={900} height={150} color={team.info.primaryColor}
            style={{ color: team.info.primaryTextColor }} className={`flex flex-col py-3 px-5 justify-between ${align}`}>
            <p id={`${idPrefix}-name`} className='text-6xl font-bold'>{team.info.schoolName}</p>
            <p id={`${idPrefix}-adjustment`} className='text-7xl font-light'>{text}</p>
        </Rect>
    );
}

function TeamBox({ team, game }: { team: Team, game: TeamGameState }) {

    return (
        <Rect width={300} height={300} color={team.info.primaryColor}>
            <ZLayers>
                <div className='opacity-40 w-full h-full'>
                    <Squares
                        speed={0.5}
                        squareSize={40}
                        direction='diagonal'
                        borderColor='#fff'
                        hoverFillColor='#222'
                    />
                </div>
                <Rect className='flex'>
                    <img src={team.info.knockoutLogoUrl + `?t=${Date.now()}`} style={{ scale: 2.4, opacity: .15 }} />
                </Rect>
                <Rect className='flex w-full h-full justify-center items-center'>
                    <p className='font-bold' style={{ color: team.info.primaryTextColor, fontSize: 175 }}>{game.score}</p>
                </Rect>
            </ZLayers>
        </Rect>
    );
}

function TopBar() {
    return (
        <div id="top-bar-mask" className='overflow-hidden'>
            <Rect id="top-bar" width={1500} height={150} color='#F0E6C8' className='flex items-center justify-between'>
                <div className='flex flex-col ps-8'>
                    <p className='text-7xl font-bold'>HALFTIME ADJUSTMENTS</p>
                    <p className='text-5xl font-light'>PRESENTED BY ROTHMAN ORTHOPAEDICS</p>
                </div>

                <Rect width={250} height={150} className='p-7 flex items-center justify-center'>
                    <img src={sponsorLogo} />
                </Rect>
            </Rect>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);