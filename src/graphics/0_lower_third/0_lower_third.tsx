import AnimationContainer from "@/components/animation-container";
import { Rect } from "@/components/rect";
import useAnimation from "@/util/use-animation";
import * as ReactDOM from 'react-dom/client';


function animation(timeline: gsap.core.Timeline) {
    timeline
        .from("#rect", { opacity: 0, duration: 0.5, ease: "power3.inOut" })
        .addPause()
        .to("#rect", { opacity: 0, duration: 0.5, ease: "power3.inOut" });
}

function LowerThird() {
    const container = useAnimation(animation);

    return (
        <div ref={container}>
            <AnimationContainer>
                <Rect id="rect" width={500} height={500} color="#000000">
                    <p className="text-7xl text-white">THIS IS A TEST GRAPHIC</p>
                </Rect>
            </AnimationContainer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<LowerThird />);