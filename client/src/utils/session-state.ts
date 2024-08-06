export interface SessionState {
    id: string | undefined;
    name: string | undefined | null;
    gameSessionId: string | undefined;
    isHost: boolean | undefined;
}

const sessionState: SessionState = {
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

    sessionStorage.setItem('sessionState', JSON.stringify(sessionState));
}

export function getSessionState(): SessionState {
    const storedState = sessionStorage.getItem('sessionState');
    if (storedState) {
        return JSON.parse(storedState);
    }
    return {
        id: undefined,
        name: undefined,
        gameSessionId: undefined,
        isHost: undefined
    };
}
