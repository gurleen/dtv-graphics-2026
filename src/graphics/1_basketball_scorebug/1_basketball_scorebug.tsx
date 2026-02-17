import AnimationContainer from "@/components/animation-container";
import { Rect, type Gradient } from "@/components/rect";
import useAnimation, { useSubAnimation } from "@/util/use-animation";
import NumberFlow from "@number-flow/react";
import { useMemo, useRef } from "react";
import * as ReactDOM from 'react-dom/client';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import FadeContainer from "@/components/fade-container";
import { type BasketballScorebugData, type GameInfo, type TeamInfo } from "./props";
import { Color } from "color-core";
import { FadeText } from "@/components/fade-text";
import { ZLayers } from "@/util/layers";
import { GlobalSettingsProvider, useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { BasketballBugStateProvider, useBasketballBugStateContext } from "@/contexts/BasketballBugStateContext";
import { ObjectStoreProvider, useObjectStoreContext } from "@/contexts/ObjectStoreContext";
import { getStatDisplayString, getTeamTotal, getTimerOptionDisplayString, getTimeSinceLastScore, type PlayerInfo, type GameLiveStats, type LastScores, type StatOptions, type StatDisplay, getPlayerStat, getPlayerSeasonStat, type StatsSource, type TextSliderState } from "@/types/basketball";
import { isDefined } from "@/util/utils";
import { getTeamKnockoutLogo } from "@/types/team";
import { useBasketballLiveData, useTextSliderState } from "@/hooks/use-basketball-bug-state";
import { useBasketballPlayers } from "@/hooks/misc";
import { useGameState } from "@/util/use-live-stats-manager";


const sponsorLogo = "https://images.dragonstv.io/sponsors/Independence.png";

const flexReverseForHome = (isHome: boolean) => isHome ? "flex-row-reverse" : "";

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#main-bar", { opacity: 0, duration: 0.5, ease: "power3.inOut" })
        .from("#sub-bar", { opacity: 0, y: -30, duration: 0.3, ease: "power3.inOut" }, "-=0.3")
        .addPause()
        .to(".anim-container", { opacity: 0, duration: 0.5, ease: "power3.inOut" });
}

interface Props {
    infoBoxCovered: string
    infoBoxText: string
}

function getTeams(): BasketballScorebugData | undefined {
    const settings = useGlobalSettings();
    const gameState = useGameState();
    const { liveData: basketballLiveData } = useBasketballLiveData();
    // const props = useProps<Props>();
    const props = { infoBoxCovered: "0", infoBoxText: 'FINAL' }

    if (!props || !settings || !basketballLiveData || !gameState) return undefined;

    return {
        homeTeam: {
            abbreviation: settings.homeTeam.abbreviation,
            color: settings.homeTeam.color,
            score: gameState.homeTeam.score,
            logoUrl: getTeamKnockoutLogo(settings.homeTeam)
        },
        awayTeam: {
            abbreviation: settings.awayTeam.abbreviation,
            color: settings.awayTeam.color,
            score: gameState.awayTeam.score,
            logoUrl: getTeamKnockoutLogo(settings.awayTeam)
        },
        info: {
            clock: gameState.clockDisplay,
            period: gameState.periodDisplay,
            shotClock: gameState.shotClock
        },
        infoBoxCovered: props.infoBoxCovered == "1",
        infoBoxText: props.infoBoxText
    }
}

function PageRoot() {
    return (
        <GlobalSettingsProvider>
            <ObjectStoreProvider>
                <BasketballBugStateProvider>
                    <PropsFetcher />
                </BasketballBugStateProvider>
            </ObjectStoreProvider>
        </GlobalSettingsProvider>
    );
}

function PropsFetcher() {
    const props = getTeams();

    return (
        <>
            {props && <BasketballScorebug props={props} />}
        </>
    );
}

function BasketballScorebug({ props }: { props: BasketballScorebugData }) {
    const container = useAnimation(animation);
    const {sliderState} = useTextSliderState();

    return (
        <>
            {props && <div ref={container} style={{ fontFamily: 'Zuume' }}>
                <AnimationContainer debug={true}>
                    <div className="flex w-full h-full justify-around" style={{ marginTop: 900 }}>
                        <div id="scorebug flex flex-col items-center" style={{ marginTop: -45 }}>
                            <ZLayers>
                                {sliderState && <TextSlider sliderState={sliderState} />}
                                <ComparisonSlider props={props} />
                                <ScoringDroughtSlider isHome={false} props={props} />
                                <ScoringDroughtSlider isHome={true} props={props} />
                                <PlayerSlider isHome={false} props={props} />
                                <PlayerSlider isHome={true} props={props} />
                            </ZLayers>
                            <div id="main-bar" className="flex z-10 relative">
                                <TeamBox isHome={false} teamInfo={props.awayTeam} />
                                <ZLayers>
                                    <InfoBox gameInfo={props.info} />
                                    <InfoBoxCover showing={props.infoBoxCovered} text={props.infoBoxText} />
                                </ZLayers>
                                <TeamBox isHome={true} teamInfo={props.homeTeam} />
                            </div>
                            <SubBar props={props} />
                        </div>
                    </div>
                </AnimationContainer>
            </div>}
        </>
    );
}

function playerSliderAnimation(timeline: gsap.core.Timeline) {
    timeline
        .from("#player-slider", { y: 100, duration: 0.3, ease: 'power3.out' })
        .addPause()
        .to("#player-slider", { y: 100, duration: 0.3, ease: 'power3.out' })
}

function PlayerSlider({ isHome, props }: { isHome: boolean, props: BasketballScorebugData }) {
    const settings = useGlobalSettings();
    const team = isHome ? props.homeTeam : props.awayTeam;
    const teamId = isHome ? settings.homeTeam.team_id : settings.awayTeam.team_id;
    const { bugState } = useBasketballBugStateContext();
    const sliderState = isHome ? bugState.homeTeam.player : bugState.awayTeam.player;
    const players = useBasketballPlayers();
    const currentPlayer = useMemo(() => {
        return players?.find(p => p.jersey === sliderState.number.toString() && p.team_id == teamId);
    }, [players, sliderState.number, teamId]);
    const [stats] = useObjectStoreContext<GameLiveStats>('basketball-live-stats');

    const ready = isDefined(currentPlayer) && isDefined(stats) && isDefined(stats.home) && isDefined(stats.visitor);

    if (!ready) { return (<></>); }

    let values: StatDisplay[] = [];

    if(sliderState.kind == "live") {
        const teamStats = isHome ? stats.home : stats.visitor;
        const playerStats = teamStats?.players.find(p => p.shirtNumber === sliderState.number.toString());
        if (isDefined(playerStats)) {
            values = sliderState.stats.map(x => ({ stat: x, value: getPlayerStat(playerStats, x).toString() }));
        }
    }
    else if (sliderState.kind == "season") {
        values = sliderState.stats.map(x => { return { stat: x, value: getPlayerSeasonStat(currentPlayer, x).toString() }; } );
    }


    return (
        <PlayerSliderInner team={team} currentPlayer={currentPlayer} playing={sliderState.showing} stats={values} type={sliderState.kind} />
    );
}

function PlayerSliderInner({ team, currentPlayer, playing, stats, type }: { team: TeamInfo, currentPlayer: PlayerInfo, playing: boolean, stats: StatDisplay[], type: StatsSource }) {
    const container = useSubAnimation(playerSliderAnimation, playing);
    const firstNameInitial = currentPlayer.first_name.charAt(0).toUpperCase();

    const typeDisplay = type === "live" ? "TODAY" : "SEASON";

    return (
        <div ref={container} className="overflow-hidden">
            <Rect id="player-slider" width={851} height={45} color="rgba(19, 19, 19, 0.95)" className="flex gap-2 items-center text-white text-4xl">
                <Rect color={team.color} className="flex px-5 h-full items-center">
                    <p className="font-bold">{team.abbreviation}</p>
                </Rect>

                <Rect color="#131313" className="flex gap-1.5 items-center px-5 h-full">
                    <p className="font-light">#{currentPlayer.jersey}</p>
                    <p className="font-light">{firstNameInitial}.</p>
                    <p className="font-semibold">{currentPlayer.last_name}</p>
                </Rect>

                <div className="flex items-center justify-between px-5">
                    <Rect className="flex gap-8 px-5 h-full items-center">
                        {stats.map((statDisplay, index) => (
                            <StatDisplayText key={index} statDisplay={statDisplay} />
                        ))}
                    </Rect>

                    <p className="text-white text-2xl font-light">{typeDisplay}</p>
                </div>
            </Rect>
        </div>
    );
}

function StatDisplayText({ statDisplay }: { statDisplay: StatDisplay }) {
    return (
        <div className="flex gap-1">
            <p className="text-white text-3xl font-semibold tabular-nums">{statDisplay.value}</p>
            <p className="text-white text-3xl font-light">{statDisplay.stat}</p>
        </div>
    );
}

function scoringDroughtSliderAnimation(timeline: gsap.core.Timeline) {
    timeline
        .from("#slider", { y: 100, duration: 0.3, ease: 'power3.out' })
        .addPause()
        .to("#slider", { y: 100, duration: 0.3, ease: 'power3.out' })
}

function ScoringDroughtSlider({ isHome, props }: { isHome: boolean, props: BasketballScorebugData }) {
    const team = isHome ? props.homeTeam : props.awayTeam;
    const { bugState } = useBasketballBugStateContext();
    const [lastScores] = useObjectStoreContext<LastScores>('basketball-live-last-scores');
    const teamBugState = isHome ? bugState.homeTeam : bugState.awayTeam;
    const timerType = teamBugState.timer.type;
    const titleText = getTimerOptionDisplayString(timerType);
    const container = useSubAnimation(scoringDroughtSliderAnimation, teamBugState.timer.showing, isDefined(lastScores));

    if (!isDefined(lastScores)) { return (<></>); }

    const period = parseInt(props.info.period.charAt(0));
    const teamLastScoreInfo = isHome ? lastScores.home : lastScores.visitor;
    const teamLastScore = timerType == "LastScore" ? teamLastScoreInfo.lastPoint : teamLastScoreInfo.lastFieldGoal;
    const droughtTime = getTimeSinceLastScore(teamLastScore, period, props.info.clock, 15);

    return (
        <div ref={container} className="overflow-hidden">
            <div id="slider" className={`flex ${isHome ? "justify-end" : "justify-start"} overflow-hidden`}>
                <Rect width={247} height={45} color={team.color} className="flex items-center px-3 justify-between">
                    <p className="text-white text-3xl font-bold">{titleText}</p>
                    <Rect width={50} className="text-end">
                        <p className="text-white text-2xl font-semibold tabular-nums">{droughtTime}</p>
                    </Rect>
                </Rect>
            </div>
        </div>
    );
}

function comparisonSliderAnimation(timeline: gsap.core.Timeline) {
    timeline
        .from("#slider", { y: 100, duration: 0.3, ease: 'power3.out' })
        .addPause()
        .to("#slider", { y: 100, duration: 0.3, ease: 'power3.out' })
}

function ComparisonSlider({ props }: { props: BasketballScorebugData }) {
    const { bugState } = useBasketballBugStateContext();
    const [stats] = useObjectStoreContext<GameLiveStats>('basketball-live-stats');

    const statsReady = isDefined(stats) && isDefined(stats.home) && isDefined(stats.visitor);
    const showing = statsReady && bugState.comparisonStat.showing;
    const container = useSubAnimation(comparisonSliderAnimation, showing, statsReady);

    if (!isDefined(stats) || !isDefined(stats.home) || !isDefined(stats.visitor)) { return (<></>); }
    const statDisplayName = getStatDisplayString(bugState.comparisonStat.stat);
    const homeValue = getTeamTotal(stats.home.players, bugState.comparisonStat.stat);
    const awayValue = getTeamTotal(stats.visitor.players, bugState.comparisonStat.stat);

    return (
        <div ref={container} className="overflow-hidden">
            <Rect id="slider" width={851} height={45} className="flex items-center gap-2 text-white text-3xl" style={{ backgroundColor: 'rgba(19, 19, 19, 0.95)' }}>
                <Rect width={247} height={45} color={props.awayTeam.color} className="center-x-y text-3xl font-semibold">
                    <FadeText text={awayValue} />
                </Rect>

                <Rect width={340} height={45} className="center-x-y font-bold text-4xl">
                    <FadeText text={statDisplayName} />
                </Rect>

                <Rect width={247} height={45} color={props.homeTeam.color} className="center-x-y text-3xl font-semibold">
                    <FadeText text={homeValue} />
                </Rect>
            </Rect>
        </div>
    );
}

function textSliderAnimation(timeline: gsap.core.Timeline) {
    timeline
        .from("#slider", { y: 100, duration: 0.3, ease: 'power3.out' })
        .from("#title", { x: -100, opacity: 0, duration: 0.3, ease: 'power3.out' }, "<0.1")
        .from("#subtitle", { x: -200, opacity: 0, duration: 0.3, ease: 'power3.out' }, "<0.1")
        .addPause()
        .to("#slider", { y: 100, duration: 0.3, ease: 'power3.out' })
}

function TextSlider({sliderState}: {sliderState: TextSliderState}) {
    const container = useSubAnimation(textSliderAnimation, sliderState.showing);

    return (
        <div ref={container} className="overflow-hidden">
            <Rect id="slider" width={851} height={45} className="flex items-center gap-2 text-white text-3xl" style={{ backgroundColor: 'rgba(19, 19, 19, 0.95)' }}>
                <Rect height={45} color="#131313" className="flex justify-center items-center py-2 px-4 opacity-100 overflow-hidden" style={{ transition: 'width 1s ease-in-out' }}>
                    <FadeText id="title" className="font-bold" text={sliderState.title} />
                </Rect>
                <div className="overflow-hidden">
                    <FadeText id="subtitle" text={sliderState.subtitle} />
                </div>
            </Rect>
        </div>
    );
}

function TeamLogoLayer({ src, isHome }: { src: string, isHome: boolean }) {
    const logoHorizPos = isHome ? "right-[-65px]" : "left-[-65px]";
    return (
        <div className={`team-bg-layer w-full h-full flex ${flexReverseForHome(isHome)} absolute inset-0`}>
            <div className={`top-[-75px] ${logoHorizPos} absolute opacity-15`}>
                <img className="w-[250px]" src={src} />
            </div>
        </div>
    );
}

function TeamAbbreviation({ abbr }: { abbr: string }) {
    return (
        <p className="text-white font-semibold text-5xl">{abbr}</p>
    );
}

function TeamScore({ score }: { score: number }) {
    return (
        <NumberFlow className="text-white font-bold text-6xl tabular-nums" value={score} />
    );
}

function getBgGradient(color: string): Gradient {
    const parsedColor = new Color(color);
    const darkerShade = parsedColor.adjustLightness(-30);
    return {
        type: 'linear',
        colors: [color, darkerShade.toHex()],
        angle: 180
    }
}

function TeamBox({ isHome, teamInfo }: { isHome: boolean, teamInfo: TeamInfo }) {
    const bgGradient = useMemo(() => getBgGradient(teamInfo.color), [teamInfo]);

    return (
        <Rect id="home-box" width={247} height={80} gradient={bgGradient} className="relative">
            <TeamLogoLayer src={teamInfo.logoUrl} isHome={isHome} />
            <div className={`absolute inset-0 z-10 w-full h-full flex ${flexReverseForHome(isHome)} justify-between items-center px-3`}>
                <TeamAbbreviation abbr={teamInfo.abbreviation} />
                <TeamScore score={teamInfo.score} />
            </div>
        </Rect>
    );
}

function InfoBox({ gameInfo }: { gameInfo: GameInfo }) {
    const bgGradient = useMemo(() => getBgGradient("#1a1a1a"), []);
    const clockStr = gameInfo.clock.startsWith('.') ? `0${gameInfo.clock}` : gameInfo.clock;

    function getShotClockColor(shotClock: number): string {
        if (shotClock == 0) return "invisible";
        if (shotClock < 15 && shotClock > 10) return "text-yellow-500";
        if (shotClock <= 10) return "text-red-500";
        return "text-white";
    }
    const getShotClockCss = (shotClockVal: number) => `font-extrabold text-3xl max-w-full tabular-nums ${getShotClockColor(shotClockVal)}`;

    return (
        <Rect id="info-bg" width={357} height={80} gradient={bgGradient} className="flex justify-between items-center" style={{ fontFamily: 'Inter' }}>
            <Rect width={99} height={56} className="flex items-center justify-around">
                <p className="text-white font-extrabold text-3xl tabular-nums">{gameInfo.period}</p>
            </Rect>
            <Rect id="clock-bg" width={159} height={56} color="#ffffff" borderRadius="22px" className="flex justify-around items-center">
                <p className="font-black text-4xl tracking-tight w-full text-center tabular-nums">
                    {clockStr}
                </p>
            </Rect>
            <Rect width={99} height={56} className="flex items-center justify-around">
                <p className={getShotClockCss(gameInfo.shotClock)}>{gameInfo.shotClock}</p>
            </Rect>
        </Rect>
    );
}

function infoBoxCoverAnimation(timeline: gsap.core.Timeline) {
    timeline
        .from("#info-box-cover", { opacity: 0, duration: 0.3, ease: 'circ.inOut' })
        .addPause()
        .to("#info-box-cover", { opacity: 0, duration: 0.3, ease: 'circ.inOut' })
}

function InfoBoxCover({ showing, text }: { showing: boolean, text: string }) {
    const bgGradient = useMemo(() => getBgGradient("#1a1a1a"), []);
    const container = useSubAnimation(infoBoxCoverAnimation, showing);

    return (
        <div ref={container}>
            <Rect id="info-box-cover" width={357} height={80} gradient={bgGradient} className="flex justify-center items-center">
                <p className="text-white font-bold text-6xl">{text}</p>
            </Rect>
        </div>
    );
}

function SponsorLogo() {
    return (
        <Rect width={357} height={35} className="flex items-center justify-center">
            <img className="h-2/3" src={sponsorLogo} />
        </Rect>
    );
}

function TimeoutCircle({ active }: { active: boolean }) {
    const container = useRef(null);

    useGSAP(() => {
        const finalValue = active ? 1 : 0.2;
        const timeline = gsap.timeline();
        timeline
            .to(".timeout-circle", { opacity: 0.2, duration: 0.1 })
            .to(".timeout-circle", { opacity: 1, duration: 0.1 })
            .to(".timeout-circle", { opacity: 0.2, duration: 0.1 })
            .to(".timeout-circle", { opacity: 1, duration: 0.1 })
            .to(".timeout-circle", { opacity: finalValue, duration: 0.2 })
    }, { scope: container, dependencies: [active] });

    return (
        <div ref={container}>
            <Rect className="timeout-circle" height={8} width={25} color="#ffffff" />
        </div>
    );
}

function BonusText({ active }: { active: boolean }) {
    return (
        <FadeContainer visible={active}>
            <p className="text-sm text-white font-semibold">BONUS</p>
        </FadeContainer>
    );
}

function TeamSubBar({ isHome, timeouts, bonus }: { isHome: boolean, timeouts: number, bonus: boolean }) {
    return (
        <Rect width={247} height={35} className={`flex items-center px-3 justify-between ${flexReverseForHome(isHome)}`}>
            <div className={`flex ${flexReverseForHome(isHome)} gap-2`}>
                <TimeoutCircle active={timeouts > 0} />
                <TimeoutCircle active={timeouts > 1} />
                <TimeoutCircle active={timeouts > 2} />
                <TimeoutCircle active={timeouts > 3} />
            </div>

            <BonusText active={bonus} />
        </Rect>
    );
}

function SubBar({ props }: { props: BasketballScorebugData }) {
    const { bugState } = useBasketballBugStateContext();

    return (
        <div id="sub-bar" className="z-0 relative opacity-90">
            <Rect width={851} height={35} color="#000000" className="flex justify-around">
                <TeamSubBar isHome={false} timeouts={bugState.awayTeam.timeouts} bonus={bugState.awayTeam.bonus} />
                <SponsorLogo />
                <TeamSubBar isHome={true} timeouts={bugState.homeTeam.timeouts} bonus={bugState.homeTeam.bonus} />
            </Rect>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<PageRoot />);