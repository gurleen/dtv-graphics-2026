import * as signalR from "@microsoft/signalr";
import type { GameState } from "./models";

export type GameStateListener = (state: GameState) => void;

export class TypedLiveDataHubClient {
    private conn: signalR.HubConnection;
    public gameState: GameState;

    private gameStateListeners: GameStateListener[];

    constructor() {
        this.gameState = TypedLiveDataHubClient.getDefaultGameState();
        this.conn = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5000/TypedLiveData")
            .withAutomaticReconnect()
            .build();
        this.conn.start();
        this.initListeners();

        this.gameStateListeners = [];
    }

    private initListeners() {
        this.conn.on("GameStateUpdated", s => {
            this.gameStateUpdated(s)
        });
    }

    static getDefaultGameState(): GameState {
        return {
            clock: 0,
            shotClock: 0,
            period: 0,
            homeTeam: {
                score: 0,
                timeouts: 0,
                fouls: 0,
                bonus: false
            },
            awayTeam: {
                score: 0,
                timeouts: 0,
                fouls: 0,
                bonus: false
            }
        }
    }

    private gameStateUpdated(newState: GameState) {
        this.gameState = newState;
        this.gameStateListeners.forEach(fn => {
            fn(newState);
        })
    }

    onGameStateUpdated(callbackFn: GameStateListener) {
        this.gameStateListeners.push(callbackFn);
    }
}