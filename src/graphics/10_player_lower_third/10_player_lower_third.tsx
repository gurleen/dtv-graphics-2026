import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import type { AppState, Linescore, Player, PlayerStats, Team } from '@/data/models';
import { useAppState, usePlayerLinescore, useTeamData } from '@/data/teams';
import useAnimation from '@/util/use-animation';
import useProps from '@/util/use-props';
import { Color } from 'color-core';
import { match } from 'ts-pattern';
import { createContext, useContext, useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';
import Markdown from 'react-markdown';
import MarkdownText from '@/components/markdown-text';

type StatsOptions = "NONE" | "PTS" | "REB" | "AST" | "STL" | "BLK" | "FG" | "FG%" | "3FG" | "3FG%" | "FT" | "FT%"

interface Props {
    isHome: string
    playerNumber: string
    lthType: "text" | "stats"
    text: string
    stat1: StatsOptions
    stat2: StatsOptions
    stat3: StatsOptions
    stat4: StatsOptions
    stat5: StatsOptions
}

interface Data {
    props: Props
    team: Team
    player: Player
    isHome: boolean
}

const DataContext = createContext<Data | undefined>(undefined);

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#container", { x: -100, opacity: 0, duration: 0.3, ease: "power3.out" })
        .from("#logo", { x: -100, opacity: 0, duration: 0.3, ease: "circ.out" }, "<0.1")
        .from("#number-box", { x: -100, opacity: 0, duration: 0.2, ease: "power3.out" }, "<0.1")
        .from("#first-name", { x: -100, opacity: 0, duration: 0.2, ease: "power3.out" }, "<0.1")
        .from("#last-name", { x: -100, opacity: 0, duration: 0.2, ease: "power3.out" }, "<0.1")
        .from("#exp-pos", { x: -100, opacity: 0, duration: 0.2, ease: "power3.out" }, "<0.1")
        .from("#subtext", { y: 100, duration: 0.4, ease: "power3.inOut" }, "<")
        .addPause()
        .to("#container", { opacity: 0, duration: 0.3, ease: "circ.out" })
}

function getTestProps(): Props {
    return {
        isHome: "1",
        playerNumber: "3",
        lthType: "text",
        text: "CAA AND BIG 5 PLAYER OF THE WEEK",
        stat1: "PTS",
        stat2: "REB",
        stat3: "AST",
        stat4: "FG",
        stat5: "3FG"
    }
}

function PageRoot() {
    const props = useProps<Props>();
    // const props = getTestProps();
    const isHome = props?.isHome == "1";
    const appState = useAppState();
    const team = isHome ? appState?.homeTeam : appState?.awayTeam;
    const teamData = useTeamData(isHome ?? true);
    const player = teamData?.players.find(x => x.jerseyNumber == props?.playerNumber);

    if (props && team && teamData && player) {
        const data: Data = {
            props: props,
            team: team,
            player: player,
            isHome: isHome
        };
        return (
            <DataContext value={data}>
                <PlayerLowerThird />
            </DataContext>
        );
    }

    return (<></>);
}

function PlayerLowerThird() {
    const data = useContext(DataContext);
    if (!data) return (<></>);

    const container = useAnimation(animation);
    const homeColor = useMemo(() => new Color(data.team.info.primaryColor), [data]);
    const homeColorDarker = useMemo(() => homeColor.adjustLightness(-4), [homeColor]);

    return (
        <div id="container" ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex justify-center w-full h-full' id='container' style={{ marginTop: 850 }}>
                    <Rect width={850} height={125} color={data.team.info.primaryColor} className='rounded-3xl flex'>
                        <Rect width={225} height={125} color={homeColorDarker.toHex()}>
                            <img id="logo" className='scale-150 mt-[-40px]' src={data.team.info.knockoutLogoUrl} />
                        </Rect>
                        <Rect width={625} height={125}>
                            <ContentArea homeColorDarker={homeColorDarker} />
                        </Rect>
                    </Rect>
                </div>
            </AnimationContainer>
        </div>
    );
}

function ContentArea({homeColorDarker}: {homeColorDarker: Color}) {
    const data = useContext(DataContext);
    if (!data) return (<></>);

    const experience = useMemo(() => fullExperience(data.player.experience), [data]);
    const position = useMemo(() => fullPosition(data.player.position), [data]);

    return (
        <div className='flex flex-col gap-2'>
            <div className='flex text-white justify-between items-center pt-4 px-4'>
                <div className='flex items-center gap-2'>
                    <div id="number-box" className='bg-white text-3xl flex justify-center items-center border-2 rounded-lg py-1 px-2 leading-none'>
                        <p className='text-black'>{data.player.jerseyNumber}</p>
                    </div>
                    <p id="first-name" className='text-5xl mt-0.5'>{data.player.firstName}</p>
                    <p id="last-name" className='text-5xl font-bold mt-0.5'>{data.player.lastName}</p>
                </div>

                <div id="exp-pos" className='flex text-3xl gap-2'>
                    <p>{experience}</p>
                    <p className='font-bold'>{position}</p>
                </div>
            </div>

            <Rect color={homeColorDarker.toHex()} className='flex pb-4 px-4 pt-2 overflow-hidden'>
                {data.props.lthType == "text" ? <TextBox /> : <StatBox />}
            </Rect>
        </div>
    );
}

function TextBox() {
    const data = useContext(DataContext);
    if (!data) return (<></>);

    return (
        <div id="subtext" className='text-4xl text-white font-light'>
            <MarkdownText text={data.props.text} />
        </div>
    );
}

function StatBox() {
    const data = useContext(DataContext);
    const line = data ? usePlayerLinescore(data.isHome, data.props.playerNumber) : undefined;
    if (!data || !line) return (<></>);

    return (
        <div id="subtext" className='text-4xl text-white font-light flex gap-8'>
            <StatLine stat={data.props.stat1} line={line} />
            <StatLine stat={data.props.stat2} line={line} />
            <StatLine stat={data.props.stat3} line={line} />
            <StatLine stat={data.props.stat4} line={line} />
            <StatLine stat={data.props.stat5} line={line} />
        </div>
    );
}

function StatLine({stat, line}: {stat: StatsOptions, line: PlayerStats}) {
    if(stat == "NONE") return (<></>);

    const statValue = useMemo(() => getStatFromLine(line, stat), [line, stat]);

    return (
        <div className='flex gap-1.5'>
            <p>{statValue}</p>
            <p className='font-bold'>{stat}</p>
        </div>
    );
}

function fullExperience(exp: string) {
    if (exp == "FR") return "FRESHMAN";
    if (exp == "SO") return "SOPHOMORE";
    if (exp == "JR") return "JUNIOR";
    if (exp == "SR") return "SENIOR";
    return exp;
}

function fullPosition(position: string) {
    if (position == "G") return "GUARD";
    if (position == "F") return "FORWARD";
    return position;
}

const totalPoints = (x: PlayerStats) => (3 * x.totals.threePointers.made) + (2 * x.totals.fieldGoals.made)
    + x.totals.freeThrows.made;

function getStatFromLine(line: PlayerStats, stat: StatsOptions) {
    return match(stat)
        .with("NONE", _ => "")
        .with("PTS", _ => totalPoints(line))
        .with("REB", _ => line.totals.rebounds.total)
        .with("AST", _ => line.totals.assists)
        .with("STL", _ => line.totals.steals)
        .with("BLK", _ => line.totals.blocks)
        .with("FG", _ => `${line.totals.fieldGoals.made}-${line.totals.fieldGoals.attempted}`)
        .with("FG%", _ => line.totals.fieldGoals.percentageDisplay)
        .with("3FG", _ => `${line.totals.threePointers.made}-${line.totals.threePointers.attempted}`)
        .with("3FG%", _ => line.totals.threePointers.percentageDisplay)
        .with("FT", _ => `${line.totals.freeThrows.made}-${line.totals.freeThrows.attempted}`)
        .with("FT%", _ => line.totals.freeThrows.percentageDisplay)
        .exhaustive()
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);