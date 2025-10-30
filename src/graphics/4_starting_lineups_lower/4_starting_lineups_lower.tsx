import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import { getPlayerHeadshot, type AppState, type Player, type Sport, type Team, type TeamData } from '@/data/models';
import { useAppState, useTeamData } from '@/data/teams';
import { ZLayers } from '@/util/layers';
import useAnimation from '@/util/use-animation';
import { useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';

const sponsorLogo = "https://images.dragonstv.io/sponsors/Independence.png";
const confLogo = "https://images.dragonstv.io/sponsors/CAAWhite.png";

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#starting-lineups", { y: 150, duration: 0.5, ease: 'circ.out' })
        .from(".player-box", { x: -50, opacity: 0, duration: 0.5, ease: 'circ.out', stagger: 0.1 }, "<0.3")
        .addPause()
        .to("#starting-lineups", { y: 250, duration: 0.5, ease: 'circ.out' })
}

function PageRoot() {
    const appState = useAppState();
    const isHome = true;

    return (
        <>
            {appState && <Matchup gfx={appState} isHome={isHome} />}
        </>
    );
}

function Matchup({ gfx, isHome }: { gfx: AppState, isHome: boolean }) {

    const team = isHome ? gfx.homeTeam : gfx.awayTeam;
    const teamData = useTeamData(isHome);

    return (
        <>
            {teamData && <MainArea team={team} teamData={teamData} />}
        </>
    );
}

function MainArea({ team, teamData }: { team: Team, teamData: TeamData }) {
    const container = useAnimation(animation);

    return (
        <div ref={container} style={{ fontFamily: 'Zuume Medium' }}>
            <AnimationContainer debug={false}>
                <div id="starting-lineups-mask" className='overflow-hidden'>
                    <div id='starting-lineups' className='flex flex-col' style={{ marginTop: 872 }}>
                        <Rect height={140} width={1920} className='flex' style={{ overflow: 'visible' }}>
                            <TeamBox team={team} />
                            <Rect width={920} height={140} color='#D8D8D8' className='flex anim-group-1' style={{ overflow: 'visible' }}>
                                {teamData.players.length > 0 && <PlayerBox player={teamData.players[0]!} team={team} sport='wbb' />}
                                {teamData.players.length > 1 && <PlayerBox player={teamData.players[1]!} team={team} sport='wbb' />}
                                {teamData.players.length > 2 && <PlayerBox player={teamData.players[2]!} team={team} sport='wbb' />}
                                {teamData.players.length > 3 && <PlayerBox player={teamData.players[3]!} team={team} sport='wbb' />}
                                {teamData.players.length > 4 && <PlayerBox player={teamData.players[4]!} team={team} sport='wbb' />}
                            </Rect>
                            <SponsorBar />
                        </Rect>
                    </div>
                </div>
            </AnimationContainer>
        </div>
    );
}

function PlayerBox({ player, team, sport }: { player: Player, team: Team, sport: Sport }) {
    const headshotUrl = useMemo(() => getPlayerHeadshot(team.info.id, sport, player.jerseyNumber), [player])

    return (
        <Rect className='flex flex-col-reverse text-white player-box' width={184} style={{ overflow: 'visible' }}>
            <ZLayers align='end'>
                <PlayerHeadshot headshotUrl={headshotUrl} />
                <Rect width={184} height={40} color={team.info.primaryColor} className='flex items-center ps-2'>
                    <span className='text-3xl font-bold'>{player.jerseyNumber}</span>
                    <span className='text-3xl ps-2'>{player.lastName}</span>
                </Rect>
            </ZLayers>
        </Rect>
    );
}

function PlayerHeadshot({ headshotUrl }: { headshotUrl: string }) {
    return (
        <Rect width={184} className='flex items-end' style={{ overflow: 'visible' }}>
            <Rect width={184} style={{ overflow: 'visible' }}>
                <img src={headshotUrl} />
            </Rect>
        </Rect>
    );
}

function TeamBox({ team }: { team: Team }) {
    return (
        <Rect height={140} width={500} color={team.info.primaryColor} className='relative anim-group-1'>
            <div className='w-full h-full inline-flex items-center ps-3 z-10'>
                <p className='text-extrabold text-white text-7xl italic z-40'>STARTING FIVE</p>
            </div>
            <div className='w-full h-full absolute bottom-50 left-55'>
                <img src={team.info.knockoutLogoUrl} />
            </div>
        </Rect>
    );
}

function SponsorBar() {
    return (
        <Rect width={511} height={140} color='#131313' className='flex items-center justify-center p-10 anim-group-1'>
            <img src={sponsorLogo} />
        </Rect>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);