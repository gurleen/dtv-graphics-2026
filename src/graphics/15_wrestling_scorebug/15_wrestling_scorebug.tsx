import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import type { AppState, Team, Wrestler, WrestlingScorebugState } from '@/data/models';
import { useAppState } from '@/data/teams';
import { ZLayers } from '@/util/layers';
import useAnimation from '@/util/use-animation';
import { useWrestlingState } from '@/util/use-live-stats-manager';
import { ordinalize } from '@/util/utils';
import gsap from "gsap";
import { useGSAP } from '@gsap/react';
import NumberFlow from '@number-flow/react';
import { Color } from 'color-core';
import { createContext, useContext, useMemo, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import FadeContainer from '@/components/fade-container';
import { FadeText } from '@/components/fade-text';

const sponsorLogo = "https://images.dragonstv.io/sponsors/Independence.png";

function animation(timeline: gsap.core.Timeline) {
    return;
    timeline
        // .delay(0.5)
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
    if (!state) return (<div></div>);

    return (
        <div id="container" ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex w-full h-full' id='container' style={{ marginTop: 846, marginLeft: 100 }}>
                    <div id="scorebug" className='flex flex-col'>
                        <TeamBox team={state.appState.awayTeam} wrestler={state.bugState.awayWrestler} score={state.bugState.awayScore}
                        advantage={state.bugState.advantageSide == "Away"} advTime={state.bugState.advantageTime} />
                        <TeamBox team={state.appState.homeTeam} wrestler={state.bugState.homeWrestler} score={state.bugState.homeScore}
                        advantage={state.bugState.advantageSide == "Home"} advTime={state.bugState.advantageTime} />
                        <InfoBox state={state.bugState} />
                    </div>
                </div>
            </AnimationContainer>
        </div>
    );
}

function TeamBox({ team, wrestler, score, advantage, advTime }: { team: Team, wrestler: Wrestler, score: number, advantage: boolean, advTime: number }) {
    const homeColorDarker = useMemo(() => new Color(team.info.primaryColor).adjustLightness(-4).toHex(), [team]);
    const rankingVisiblity = wrestler.isRanked ? '' : 'invisible';

    return (
        <div className='flex flex-row'>
            <Rect width={400} height={60} color={team.info.primaryColor} className='w-border'>
                <ZLayers>
                    <div>
                        <img style={{ marginTop: -180, marginLeft: -130, scale: 0.4, opacity: 0.1 }} src={team.info.knockoutLogoUrl} />
                    </div>
                    <div className='flex w-full items-center justify-between text-white'>
                        <div className='text-4xl flex ps-3 pt-1'>
                            <p className={`text-3xl ${rankingVisiblity}`}>{wrestler.ranking}</p>
                            <FadeText className='ms-1 font-light' text={wrestler.firstName} />
                            <FadeText className='ms-2 font-bold' text={wrestler.lastName} />
                        </div>

                        <Rect width={90} height={60} color={homeColorDarker} className='flex items-center justify-center w-border overflow-hidden'>
                            <NumberFlow className="text-white font-bold text-5xl tabular-nums" value={score} />
                        </Rect>
                    </div>
                </ZLayers>
            </Rect>

            <RidingTimeBox hasAdvantage={advantage} time={advTime} color={team.info.primaryColor} />
        </div>
    );
}

function RidingTimeBox({hasAdvantage, time, color}: {hasAdvantage: boolean, time: number, color: string}) {
    return (
        <FadeContainer visible={hasAdvantage}>
            <Rect height={60} width={115} color={color} className='w-border pt-1 grid grid-cols-3 items-center text-center font-bold text-white text-4xl tabular-nums'>
                <p className='col-span-1'>RT</p>
                <p className='col-span-2'>{formatClock(time)}</p>
            </Rect>
        </FadeContainer>
    );
}

function formatClock(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time - (minutes * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatPeriod(period: number) {
    if (period > 3) { return "OT" }
    return ordinalize(period);
}

function PeriodCircle({ active }: { active: boolean }) {
    const container = useRef(null);

    useGSAP(() => {
        const finalValue = active ? 1 : 0.2;
        const timeline = gsap.timeline();
        timeline
            .to(".timeout-box", { opacity: 0.2, duration: 0.1 })
            .to(".timeout-box", { opacity: 1, duration: 0.1 })
            .to(".timeout-box", { opacity: 0.2, duration: 0.1 })
            .to(".timeout-box", { opacity: 1, duration: 0.1 })
            .to(".timeout-box", { opacity: finalValue, duration: 0.2 })
    }, { scope: container, dependencies: [active] });

    return (
        <div ref={container}>
            <Rect width={12} height={12} color='#000000' className='timeout-box rounded-xl' />
        </div>
    );
}

function InfoBox({ state }: { state: WrestlingScorebugState }) {
    return (
        <Rect width={400} height={33} color='#D8D8D8' className='flex font-bold text-3xl'>
            <Rect width={85} height={35} className='w-border center-x-y'>
                <FadeText text={state.weightClass} />
            </Rect>
            <Rect width={175} height={35} className='w-border center-x-y p-2'>
                <img src={sponsorLogo} />
            </Rect>
            <Rect width={70} height={35} className='w-border center-x-y'>
                <ZLayers>
                    <div className='center-x-y gap-2 mt-3'>
                        <PeriodCircle active={state.period >= 1} />
                        <PeriodCircle active={state.period >= 2} />
                        <PeriodCircle active={state.period >= 3} />
                    </div>

                    <FadeContainer visible={state.period >= 4}>
                        <Rect className='w-full h-full center-x-y' color='#D8D8D8'>
                            <p>OT</p>
                        </Rect>
                    </FadeContainer>
                </ZLayers>
            </Rect>
            <Rect width={70} height={35} className='w-border center-x-y'>
                <p className='tabular-nums'>{formatClock(state.clock)}</p>
            </Rect>
        </Rect>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);