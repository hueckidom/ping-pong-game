import { values } from "./options";

export type gamepad = {
  type: "button" | "pad";
  pressed: boolean;
  isRelease: boolean;
  index: number;
  value: number;
  gamepadIndex: number;
};

export type GamePlayer = {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  stopPlayer?: boolean;
  sessionData?: PlayerSessionData;
};

export type ball = GamePlayer & {
  velocityX: number; // shhifting by 2px
};

export interface HighScoreProps { }

export interface HomeProps { }
export interface AudioComponentProps {
  onAudioEnd: () => void;
  path: string;
  volume: number;
}

export interface QuestionDialogProps {
  value: values;
  question: Question;
  answeredQuestion: (index: number) => void;
  isAnsweredQuestionCorrect: boolean | undefined;
}

export interface MultiplePlayerModeProps {
  settings: SettingProps;
}

export interface SinglePlayerModeProps {
  settings: SettingProps;
}

export interface SettingProps {
  speedOption: string;
  pointOption: number;
}

export interface Score {
  name?: string;
  score: number;
}

export interface Question {
  question: string;
  A: string;
  B: string;
  C: string;
  D: string;
  answer: string;
}

export interface BaseSettings {
  velocityXIncrement: number;
  baseVelocityX: number;
  baseVelocityY: number;
  maxLife: number;
  maxVelocityX: number;
  moveSpeed: number;
  playerWidth: number;
  playerHeight: number;
  boardHeightDivisor: number;
  maxBoardWidth: number;
  player2KeyUp: string;
  player2KeyDown: string;
  player1KeyUp: string;
  player1KeyDown: string;
  volume: number;
  questionSeconds: number;
  pushInterval: number;
}

export interface PlayerSessionData {
  sessionId: string;
  id: string;
  name: string | null;
  score: number;
}

export interface GameSession {
  sessionId: string;
  players: PlayerSessionData[] | null;
  isSessionRunning: boolean;
}
export interface PlayerPosition {
  playerId: string;
  x: number;
  y: number;
}

export interface PlayerScoreAndLife {
  score: number;
  life: number;
}

export interface QuestionItem {
  questionId: string;
}

export interface AnswerQuestionItem {
  questionIndex: number;
}

export interface BallPosition {
  x: number;
  y: number;
}

export interface BallSize {
  width: number;
  height: number;
}
