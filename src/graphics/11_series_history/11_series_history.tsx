import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import type { AppState, Team } from '@/data/models';
import { useAppState } from '@/data/teams';
import { ZLayers } from '@/util/layers';
import useAnimation from '@/util/use-animation';
import useProps from '@/util/use-props';
import { Color } from 'color-core';
import { createContext, useContext, useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';
import he from 'he';


interface Props {
    totalGames: string
    firstYearPlayed: string
    homeWins: string
    awayWins: string
    homeDacWins: string
    awayDacWins: string
    homeLast5: string
    awayLast5: string
    homeStreak: string
    lastGameResult: "W" | "L"
    lastGameHomeScore: string
    lastGameAwayScore: string
    lastGameDate: string
    lastGameWasAtHome: "0" | "1"
    note: string
}

interface Data {
    props: Props
    appState: AppState
}

const DataContext = createContext<Data | undefined>(undefined);

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#container", { x: -600, duration: 0.3, ease: "power3.out" })
        .from(".team-text-box", { y: -500, duration: 0.3, ease: "power3.out" }, "<0.2")
        .from("#stat-box", { y: -500, duration: 0.3, ease: "power3.out" }, "<")
        .from("#note-box", { y: 500, duration: 0.3, ease: "power3.out" }, "<0.2")
        .addPause()
        .to("#container", { opacity: 0, duration: 0.3, ease: "circ.out" })
}

function getTestProps(): Props {
    return {
        totalGames: '14',
        firstYearPlayed: '1972',
        homeWins: '7',
        awayWins: '7',
        homeDacWins: '9',
        awayDacWins: '2',
        homeLast5: '5',
        awayLast5: '5',
        homeStreak: 'L3',
        lastGameResult: 'L',
        lastGameHomeScore: '49',
        lastGameAwayScore: '53',
        lastGameDate: 'DEC 20, 2019',
        lastGameWasAtHome: '1',
        note: 'THIS IS COACH MALLON\'S FIRST GAME AGAINST THE QUAKERS AS HEAD COACH'
    }
}

function PageRoot() {
    const props = useProps<Props>();
    // const props = getTestProps();
    const appState = useAppState();

    if (props && appState) {
        const data = { props: props, appState: appState }
        return (
            <DataContext value={data}>
                <SeriesHistory />
            </DataContext>
        );
    }
}

function SeriesHistory() {
    const container = useAnimation(animation);
    const data = useContext(DataContext);
    if (!data) return (<></>);

    const props = data.props;
    const lastGameClass = props.lastGameResult == "W" ? "text-green-900" : "text-red-900";
    console.log(props.note);

    return (
        <div id="container" ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex justify-start w-full h-full' id='container' style={{ marginTop: 0 }}>
                    <Rect width={500} height={1080} color='rgba(0, 0, 0, 0.95)'>
                        <Rect width={500} height={200} className='flex'>
                            <ZLayers>
                                <div className='flex'>
                                    <TeamLogoBox team={data.appState.awayTeam} />
                                    <TeamLogoBox team={data.appState.homeTeam} />
                                </div>

                                <div className='flex items-center justify-center w-full h-full'>
                                    <p className='text-8xl text-white font-bold italic'>SERIES HISTORY</p>
                                </div>
                            </ZLayers>
                        </Rect>

                        <ZLayers>
                            <div className='flex overflow-hidden'>
                                <TeamTextBox team={data.appState.awayTeam} />
                                <TeamTextBox team={data.appState.homeTeam} />
                            </div>

                            <div className='w-full h-full flex flex-col items-center py-5 text-white text-6xl gap-2'>
                                <div className='overflow-hidden'>
                                    <div id="stat-box" className='flex flex-col gap-2'>
                                        <div className='flex justify-center text-5xl gap-2 font-extralight'>
                                            <p className='font-bold'>{props.totalGames}</p>
                                            <p>GAMES PLAYED SINCE</p>
                                            <p className='font-bold'>{props.firstYearPlayed}</p>
                                        </div>

                                        <Divider />

                                        <ComparisonRow name='WINS' awayVal={props.awayWins} homeVal={props.homeWins} />
                                        <Divider />
                                        <ComparisonRow name={`AT THE\nDAC`} awayVal={props.awayDacWins} homeVal={props.homeDacWins} />
                                        <Divider />
                                        <ComparisonRow name='LAST 5' awayVal={props.awayLast5} homeVal={props.homeLast5} />
                                    </div>
                                </div>

                                <div className='overflow-hidden'>
                                    <div id="note-box" className='flex flex-col gap-2'>
                                        <div className='flex w-full justify-between px-5 pt-5'>
                                            <p className='font-extralight'>CURRENT STREAK</p>
                                            <p className='font-bold'>L3</p>
                                        </div>

                                        <div className='flex w-full justify-between px-5 pb-5'>
                                            <p className='font-extralight'>LAST GAME</p>
                                            <div className={`flex gap-6 font-bold ${lastGameClass}`}>
                                                <p>{props.lastGameResult}</p>
                                                <p>{props.lastGameHomeScore}-{props.lastGameAwayScore}</p>
                                            </div>
                                        </div>

                                        <Divider />

                                        <div className='flex text-justify w-full items-center justify-center px-5 pt-5'>
                                            <p className='font-light'>{he.decode(props.note)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ZLayers>
                    </Rect>
                </div>
            </AnimationContainer>
        </div>
    );
}

function ComparisonRow({ name, awayVal, homeVal }: { name: string, awayVal: string, homeVal: string }) {
    return (
        <div className='flex justify-evenly items-center w-full text-8xl'>
            <p className='font-bold'>{awayVal}</p>
            <Rect color='#131313' className='flex items-center justify-center py-2 px-5'>
                <p className='text-center whitespace-pre-wrap text-6xl'>{name}</p>
            </Rect>
            <p className='font-bold'>{homeVal}</p>
        </div>
    );
}

function Divider() {
    return (
        <Rect width={500} height={1} className='rounded-2xl opacity-75' color='#fff' />
    );
}

function TeamTextBox({ team }: { team: Team }) {
    const teamColor = useMemo(() => new Color(team.info.primaryColor), [team]);
    const teamColorDarker = useMemo(() => teamColor.adjustLightness(-4), [teamColor]);

    return (
        <Rect className='team-text-box' width={250} height={450} color={teamColorDarker.toHex()} />
    );
}

function TeamLogoBox({ team }: { team: Team }) {
    return (
        <Rect width={250} height={200} color={team.info.primaryColor} className='flex justify-center'>
            <img className='scale-250 opacity-10' src={team.info.knockoutLogoUrl} />
        </Rect>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);