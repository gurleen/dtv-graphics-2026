import { useState } from "react";
import { EventBus } from "./emitter";

declare global {
    interface Window {
        play: () => void;
        stop: () => void;
        update: (data: string) => void;
    }
}

export default function useProps<T>() {
    const [props, setProps] = useState<T | null>(null);

    EventBus.on("update", (data: T) => {
        setProps(data);
        console.debug("Update called with:", data);
    });

    return props;
}