import useSWR from "swr"
import type { TeamData, AppState, CurrentGameState } from "./models";

const API_BASE_URL = "http://localhost:5069"



const fetcher = (path: string) => fetch(new URL(path, API_BASE_URL)).then(res => res.json());

export function useAppState() {
    const { data, error } = useSWR<AppState>('/api/state/graphicsData', fetcher);
    return data;
}

export default function fetchLiveData() {
    const { data, error } = useSWR("/dataStore", fetcher);
    return data;
}

export function currentGameState() {
    const { data, error } = useSWR<CurrentGameState>('/api/state/game', fetcher);
    if(error) { console.error(error); }
    return data;
}

export function useTeamData(home: boolean) {
    const url = home ? '/api/state/homeTeam' : '/api/state/awayTeam';
    const { data, error } = useSWR<TeamData>(url, fetcher);
    return data;
}