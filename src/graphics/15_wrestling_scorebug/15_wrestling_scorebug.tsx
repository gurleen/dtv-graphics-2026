import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import type { AppState, Team, Wrestler, WrestlingScorebugState } from '@/data/models';
import { useAppState } from '@/data/teams';
import { ZLayers } from '@/util/layers';
import useAnimation from '@/util/use-animation';
import { useWrestlingState } from '@/util/use-live-stats-manager';
import { ordinalize } from '@/util/utils';
import NumberFlow from '@number-flow/react';
import { Color } from 'color-core';
import { createContext, useContext, useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';

const sponsorLogo = "https://images.dragonstv.io/sponsors/Independence.png";

function animation(timeline: gsap.core.Timeline) {
    timeline
        .delay(0.5)
        .from("#scorebug", { x: -200, opacity: 0, duration: 0.5, ease: "circ.out" })
        .addPause()
        .to("#scorebug", { opacity: 0, duration: 0.3, ease: "circ.out" })
}

interface Data {
    bugState: WrestlingScorebugState;
    appState: AppState;
}

const DataContext = createContext<Data | undefined>(undefined);

function PageRoot() {
    const bugState = useWrestlingState();
    const appState = useAppState();

    return (
        <>
            {appState && bugState && <DataContext value={{ appState: appState, bugState: bugState }}>
                <WrestlingScorebug />
            </DataContext>}
        </>
    );
}

function WrestlingScorebug() {
    const container = useAnimation(animation);
    const state = useContext(DataContext);
    if(!state) return (<div></div>);

    return (
        <div id="container" ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex w-full h-full' id='container' style={{ marginTop: 846, marginLeft: 100 }}>
                    <div id="scorebug" className='flex flex-col'>
                        <TeamBox team={state.appState.awayTeam} wrestler={state.bugState.awayWrestler} score={state.bugState.awayScore} />
                        <TeamBox team={state.appState.homeTeam} wrestler={state.bugState.homeWrestler} score={state.bugState.homeScore} />
                        <InfoBox state={state.bugState} />
                    </div>
                </div>
            </AnimationContainer>
        </div>
    );
}

function TeamBox({team, wrestler, score}: {team: Team, wrestler: Wrestler, score: number}) {
    const homeColorDarker = useMemo(() => new Color(team.info.primaryColor).adjustLightness(-4).toHex(), [team]);

    return (
        <Rect width={400} height={60} color={team.info.primaryColor} className='w-border'>
            <ZLayers>
                <div>
                    <img style={{ marginTop: -180, marginLeft: -130, scale: 0.4, opacity: 0.1 }} src={team.info.knockoutLogoUrl} />
                </div>
                <div className='flex w-full items-center justify-between text-white'>
                    <div className='text-4xl flex gap-2 ps-3 pt-1'>
                        <span className='font-light'>{wrestler.firstName}</span>
                        <span className='font-bold'>{wrestler.lastName}</span>
                    </div>
                    
                    <Rect width={90} height={60} color={homeColorDarker} className='flex items-center justify-center w-border overflow-hidden'>
                        <NumberFlow className="text-white font-bold text-5xl tabular-nums" value={score} />
                    </Rect>
                </div>
            </ZLayers>
        </Rect>
    );
}

function InfoBox({state}: {state: WrestlingScorebugState}) {
    return (
        <Rect width={400} height={33} color='#D8D8D8' className='flex font-bold text-3xl'>
            <Rect width={85} height={35} className='w-border center-x-y'>
                {state.weightClass}
            </Rect>
            <Rect width={175} height={35} className='w-border center-x-y p-2'>
                <img src={sponsorLogo} />
            </Rect>
            <Rect width={70} height={35} className='w-border center-x-y'>
                {ordinalize(state.period)}
            </Rect>
            <Rect width={70} height={35} className='w-border center-x-y tabular-nums'>
                10:00
            </Rect>
        </Rect>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);