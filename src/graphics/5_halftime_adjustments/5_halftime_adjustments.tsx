import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import { type AppState, type Team, type TeamData } from '@/data/models';
import { useAppState, useTeamData } from '@/data/teams';
import { ZLayers } from '@/util/layers';
import useAnimation from '@/util/use-animation';
import useProps from '@/util/use-props';
import * as ReactDOM from 'react-dom/client';

const sponsorLogo = "https://images.dragonstv.io/sponsors/Rothman.png";

function animation(timeline: gsap.core.Timeline) {

}

function PageRoot() {
    const appState = useAppState();

    return (
        <>
            {appState && <HalftimeAdjustments gfx={appState} />}
        </>
    );
}

function HalftimeAdjustments({ gfx }: { gfx: AppState }) {
    return (
        <>
            {<MainArea appState={gfx} />}
        </>
    );
}

function MainArea({ appState }: { appState: AppState }) {
    const container = useAnimation(animation);

    return (
        <div ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex justify-center w-full h-full'>
                    <div id="halftime-adjustments-mask" className='overflow-hidden' style={{ marginTop: 550 }}>
                        <TopBar />
                        <ContentArea appState={appState} />
                    </div>
                </div>
            </AnimationContainer>
        </div>
    );
}

function ContentArea({ appState }: { appState: AppState }) {
    return (
        <Rect width={1500} height={300} color={appState.homeTeam.info.primaryColor} className='text-white'>
            <ZLayers>
                <div className='flex justify-between'>
                    <img width={300} className='opacity-15' src={appState.awayTeam.info.fullLogoUrl} />
                    <img width={300} className='opacity-15' src={appState.homeTeam.info.fullLogoUrl} />
                </div>

                <div className='flex w-full h-full justify-between px-26 items-center'>
                    <p className='text-9xl font-black'>99</p>
                    <p className='text-9xl font-black'>99</p>
                </div>

                <div className='flex flex-col w-full h-full items-center justify-center text-6xl'>
                    <div className='flex w-3/5 justify-between'>
                        <span className='font-bold pe-5'>{appState.awayTeam.info.schoolName}</span>
                        <p className='font-light'>ADJUSTMENT FOR AWAY TEAM</p>
                    </div>
                    <div className='flex w-3/5 justify-between'>
                        <span className='font-bold pe-5'>{appState.homeTeam.info.schoolName}</span>
                        <span className='font-light'>ADJUSTMENT FOR HOME TEAM</span>
                    </div>
                </div>
            </ZLayers>
        </Rect>
    );
}

function TopBar() {
    return (
        <Rect width={1500} height={150} color='#131313' className='flex items-center'>
            <Rect width={250} height={150} color='#ffffff' className='p-4'>
                <img className='object-cover' src={sponsorLogo} />
            </Rect>

            <div className='flex flex-col text-white ps-8'>
                <p className='text-7xl font-bold'>HALFTIME ADJUSTMENTS</p>
                <p className='text-5xl font-light'>PRESENTED BY ROTHMAN ORTHOPEDICS</p>
            </div>
        </Rect>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);