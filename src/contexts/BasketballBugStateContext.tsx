import { createContext, useContext, type ReactNode } from 'react';
import type { BasketballScorebugState } from '@/types/basketball';
import { useBasketballBugState } from '@/hooks/use-basketball-bug-state';

interface BasketballBugStateContextValue {
    bugState: BasketballScorebugState;
    setBugState: (updater: (draft: BasketballScorebugState) => void) => void;
}

const BasketballBugStateContext = createContext<BasketballBugStateContextValue | null>(null);

export function BasketballBugStateProvider({ children }: { children: ReactNode }) {
    const { bugState, setBugState } = useBasketballBugState();

    if (!bugState) {
        console.error('Failed to load basketball bug state');
        return <></>;
    }

    return (
        <BasketballBugStateContext.Provider value={{ bugState, setBugState }}>
            {children}
        </BasketballBugStateContext.Provider>
    );
}

export function useBasketballBugStateContext(): BasketballBugStateContextValue {
    const context = useContext(BasketballBugStateContext);

    if (!context) {
        throw new Error('useBasketballBugStateContext must be used within a BasketballBugStateProvider');
    }

    return context;
}
