import React, { useEffect, useState, useCallback, useRef } from "react";
import { Question, QuestionDialogProps, gamepad } from "../utils/types";
import {
  addGamePadListener,
  isDownPressed,
  isUpPressed,
  removeGamePadListener,
} from "../utils/gamepad";
import { gameDefaults } from "../views/Game";
import correctSound from "../assets/correct.mp3";
import wrongSound from "../assets/wrong.mp3";
import { playSound } from "../utils/board";

const state: any = {
  question: undefined,
  activeIndex: 0,
  isDone: false,
};

const QuestionDialogCmp: React.FC<QuestionDialogProps> = ({
  answeredQuestion,
  question,
  isAnsweredQuestionCorrect,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isWrong, setIsWrong] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timer, setTimer] = useState(gameDefaults.questionSeconds);
  let timeoutRef: any = useRef(null);

  useEffect(() => {
    if (isAnsweredQuestionCorrect == undefined) return;

    if (isAnsweredQuestionCorrect) {
      setIsCorrect(true);
      playSound(correctSound);
    } else {
      setIsWrong(true);
      playSound(wrongSound);
    }
  }, [isAnsweredQuestionCorrect]);

  const handleSpace = useCallback(() => {
    clearTimeout(timeoutRef.current);
    answeredQuestion(activeIndex);
  }, [activeIndex, question]);

  useEffect(() => {
    setIsWrong(false);
    setIsCorrect(false);
    setTimer(gameDefaults.questionSeconds);

    // if times is up we push a wrong question index
    timeoutRef.current = setTimeout(() => {
      answeredQuestion(-1);
    }, gameDefaults.questionSeconds * 1000);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      switch (event.key) {
        case "ArrowUp":
          setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
          break;
        case "ArrowDown":
          setActiveIndex((prevIndex) => (prevIndex < 3 ? prevIndex + 1 : 3));
          break;
        case " ":
          handleSpace();
          break;
        default:
          break;
      }
    },
    [handleSpace]
  );

  const gamePadhandler = useCallback(
    (input: gamepad) => {
      if (input.type === "button" && input.pressed) {
        handleSpace();
        return;
      }

      if (isDownPressed(input)) {
        setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
      }

      if (isUpPressed(input)) {
        setActiveIndex((prevIndex) => (prevIndex < 3 ? prevIndex + 1 : 3));
      }
    },
    [handleSpace]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    const padIndex = addGamePadListener(gamePadhandler);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      removeGamePadListener(gamePadhandler, padIndex);
    };
  }, [handleKeyPress, gamePadhandler]);

  return (
    <div className="hero min-h-screen bg-base-300 fixed z-20 top-0 opacity-95 backdrop-blur-md">
      <div className="hero-content text-left flex-col px-4">
        {!isWrong && !isCorrect && (
          <>
            <div className="title-wrapper mb-8 floating">
              <h1 className="sweet-title sweet-title-mixed game-title">
                <span data-text={timer}>{timer}</span>
              </h1>
            </div>
            <div className="text-2xl font-bold">{question?.question}</div>
            <div className="flex flex-col gap-2">
              <div
                className={`kbd w-full text-xl ${
                  activeIndex === 0 ? "bg-primary" : ""
                }`}
              >
                {question?.A}
              </div>
              <div
                className={`kbd text-xl ${
                  activeIndex === 1 ? "bg-primary" : ""
                }`}
              >
                {question?.B}
              </div>
              <div
                className={`kbd text-xl ${
                  activeIndex === 2 ? "bg-primary" : ""
                }`}
              >
                {question?.C}
              </div>
              <div
                className={`kbd text-xl ${
                  activeIndex === 3 ? "bg-primary" : ""
                }`}
              >
                {question?.D}
              </div>
            </div>
          </>
        )}

        {isWrong && (
          <div className="title-wrapper mb-8 splash-in">
            <h1 className="sweet-title sweet-title-red">
              <span data-text={"Falsch..."}>{"Falsch..."}</span>
            </h1>
          </div>
        )}

        {isCorrect && (
          <div className="title-wrapper mb-8 splash-in">
            <h1 className="sweet-title sweet-title-green">
              <span data-text={"Richtig!"}>{"Richtig!"}</span>
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDialogCmp;
