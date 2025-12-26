import { createContext, useContext, useState, type ReactNode } from 'react';

interface PageContextValue {
    currentTab: string;
    setCurrentTab: (tab: string) => void;
}

const PageContext = createContext<PageContextValue | null>(null);
const STORAGE_KEY = 'global-settings-current-tab';

export function usePageContext() {
    const context = useContext(PageContext);
    if (!context) {
        throw new Error('usePageContext must be used within PageProvider');
    }
    return context;
}

export function PageProvider({ children }: { children: ReactNode }) {
    const [currentTab, setCurrentTabState] = useState<string>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved || 'SPORT';
    });

    const setCurrentTab = (tab: string) => {
        setCurrentTabState(tab);
        localStorage.setItem(STORAGE_KEY, tab);
    };

    return (
        <PageContext.Provider value={{ currentTab, setCurrentTab }}>
            {children}
        </PageContext.Provider>
    );
}
