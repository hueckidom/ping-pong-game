import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addScores, getScores } from "../api/api";
import { gameState } from "../utils/game-state";

const state = {
  teamname: "",
  score: 0,
  isTop10: false
};

const EnterScore: React.FC = () => {
  const [teamName] = useState(gameState().teamName);
  const [score] = useState(gameState().score!);
  const [isScoreAtTopTen, setIsScoreAtTopTen] = useState(false);
  const isFetching = useRef<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);


  const navigate = useNavigate();

  /**
   * Checks and sumbits the score if its in the top 10
   */
  async function checkAndSubmitScore() {
    if (isFetching.current) {
      return;
    }

    if (gameState().teamName == "") {
      window.location.href = "/";
      return;
    }

    isFetching.current = true;
    const currentScores = await getScores();

    if (currentScores.length < 10 ||
      currentScores[currentScores.length - 1].score < gameState().score!) {
      setIsScoreAtTopTen(true);
      state.isTop10 = true;
      if (gameState().isHost && gameState()!.players!.length) {
        addScores(gameState().sessionId!, gameState().players![0].id, gameState().teamName!, gameState().score!);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    checkAndSubmitScore();

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case " ":
          handleNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handleNext = () => {
    navigate("/scores");
  };

  return (
    <>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center flex-col gap-4">
          <div className="text-3xl">{teamName}</div>
          <div className="text-3xl">
            <div className="sweet-title sweet-title-mixed mb-4">
              <span data-text={score}>
                {score}
              </span>
            </div>
            <span className="opacity-60">Punkte</span>
          </div>
          {!isLoading && <div className={(isScoreAtTopTen ? "text-yellow-200" : "") + " text-3xl mt-4 flex gap-2 justify-center items-center bg-base-300 p-4"} >
            {isScoreAtTopTen ? "Ihr habt es auf die Bestenliste geschafft!" : "Leider habt ihr es nicht auf die Bestenliste geschafft"}
          </div>}
          <button
            className={"kave-btn mt-2"}
            onClick={handleNext}
          >
            <span className="kave-line"></span>
            Weiter
          </button>
        </div>
      </div>
    </>
  );
};

export default EnterScore;
