import { useEffect, useRef } from "react";

export interface UseIntervalCallback {
    (): void;
}

export type UseIntervalDelay = number | null;

export function useInterval(callback: UseIntervalCallback, delay: UseIntervalDelay) {
    const savedCallback = useRef<UseIntervalCallback>(undefined);
 
    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
 
    // Set up the interval.
    useEffect(() => {
        function tick() {
            if (savedCallback.current) {
                savedCallback.current();
            }
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}