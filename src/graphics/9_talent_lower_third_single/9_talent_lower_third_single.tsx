import AnimationContainer from '@/components/animation-container';
import { Rect } from '@/components/rect';
import useAnimation from '@/util/use-animation';
import useProps from '@/util/use-props';
import * as ReactDOM from 'react-dom/client';


interface Props {
    firstName: string
    lastName: string
}

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#text-box", { y: 100, opacity: 0, duration: 0.3, ease: "circ.out" })
        .from("#first-name", { y: 100, opacity: 0, duration: 0.3, ease: "circ.out" }, "<0.1")
        .from("#last-name", { y: 100, opacity: 0, duration: 0.3, ease: "circ.out" }, "<0.1")
        .from("#top-box", { y: 100, duration: 0.3, ease: "circ.out" }, "<0.1")
        .addPause()
        .to("#container", { opacity: 0, duration: 0.3, ease: "circ.out" })
}

function getTestProps(): Props {
    return {
        firstName: "TESSA",
        lastName: "PELOSO",
    }
}

function PageRoot() {
    const props = useProps<Props>();
    // const props = getTestProps();

    return (
        <>
            {props && <TalentLowerThirdSingle props={props} />}
        </>
    );
}

function TalentLowerThirdSingle({ props }: { props: Props }) {
    const container = useAnimation(animation);

    return (
        <div id="container" ref={container} style={{ fontFamily: 'Zuume' }}>
            <AnimationContainer debug={false}>
                <div className='flex justify-center w-full h-full' id='container' style={{ marginTop: 850 }}>
                    <div className='flex flex-col items-center'>
                        <TextBox props={props} />
                    </div>
                </div>
            </AnimationContainer>
        </div>
    );
}

function TextBox({ props }: { props: Props }) {
    return (
        <Rect id="text-box" width={400} height={100} color='#D3D1D1' className='flex flex-col justify-between'>
            <Rect width={400} height={5} />
            <div className='flex justify-start items-center text-center text-5xl gap-2 p-3'>
                <p id="first-name" className='text-5xl'>{props.firstName}</p>
                <p id="last-name" className='font-bold'>{props.lastName}</p>
            </div>
            <Rect width={400} height={14} color='#000000' />
        </Rect>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);