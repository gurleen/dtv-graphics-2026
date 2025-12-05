import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import type { WrestlerYear } from '@/controls/wrestling/types';
import type { Wrestler, AppState, Team } from '@/data/models';
import { useAppState } from '@/data/teams';
import { ZLayers } from '@/util/layers';
import useAnimation from '@/util/use-animation';
import { createContext, useContext } from 'react';
import * as ReactDOM from 'react-dom/client';
import useSWR from 'swr';

const sponsorLogo = "https://images.dragonstv.io/sponsors/Independence.png";

const fetcher = (path: string) => fetch(new URL(path, "https://gfx.dragonstv.io")).then(res => res.json());

interface Probables {
    home: Wrestler[]
    away: Wrestler[]
}

function useTeamProbables(team: 'home' | 'away') {
    const { data, error } = useSWR<Wrestler[]>(`json/wrestling/${team}-prob.json`, fetcher);
    return data;
}

function useProbables(): Probables | undefined {
    const home = useTeamProbables('home');
    const away = useTeamProbables('away');
    if(home && away) {
        return {
            home: home,
            away: away
        };
    }
}

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#container", { y: 100, opacity: 0, duration: 0.3, ease: "circ.out" })
        .addPause()
        .to("#container", { opacity: 0, duration: 0.3, ease: "circ.out" })
}

interface Data {
    app: AppState
    probables: Probables
}

const DataContext = createContext<Data | undefined>(undefined);

function PageRoot() {
    const appState = useAppState();
    const probables = useProbables();

    return (
        <>
            {appState && probables && <DataContext value={{ app: appState, probables: probables }}>
                    <WrestlingProbables />
                </DataContext>}
        </>
    );
}

function WrestlingProbables() {
    const container = useAnimation(animation);
    const data = useContext(DataContext);

    if(!data) { return (<div></div>); }

    return (
        <div id="container" ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex justify-center w-full h-full text-white' id='container' style={{ marginTop: 50 }}>
                    <div className='flex flex-col items-center'>
                        <Rect width={1215} height={127} color='#D8D8D8' className='flex items-center justify-between px-6'>
                            <p className='font-bold text-[86px] text-black'>PROBABLE STARTERS</p>
                            <img width={352} src={sponsorLogo} />
                        </Rect>
                        
                        <div className='flex'>
                            <TeamBox team={data.app.awayTeam} isHome={false} />
                            <TeamBox team={data.app.homeTeam} isHome={true} />
                        </div>

                        <ProbablesTable />
                    </div>
                </div>
            </AnimationContainer>
        </div>
    );
}

function ProbablesTable() {
    const data = useContext(DataContext);
    if(!data) { return (<div></div>); }

    const home = data.probables.home;
    const away = data.probables.away;

    return (
        <Rect width={1215} height={735} color='#131313' className='px-5 py-2 flex flex-col gap-0 leading-18'>
            <ProbablesRow weight={125} home={home[0]!} away={away[0]!} />
            <ProbablesRow weight={133} home={home[1]!} away={away[1]!} />
            <ProbablesRow weight={141} home={home[2]!} away={away[2]!} />
            <ProbablesRow weight={149} home={home[3]!} away={away[3]!} />
            <ProbablesRow weight={157} home={home[4]!} away={away[4]!} />
            <ProbablesRow weight={165} home={home[5]!} away={away[5]!} />
            <ProbablesRow weight={174} home={home[6]!} away={away[6]!} />
            <ProbablesRow weight={184} home={home[7]!} away={away[7]!} />
            <ProbablesRow weight={197} home={home[8]!} away={away[8]!} />
            <ProbablesRow weight={285} home={home[9]!} away={away[9]!} />
        </Rect>
    );
}

function getYearCode(year: number) {
    switch(year) {
        case 1: return 'FR';
        case 2: return 'SO';
        case 3: return 'JR';
        case 4: return 'SR';
        case 5: return 'GR';
    }
}

function ProbablesRow({away, home, weight}: {away: Wrestler, home: Wrestler, weight: number}) {
    return (
        <div className='grid grid-cols-3 w-full text-[52px]'>
            <div className='flex'>
                <p>{away.firstName} <span className='font-bold'>{away.lastName}</span></p>
            </div>
            <div className='center-x-y font-bold'>
                <Rect width={200} height={50} color='#D8D8D8' className='grid grid-cols-2 text-black px-8 tabular-nums leading-14'>
                    <p className='text-center'>{weight}</p>
                    <p className='text-center'>LBS</p>
                </Rect>
            </div>
            <div className='text-right'>
                <p>{home.firstName} <span className='font-bold'>{home.lastName}</span></p>
            </div>
        </div>
    );
}

function TeamBox({team, isHome}: {team: Team, isHome: boolean}) {
    const xMarginAmount = 200;
    const xMargin = isHome ? { marginLeft: xMarginAmount } : { marginLeft: -xMarginAmount };
    const rowDir = isHome ? 'flex-row-reverse' : ''

    return (
        <Rect width={608} height={95} color={team.info.primaryColor}>
            <ZLayers>
                <div>
                    <img style={{ marginTop: -250, ...xMargin, scale: 0.75, opacity: 0.1 }} src={team.info.knockoutLogoUrl} />
                </div>

                <div className={`px-5 py-5 flex items-center ${rowDir}`}>
                    <p className='text-6xl font-bold'>{team.info.schoolName}</p>
                </div>
            </ZLayers>
        </Rect>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);