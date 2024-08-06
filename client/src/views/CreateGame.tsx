import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import buttonClickSound from "../assets/button-click-sound.mp3";
import backgroundMusic from "../assets/game.mp3";
import AudioComponent from "../components/Audio";
import { playSound } from "../utils/board";
import { apiUrl } from "../utils/config";
import { createSession, getSessionById, startGame } from "../api/api";

const CreateGame: React.FC<{
  onSubmit: (name: string, sessionId: string) => void;
}> = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emptyError, setEmptyError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isWaitingForPlayer, setIsWaitingForPlayer] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showInviteMessage, setShowInviteMessage] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await playSound(buttonClickSound);

    if (!name) {
      setEmptyError("Kein Inhalt. Bitte geben Sie Ihren Namen ein.");
      return;
    }

    try {
      setError(null)
      setLoading(true);
      await new Promise((resolve) => setTimeout(() => resolve(null), 500)); //little delay for animation purpose
      const response = await createSession(name);
      const sessionId = response.sessionId;
      if (sessionId) {
        setSessionId(sessionId);
        onSubmit(name, sessionId);
        const joinLink = `${window.location.origin}/#/join/${sessionId}`;
        setLink(joinLink);
        setIsWaitingForPlayer(true);
        setShowInviteMessage(true);
        pollForPlayers(sessionId);
      } else {
        throw new Error("Invalid response structure: No sessionId found");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Fehler beim erstellen des Spieles.");
    } finally {
      setLoading(false)
    }
  };

  const pollForPlayers = async (sessionId: string) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await getSessionById(sessionId);
        console.log("API Response:", response);

        const players = response.players || [];
        console.log("Number of players:", players.length);

        if (players.length > 1) {
          clearInterval(intervalId);
          setIsWaitingForPlayer(false);
          alert("Ein neuer Spieler ist dem Spiel beigetreten!");
        }
      } catch (err) {
        console.error("Error while polling for players:", err);
      }
    }, 2000);
  };

  const copyToClipboard = async () => {
    await playSound(buttonClickSound);
    if (link) {
      navigator.clipboard
        .writeText(link)
        .then(() => alert("Link copied to clipboard"))
        .catch((err) => console.error("Failed to copy: ", err));
    }
  };

  const onStartGame = async () => {
    await playSound(buttonClickSound);
    if (sessionId) {
      try {
        await startGame(sessionId);
        navigate(`/game/${sessionId}`);
      } catch (err) {
        console.error("Failed to start game:", err);
        setError("Failed to start the game. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center flex flex-col items-center">
          <div className="mb-12 floating">
            <h2 className="sweet-title sweet-title-purple mb-4">
              <span data-text="Spiel">Spiel</span>
            </h2>
            <h2 className="sweet-title sweet-title-mixed">
              <span data-text="Erstellen">Erstellen</span>
            </h2>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-4"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setEmptyError(null);
              }}
              placeholder="DEIN NAME"
              className="input-kave-btn"
              required
            />
            {isLoading ?
              <div className="text-md p-4">Wird erstellt... <span className="loading loading-spinner text-info"></span> </div> :
              <button type="submit" className={`kave-btn ${name ? "" : "empty"}`} disabled={isLoading}>
                <span className="kave-line"></span>
                Erstellen
              </button>
            }

            {emptyError && <p className="mt-4 text-red-500">{emptyError}</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}
            {link && (
              <button
                type="button"
                onClick={copyToClipboard}
                className={`kave-btn ${name ? "" : "empty"}`}
              >
                Copy Link
              </button>
            )}
          </form>

          {isWaitingForPlayer && (
            <div className="mt-4 text-white flex gap-2 justify-center items-center">
              <p>Warten auf weitere Spieler</p>
              <span className="loading loading-ring loading-md"></span>
            </div>
          )}

          {!isWaitingForPlayer && sessionId && (
            <button
              onClick={onStartGame}
              className={`kave-btn ${sessionId ? "active" : "empty"}`}
              style={{ marginTop: "17px" }}
            >
              <span className="kave-line"></span>
              Starte Spiel
            </button>
          )}

          {showInviteMessage && (
            <div className="hero-content text-left flex-col bg-base-300 p-4 rounded-lg min-w-96 absolute bottom-10 left-10">
              <p>Lade deine Freunde über Teams ein 😊</p>
            </div>
          )}
        </div>
      </div>
      <AudioComponent
        onAudioEnd={() => { }}
        path={backgroundMusic}
        volume={0.005}
      />
    </>
  );
};

export default CreateGame;
