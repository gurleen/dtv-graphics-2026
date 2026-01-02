import type { BasketballScorebugState } from "@/types/basketball";
import { useObjectStore } from "@/util/use-object-store";
import { useEffect } from "react";

export function useBasketballBugState() {
    const {
        data,
        subscribe,
        unsubscribe,
        set,
    } = useObjectStore();

    useEffect(() => {
        subscribe('basketball-scorebug-state');
        return () => unsubscribe('basketball-scorebug-state');
    }, []);

    const bugState = data['basketball-scorebug-state'] as BasketballScorebugState | undefined;
    const setBugState = (updater: (draft: BasketballScorebugState) => void) => {
        const draft = { ...bugState! };
        updater(draft);
        set('basketball-scorebug-state', draft);
    }

    return { bugState, setBugState };
}