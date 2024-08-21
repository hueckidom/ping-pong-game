import buttonClickSound from "../assets/button-click-sound.mp3";
import { HomeProps, gamepad } from "../utils/types";
import { useNavigate } from "react-router-dom";
import backgroundMusic from "../assets/game.mp3";
import valuehero2 from "../assets/valuehero.png";
import AudioComponent from "../components/Audio";
import { playSound } from "../utils/board";
import QuestionDialogCmp from "../components/QuestionDialog";
import { getRandomQuestion } from "../utils/question";

const Home: React.FC<HomeProps> = ({ }) => {
  const navigate = useNavigate();

  const goToGame = async () => {
    await playSound(buttonClickSound);
    navigate("/create-game");
  };
  const goToHighscore = async () => {
    await playSound(buttonClickSound);
    navigate("/scores");
  };

  return (
    <>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="">
            <div className="title-wrapper mb-12 floating">
              <div className="fixed w-full hero-img mb-20">
                <img
                  className="w-2/4 max-w-72 opacity-75"
                  src={valuehero2}
                />
              </div>
              <h1 className={"sweet-title-mixed sweet-title"}>
                <span data-text="#ValueHero">#ValueHero</span>
              </h1>
            </div>

            <div className="flex flex-col gap-4">
              <button
                className={"kave-btn"}
                onClick={goToGame}
              >
                <span className="kave-line"></span>
                SPIEL ERSTELLEN
              </button>
              <button className={"kave-btn"}
                onClick={goToHighscore}
              >
                <span className="kave-line"></span>
                Bestenliste
              </button>
            </div>
          </div>
        </div>
        {/* <QuestionDialogCmp
          question={getRandomQuestion()}
          isAnsweredQuestionCorrect={undefined}
          answeredQuestion={() => { }}
          value={"Verbundenheit"}
        /> */}
        <AudioComponent
          onAudioEnd={() => { }}
          path={backgroundMusic}
          volume={0.005}
        />
      </div >
    </>
  );
};

export default Home;
