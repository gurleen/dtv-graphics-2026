import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { AnimationFunc } from "@/util/use-animation";

export interface FadeTextProps {
    text: string
    className?: string
    id?: string
    inAnim?: AnimationFunc
    outAnim?: AnimationFunc
}

const defaultInAnim: AnimationFunc = (tl) => tl.to("div", { opacity: 0, duration: 0.2, ease: 'power3.inOut' });
const defaultOutAnim: AnimationFunc = (tl) => tl.to("div", { opacity: 1, duration: 0.2, ease: 'power3.inOut' });

export function FadeText({ text, className, id, inAnim, outAnim }: FadeTextProps) {
    const container = useRef(null);
    const [shownText, setShownText] = useState<string | undefined>();

    const usingInAnim = inAnim ?? defaultInAnim;
    const usingOutAnim = outAnim ?? defaultOutAnim;

    useGSAP(() => {
        if(!shownText) {
            setShownText(text);
        }
        else {
            const tl = new gsap.core.Timeline();
            usingInAnim(tl);
            tl.call(x => setShownText(text))
            usingOutAnim(tl);
        }
    }, {scope: container, dependencies: [text]});

    return (
        <div ref={container}>
            <div id={id} className={className}>{shownText}</div>
        </div>
    );
}