import { createContext, useContext, type ReactNode } from 'react';
import { Sport } from '@/data/models';
import type { GlobalSettings } from '@/types/globalSettings';
import type { TeamInfo } from '@/types/team';
import { useSpxObject, useTeamData } from '@/util/spx';

interface GlobalSettingsContextValue {
    settings: GlobalSettings;
    homeTeam: TeamInfo;
    awayTeam: TeamInfo;
    teamSearch: {value: number, label: string}[];
    saveSettings: (updater: (draft: GlobalSettings) => void) => void;
}

const GlobalSettingsContext = createContext<GlobalSettingsContextValue | null>(null);

export function GlobalSettingsProvider({ children }: { children: ReactNode }) {
    const teams = useTeamData();
    const { data: settings, save: saveToDisk } = useSpxObject<GlobalSettings>('global', 'settings.json', {
        defaultValue: undefined
    });

    if (!teams || !settings) {
        return <></>;
    }

    const teamSearch = teams.map(t => ({ value: t.team_id, label: t.display_name }))
    const homeTeam = teams.find(t => t.team_id === settings.homeTeamId);
    const awayTeam = teams.find(t => t.team_id === settings.awayTeamId);

    if (!homeTeam || !awayTeam) {
        return <div></div>;
    }

    const saveSettings = (updater: (draft: GlobalSettings) => void) => {
        const draft = { ...settings };
        updater(draft);
        saveToDisk(draft);
    };

    return (
        <GlobalSettingsContext.Provider value={{ settings, homeTeam, awayTeam, teamSearch, saveSettings }}>
            {children}
        </GlobalSettingsContext.Provider>
    );
}

export function useGlobalSettings(): GlobalSettingsContextValue {
    const context = useContext(GlobalSettingsContext);

    if (!context) {
        throw new Error('useGlobalSettings must be used within a GlobalSettingsProvider');
    }

    return context;
}
