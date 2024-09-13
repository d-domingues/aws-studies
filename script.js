const questions = require('./questions.json');
const doneQuestions = require('./done.json');
const fs = require('fs');

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

function writeToAlpine(nQuestions) {
  const shuffledQuestions = filterQuestionsByKeywords().sort(() => 0.5 - Math.random());
  const randomQuestions = shuffledQuestions.slice(0, nQuestions);

  const nextDoneQuestions = randomQuestions.map((q) => q.index);
  console.log(nextDoneQuestions.length);

  const alpineTmpl = fs.readFileSync('./alpine_tmpl.html', 'utf8');
  const stringToAdd = `<script> questions=${JSON.stringify(randomQuestions)} </script>`;

  fs.writeFileSync('quizz.html', alpineTmpl + stringToAdd, 'utf8');
  // fs.writeFileSync('../../OneDrive/quizz.html', alpineTmpl + stringToAdd, 'utf8');
  // fs.writeFileSync('done.json', JSON.stringify([...doneQuestions, ...nextDoneQuestions]));
}

// 15 + 20 + 30 + 53
writeToAlpine(15, [
  'Architected',
  'pillar',
  'framework',
  'Responsibility',
  'CAF',
  'Adoption',
  'Partner Network',
  'APN',
  'Support',
  'Enterprise',
  'Partner Solution',
  'Operational Excellence',
  'Performance Efficiency',
  'Cost Optimization',
  'Developer Support',
  'Concierge',
  'phone',
]);

/* 
writeToAlpine(1000, [
  'vpn',
  'vpc',
  'Gateway',
  'NAT',
  'access control',
  'NACL',
  'Security Group',
  'Direct Connect',
  'PrivateLink',
  'Transit',
  'endpoint',
  'Route table',
  'subnet',
  'flow log',
  'site-to-site',
  'virtual private',
  'customer gateway',
]);
 */
