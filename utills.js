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

const fs = require('fs');
const path = require('path');

// Function to extract questions and answers from markdown content
function extractQuestionsFromMarkdown(markdownContent) {
  const questions = [];
  let currentQuestion = null;
  let questionId = 0;

  // Split content by lines
  const lines = markdownContent.split('\n');

  lines.forEach((line) => {
    // Identify question
    if (line.startsWith('### ')) {
      if (currentQuestion) {
        questions.push(currentQuestion); // Add the previous question
      }
      currentQuestion = {
        id: questionId,
        question: line.substring(4), // Remove '### '
        options: [],
        solutions: [],
      };
      questionId++;
    }

    // Identify options
    if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
      const optionText = line.substring(6); // Remove '- [ ] ' or '- [x] '
      currentQuestion.options.push(optionText);

      // If the option is correct (starts with [x]), add the index to solutions
      if (line.startsWith('- [x]')) {
        currentQuestion.solutions.push(currentQuestion.options.length - 1);
      }
    }
  });

  if (currentQuestion) {
    questions.push(currentQuestion); // Add the last question
  }

  return questions;
}

// Read the markdown file (replace with your file path)
const filePath = path.join(__dirname, 'README.md');
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Extract the questions
  const questionsJson = extractQuestionsFromMarkdown(data);

  // Write to a JSON file (output.json)
  fs.writeFile('output.json', JSON.stringify(questionsJson, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return;
    }
    console.log('Questions extracted and saved to output.json');
  });
});
