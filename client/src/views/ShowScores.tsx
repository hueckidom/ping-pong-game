import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerSessionData } from "../utils/types";
import { getScores } from "../api/api";

let canGoBack = false;
const ShowScores: React.FC = () => {
  const [highscores, setHighscores] = useState<PlayerSessionData[]>([]);
  const navigate = useNavigate();

  const handleKeyPress = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.key === " " && canGoBack) {
      navigate("/");
    }
  };

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scores = await getScores();

        // Sortieren nach Score und Filtern der Top 10
        const sortedScores = scores
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        setHighscores(sortedScores);
      } catch (error) {
        console.error("Error fetching high scores:", error);
      }
    };

    fetchScores();

    canGoBack = false;
    window.addEventListener("keydown", handleKeyPress);

    setTimeout(() => {
      canGoBack = true;
    }, 200);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [navigate]);

  return (
    <div className="hero min-h-screen bg-base-200">
      <button className="kbd fixed left-2 top-2 hover:opacity-60 text-lg" onClick={() => navigate("/")}>◀︎ Zurück</button>
      <div className="hero-content text-left flex-col bg-base-300 p-4 rounded-lg min-w-96">
        <div className="title-wrapper mb-12 floating">
          <h1 className="sweet-title sweet-title-mixed">
            <span data-text="Bestenliste">Bestenliste</span>
          </h1>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>Punkte</th>
              </tr>
            </thead>
            <tbody className="text-xl">
              {highscores.map((score, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{score.name}</td>
                  <td>{score.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShowScores;
