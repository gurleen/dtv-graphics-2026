import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export interface FadeTextProps {
    text: string
    className?: string,
    id?: string
}

export function FadeText({ text, className, id }: FadeTextProps) {
    const container = useRef(null);
    const [shownText, setShownText] = useState<string | undefined>();

    useGSAP(() => {
        if(!shownText) {
            setShownText(text);
        }
        else {
            new gsap.core.Timeline()
            .to("div", { opacity: 0, duration: 0.2, ease: 'power3.inOut' })
            .call(x => setShownText(text))
            .to("div", { opacity: 1, duration: 0.2, ease: 'power3.inOut' })
        }
    }, {scope: container, dependencies: [text]});

    return (
        <div ref={container}>
            <div id={id} className={className}>{shownText}</div>
        </div>
    );
}