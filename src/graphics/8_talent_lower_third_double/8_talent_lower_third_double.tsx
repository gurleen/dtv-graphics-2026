import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import useAnimation from '@/util/use-animation';
import useProps from '@/util/use-props';
import * as ReactDOM from 'react-dom/client';

const confLogo = "https://images.dragonstv.io/sponsors/CAAWhite.png";

interface Props {
    firstNameLeft: string
    lastNameLeft: string
    firstNameRight: string
    lastNameRight: string
}

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#text-box", { y: 100, opacity: 0, duration: 0.3, ease: "circ.out" })
        .from("#left-first-name", { x: -100, opacity: 0, duration: 0.3, ease: "circ.out" }, "<0.1")
        .from("#left-last-name", { x: -100, opacity: 0, duration: 0.3, ease: "circ.out" }, "<0.1")
        .from("#right-first-name", { x: 100, opacity: 0, duration: 0.3, ease: "circ.out" }, "<0.1")
        .from("#right-last-name", { x: 100, opacity: 0, duration: 0.3, ease: "circ.out" }, "<0.1")
        .from("#top-box", { y: 100, duration: 0.3, ease: "circ.out" }, "<0.1")
        .addPause()
        .to("#container", { opacity: 0, duration: 0.3, ease: "circ.out" })
}

function getTestProps(): Props {
    return {
        firstNameLeft: "MIKE",
        lastNameLeft: "TUBEROSA",
        firstNameRight: "ROB",
        lastNameRight: "BROOKS"
    }
}

function PageRoot() {
    const props = useProps<Props>();
    // const props = getTestProps();

    return (
        <>
            {props && <TalentLowerThirdDouble props={props} />}
        </>
    );
}

function TalentLowerThirdDouble({ props }: { props: Props }) {
    const container = useAnimation(animation);

    return (
        <div id="container" ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex justify-center w-full h-full' id='container' style={{ marginTop: 850 }}>
                    <div className='flex flex-col items-center'>
                        <TopBox />
                        <TextBox props={props} />
                    </div>
                </div>
            </AnimationContainer>
        </div>
    );
}

function TopBox() {
    return (
        <div className='overflow-hidden'>
            <Rect id='top-box' height={44} width={321} color='#131313' className='flex gap-2 justify-center items-center py-2'>
                <img width={84} src={confLogo} />
                <span className='text-white text-4xl mt-1'>ON DRAGONSTV</span>
            </Rect>
        </div>
    );
}

function TextBox({ props }: { props: Props }) {
    return (
        <Rect id="text-box" width={726} height={149} color='#D3D1D1' className='flex flex-col justify-between'>
            <Rect width={726} height={5} />
            <div className='flex justify-evenly items-center text-center'>
                <div id='left-name'>
                    <p id="left-first-name" className='text-5xl'>{props.firstNameLeft}</p>
                    <p id="left-last-name" className='text-6xl font-bold'>{props.lastNameLeft}</p>
                </div>
                <Rect width={1} color='#131313' height={100} className='rounded-lg' />
                <div id='right-name'>
                    <p id="right-first-name" className='text-5xl'>{props.firstNameRight}</p>
                    <p id="right-last-name" className='text-6xl font-bold'>{props.lastNameRight}</p>
                </div>
            </div>
            <Rect width={726} height={14} color='#000000' />
        </Rect>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);