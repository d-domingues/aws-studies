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
  const lowerKeywords = keywords.length ? keywords.map((keyword) => keyword.toLowerCase()) : [''];

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
  console.log('>>> questions count: ', nextDoneQuestions.length);

  const alpineTmpl = fs.readFileSync('./alpine_tmpl.html', 'utf8');
  const stringToAdd = `<script> globalThis.questionsIdxs=${JSON.stringify(randomQuestions.map((q) => q.index))}; </script>`;

  let destination = devMode ? 'quiz.html' : '../../OneDrive/quizes/quiz.html';

  if (!devMode) {
    fs.writeFileSync('done.json', JSON.stringify([...doneQuestions, ...nextDoneQuestions]));
  }

  fs.writeFileSync(destination, alpineTmpl + stringToAdd, 'utf8');
}

const keywords = [
  // 1. Networking
  [
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
  ],
  // 2. Cloud Architecture & Partner Solutions
  [
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
    'Marketplace',
  ],
  // 3. Cost Management & Pricing (64, 65)
  ['cost', 'discount', 'Pricing', 'Calculator', 'pay-as-you-go', 'price', 'Budget', 'billing', 'Compute Optimiz', 'Saving'],
  // 4. Infrastructure Security and Threat Management:
  [
    'TLS',
    'SSL',
    'cerfificate',
    'HTTPS',
    'ACM',
    'Certificate Manager',
    'KMS',
    'Key Management',
    'Secrets',
    'Firewall',
    'WAF',
    'Shield',
    'GuardDuty',
    'Detective',
    'Inspector',
    'IAM',
    'cognito',
    'Identity and Access Management',
    'Macie',
    'Security Hub',
    'Control Tower',
    'Bucket Policies',
  ],
  // 5. Monitoring, Auditing, and Compliance:
  [
    'CloudWatch',
    'Logs',
    'Metrics',
    'CloudTrail',
    'Health',
    'aws Config',
    'Compliance',
    'Advisor',
    'Systems Manager',
    'Trusted Advisor',
    'Amazon EventBridge',
    'Audit Manager',
  ],
  // 6.
  ['cloudfront'],
];

// node script.js --dev true --len 10
writeToAlpine({
  devMode: flags.dev === 'true',
  length: +flags.len,
  keywords: keywords[+flags.topic - 1],
});
