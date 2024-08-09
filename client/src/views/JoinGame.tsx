import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessionById, joinRoom } from "../api/api";
import { updateGameState } from "../utils/game-state";
import { PlayerSessionData } from "../utils/types";

const JoinGame: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [playerName, setPlayerName] = useState("");
  const [emptyError, setEmptyError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [joined, setJoined] = useState<boolean>(false);
  const [players, setPlayers] = useState<PlayerSessionData[]>([]);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName && sessionId) {
      try {
        await joinRoom(sessionId, playerName);
        setJoined(true);
        setLoading(true);

        // Start polling to check if the game has started
        pollForGameStart(sessionId);
      } catch (err) {
        setError("Failed to join the game. Please try again.");
        setLoading(false);
      }
    }
  };

  const pollForGameStart = async (sessionId: string) => {
    try {
      const response = await getSessionById(sessionId);
      const isGameStarted = response.isSessionRunning;

      if (response.players?.length && response.players.length > 1) {
        const palyer2 = response.players[1];
        updateGameState({
          name: playerName,
          id: palyer2.id,
          sessionId: response.sessionId,
          isHost: false,
          players: response.players
        });
        setPlayers(response.players!);
      }

      if (isGameStarted) {
        setLoading(false);
        navigate(`/game/${sessionId}`);
        return;
      }

      await new Promise((resolve) => setTimeout(() => resolve(null), 1000));
      await pollForGameStart(sessionId);
    } catch (err) {
      console.error("Error while polling for game start:", err);
    }
  };

  // Component GameLobbyPanel, if more than 1 players joined and we are rdy
  const GameLobbyPanel = () => {
    return (
      <>
        {players.map((value, index) => {
          if (index == 0)
            return (
              <div className="text-yellow-200 font-bold mb-4">
                Spieler 1 : {value.name}
              </div>
            );
          if (index == 1)
            return (
              <div className="text-blue-500 font-bold mb-4">
                Spieler 2 : {value.name}
              </div>
            );

          return <div className="mb-4">Zuschauer : {value.name}</div>;
        })}
      </>
    );
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="">
          <div className="title-wrapper mb-12 floating">
            <h1 className="sweet-title mb-4">
              <span data-text="Spiel">Spiel</span>
            </h1>
            <h1 className="sweet-title sweet-title-mixed">
              <span data-text="Beitreten">Beitreten</span>
            </h1>
          </div>

          {!joined && (
            <form onSubmit={handleSubmit}>
              <label className="block mb-4">
                <input
                  type="text"
                  autoFocus={true}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="DEIN NAME"
                  className={`input-kave-btn `}
                  required
                />
              </label>
              <button
                type="submit"
                className={`kave-btn ${playerName ? "" : "empty"}`}
              >
                <span className="kave-line"></span>
                Beitreten
              </button>

              {emptyError && <p className="mt-4 text-red-500">{emptyError}</p>}
              {error && <p className="mt-4 text-red-500">{error}</p>}
            </form>
          )}

          {players.length > 1 && (
            <GameLobbyPanel />
          )}

          {loading && (
            <div className="mt-4 text-white flex gap-2 justify-center items-center bg-base-300 p-4">
              <p>Warte bist der Host das Spiel startet</p>
              <span className="loading loading-ring loading-md"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinGame;
