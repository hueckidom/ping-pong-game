// src/utils/ApiService.ts
import axios from 'axios';
import { PlayerSessionData, GameSession } from '../utils/types';
import { apiUrl } from "../utils/config";

export const joinRoom = async (sessionId: string, playerName: string): Promise<void> => {
    const response = await axios.post<void>(`${apiUrl}/api/Player/JoinRoom/${sessionId}`, { playername: playerName });
    return response.data;
};

export const getScores = async (): Promise<PlayerSessionData[]> => {
    const response = await axios.get<PlayerSessionData[]>(`${apiUrl}/Score/GetScores`);
    return response.data;
};

export const addScores = async (sessionId: string, playerId: string, name: string, score: number): Promise<void> => {
    const response = await axios.post<void>(`${apiUrl}/Score/AddScores`, { sessionId, id: playerId, name, score });
    return response.data;
};

export const createSession = async (name: string): Promise<GameSession> => {
    const response = await axios.post<GameSession>(`${apiUrl}/Session/CreateSession`, { name });
    return response.data;
};

export const getAllSessions = async (): Promise<GameSession[]> => {
    const response = await axios.get<GameSession[]>(`${apiUrl}/Session/GetAllSessions`);
    return response.data;
};

export const getSessionById = async (sessionId: string): Promise<GameSession> => {
    const response = await axios.get<GameSession>(`${apiUrl}/Session/GetSessionById/${sessionId}`);
    return response.data;
};

export const startGame = async (sessionId: string): Promise<GameSession> => {
    const response = await axios.post<GameSession>(`${apiUrl}/Session/Startgame`, { sessionId });
    return response.data;
};

export const endGame = async (sessionId: string): Promise<void> => {
    const response = await axios.post<void>(`${apiUrl}/Session/EndGame`, { sessionId });
    return response.data;
};
