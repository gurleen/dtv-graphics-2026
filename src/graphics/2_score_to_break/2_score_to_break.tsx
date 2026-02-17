import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import { GlobalSettingsProvider, useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import type { GameState } from '@/data/models';
import { useBasketballLiveData } from '@/hooks/use-basketball-bug-state';
import type { BasketballLiveData } from '@/types/basketball';
import { getTeamKnockoutLogo, type TeamInfo } from '@/types/team';
import { createContextFrom } from '@/util/context-factory';
import useAnimation from '@/util/use-animation';
import { useGameState } from '@/util/use-live-stats-manager';
import useProps from '@/util/use-props';
import { useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';

const sponsorLogo = "https://images.dragonstv.io/sponsors/Independence.png";

interface Props {
    period: string
}

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#score-to-break", { x: -100, opacity: 0, duration: 1, ease: "power3.out" })
        .from("#home-score", { x: 100, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.7")
        .from("#away-score", { x: -100, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.8")
        .addPause()
        .to("#score-to-break", { opacity: 0 })
}

function getPageData() {
    // const props = useProps<Props>();
    const props = { period: "End of 3rd Quarter" } as Props; // Mocked props for testing
    const gameState = useGameState();
    const { liveData } = useBasketballLiveData();

    if (!props || !liveData || !gameState) { 
        return null; 
    }
    
    return { props, liveData, gameState };
}

const { Provider: PageDataProvider, useCustomContext: usePageDataContext } = createContextFrom(getPageData);

function PageRoot() {
    return (
        <GlobalSettingsProvider>
            <PageDataProvider>
                <ScoreToBreak />
            </PageDataProvider>
        </GlobalSettingsProvider>
    );
}

function ScoreToBreak() {
    const container = useAnimation(animation);
    const { homeTeam, awayTeam } = useGlobalSettings();
    const { props, gameState } = usePageDataContext()!;

    return (
        <div ref={container} style={{ fontFamily: 'Inter' }}>
            <AnimationContainer debug={false}>
                <div id="score-to-break" className='flex flex-col' style={{ paddingTop: 650, paddingLeft: 75 }}>
                    <Rect width={437} height={373} color="#131313">
                        <div className='flex'>
                            <TeamBox team={awayTeam}  />
                            <ScoreBox score={gameState.awayTeam.score} isHome={false} />
                        </div>
                        <div className='flex'>
                            <TeamBox team={homeTeam} />
                            <ScoreBox score={gameState.homeTeam.score} isHome={true} />
                        </div>
                        <BottomBar periodText={props.period} />
                    </Rect>
                </div>
            </AnimationContainer>
        </div>
    );
}

function TeamBox({team}: {team: TeamInfo }) {
    const logoUrl = getTeamKnockoutLogo(team);

    return (
        <Rect width={183} height={168} color={team.color}>
            <div>
                <img style={{maxWidth: 400, marginLeft: -110, marginTop: -110}} src={logoUrl} />
            </div>
        </Rect>
    );
}

function ScoreBox({score, isHome}: { score: number, isHome: boolean }) {
    const textId = useMemo(() => isHome ? 'home-score' : 'away-score', []);
    return (
        <Rect width={254} height={168} className='flex text-center items-center justify-center'>
            <p id={textId} className='text-white text-7xl font-black italic'>{score}</p>
        </Rect>
    );
}

function BottomBar({periodText}: {periodText: string}) {
    return (
        <Rect width={437} height={37} color='#D3D1D1' className='flex items-center px-2 justify-between'>
            <Rect width={150} height={37} className='flex items-center'>
                <img src={sponsorLogo} className='object-fit' />
            </Rect>
            <p className='font-extrabold'>{periodText.toUpperCase()}</p>
        </Rect>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);