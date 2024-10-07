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
