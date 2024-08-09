import { PlayerSessionData, Question } from "./types";

export interface GameState {
    id?: string;
    name?: string;
    sessionId?: string;
    isHost?: boolean;
    isPaused?: boolean;
    isSpawningBubble?: boolean;
    question?: Question;
    teamName?: string;
    timer?: number;
    life?: number;
    score?: number;
    players?: PlayerSessionData[];
}

let _gameState: GameState = {};

export function updateGameState(data: Partial<GameState>) {
    _gameState = {
        ..._gameState,
        ...data
    }
}

export function gameState(): GameState { return _gameState };
