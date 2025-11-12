import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import type { AppState, Team } from '@/data/models';
import { useAppState } from '@/data/teams';
import useAnimation from '@/util/use-animation';
import { useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';

const sponsorLogo = "https://images.dragonstv.io/sponsors/Independence.png";
const confLogo = "https://images.dragonstv.io/sponsors/CAAWhite.png";

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#caa-box", { y: 189, duration: 2.23, ease: 'expo.out' })
        .from("#caa-logo", { y: 189, duration: 2, ease: 'expo.out' }, "<0.1")
        .from("#home-box", { y: 189, duration: 2, ease: 'expo.out' }, "<0.3")
        .from("#away-box", { y: 189, duration: 2, ease: 'expo.out' }, "<")
        .from("#home-logo", { y: 75, duration: 2, ease: 'expo.out' }, "<0.1")
        .from("#away-logo", { y: 75, duration: 2, ease: 'expo.out' }, "<")
        .from("#home-school-name", { y: 75, duration: 2, ease: 'expo.out' }, "<0.1")
        .from("#away-school-name", { y: 75, duration: 2, ease: 'expo.out' }, "<")
        .from("#home-team-name", { y: 75, duration: 2, ease: 'expo.out' }, "<0.1")
        .from("#away-team-name", { y: 75, duration: 2, ease: 'expo.out' }, "<")
        .from("#sponsor-bar", { y: 75, duration: 1.5, ease: 'expo.out' }, "<1")
        .from("#bottom-bar", { y: -75, duration: 1.5, ease: 'expo.out' }, "<")
        .addPause()
        .to("#matchup", { opacity: 0, duration: 0.5, ease: 'expo.out' })
}

function PageRoot() {
    const appState = useAppState();

    return (
        <>
            {appState && <Matchup gfx={appState} />}
        </>
    );
}

function Matchup({ gfx }: { gfx: AppState }) {
    const container = useAnimation(animation);

    return (
        <div ref={container} style={{ fontFamily: 'Zuume Medium' }}>
            <AnimationContainer debug={false}>
                <div id='matchup' className='flex flex-col' style={{ marginTop: 700 }}>
                    <div id='sponsor-area-mask' className='overflow-hidden'>
                        <SponsorBar />
                    </div>
                    <div id='main-area-mask' className='overflow-hidden'>
                        <MainArea gfx={gfx} />
                    </div>
                    <div id='bottom-area-mask' className='overflow-hidden'>
                        <BottomBar />
                    </div>
                </div>
            </AnimationContainer>
        </div>
    );
}

function MainArea({ gfx }: { gfx: AppState }) {
    return (
        <div id="matchup-middle" className='flex'>
            <TeamBox team={gfx.awayTeam} isHome={false} />
            <CAABox />
            <TeamBox team={gfx.homeTeam} isHome={true} />
        </div>
    );
}

function TeamBox({ team, isHome }: { team: Team, isHome: boolean }) {
    const flexDir = useMemo(() => isHome ? 'flex-row-reverse' : 'flex-row', [isHome]);
    const textAlign = useMemo(() => isHome ? 'items-start' : '', [isHome]);
    const idPrefix = useMemo(() => isHome ? 'home' : 'away', [isHome]);

    return (
        <Rect id={`${idPrefix}-box`} width={785} height={189} color={team.info.primaryColor} className={`flex ${flexDir}`}>
            <Rect width={300} height={189} id={`${idPrefix}-logo`}>
                <img src={team.info.knockoutLogoUrl} style={{ marginTop: -50, scale: 1.5 }} />
            </Rect>
            <Rect width={485} height={189} className={`flex flex-col items-end px-5 text-white justify-center ${textAlign}`}>
                <p id={`${idPrefix}-school-name`} className='font-extrabold text-7xl'>{team.info.schoolName.toUpperCase()}</p>
                <p id={`${idPrefix}-team-name`} className='font-black text-8xl'>{team.info.teamName.toUpperCase()}</p>
            </Rect>
        </Rect>
    );
}

function CAABox() {
    return (
        <Rect id="caa-box" width={350} height={189} color='#141515' className='flex justify-center items-center p-5'>
            <img id="caa-logo" src={confLogo} />
        </Rect>
    );
}

function SponsorBar() {
    return (
        <div id='sponsor-bar' className='flex justify-center'>
            <Rect height={72} color='#141414' className='flex gap-5 items-center justify-center p-7'>
                <p className='text-5xl text-white'>DREXEL BASKETBALL PRESENTED BY</p>
                <img className='mb-1' width={400} src={sponsorLogo} />
            </Rect>
        </div>
    );
}

function BottomBar() {
    return (
        <Rect id='bottom-bar' width={1920} height={61} color='#F0F0F0' className='flex justify-center items-center text-5xl'>
            <span>DASKALAKIS ATHLETIC CENTER</span>
            <span className='px-4'>•</span>
            <span>PHILADELPHIA, PA</span>
        </Rect>
    );
}


const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);