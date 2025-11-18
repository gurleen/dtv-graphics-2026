import AnimationContainer from '@/components/animation-container';
import MarkdownText from '@/components/markdown-text';
import { Rect } from '@/components/rect';
import { type AppState, type TeamData } from '@/data/models';
import { useAppState, useTeamData } from '@/data/teams';
import { ZLayers } from '@/util/layers';
import useAnimation from '@/util/use-animation';
import useProps from '@/util/use-props';
import he from 'he';
import { useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';

const sponsorLogo = "https://images.dragonstv.io/sponsors/Belfor.png";

interface Data {
    gfx: AppState
    isHome: boolean
    playerNumber: string
    text: string
    teamData: TeamData
}

interface Props {
    text: string
    playerNumber: string
    isHome: string
}

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#container", { x: -100, opacity: 0, duration: 0.5, ease: 'circ.out' })
        .addPause()
        .to("#container", { opacity: 0, duration: 0.5, ease: 'circ.out' })
}

function getTestProps(): Props {
    return {
        text: '**13** PTS, **4** REB, **2** AST, **2** STL\nIN LOSS TO **SYRACUSE** (11/15)',
        playerNumber: '22',
        isHome: "1"
    }
}

function decodeText(text: string): string {
    return he.decode(text).replaceAll("<br>", "\n");
}

function PageRoot() {
    const appState = useAppState();
    // const props = useProps<Props>();
    const props = getTestProps();

    return (
        <>
            {appState && props && <TeamDataWrapper gfx={appState} props={props} />}
        </>
    );
}

function TeamDataWrapper({ gfx, props }: { gfx: AppState, props: Props}) {
    const teamInfo = useTeamData(props.isHome == "1");

    return (
        <>
            {teamInfo && props && <PlayerToWatch gfx={gfx} isHome={props.isHome == "1"} teamData={teamInfo} playerNumber={props.playerNumber} text={props.text} />}
        </>
    );
}

function PlayerToWatch({ gfx, isHome, teamData, playerNumber, text }: Data) {
    const container = useAnimation(animation);
    const team = useMemo(() => isHome ? gfx.homeTeam : gfx.awayTeam, [gfx, isHome]);
    const player = useMemo(() => teamData.players.find(x => x.jerseyNumber == playerNumber), [teamData, playerNumber, isHome]);

    return (
        <div ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex justify-center w-full h-full' id='container' style={{ marginTop: 850 }}>
                    <Rect width={500} height={145} color={team.info.primaryColor} className='flex'>
                        <ZLayers>
                            <img src={team.info.knockoutLogoUrl} width={350} height={350} style={{ marginLeft: 275, marginTop: -100 }} />

                            <Rect height={145} className='flex flex-col leading-10 text-white font-bold items-start justify-center ms-3'>
                                <p className='text-5xl'>{player?.firstName}</p>
                                <p className='text-7xl'>{player?.lastName}</p>
                            </Rect>
                        </ZLayers>
                    </Rect>

                    <Rect width={920} height={145} color='#D8D8D8' className='flex items-center justify-center text-center p-8'>
                        <p className='text-6xl whitespace-pre-wrap'>
                            <MarkdownText text={decodeText(text)} />
                        </p>
                    </Rect>

                    <Rect width={500} height={145} color='#D8D8D8'>
                        <img src={sponsorLogo} />
                    </Rect>
                </div>
            </AnimationContainer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);