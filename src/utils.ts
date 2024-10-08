import { Question } from './types';

export function fisherYatesShuffle(array: any[]) {
  let i = array.length;
  while (i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

export function verifyAnswer(answer: string[], solution: number[]) {
  return answer.every((e) => solution.includes(+e));
}

export function compareAnswers(questionList: Question[], history: string[][]) {
  return questionList.reduce(
    (acc, next, idx) => {
      try {
        const isCorrect = history[idx].every((e) => next.solutions.includes(+e));
        if (isCorrect) {
          return [acc[0], [...acc[1], next.id], acc[2]];
        }
      } catch (error) {
        return acc;
      }

      return [[...acc[0], idx], acc[1], [...acc[2], next.id]];
    },
    [[], [], []] as any[][]
  );
}

export function filterQuestions(data: Question[], keywords: string[], excludeIds: string[]) {
  const lowerKeywords = keywords.length ? keywords.map((keyword) => keyword.toLowerCase()) : [''];

  return data.filter(
    (item) =>
      !excludeIds.includes(item.id) &&
      lowerKeywords.some(
        (keyword) =>
          item.question.toLowerCase().includes(keyword) || item.options.some((option) => option.toLowerCase().includes(keyword))
      )
  );
}
