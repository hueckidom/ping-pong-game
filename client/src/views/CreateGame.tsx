import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import buttonClickSound from "../assets/button-click-sound.mp3";
import backgroundMusic from "../assets/game.mp3";
import AudioComponent from "../components/Audio";
import { playSound } from "../utils/board";
import { createSession, getSessionById, startGame } from "../api/api";
import { PlayerSessionData } from "../utils/types";
import { setSessionState } from "../utils/session-state";

let playerPollIntervall: any;
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
  const [showCopyMessage, setShowCopyMessage] = useState<boolean>(false);
  const [players, setPlayers] = useState<PlayerSessionData[]>([]);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await playSound(buttonClickSound);

    if (!name) {
      setEmptyError("Kein Inhalt. Bitte geben Sie Ihren Namen ein.");
      return;
    }

    try {
      setError(null);
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
      setLoading(false);
    }
  };

  const pollForPlayers = async (sessionId: string) => {
    playerPollIntervall = setInterval(async () => {
      try {
        const response = await getSessionById(sessionId);
        const players = response.players || [];

        const me = players[0];
        setSessionState(me.name ?? "random1", me.id, sessionId, true);

        console.log("Number of players:", players.length);

        if (players.length > 1) {
          setIsWaitingForPlayer(false);
          setPlayers(players);
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
        .catch((err) => console.error("Failed to copy: ", err));
      setShowCopyMessage(true);

      setTimeout(() => {
        setShowCopyMessage(false);
      }, 2000);
    }
  };

  const onStartGame = async () => {
    await playSound(buttonClickSound);
    if (sessionId) {
      try {
        clearInterval(playerPollIntervall);
        await startGame(sessionId);
        navigate(`/game/${sessionId}`);
      } catch (err) {
        console.error("Failed to start game:", err);
        setError("Failed to start the game. Please try again.");
      }
    }
  };

  // Componentn <CreateButton>
  const CreateButton = () => {
    if (isWaitingForPlayer) {
      return <></>;
    }

    if (isLoading) {
      return (
        <div className="text-md p-4">
          {" "}
          Wird erstellt...{" "}
          <span className="loading loading-spinner text-info"></span>{" "}
        </div>
      );
    }

    return (
      <button
        type="submit"
        className={`kave-btn ${name ? "" : "empty"}`}
        disabled={isLoading}
      >
        <span className="kave-line"></span>
        Erstellen
      </button>
    );
  };

  // Component NameInput
  const NameInput = () => {
    if (isWaitingForPlayer) {
      return (
        <span>
          Dein Name : <b> {name}</b>
        </span>
      );
    }

    return (
      <input
        type="text"
        value={name}
        autoFocus={true}
        onChange={(e) => {
          setName(e.target.value);
          setEmptyError(null);
        }}
        placeholder="DEIN NAME"
        className="input-kave-btn"
        required
      />
    );
  };

  // Component GameLobbyPanel, if more than 1 players joined and we are rdy
  const GameLobbyPanel = () => {
    return (
      <>
        {players.map((value, index) => {
          if (index == 0)
            return (
              <span className="text-yellow-200 font-bold">
                Spieler 1(du) : {value.name}
              </span>
            );
          if (index == 1)
            return (
              <span className="text-blue-500 font-bold">
                Spieler 2 : {value.name}
              </span>
            );

          return <span>Zuschauer : {value.name}</span>;
        })}
      </>
    );
  };

  const CreateGamePanel = () => {
    if (players.length > 1) {
      return <GameLobbyPanel />;
    }

    return (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4"
      >
        <NameInput />
        <CreateButton />

        {emptyError && <p className="mt-4 text-red-500">{emptyError}</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}

        {showInviteMessage && (
          <div className="hero-content text-left flex-col bg-base-300 p-4 rounded-lg">
            <p>Leite den Einladungslink an deinen Mitspieler weiter 😊</p>
          </div>
        )}
        {link && (
          <div className="relative">
            <span className="text-xs">{link}</span>
            <button
              type="button"
              onClick={copyToClipboard}
              className="btn btn-neutral btn-sm ml-2"
            >
              Kopieren
            </button>
            {showCopyMessage && (
              <div className="hero-content text-right flex-col bg-base-300 p-2 animate-bounce opacity-80 rounded-lg text-xs text-green-300 absolute w-full">
                <p>Link in zwischenablage kopiert</p>
              </div>
            )}
          </div>
        )}

        {isWaitingForPlayer && (
          <div className="mt-4 text-white flex gap-2 justify-center items-center bg-base-300 p-4">
            <p>Warte auf weiteren Spieler</p>
            <span className="loading loading-ring loading-md"></span>
          </div>
        )}
      </form>
    );
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

          <CreateGamePanel />
          {players.length > 1 && (
            <button
              onClick={onStartGame}
              className={`kave-btn ${sessionId ? "active" : "empty"}`}
              style={{ marginTop: "17px" }}
            >
              <span className="kave-line"></span>
              Starte Spiel
            </button>
          )}
        </div>
      </div>
      <AudioComponent
        onAudioEnd={() => {}}
        path={backgroundMusic}
        volume={0.005}
      />
    </>
  );
};

export default CreateGame;
