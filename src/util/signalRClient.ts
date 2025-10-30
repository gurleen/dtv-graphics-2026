import * as signalR from "@microsoft/signalr";
import type Emittery from "emittery";

export class SignalRClient {
    public connection: signalR.HubConnection;

    constructor(baseUrl: string) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(baseUrl)
            .withAutomaticReconnect()
            .build();
        this.connection.start();
    }
}