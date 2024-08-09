import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessionById, joinRoom } from "../api/api";
import { updateGameState } from "../utils/game-state";

const JoinGame: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [playerName, setPlayerName] = useState("");
  const [emptyError, setEmptyError] = useState<string | null>(null);
  const [showInviteMessage, setShowInviteMessage] = useState<boolean>(false);
  const [isWaitingForPlayer, setIsWaitingForPlayer] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [joined, setJoined] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName && sessionId) {
      try {
        await joinRoom(sessionId, playerName);
        setJoined(true);
        setLoading(true);
        setIsWaitingForPlayer(true);

        // Start polling to check if the game has started
        pollForGameStart(sessionId);
      } catch (err) {
        setError("Failed to join the game. Please try again.");
        setLoading(false);
      }
    }
  };

  const pollForGameStart = (sessionId: string) => {
    const intervalId = setInterval(async () => {
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
          });
        }

        if (isGameStarted) {
          clearInterval(intervalId);
          setLoading(false);
          navigate(`/game/${sessionId}`);
        }
      } catch (err) {
        console.error("Error while polling for game start:", err);
      }
    }, 2000); // Poll every 2 seconds
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

          {joined && (
            <div className="mt-4">
              {isWaitingForPlayer && (
                <span>
                  Dein Name: <b>{playerName}</b>
                </span>
              )}
            </div>
          )}

          {loading && (
            <div className="mt-4 text-white flex gap-2 justify-center items-center bg-base-300 p-4">
              <p>Warte auf weiteren Spieler</p>
              <span className="loading loading-ring loading-md"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinGame;
