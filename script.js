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

const questions = extractQuestionsAndOptions();
console.log(questions);

//
function formatQuestionsInHTML(jsonData) {
  return [
    `
      <script>
        function showSolution(node, solution) {
          node.insertAdjacentText('afterend', solution);
        }
      </script>`,
    ...jsonData.map((item, index) => {
      const questionText = `
      <strong>Question ${index + 1}:</strong> ${item.question}
      `;

      // Format the options with uppercase letters
      const optionsText = item.options
        .map((option, i) => {
          const letter = String.fromCharCode(65 + i); // 'A', 'B', 'C', etc.
          return `
      <strong>${letter}</strong>: ${option}`;
        })
        .join('<br>');

      const solutionText = item.solutions
        .map((solutionIndex) => {
          const letter = String.fromCharCode(65 + solutionIndex);
          return `option ${letter}`;
        })
        .join(', ');

      const solutionSection = `
      <button style="margin-right: 1rem;" onclick="showSolution(this, '${solutionText}')">SOLUTION</button>
      `;

      const separator = '<hr>';

      return [questionText, optionsText, solutionSection, separator].join('<br><br>');
    }),
  ].join('');
}

console.log(formatQuestionsInHTML(questions));

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

const uniqueArray = removeDuplicateQuestions(questions);
console.log(uniqueArray);
