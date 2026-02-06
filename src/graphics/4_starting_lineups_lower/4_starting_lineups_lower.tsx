import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import { getPlayerHeadshot, Sport, type AppState, type Player, type Team, type TeamData } from '@/data/models';
import { useAppState, useTeamData } from '@/data/teams';
import { ZLayers } from '@/util/layers';
import useAnimation from '@/util/use-animation';
import useProps from '@/util/use-props';
import { useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';
import type { StartingLineupsLowerProps } from './props';

const sponsorLogo = "https://images.dragonstv.io/sponsors/Independence.png";

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#starting-lineups", { y: 150, duration: 0.5, ease: 'circ.out' })
        .from(".player-box", { x: -50, opacity: 0, duration: 0.5, ease: 'circ.out', stagger: 0.1 }, "<0.3")
        .addPause()
        .to("#starting-lineups", { y: 250, duration: 0.5, ease: 'circ.out' })
}

function GetTestProps(): StartingLineupsLowerProps {
    return {
    isHome: '0',
    starter1: 0,
    starter2: 1,
    starter3: 2,
    starter4: 3,
    starter5: 4
}
}

function PageRoot() {
    const props = useProps<StartingLineupsLowerProps>();
    // const props = GetTestProps();
    const appState = useAppState();

    return (
        <>
            {appState && props && <StartingLineupsLower gfx={appState} props={props} />}
        </>
    );
}

function StartingLineupsLower({ gfx, props }: { gfx: AppState, props: StartingLineupsLowerProps }) {
    const isHome = props.isHome == "1";
    const team = isHome ? gfx.homeTeam : gfx.awayTeam;
    const teamData = useTeamData(isHome);

    return (
        <>
            {teamData && <MainArea team={team} teamData={teamData} props={props} />}
        </>
    );
}

function getPlayer(teamData: TeamData, shirtNum: number): Player | undefined {
    return teamData.players.find(x => x.jerseyNumber == shirtNum.toString())
}

function MainArea({ team, teamData, props }: { team: Team, teamData: TeamData, props: StartingLineupsLowerProps }) {
    const container = useAnimation(animation);
    const player1 = useMemo(() => getPlayer(teamData, props.starter1), [teamData, props]);
    const player2 = useMemo(() => getPlayer(teamData, props.starter2), [teamData, props]);
    const player3 = useMemo(() => getPlayer(teamData, props.starter3), [teamData, props]);
    const player4 = useMemo(() => getPlayer(teamData, props.starter4), [teamData, props]);
    const player5 = useMemo(() => getPlayer(teamData, props.starter5), [teamData, props]);

    return (
        <div ref={container} style={{ fontFamily: 'Zuume Medium' }}>
            <AnimationContainer debug={false}>
                <div id="starting-lineups-mask" className='overflow-hidden'>
                    <div id='starting-lineups' className='flex flex-col' style={{ marginTop: 875 }}>
                        <Rect height={140} width={1920} className='flex' style={{ overflow: 'visible' }}>
                            <TeamBox team={team} />
                            <Rect width={920} height={140} color='#D8D8D8' className='flex anim-group-1' style={{ overflow: 'visible' }}>
                                {player1 && <PlayerBox player={player1} team={team} sport={Sport.WomensBasketball} />}
                                {player2 && <PlayerBox player={player2} team={team} sport={Sport.WomensBasketball} />}
                                {player3 && <PlayerBox player={player3} team={team} sport={Sport.WomensBasketball} />}
                                {player4 && <PlayerBox player={player4} team={team} sport={Sport.WomensBasketball} />}
                                {player5 && <PlayerBox player={player5} team={team} sport={Sport.WomensBasketball} />}
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
                <img src={team.info.knockoutLogoUrl + `?t=${Date.now()}`} />
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