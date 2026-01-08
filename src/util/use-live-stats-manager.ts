import { useEffect, useRef, useState } from "react";
import type { GameState, WrestlingScorebugState } from "@/data/models";
import { TypedLiveDataHubClient } from "@/data/typedLiveDataHubClient";



export function useGameState() {
    const client = useRef<TypedLiveDataHubClient | undefined>(undefined);
    const [gameState, setGameState] = useState<GameState | undefined>();

    useEffect(() => {
        client.current = new TypedLiveDataHubClient();
        client.current.onGameStateUpdated(s => {
            console.debug("new game state", s);
            setGameState(s);
        });
        console.log(client.current);
    }, []);

    return gameState;
}


export function useWrestlingState() {
    const client = useRef<TypedLiveDataHubClient | undefined>(undefined);
    const [gameState, setGameState] = useState<WrestlingScorebugState | undefined>();

    useEffect(() => {
        client.current = new TypedLiveDataHubClient();
        client.current.onWrestlingStateUpdated(s => {
            setGameState(s);
        });
        console.log(client.current);
    }, []);

    return gameState;
}