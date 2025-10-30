import { useEffect, useRef, useState } from "react";
import type { GameState } from "@/data/models";
import { TypedLiveDataHubClient } from "@/data/typedLiveDataHubClient";



export function useGameState() {
    const client = useRef<TypedLiveDataHubClient | undefined>(undefined);
    const [gameState, setGameState] = useState<GameState | undefined>();

    useEffect(() => {
        client.current = new TypedLiveDataHubClient();
        client.current.onGameStateUpdated(s => {
            console.log("new game state", s);
            setGameState(s);
        });
        console.log(client.current);
    }, []);

    return gameState;
}