import * as signalR from "@microsoft/signalr";
import { apiUrl } from "../utils/config";
import { BallPosition, BallSize, PlayerPosition, PlayerScoreAndLife, QuestionItem } from "../utils/types";

export class GameHubClient {
    private connection: signalR.HubConnection;

    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${apiUrl}/hub`, {
                withCredentials: false //  CORS policy
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();
    }

    public async start(): Promise<void> {
        try {
            await this.connection.start();
            console.log("SignalR Connected.");
        } catch (err) {
            console.error("Error while starting connection: ", err);
            setTimeout(() => this.start(), 5000);
        }
    }

    public registerOnServerEvents(callbacks: {
        receiveMessage: (message: string) => void,
        receivePlayerMovement: (playerId: string, x: number, y: number) => void,
        receiveScoreAndLife: (score: number, life: number) => void,
        receiveQuestionId: (questionId: string) => void,
        receiveBallMovement: (x: number, y: number) => void,
        receiveBallSize: (width: number, height: number) => void
    }): void {
        this.connection.on("ReceiveMessage", callbacks.receiveMessage);
        this.connection.on("ReceivePlayerMovement", callbacks.receivePlayerMovement);
        this.connection.on("ReceivedScoreAndLife", callbacks.receiveScoreAndLife);
        this.connection.on("ReceivedQuestionId", callbacks.receiveQuestionId);
        this.connection.on("ReceivedBallMovement", callbacks.receiveBallMovement);
        this.connection.on("ReceivedBallSize", callbacks.receiveBallSize);
    }

    public async stop(): Promise<void> {
        try {
            await this.connection.stop();
            console.log("SignalR Disconnected.");
        } catch (err) {
            console.error("Error while stopping connection: ", err);
        }
    }

    public async joinLobby(sessionId: string): Promise<void> {
        await this.connection.invoke("JoinLobby", sessionId);
    }

    public async leaveLobby(sessionId: string): Promise<void> {
        await this.connection.invoke("LeaveLobby", sessionId);
    }

    public async detectPlayerMovement(sessionId: string, playerPosition: PlayerPosition): Promise<void> {
        console.log(playerPosition)
        await this.connection.invoke("DetectPlayerMovement", sessionId, playerPosition);
    }

    public async detectPlayerSize(sessionId: string, playerSize: PlayerPosition): Promise<void> {
        await this.connection.invoke("DetectPlayerSize", sessionId, playerSize);
    }

    public async detectPlayerScoreAndLife(sessionId: string, scoreAndLife: PlayerScoreAndLife): Promise<void> {
        await this.connection.invoke("DetectPlayerScoreAndLife", sessionId, scoreAndLife);
    }

    public async detectCurrentQuestion(sessionId: string, currentQuestionId: QuestionItem): Promise<void> {
        await this.connection.invoke("DetectCurrentQuestion", sessionId, currentQuestionId);
    }

    public async detectBallMovement(sessionId: string, ballPosition: BallPosition): Promise<void> {
        await this.connection.invoke("DetectBallMovement", sessionId, ballPosition);
    }

    public async detectBallSize(sessionId: string, ballSize: BallSize): Promise<void> {
        await this.connection.invoke("DetectBallSize", sessionId, ballSize);
    }
}
