import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import type { AppState, Team } from '@/data/models';
import { useAppState } from '@/data/teams';
import useAnimation from '@/util/use-animation';
import useProps from '@/util/use-props';
import { createContext, useContext } from 'react';
import * as ReactDOM from 'react-dom/client';

const confLogo = "https://images.dragonstv.io/sponsors/CAAWhite.png";

interface Props {
    isReversed: string
    firstNameHome: string
    lastNameHome: string
    textHome: string
    firstNameAway: string
    lastNameAway: string
    textAway: string
}

interface CoachInfo {
    firstName: string
    lastName: string
    text: string
}

interface Data {
    props: Props
    state: AppState
}

const DataContext = createContext<Data | undefined>(undefined);

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#left-box", { x: -600, duration: 0.5, ease: 'circ.out' })
        .from("#right-box", { x: 600, duration: 0.5, ease: 'circ.out' }, "<")
        .addPause()
        .to("#container", { opacity: 0, duration: 0.3, ease: "circ.out" })
}

function getTestProps(): Props {
    return {
        isReversed: '0',
        firstNameHome: 'AMY',
        lastNameHome: 'MALLON',
        textHome: 'COACH TEXT',
        firstNameAway: 'OTHER',
        lastNameAway: 'COACH',
        textAway: 'COACH TEXT'
    }
}

function PageRoot() {
    const props = useProps<Props>();
    // const props = getTestProps();
    const appState = useAppState();

    if (props && appState) {
        const data: Data = { props: props, state: appState }
        return (
            <DataContext value={data}>
                {props && <CoachLowerThirdDouble />}
            </DataContext>
        );
    }
}

function CoachLowerThirdDouble() {
    const container = useAnimation(animation);

    const data = useContext(DataContext);
    if (!data) { return (<></>); }

    const homeCoach: CoachInfo = { firstName: data.props.firstNameHome, lastName: data.props.lastNameHome, text: data.props.textHome }
    const awayCoach: CoachInfo = { firstName: data.props.firstNameAway, lastName: data.props.lastNameAway, text: data.props.textAway }

    const isReversed = data.props.isReversed == "1";
    const leftTeam = isReversed ? data.state.awayTeam : data.state.homeTeam;
    const leftCoach = isReversed ? awayCoach : homeCoach;
    const rightTeam = isReversed ? data.state.homeTeam : data.state.awayTeam;
    const rightCoach = isReversed ? homeCoach : awayCoach;

    return (
        <div id="container" ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex justify-between w-full h-full' id='container' style={{ marginTop: 850 }}>
                    <TeamBox team={leftTeam} coach={leftCoach} isRight={false} />
                    <TeamBox team={rightTeam} coach={rightCoach} isRight={true} />
                </div>
            </AnimationContainer>
        </div>
    );
}

function TeamBox({ team, coach, isRight }: { team: Team, coach: CoachInfo, isRight: boolean }) {
    const flexReverse = isRight ? "flex-row-reverse" : ""; 
    const textAlign = isRight ? "text-right" : "";
    const id = isRight ? "right-box" : "left-box";

    return (
        <Rect id={id} width={600} height={125} color={team.info.primaryColor} className={`flex ${flexReverse} ${textAlign}`}>
            <div className='flex flex-col text-white p-4'>
                <p className='text-6xl'>{coach.firstName} <span className='font-bold'>{coach.lastName}</span> </p>
                <p className='text-4xl'>{coach.text}</p>
            </div>
        </Rect>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);