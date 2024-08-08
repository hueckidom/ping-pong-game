import React, { useEffect, useRef, useState } from "react";
import {
  BaseSettings,
  MultiplePlayerModeProps,
  GameSession,
  ball,
  GamePlayer,
  Question,
} from "../utils/types";
import { determineBoardWidth, playSound } from "../utils/board";
import { values } from "../utils/options";
import QuestionDialogCmp from "../components/QuestionDialog";

import questionSound from "../assets/questions.mp3";
import bubblePicture from "../assets/ball.png";
import BodenStaendigkeitBallImg from "../assets/b.png";
import LeistungBallImg from "../assets/l.png";
import RespektBallImg from "../assets/r.png";
import VerbundenheitBallImg from "../assets/vbh.png";
import Vertrauen from "../assets/v.png";
import hitSound from "../assets/Paddle Ball Hit Sound Effect HD.mp3";
import goalSound from "../assets/goal.mp3";
import backgroundMusic from "../assets/game.mp3";
import CountdownOverlay from "./CountdownOverlay";
import { GameHubClient } from "../api/gamehub";
import { SessionStorage, getSessionState } from "../utils/session-state";
import { getSessionById } from "../api/api";
import {
  askedQuestionsSet,
  checkAnswerToQuestion,
  getQuestionById,
  getRandomQuestion,
} from "../utils/question";

const INITIAL_GAME_DEFAULTS: BaseSettings = {
  velocityXIncrement: 1.2,
  baseVelocityX: 2.5,
  baseVelocityY: 1.7,
  boardHeightDivisor: 1.7,
  maxBoardWidth: 700,
  maxLife: 2,
  maxVelocityX: 7,
  moveSpeed: 6,
  playerHeight: 60,
  playerWidth: 10,
  player1KeyDown: "ArrowDown",
  player1KeyUp: "ArrowUp",
  player2KeyDown: "",
  player2KeyUp: "",
  volume: 0.06,
  questionSeconds: 20,
  pushInterval: 160,
};

export let gameDefaults: BaseSettings = { ...INITIAL_GAME_DEFAULTS };
export let gameHub = new GameHubClient();

export const assignGameDefaults = (settings: BaseSettings) => {
  gameDefaults = settings;
};

let animationFrame: number | null = null;
let gameSession: GameSession;
let sessionState: SessionStorage; // stored in the session storeage

// simple state management
const gameState = {
  timer: 0,
  score: 0,
  life: gameDefaults.maxLife,
  isHost: false,
  isPaused: false,
  question: undefined,
  isSpawningBubble: false
};

const GameField: React.FC<MultiplePlayerModeProps> = () => {
  const boardWidth = determineBoardWidth();
  const boardHeight = boardWidth / gameDefaults.boardHeightDivisor;
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const boardRef = useRef<HTMLCanvasElement | null>(null);
  const [gameEffect, setGameEffect] = useState<
    "shake" | "smallerPad" | "blackout" | "none" | "velocityYChange"
  >("none");

  const [currentValue, setCurrentValue] = useState<values>("Vertrauen");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBackgroundMusicPlaying, setBackgroundMusicPlaying] =
    useState<boolean>(false);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(0);
  const [life, setLife] = useState<number>(gameDefaults.maxLife);
  const timerRef = useRef<number | null>(null);
  const hasRunRef = useRef<boolean>(false);
  const [gameStared, setGameStarted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [question, setQuestion] = useState<Question | undefined>(undefined);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | undefined>(
    undefined
  );

  const backgroundAudio = new Audio(backgroundMusic);
  backgroundAudio.volume = 0.07;

  const player1: GamePlayer = {
    x: 2,
    y: boardHeight / 2,
    width: gameDefaults.playerWidth,
    height: gameDefaults.playerHeight,
    velocityY: 0,
    stopPlayer: false,
  };

  const player2: GamePlayer = {
    x: boardWidth - gameDefaults.playerWidth - 2,
    y: boardHeight / 2,
    width: gameDefaults.playerWidth,
    height: gameDefaults.playerHeight,
    velocityY: 0,
    stopPlayer: false,
  };

  const ball: ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: 32,
    height: 32,
    velocityX: gameDefaults.baseVelocityX,
    velocityY: gameDefaults.baseVelocityY,
  };

  const bubbleRef = useRef<any>(null);

  useEffect(() => {
    if (hasRunRef.current) return;
    backgroundAudio.play().then(() => (hasRunRef.current = true));
    askedQuestionsSet.clear();

    return () => {
      if (hasRunRef.current) {
        backgroundAudio.pause();
        backgroundAudio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!gameState.isHost) return;

    gameState.score = score;
    gameState.life = life;
    gameHub.pushPlayerScoreAndLife(gameSession.sessionId, {
      life,
      score,
    });
  }, [score, life]);


  useEffect(() => {
    gameState.question = question as any;
  }, [question]);

  useEffect(() => {
    gameState.timer = timer;
  }, [timer]);

  useEffect(() => {
    if (gameState.isHost && question) {
      gameHub.pushCurrentQuestion(gameSession.sessionId, {
        questionId: question.question,
      });
    }
  }, [question])

  useEffect(() => {
    if (!gameStared) return;

    initializeGame();
  }, [gameStared]);

  useEffect(() => {
    // if (life <= 0) {
    //   window.location.href = `/#/enter-score?score=${scoreRef.current}`;
    // }
  }, [life]);

  useEffect(() => {
    setCurrentValue(currentValue);

    switch (currentValue) {
      case "Bodenständigkeit":
        setGameEffect("shake");
        break;
      case "Leistung":
        setGameEffect("smallerPad");
        break;
      case "Respekt":
        setGameEffect("velocityYChange");
        break;
      case "Verbundenheit":
        setGameEffect("blackout");
        break;
      case "Vertrauen":
        setGameEffect("none");
        break;
    }
  }, [currentValue]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isPaused) {
        triggerPause();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    gameState.isPaused = isPaused;

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPaused]);

  useEffect(() => {
    boardRef.current = document.getElementById("board") as HTMLCanvasElement;
    if (boardRef.current) {
      boardRef.current.height = boardHeight;
      boardRef.current.width = boardWidth;
      contextRef.current = boardRef.current.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
    }

    return () => {
      cleanupGame();
    };
  }, []);

  const cleanupGame = () => {
    resetTimer();
    window.removeEventListener("keydown", movePlayer);
    window.removeEventListener("keyup", stopMovingPlayer);
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };

  const startTimer = () => {
    timerRef.current = window.setInterval(() => {
      if (!isPaused) {
        setTimer((prevTimer) => prevTimer + 1);
      }
    }, 1000);
  };

  const resetTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    setTimer(0);
  };

  const resetGameState = () => {
    gameState.life = gameDefaults.maxLife;
    gameState.score = 0;
    gameState.timer = 0;
  };

  const triggerPause = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  };

  const movePlayer = (e: KeyboardEvent) => {
    handlePlayerMovement(e, true);
  };

  const stopMovingPlayer = (e: KeyboardEvent) => {
    handlePlayerMovement(e, false);
  };

  const handlePlayerMovement = (e: KeyboardEvent, isKeyDown: boolean) => {
    const velocity = isKeyDown ? gameDefaults.moveSpeed : 0;

    const player = gameState.isHost ? player1 : player2;

    if (e.key === gameDefaults.player1KeyUp) {
      player.velocityY = -velocity;
      player.stopPlayer = !isKeyDown;
    } else if (e.key === gameDefaults.player1KeyDown) {
      player.velocityY = velocity;
      player.stopPlayer = !isKeyDown;
    }

    if (!outOfBound(player.y + player.velocityY)) {
      if (!player.stopPlayer) {
        player.y += player.velocityY;
      }
    }

    gameHub.detectPlayerMovement(gameSession.sessionId, {
      playerId: sessionState?.id!,
      y: player.y,
      x: player.x,
    });

    if (e.key === "p" || e.key === "Escape") {
      triggerPause();
    }
  };

  const animate = (): void => {
    animationFrame = requestAnimationFrame(animate);

    if (!gameState.isPaused && contextRef.current) {
      updateGameField();
    }
  };

  const updateGameField = () => {
    const context = contextRef.current!;
    context.clearRect(0, 0, boardWidth, boardHeight);

    drawPlayer(context, player1);
    drawPlayer(context, player2);

    if (gameState.isHost) {
      ball.x += ball.velocityX;
      ball.y += ball.velocityY;
    }

    drawBall(context);

    if (gameState.isHost) {
      checkBubbleCollisions();
      gameHub.detectBallMovement(gameSession.sessionId, {
        x: ball.x,
        y: ball.y,
      });
    }

    if (gameState.isHost) {
      updateBubblePosition();
    }

    drawBubble();
  };

  const drawPlayer = (
    context: CanvasRenderingContext2D,
    player: GamePlayer
  ) => {
    context.fillStyle = "#fff";

    context.fillRect(
      player.x,
      player.y,
      player.width,
      player.height - (gameEffect === "smallerPad" ? 15 : 0)
    );
  };

  const drawBall = (context: CanvasRenderingContext2D) => {
    const ballImg = new Image();
    ballImg.src = determineBallPicture(currentValue);
    context.drawImage(ballImg, ball.x, ball.y, ball.width, ball.height);

    if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
      ball.velocityY *= ball.velocityY > 3 || ball.velocityY < -3 ? -1 : -1.05;
    }

    if (detectCollision(ball, player1)) {
      handleBallCollision(player1);
    } else if (detectCollision(ball, player2)) {
      handleBallCollision(player2);
    }

    if (ball.x < 0 || ball.x + ball.width > boardWidth) {
      handleGoal();
    }
  };

  const detectCollision = (a: any, b: any) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  const handleBallCollision = (player: GamePlayer) => {
    playSound(hitSound);
    let collided = false;

    if (player === player1 && ball.x <= player1.x + player1.width) {
      ball.velocityX *=
        ball.velocityX < -gameDefaults.maxVelocityX
          ? -1
          : -gameDefaults.velocityXIncrement;
      collided = true;
    } else if (player === player2 && ball.x + ball.width >= player2.x) {
      ball.velocityX *=
        ball.velocityX > gameDefaults.maxVelocityX
          ? -1
          : -gameDefaults.velocityXIncrement;
      collided = true;
    }

    // if (gameEffect === "velocityYChange") {
    //   ball.velocityY = Math.random() * 3 + 1.5;
    // }

    if (collided && gameState.isHost) {
      setScore(gameState.score + gameState.timer);
    }
  };

  const handleGoal = () => {
    setLife((prevLife) => prevLife - 1);
    if (life > 0) {
      playSound(goalSound);
      resetBall();
    } else {
      setIsPaused(true);
    }
  };

  const resetBall = () => {
    ball.x = boardWidth / 2;
    ball.y = boardHeight / 2;
    ball.velocityX = gameDefaults.baseVelocityX;
    ball.velocityY = gameDefaults.baseVelocityY;
  };

  const outOfBound = (y: number) => {
    return y < 0 || y + player1.height > boardHeight;
  };

  const startBubbleTimer = () => {
    if (gameState.isSpawningBubble || !gameState.isHost) return;

    gameState.isSpawningBubble = true;
    const spawnInterval = Math.random() * 5000 + 12000;
    setTimeout(spawnBubble, spawnInterval);
  };

  const spawnBubble = () => {
    if (bubbleRef.current) return;
    bubbleRef.current = {
      x: boardWidth / 2,
      y: (Math.random() * boardHeight) / 1.5 + 20,
      radius: 26,
      velocityX: ball.velocityX,
      velocityY: 1.2,
    };

    if (gameState.isHost) {
      gameHub.pushSpawnQuestionBall(gameSession.sessionId, {
        x: bubbleRef.current.x,
        y: bubbleRef.current.y
      })
    }
  };

  const updateBubblePosition = () => {
    if (!bubbleRef.current) return;

    let newX = bubbleRef.current.x + bubbleRef.current.velocityX;
    let newY = bubbleRef.current.y + bubbleRef.current.velocityY;

    if (
      newX < bubbleRef.current.radius ||
      newX > boardWidth - bubbleRef.current.radius
    ) {
      bubbleRef.current.velocityX = -bubbleRef.current.velocityX;
      newX = bubbleRef.current.x + bubbleRef.current.velocityX;
    }
    if (
      newY < bubbleRef.current.radius ||
      newY > boardHeight - bubbleRef.current.radius
    ) {
      bubbleRef.current.velocityY = -bubbleRef.current.velocityY;
      newY = bubbleRef.current.y + bubbleRef.current.velocityY;
    }

    bubbleRef.current = { ...bubbleRef.current, x: newX, y: newY };

    gameHub.pushQuestionBallMovement(gameSession.sessionId, {
      x: bubbleRef.current.x,
      y: bubbleRef.current.y
    })
  };

  const drawBubble = () => {
    if (!bubbleRef.current) return;
    const bubbleImage = new Image();
    bubbleImage.src = bubblePicture;
    contextRef.current?.drawImage(
      bubbleImage,
      bubbleRef.current.x - bubbleRef.current.radius,
      bubbleRef.current.y - bubbleRef.current.radius,
      bubbleRef.current.radius * 2,
      bubbleRef.current.radius * 2
    );
  };

  const checkBubbleCollisions = () => {
    if (!bubbleRef.current) return;

    const checkBubbleCollision = (player: GamePlayer) => {
      if (!bubbleRef.current) return;

      const dx = bubbleRef.current!.x - (player.x + player.width / 2);
      const dy = bubbleRef.current!.y - (player.y + player.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (
        distance <
        bubbleRef.current!.radius + Math.max(player.width, player.height) / 2
      ) {
        handleBubbleTouch();
        bubbleRef.current = null;
      }
    };

    checkBubbleCollision(player1);
    checkBubbleCollision(player2);
  };

  const gameSessionId = () => {
    const hash = location.hash;
    const parts = hash.split("/");
    return parts[parts.length - 1];
  };

  const handleBubbleTouch = () => {
    const question = getRandomQuestion();
    setQuestion(question);

    setIsPaused(true);
    playSound(questionSound);
  };

  const answeredQuestion = (questionIndex: number) => {
    gameHub.pushAnsweredQuestion(gameSession.sessionId, { questionIndex });
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (gameState.isHost) {
      if (isCorrect) {
        setScore(gameState.score + timer);
      } else {
        setLife((prevLife) => prevLife - 1);
      }
    }

    setTimeout(() => {
      setQuestion(undefined);
      setIsAnswerCorrect(undefined);
      nextValue();
      triggerPause();
      gameState.isSpawningBubble = false;
      startBubbleTimer();
    }, 2000);
  };

  const initializeGame = async () => {
    try {
      await initializeHubSession();

      setIsCountdownActive(false);
      resetGameState();
      startTimer();
      setIsPaused(false);
      gameState.isSpawningBubble = false;
      animationFrame = requestAnimationFrame(animate);
      window.addEventListener("keydown", movePlayer);
      window.addEventListener("keyup", stopMovingPlayer);

      startBubbleTimer();
    } catch (err) {
      console.error(err);
    }
  };

  async function initializeHubSession() {
    try {
      gameSession = await getSessionById(gameSessionId());
      sessionState = getSessionState();

      if (
        gameSession?.players?.length &&
        gameSession?.players[0].id === sessionState.id
      ) {
        gameState.isHost = true;
      }

      await gameHub.start();
      registerHubEvents();
      await gameHub.joinLobby(gameSessionId());
    } catch (err) {
      alert("Unbekannter Fehler beim Versuch das Spiel zu starten!");
      throw err;
    }
  }

  async function registerHubEvents() {
    const callbacks = {
      receiveMessage: (message: string) => { },
      receivePlayerMovement: (playerId: string, x: number, y: number) => {
        const isMe = sessionState?.id === playerId;
        if (isMe) return;

        const player = gameState.isHost ? player2 : player1;
        player.x = x;
        player.y = y;
      },
      receiveScoreAndLife: (score: number, life: number) => {
        if (!gameState.isHost) {
          setScore(score);
          setLife(life);
        }
      },
      receiveBallMovement: (x: number, y: number) => {
        if (!gameState.isHost) {
          ball.x = x;
          ball.y = y;
        }
      },
      receiveQuestionBallMovement: (x: number, y: number) => {
        if (!gameState.isHost && bubbleRef.current) {
          bubbleRef.current.x = x;
          bubbleRef.current.y = y;
        } 
      },
      receivedCurrentQuestion: (questionId: string) => {
        if (!gameState.isHost) {
          bubbleRef.current = null;
          setIsPaused(true);
          playSound(questionSound);
          const question = getQuestionById(questionId);
          setQuestion(question);
        }
      },
      receiveBallSize: (width: number, height: number) => {
        console.log(`Ball size is (${width}, ${height})`);
      },
      receivedAnsweredQuestion: (questionindex: number) => {
        const isCorrect = checkAnswerToQuestion(question!, questionindex);
        setIsAnswerCorrect(isCorrect);
        handleAnswer(isCorrect);
      },
      receivedDetectSpawnQuestionBall: (x: number, y: number) => {
        if (bubbleRef.current) return;
        bubbleRef.current = {
          x,
          y,
          radius: 26,
          velocityX: ball.velocityX,
          velocityY: 1.2,
        };
      }
    };

    gameHub.registerOnServerEvents(callbacks);
  }

  const nextValue = () => {
    const valueQueue: values[] = [
      "Vertrauen",
      "Bodenständigkeit",
      "Leistung",
      "Verbundenheit",
      "Respekt",
    ];
    const currentIndex = valueQueue.indexOf(currentValue);
    const nextIndex = (currentIndex + 1) % valueQueue.length;
    setCurrentValue(valueQueue[nextIndex]);
  };

  const determineBallPicture = (value: values) => {
    switch (value) {
      case "Bodenständigkeit":
        return BodenStaendigkeitBallImg;
      case "Leistung":
        return LeistungBallImg;
      case "Respekt":
        return RespektBallImg;
      case "Verbundenheit":
        return VerbundenheitBallImg;
      case "Vertrauen":
        return Vertrauen;
    }
  };

  return (
    <section className="flex-1 text-center fixed w-full h-full flex justify-center align-middle items-center left-0 top-0 flex-col">
      {/* Values */}
      <div className="my-8 text-md flex gap-2 justify-center align-middle">
        <span className="opacity-75">Ihr haltet gerade gemeinsam den Wert</span>
        <div className="title-wrapper game-wrapper floating">
          <h1 className="sweet-title game-title sweet-title-mixed">
            <span data-text={currentValue}>{currentValue}</span>
          </h1>
        </div>
        <span className="opacity-75">hoch!</span>
      </div>
      {/* Game board */}
      <div
        className={`gradient-border ${gameEffect === "shake"
          ? "shake-effect"
          : gameEffect === "blackout"
            ? "blackout-effect"
            : ""
          }`}
      >
        <canvas
          className="bg-base-300 mt-10 m-auto shadow-lg"
          id="board"
        ></canvas>
      </div>
      {/* Score */}
      <div className="stats shadow-xl bg-base-200 p-2 mt-8">
        <div className="stat place-items-center">
          <div className="stat-title">Zeit</div>
          <div className="stat-value opacity-75">{timer}s</div>
        </div>
        <div className="stat place-items-center">
          <div className="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Punkte</div>
          <div className="stat-value text-secondary glow">{score}</div>
        </div>
        <div className="stat place-items-center">
          <div className="stat-figure text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Leben</div>
          <div className="stat-value opacity-75">{life}</div>
        </div>
      </div>

      {question && (
        <QuestionDialogCmp
          question={question}
          isAnsweredQuestionCorrect={isAnswerCorrect}
          answeredQuestion={answeredQuestion}
          value={currentValue}
        />
      )}
      {isCountdownActive && (
        <CountdownOverlay onCountdownComplete={() => setGameStarted(true)} />
      )}
    </section>
  );
};

export default GameField;
