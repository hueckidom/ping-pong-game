// src/utils/ApiService.ts
import axios from 'axios';
import { Player, Session, ApiResponse } from '../utils/types';
import { apiUrl } from "../utils/config";

export const joinRoom = async (sessionId: string, playerName: string): Promise<void> => {
    const response = await axios.post<ApiResponse<void>>(`${apiUrl}/api/Player/JoinRoom/${sessionId}`, { playername: playerName });
    return response.data.data;
};

export const getScores = async (): Promise<Player[]> => {
    const response = await axios.get<ApiResponse<Player[]>>(`${apiUrl}/Score/GetScores`);
    return response.data.data;
};

export const addScores = async (sessionId: string, playerId: string, name: string, score: number): Promise<void> => {
    const response = await axios.post<ApiResponse<void>>(`${apiUrl}/Score/AddScores`, { sessionId, id: playerId, name, score });
    return response.data.data;
};

export const createSession = async (name: string): Promise<Session> => {
    const response = await axios.post<ApiResponse<Session>>(`${apiUrl}/Session/CreateSession`, { name });
    return response.data.data;
};

export const getAllSessions = async (): Promise<Session[]> => {
    const response = await axios.get<ApiResponse<Session[]>>(`${apiUrl}/Session/GetAllSessions`);
    return response.data.data;
};

export const getSessionById = async (sessionId: string): Promise<Session> => {
    const response = await axios.get<ApiResponse<Session>>(`${apiUrl}/Session/GetSessionById/${sessionId}`);
    return response.data.data;
};

export const startGame = async (sessionId: string): Promise<Session> => {
    const response = await axios.post<ApiResponse<Session>>(`${apiUrl}/Session/Startgame`, { sessionId });
    return response.data.data;
};

export const endGame = async (sessionId: string): Promise<void> => {
    const response = await axios.post<ApiResponse<void>>(`${apiUrl}/Session/EndGame`, { sessionId });
    return response.data.data;
};
