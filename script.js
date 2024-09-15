const questions = require('./questions.json');
const doneQuestions = require('./done.json');
const fs = require('fs');

const args = process.argv.slice(2);

const flags = args.reduce((acc, arg, i) => (arg.startsWith('--') ? { ...acc, [arg.replace('--', '')]: args[i + 1] } : acc), {
  dev: 'false',
  len: '65',
});

console.log('Parsed Flags:', flags);

function filterQuestions(data, keywords, excludeIndexes) {
  const lowerKeywords = keywords.map((keyword) => keyword.toLowerCase());

  return data.filter(
    (item) =>
      !excludeIndexes.includes(item.index) &&
      lowerKeywords.some(
        (keyword) =>
          item.question.toLowerCase().includes(keyword) || item.options.some((option) => option.toLowerCase().includes(keyword))
      )
  );
}

function writeToAlpine({ devMode = fase, length = 65, keywords = [] }) {
  console.log(`>>> params: devMode=${devMode}, length=${length}`);

  const shuffledQuestions = filterQuestions(questions, keywords, doneQuestions).sort(() => 0.5 - Math.random());
  const randomQuestions = shuffledQuestions.slice(0, length);

  const nextDoneQuestions = randomQuestions.map((q) => q.index);
  console.log('>>> questionscount: ', nextDoneQuestions.length);

  const alpineTmpl = fs.readFileSync('./alpine_tmpl.html', 'utf8');
  const stringToAdd = `<script> questions=${JSON.stringify(randomQuestions)} </script>`;

  let destination = devMode ? 'quizz.html' : '../../OneDrive/quizz.html';

  if (!devMode) {
    fs.writeFileSync('done.json', JSON.stringify([...doneQuestions, ...nextDoneQuestions]));
  }

  fs.writeFileSync(destination, alpineTmpl + stringToAdd, 'utf8');
}

// 15 + 20 + 30 + 53
writeToAlpine({
  devMode: flags.dev === 'true',
  length: +flags.len,
  keywords: [
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
    'Quick Starts',
    'Operational Excellence',
    'Performance Efficiency',
    'Cost Optimization',
    'Developer Support',
    'Concierge',
    'phone',
  ],
});

/* writeToAlpine(1000, [
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

// node script.js --dev true --len 10
