import questions from "../assets/questions.json";
import { Question } from "./types";
export const askedQuestionsSet = new Set();

export function getRandomQuestion() {
  let remainingQuestions = questions.filter(
    (q) => !askedQuestionsSet.has(q.question)
  );
  if (remainingQuestions.length === 0) {
    askedQuestionsSet.clear();
    remainingQuestions = questions;
  }
  const randomQuestion =
    remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
  askedQuestionsSet.add(randomQuestion.question);
  return randomQuestion;
}

export function getQuestionById(id: string) {
  const foundQuestion = questions.find((question) => question.question == id);
  return foundQuestion;
}

const indexToAlpha = (index: number): string => {
  switch (index) {
    case 0:
      return "A";
    case 1:
      return "B";
    case 2:
      return "C";
    case 3:
      return "D";
    default:
      return "FAIL";
  }
};

export function checkAnswerToQuestion(question: Question, answerIndex: number) {
  const answerAlpha = indexToAlpha(answerIndex);
  if (answerAlpha === question?.answer) {
    return true;
  }

  return false;
}
