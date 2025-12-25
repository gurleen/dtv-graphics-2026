import useSWR from "swr"
import { useState, useEffect } from "react"
import type { TeamData, AppState, CurrentGameState, GameState, Boxscore } from "./models";

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
    const { data, error } = useSWR<GameState>('/api/state/game', fetcher);
    if(error) { console.error(error); }
    return data;
}

export function useTeamData(home: boolean) {
    const [data, setData] = useState<TeamData | undefined>(undefined);
    
    useEffect(() => {
        const url = home ? '/api/state/homeTeam' : '/api/state/awayTeam';
        
        const fetchData = () => {
            fetch(new URL(url, API_BASE_URL))
                .then(res => res.json())
                .then(data => setData(data))
                .catch(error => console.error(error));
        };
        
        fetchData();
        const interval = setInterval(fetchData, 500);
        
        return () => clearInterval(interval);
    }, [home]);
    
    return data;
}

export function useBoxscore() {
    const { data, error } = useSWR<Boxscore>('/api/boxscore', fetcher);
    return data;
}

export function usePlayerLinescore(home: boolean, number: string) {
    const data = useBoxscore();
    const team = home ? data?.homeTeam : data?.awayTeam;
    return team?.players.find(x => x.jerseyNumber.toString() == number);
}