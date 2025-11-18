import AnimationContainer from '@/components/animation-container';
import { FadeText } from '@/components/fade-text';
import MarkdownText from '@/components/markdown-text';
import { Rect } from '@/components/rect';
import type { Team } from '@/data/models';
import { useAppState } from '@/data/teams';
import useAnimation, { type AnimationFunc } from '@/util/use-animation';
import useProps from '@/util/use-props';
import { Color } from 'color-core';
import { createContext, useContext, useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';

interface Props {
    isHome: string
    firstName: string
    lastName: string
    position: string
    text: string
}

interface Data {
    props: Props
    team: Team
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
        text: "PHILADELPHIA BIG 5 COACH OF THE WEEK",
        firstName: 'AMY',
        lastName: 'MALLON',
        position: 'HEAD COACH'
    }
}

function PageRoot() {
    const props = useProps<Props>();
    // const props = getTestProps();
    const isHome = props?.isHome == "1";
    const appState = useAppState();
    const team = isHome ? appState?.homeTeam : appState?.awayTeam;

    if (props && team) {
        const data: Data = {
            props: props,
            team: team,
            isHome: isHome
        };
        return (
            <DataContext value={data}>
                <CoachLowerThird />
            </DataContext>
        );
    }

    return (<></>);
}

function CoachLowerThird() {
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

function ContentArea({ homeColorDarker }: { homeColorDarker: Color }) {
    const data = useContext(DataContext);
    if (!data) return (<></>);

    return (
        <div className='flex flex-col gap-2'>
            <div className='flex text-white justify-between items-center pt-4 px-4'>
                <div className='flex items-center gap-2'>
                    <p id="first-name" className='text-5xl mt-0.5'>{data.props.firstName}</p>
                    <p id="last-name" className='text-5xl font-bold mt-0.5'>{data.props.lastName}</p>
                </div>

                <div id="exp-pos" className='flex text-3xl gap-2'>
                    <p>{data.props.position}</p>
                </div>
            </div>

            <Rect color={homeColorDarker.toHex()} className='flex pb-4 px-4 pt-2 overflow-hidden'>
                <TextBox />
            </Rect>
        </div>
    );
}

const textBoxInAnim: AnimationFunc = (tl) => tl.to("div", { y: -100, duration: 0.2, ease: 'circ.inOut' })
const textBoxOutAnim: AnimationFunc = (tl) => {
    tl.to("div", { y: 200, duration: 0.00001 })
    tl.to("div", { y: -100, duration: 0.2, ease: 'circ.inOut' });
}

function TextBox() {
    const data = useContext(DataContext);
    if (!data) return (<></>);

    return (
        <div id="subtext" className='text-4xl text-white font-light overflow-hidden'>
            {/* <MarkdownText text={data.props.text} /> */}
            <FadeText inAnim={textBoxInAnim} outAnim={textBoxOutAnim} text={data.props.text} />
        </div>
    );
}


const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);