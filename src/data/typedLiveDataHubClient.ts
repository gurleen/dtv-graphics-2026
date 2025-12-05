import * as signalR from "@microsoft/signalr";
import type { GameState, WrestlingScorebugState } from "./models";

export type GameStateListener = (state: GameState) => void;
export type WrestlingStateListener = (state: WrestlingScorebugState) => void;

export class TypedLiveDataHubClient {
    private conn: signalR.HubConnection;
    public gameState: GameState;
    public wrestlingState: WrestlingScorebugState;

    private gameStateListeners: GameStateListener[];
    private wrestlingStateListeners: WrestlingStateListener[];

    constructor() {
        this.gameState = TypedLiveDataHubClient.getDefaultGameState();
        this.wrestlingState = TypedLiveDataHubClient.getDefaultWrestlingState();

        this.conn = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5000/TypedLiveData")
            .withAutomaticReconnect()
            .build();
        this.conn.start();
        this.initListeners();

        this.gameStateListeners = [];
        this.wrestlingStateListeners = [];
    }

    private initListeners() {
        this.conn.on("GameStateUpdated", s => {
            this.gameStateUpdated(s)
        });

        this.conn.on("WrestlingStateUpdated", s => {
            this.wrestlingStateUpdated(s);
        })
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

    static getDefaultWrestlingState(): WrestlingScorebugState {
        return {
            clock: 0,
            period: 0,
            advantageTime: 0,
            advantageSide: "Home",
            homeWrestler: {
                ranking: 0,
                firstName: "",
                lastName: ""
            },
            awayWrestler: {
                ranking: 0,
                firstName: "",
                lastName: ""
            },
            homeScore: 0,
            awayScore: 0
        }
    }

    private gameStateUpdated(newState: GameState) {
        this.gameState = newState;
        this.gameStateListeners.forEach(fn => {
            fn(newState);
        });
    }

    private wrestlingStateUpdated(newState: WrestlingScorebugState) {
        this.wrestlingState = newState;
        this.wrestlingStateListeners.forEach(fn => {
            fn(newState);
        });
    }

    onGameStateUpdated(callbackFn: GameStateListener) {
        this.gameStateListeners.push(callbackFn);
    }
    
    onWrestlingStateUpdated(callbackFn: WrestlingStateListener) {
        this.wrestlingStateListeners.push(callbackFn);
    }
}