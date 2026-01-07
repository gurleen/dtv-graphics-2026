import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import type { AppState, Team } from '@/data/models';
import { useAppState } from '@/data/teams';
import useAnimation from '@/util/use-animation';
import useProps from '@/util/use-props';
import * as ReactDOM from 'react-dom/client';

const confLogo = "https://images.dragonstv.io/sponsors/CAAWhite.png";

function animation(timeline: gsap.core.Timeline) {
    timeline
    .from("#container", { y: 100, opacity: 0, duration: 0.3, ease: "circ.out" })
    .addPause()
    .to("#container", { opacity: 0, duration: 0.3, ease: "circ.out" })
}

function PageRoot() {
    const appState = useAppState();

    return (
        <>
            {appState && <TalentLowerThirdSingle state={appState} />}
        </>
    );
}

function TalentLowerThirdSingle({ state }: { state: AppState }) {
    const container = useAnimation(animation);

    return (
        <div id="container" ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex justify-center w-full h-full' id='container' style={{ marginTop: 850 }}>
                    <div className='flex flex-col'>
                        <div className='flex items-center'>
                            <TeamBox team={state.awayTeam} isRight={false} />
                            <Rect width={300} height={104} color='#000' className='flex justify-center items-center p-10'>
                                <img src={confLogo} />
                            </Rect>
                            <TeamBox team={state.homeTeam} isRight={true} />
                        </div>
                        <Rect width={1330} height={40} color='#000' className='text-white flex items-center justify-between px-3 text-3xl'>
                            <p>DASKALAKIS ATHLETIC CENTER</p>
                            <p>COMING UP NEXT...</p>
                        </Rect>
                    </div>
                </div>
            </AnimationContainer>
        </div>
    );
}

function TeamBox({ team, isRight }: { team: Team, isRight: boolean }) {
    const flexDir = isRight ? "row-reverse" : "row";
    return (
        <Rect width={515} height={104} color={team.info.primaryColor} className='flex items-center justify-between px-3' style={{ flexDirection: flexDir }}>
            <Rect width={319}>
                <img src={team.info.knockoutLogoUrl + `?t=${Date.now()}`} />
            </Rect>
            <div className='flex flex-col me-2 text-white'>
                <p className='text-6xl font-bold'>{team.info.schoolName}</p>
            </div>
        </Rect>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);