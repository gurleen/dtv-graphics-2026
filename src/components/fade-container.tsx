import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";

export default function FadeContainer({visible, children}: {visible: boolean, children: React.ReactNode}) {
    const container = useRef(null);

    useGSAP(() => {
        const finalValue = visible ? 1 : 0;
        gsap.to(".children", {opacity: finalValue, duration: 0.2, ease: "power4.inOut"});
    }, {scope: container, dependencies: [visible]})

    return (
        <div ref={container}>
            <div className="children">
                {children}
            </div>
        </div>
    );
}