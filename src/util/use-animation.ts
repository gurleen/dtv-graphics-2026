import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { EventBus } from "./emitter";

gsap.registerPlugin(useGSAP);

declare global {
    interface Window {
        play: () => void;
        stop: () => void;
    }
}

type AnimationFunc = (timeline: gsap.core.Timeline) => void;

export default function useAnimation(animFunc: AnimationFunc) {
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap
            .timeline({ onComplete: () => { tl.current?.seek(0).pause(); }});
        animFunc(tl.current);
    }, { scope: container });

    EventBus.on("play", () => {
        tl.current?.play();
    });

    EventBus.on("stop", () => {
        tl.current?.play();
    });

    return container;
}

export function useSubAnimation(animFunc: AnimationFunc, playing: boolean) {
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    useGSAP(() => {
        tl.current = gsap
            .timeline({ onComplete: () => { tl.current?.seek(0).pause(); }, paused: true});
        animFunc(tl.current);
    }, { scope: container });

    useEffect(() => {
        if(isPlaying != playing) { tl.current?.play(); }
        setIsPlaying(playing);
    })

    return container;
}