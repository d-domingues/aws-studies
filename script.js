const questions = require('./questions.json');
const doneQuestions = require('./done.json');
const fs = require('fs');

function formatQuestionsInHTML(jsonData) {
  const progress = `<progress value="0" max="${jsonData.length}"></progress>`;

  const skipQuizzBtn = '<button onclick="onFinish(); this.hidden = true;">SKIP QUIZZ</button>';

  const report = `
  <div hidden>
    <b id="correct-count">Correct count:</b>
    <b id="incorrect-answers">Incorrect answers:</b>
    <b id="rate">Rate:</b>
    <hr>
  </div>
`;

  const script = `
<script>
  window.onload = function() {
    shuffleForm();
  };

  let correct = 0;
  let incorrectAnswers = [];

  function onChange(formNode, solution) {
    const formData = new FormData(formNode);
    const formValue = [...formData.keys()].map((key) => key);
    isCorrectAnswer = solution.every(el => formValue.includes(String(el)));
    
    if (formValue.length == solution.length) {
      document.querySelector('progress').value += 1;
      formNode.hidden = true;

      // correct answer
      if (isCorrectAnswer) correct++;
      else incorrectAnswers.push([...document.forms].indexOf(formNode) + 1)
      
      const nextForm = formNode?.nextElementSibling;
      
      // next question
      if (+formNode.dataset.formidx < ${jsonData.length - 1}) nextForm.hidden = false;
      // end of quizz
      else onFinish();
    }
  }

  function onFinish() {
    document.body.classList.add('show-correct')
    document.querySelectorAll('input[type="checkbox"]')?.forEach(el => el.disabled = true)

    document.querySelector('#correct-count')?.insertAdjacentText('afterend', ' ' + correct);
    document.querySelector('#incorrect-answers')?.insertAdjacentText('afterend', ' ' + incorrectAnswers); 

    const rate = Math.floor(correct / ${jsonData.length} * 100);
    document.querySelector('#rate')?.insertAdjacentText('afterend', ' ' + rate + '% ' + (rate >= 70 ? '(PASS)' : '(FAIL)'));
    document.querySelectorAll('[hidden]').forEach(n => n.hidden = false);
  }
  
  function shuffleForm() {
    document.querySelectorAll('.options-list').forEach(optsList => {
      const optionNodes = [...optsList.children];
      optionNodes.sort(() => Math.random() - 0.5);
      optionNodes.forEach(optNode => optsList.appendChild(optNode));
    })
  }
</script>`;

  const styles = `
<style>
  body {
    font-family: sans-serif;
    font-size: 1.2rem;
  }

  body.show-correct .correct-answer {
    outline: lightgreen 4px solid;
  }

  progress {
    display: block;
    width: auto;
  }

  #correct-count, #incorrect-answers, #rate {
    display: block;
  }

  form {
    margin-bottom: 2rem;
  }

  ul {
    list-style-type: none;
    padding: 0;

    & label{
      line-height: 2.2rem
    }
  }
</style>
`;

  const html = jsonData.reduce((acc, item, index) => {
    const questionText = `<strong>Question ${index + 1}:</strong> ${item.question}`;

    const optionsText = item.options.reduce((acc, option, i) => {
      const input = `<input type="checkbox" name="${i}" id="opt-${index}-${i}" />`;
      const label = `<label for="opt-${index}-${i}">${option}</label>`;
      return `${acc}
      <li class=${item.solutions.includes(i) ? 'correct-answer' : ''}>
        ${input}
        ${label}
      </li>`.trim();
    }, '');

    const formWarpper = `
<form data-formidx="${index}"  ${index != 0 ? 'hidden' : ''} onchange="onChange(this, ${JSON.stringify(item.solutions)})">
  ${questionText}
  <ul class="options-list">
    ${optionsText}
  </ul>
</form>`;

    return `${acc}${formWarpper}`.trim();
  }, '');

  return `${styles}${skipQuizzBtn}${progress}${report}${html}${script}`.trim();
}

function filterQuestionsByKeywords(keywords = []) {
  if (keywords.length == 0) return questions;

  return questions.filter(
    (q) =>
      !doneQuestions.includes(q.index) &&
      keywords.some((keyword) => {
        const lowerKeyword = keyword.toLowerCase().trim();
        return (
          q.question.toLowerCase().includes(lowerKeyword) ||
          q.options.some((option) => option.toLowerCase().includes(lowerKeyword))
        );
      })
  );
}

// Write the random questions to an HTML file
function createExamFile(nQuestions, keywords = []) {
  const shuffledQuestions = filterQuestionsByKeywords(keywords).sort(() => 0.5 - Math.random());
  const randomQuestions = shuffledQuestions.slice(0, nQuestions);

  const htmlContent = formatQuestionsInHTML(randomQuestions);
  const nextDoneQuestions = randomQuestions.map((q) => q.index);

  fs.writeFileSync('exam.html', htmlContent);
  fs.writeFileSync('done.json', JSON.stringify([...doneQuestions, ...nextDoneQuestions]));
}

createExamFile(30, [
  'vpn',
  'vpc',
  'Gateway',
  'NAT',
  'NACL',
  'Security Groups',
  'Direct Connect',
  'PrivateLink',
  'Transit Gateway',
  'endpoint',
  'Route table',
  'subnet',
]);
