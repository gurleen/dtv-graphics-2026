import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import type { TeamStandingsRecord } from '@/types/basketball';
import { useSpxObject, useTeamData } from '@/util/spx';
import useAnimation from '@/util/use-animation';
import { isDefined } from '@/util/utils';
import * as ReactDOM from 'react-dom/client';
import { createContext, useContext } from 'react';
import { getTeamKnockoutLogo, type TeamInfo } from '@/types/team';
import { ZLayers } from '@/util/layers';

const confLogo = "https://images.dragonstv.io/sponsors/CAAWhite.png";
const playingTeams = [2619, 2182];

interface PageContextType {
    teams: TeamInfo[];
    records: TeamStandingsRecord[];
}

const PageContext = createContext<PageContextType | null>(null);

export function usePageContext() {
    const context = useContext(PageContext);
    if (!context) {
        throw new Error('usePageContext must be used within PageContext.Provider');
    }
    return context;
}

function animation(timeline: gsap.core.Timeline) {
    timeline
        .delay(0.5)
        .from("#standings-bg", { x: -700, duration: 0.75, ease: 'expo.out' })
        .from(".team-row", { x: -500, duration: 0.5, ease: 'expo.out', stagger: 0.1 }, "<0.2")
        .from(".caa-logo", { x: -500, duration: 1.5, ease: 'expo.out', stagger: 0.1 }, "<0.5")
        .to(".playing-team", {
            boxShadow: '0 0 20px 4px rgba(255, 255, 255, 0.8), 0 0 40px 8px rgba(255, 255, 255, 0.4)',
            duration: 1.0,
            ease: 'power2.inOut'
        }, "+=0.5")
        .to(".non-playing-team", {
            opacity: 0.6,
            duration: 1.0,
            ease: 'power2.inOut'
        }, "<")
        .addPause()
        .to("#standings-bg", { opacity: 0, duration: 0.5, ease: 'expo.out' });
}

function PageRoot() {
    const teams = useTeamData();
    const { data: records } = useSpxObject<TeamStandingsRecord[]>("basketball", "mbb_records.json");

    if (!isDefined(records) || !isDefined(teams)) { return null; }

    return (
        <PageContext.Provider value={{ teams, records }}>
            <CAAStandings />
        </PageContext.Provider>
    );
}

function CAAStandings() {
    const container = useAnimation(animation);
    const { records } = usePageContext();

    return (
        <div id="container" ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <Rect height={1080} width={500} color="#131313" id="standings-bg">
                    <p className='font-bold text-[93px] text-white ps-[14px]'>STANDINGS</p>

                    <div className='flex flex-col items-center gap-2'>
                        <TableHeader />

                        {records.map(record => (
                            <TeamRow key={record.team_id} teamId={record.team_id} />
                        ))}

                        <CAALogoRow />
                    </div>
                </Rect>
            </AnimationContainer>
        </div>
    );
}

function TeamRow({ teamId }: { teamId: number }) {
    const { teams, records } = usePageContext();
    const team = teams.find(t => t.team_id === teamId);
    const record = records.find(r => r.team_id === teamId);

    if (!team || !record) { return null; }

    const imageUrl = getTeamKnockoutLogo(team);
    const isPlaying = playingTeams.includes(team.team_id);

    return (
        <Rect
            width={479}
            height={54}
            color={team.color}
            className={`rounded-2xl team-row ${isPlaying ? 'playing-team' : 'non-playing-team'}`}
            style={isPlaying ? { boxShadow: '0 0 20px 4px rgba(255, 255, 255, 0), 0 0 40px 8px rgba(255, 255, 255, 0)' } : {}}
        >
            <ZLayers>
                <img src={imageUrl} className='w-[150px] h-auto my-[-50px] opacity-15' />

                <div className='w-full h-full grid grid-cols-12 px-4 pt-2 text-shadow-lg/60' style={{ color: 'white' }}>
                    <p className='text-4xl font-bold col-span-8'>{team.short_name}</p>
                    <div className='center-x-y tabular-nums ibm-plex-mono-bold col-span-2'>
                        <p className='text-center text-xl'>{record.conf_display}</p>
                    </div>
                    <div className='center-x-y tabular-nums ibm-plex-mono-bold col-span-2'>
                        <p className='text-center text-xl'>{record.overall_display}</p>
                    </div>
                </div>
            </ZLayers>
        </Rect>
    );
}

function TableHeader() {
    return (
        <div className='w-[479px] h-[54px] grid grid-cols-12 px-4 pt-2'>
            <p className='text-4xl font-bold col-span-8 text-white'>TEAM</p>
            <div className='center-x-y col-span-2'>
                <p className='text-center font-bold text-3xl text-white'>CONF</p>
            </div>
            <div className='center-x-y col-span-2'>
                <p className='text-center font-bold text-3xl text-white'>OVERALL</p>
            </div>
        </div>
    )
}

const CAALogo = ({ opacity }: { opacity: number }) => (
    <img src="https://images.dragonstv.io/sponsors/CAAWhite.png" className='h-10 w-auto caa-logo' style={{ opacity }} />
);

function CAALogoRow() {
    return (
        <div className='flex items-center justify-end gap-4 mt-4 me-3'>
            <CAALogo opacity={0.2} />
            <CAALogo opacity={0.4} />
            <CAALogo opacity={0.6} />
            <CAALogo opacity={0.8} />
            <CAALogo opacity={1.0} />
        </div>
    );
}


const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);