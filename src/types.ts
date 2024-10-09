export type Question = {
  id: string;
  question: string;
  options: string[];
  solutions: number[];
};

export type QuestionsWithAnswers = Question & { answers: string[] };
