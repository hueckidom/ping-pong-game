export interface SessionStorage {
    id: string | undefined;
    name: string | undefined | null;
    gameSessionId: string | undefined;
    isHost: boolean | undefined;
}

const sessionState: SessionStorage = {
    id: undefined,
    name: undefined,
    gameSessionId: undefined,
    isHost: undefined
};

export function setSessionState(myname: string, id: string, gameSessionId: string, isHost: boolean) {
    sessionState.gameSessionId = gameSessionId;
    sessionState.id = id;
    sessionState.name = myname;
    sessionState.isHost = isHost;
}

export function getSessionState(): SessionStorage {
    return sessionState;
}
