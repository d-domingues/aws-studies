const fs = require('fs');
const questions = require('./questions.json');

function formatQuestionsInHTML(jsonData) {
  const progress = `<progress value="0" max="${jsonData.length}" style="display:block;width:auto;"></progress>`;

  const newLine = '<br><br>';

  const skipQuizzBtn = '<button onclick="onFinish(); this.hidden = true;">SKIP QUIZZ</button>';

  const report = `
  <div hidden>
    <b id="correct-count">Correct count:</b>
    <br>
    <b id="incorrect-answers">Incorrect answers:</b>
    <br>
    <b id="rate">Rate:</b>
    <br>
    <br>
    <hr>
  </div>
`;

  const script = `
<script>
  let correct = 0;
  let incorrectAnswers = [];

  function showFormData(formNode, solution) {
    const formData = new FormData(formNode);
    const formValue = [...formData.keys()].map((key) => key);
    isCorrectAnswer = solution.every(el => formValue.includes(String(el)));
    
    console.log(formValue, solution);
    console.log(isCorrectAnswer)

    if (formValue.length == solution.length) {
      formNode.hidden = true;

      // correct answer
      if (isCorrectAnswer) correct++;
      else incorrectAnswers.push([...document.forms].indexOf(formNode) + 1)
      
      const nextForm = formNode?.nextElementSibling;
      // next question
      if (nextForm) {
        nextForm.hidden = false;
        document.querySelector('progress').value += 1;
      }
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
    document.querySelector('#rate')?.insertAdjacentText('afterend', ' ' + rate + '% ' + (rate >= 70 ? '(PASS 🏆)' : '(FAIL 😞)'));
    document.querySelectorAll('[hidden]').forEach(n => n.hidden = false);
  }
</script>`;

  const styles = `
<style>
  body {
    font-family: sans-serif;
  }

  body.show-correct .correct-answer {
    outline: lightgreen 4px solid;
  }
</style>
`;

  const html = jsonData
    .map((item, index) => {
      const questionText = `<strong>Question ${index + 1}:</strong> ${item.question}`;

      const optionsText = item.options
        .map((option, i) => {
          const styleClass = item.solutions.includes(i) ? 'correct-answer' : '';

          return `
  <input class="${styleClass}" type="checkbox" name="${i}" id="opt-${index}-${i}" onchange="showFormData(this.parentNode, ${JSON.stringify(
            item.solutions
          )})" />
  <label style="line-height: 2.2rem;" for="opt-${index}-${i}">${option}</label>
  `;
        })
        .join('<br>');

      return `
<form style="font-size: 1.2rem;" ${index != 0 ? 'hidden' : ''}>
  ${questionText}
  ${newLine}
  ${optionsText}
  ${newLine}
</form>`;
    })
    .join('');

  return `${progress}${styles}${script}${skipQuizzBtn}${report}${html}`;
}

function filterQuestionsByKeywords(keywords = []) {
  if (keywords.length == 0) return questions;

  return questions.filter((q) =>
    keywords.some((keyword) => {
      const lowerKeyword = keyword.toLowerCase().trim();
      return (
        q.question.toLowerCase().includes(lowerKeyword) || q.options.some((option) => option.toLowerCase().includes(lowerKeyword))
      );
    })
  );
}

// Write the random questions to an HTML file
function createExamFile(nQuestions, keywords = []) {
  const shuffled = filterQuestionsByKeywords(keywords).sort(() => 0.5 - Math.random());
  const randomQuestions = shuffled.slice(0, nQuestions);
  const htmlContent = formatQuestionsInHTML(randomQuestions);

  fs.writeFileSync('exam.html', htmlContent);
  console.log('exam.html has been created!');
}

createExamFile(30, [
  'vpn',
  'vpc',
  'Internet Gateway',
  'NAT Gateway',
  'NACL',
  'Security Groups',
  'Direct Connect',
  'PrivateLink',
  'Transit Gateway',
]);
