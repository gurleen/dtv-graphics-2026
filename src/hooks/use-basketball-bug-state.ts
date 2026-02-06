import type { BasketballScorebugState, BasketballLiveData, TextSliderState } from "@/types/basketball";
import { useObjectStore } from "@/util/use-object-store";
import { useEffect } from "react";

export function useBasketballBugState() {
    const key = 'basketball-scorebug-state';
    const {
        data,
        subscribe,
        unsubscribe,
        set,
    } = useObjectStore();

    useEffect(() => {
        subscribe(key);
        return () => unsubscribe(key);
    }, []);

    const bugState = data[key] as BasketballScorebugState | undefined;
    const setBugState = (updater: (draft: BasketballScorebugState) => void) => {
        const draft = { ...bugState! };
        updater(draft);
        set(key, draft);
    }

    return { bugState, setBugState };
}

export function useBasketballLiveData() {
    const key = 'basketball-live-data';
    const {
        data,
        subscribe,
        unsubscribe,
    } = useObjectStore();

    useEffect(() => {
        subscribe(key);
        return () => unsubscribe(key);
    }, []);

    const liveData = data[key] as BasketballLiveData | undefined;
    return { liveData };
}

export function useTextSliderState() {
    const key = 'basketball-bug-text-slider';
    const {
        data,
        subscribe,
        unsubscribe,
        set,
    } = useObjectStore();

    useEffect(() => {
        subscribe(key);
        return () => unsubscribe(key);
    }, []);

    const sliderState = data[key] as TextSliderState | undefined;
    const setSliderState = (updater: (draft: TextSliderState) => void) => {
        const draft = { ...sliderState! };
        updater(draft);
        set(key, draft);
    }

    return { sliderState, setSliderState };
}