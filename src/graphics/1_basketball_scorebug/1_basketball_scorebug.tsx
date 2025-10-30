import AnimationContainer from "@/components/animation-container";
import { Rect, type Gradient } from "@/components/rect";
import useAnimation from "@/util/use-animation";
import NumberFlow from "@number-flow/react";
import { useMemo, useRef } from "react";
import * as ReactDOM from 'react-dom/client';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import FadeContainer from "@/components/fade-container";
import { type BasketballScorebugData, type GameInfo, type TeamInfo } from "./props";
import { Color } from "color-core";
import { useAppState } from "@/data/teams";
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

function getTeams(): BasketballScorebugData | undefined {
    const appState = useAppState();
    const liveData = useGameState();

    if (!appState || !liveData) return undefined;

    return {
        homeTeam: {
            abbreviation: appState.homeTeam.info.abbreviation,
            color: appState.homeTeam.info.primaryColor,
            score: liveData.homeTeam.score,
            logoUrl: appState.homeTeam.info.knockoutLogoUrl,
            bonus: liveData.homeTeam.bonus,
            timeouts: liveData.homeTeam.timeouts
        },
        awayTeam: {
            abbreviation: appState.awayTeam.info.abbreviation,
            color: appState.awayTeam.info.primaryColor,
            score: liveData.awayTeam.score,
            logoUrl: appState.awayTeam.info.knockoutLogoUrl,
            bonus: liveData.awayTeam.bonus,
            timeouts: liveData.awayTeam.timeouts
        },
        info: {
            clock: liveData.clockDisplay,
            period: liveData.periodDisplay,
            shotClock: liveData.shotClock
        }
    }
}

function PageRoot() {
    const props = getTeams();

    return (
        <>
            {props && <BasketballScorebug props={props} />}
        </>
    );
}

function BasketballScorebug({ props }: { props: BasketballScorebugData }) {
    const container = useAnimation(animation);

    return (
        <>
            {props && <div ref={container} style={{ fontFamily: 'Inter' }}>
                <AnimationContainer debug={true}>
                    <div className="flex w-full h-full justify-center" style={{marginTop: 900}}>
                        <div id="scorebug">
                            <div id="main-bar" className="flex z-10 relative">
                                <TeamBox isHome={false} teamInfo={props.awayTeam} />
                                <InfoBox gameInfo={props.info} />
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
        <p className="text-white font-extrabold text-4xl">{abbr}</p>
    );
}

function TeamScore({ score }: { score: number }) {
    return (
        <NumberFlow className="text-white font-black text-5xl tabular-nums" value={score} />
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

    function getShotClockColor(shotClock: number): string {
        if (shotClock < 15 && shotClock > 10) return "text-yellow-500";
        if (shotClock <= 10) return "text-red-500";
        return "text-white";
    }
    const getShotClockCss = (shotClockVal: number) => `font-extrabold text-3xl max-w-full tabular-nums ${getShotClockColor(shotClockVal)}`;

    return (
        <Rect id="info-bg" width={357} height={80} gradient={bgGradient} className="flex justify-between items-center">
            <Rect width={99} height={56} className="flex items-center justify-around">
                <p className="text-white font-extrabold text-3xl tabular-nums">{gameInfo.period}</p>
            </Rect>
            <Rect id="clock-bg" width={159} height={56} color="#ffffff" borderRadius="22px" className="flex justify-around items-center">
                <p className="font-black text-4xl tracking-tight w-full text-center tabular-nums">
                    {gameInfo.clock}
                </p>
            </Rect>
            <Rect width={99} height={56} className="flex items-center justify-around">
                <p className={getShotClockCss(gameInfo.shotClock)}>{gameInfo.shotClock}</p>
            </Rect>
        </Rect>
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
            <div className="flex gap-2">
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
    return (
        <div id="sub-bar" className="z-0 relative opacity-90">
            <Rect width={851} height={35} color="#000000" className="flex justify-around">
                <TeamSubBar isHome={false} timeouts={props.awayTeam.timeouts} bonus={props.awayTeam.bonus} />
                <SponsorLogo />
                <TeamSubBar isHome={true} timeouts={props.homeTeam.timeouts} bonus={props.homeTeam.bonus} />
            </Rect>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<PageRoot />);