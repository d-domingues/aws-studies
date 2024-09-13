function extractQuestionsAndOptions() {
  const questionElements = document.querySelectorAll('div.result-pane--question-result-pane--EdDud');

  return Array.from(questionElements).map((questionElement) => {
    const questionText = Array.from(questionElement.querySelectorAll('div.result-pane--question-format--NZ-V1 p'))
      .map((node) => node.innerText.trim())
      .join('');

    const optsAndCorrect = Array.from(questionElement.querySelectorAll('.result-pane--answer-result-pane--HLvLj')).reduce(
      (acc, next, idx) => ({
        options: [...acc.options, next.querySelector('div.answer-result-pane--answer-body--6Y3ge p').innerText.trim()],
        solutions: next.querySelector('.answer-result-pane--answer-correct--wjhP-') ? [...acc.solutions, idx] : acc.solutions,
      }),
      { options: [], solutions: [] }
    );

    return {
      question: questionText,
      ...optsAndCorrect,
    };
  });
}

function removeDuplicateQuestions(arr) {
  const seenQuestions = new Set();
  const resultArray = [];

  arr.forEach((obj, idx) => {
    if (!seenQuestions.has(obj.question)) {
      seenQuestions.add(obj.question);
      resultArray.push({ ...obj }); // Adding a copy of the object
    }
  });

  return resultArray;
}

/*    function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  function shuffleQuestionsAndOptions(data) {
    return shuffle(data).map((q) => ({ ...q, options: shuffle(q.options) }));
  } */

// const optionNodes = [...optsList.children];
// optionNodes.sort(() => Math.random() - 0.5);
// optionNodes.forEach((optNode) => optsList.appendChild(optNode));

// document.querySelector('ul').childNodes;
