import persist from '@alpinejs/persist';
import Alpine from 'alpinejs';
// import { Amplify } from 'aws-amplify';
import '../style.css';
// import amplifyconfig from './amplifyconfiguration.json'; // Path may vary
import { QuestionsWithAnswers } from './types';
import { compareAnswers, fisherYatesShuffle } from './utils';

// Amplify.configure(amplifyconfig);
Alpine.plugin(persist);
window.Alpine = Alpine;

/**
 *
 * QUIZ
 *
 */
Alpine.data('quiz', () => ({
  questions: Alpine.$persist<QuestionsWithAnswers[] | null>(null).as('questions'),
  answerIdx: 0,
  finished: false,

  init() {
    if (!this.questions) {
      return (window.location.href = '/');
    }

    this.$watch('answerIdx', (value: number) => (this.finished = value < 0));

    const updateAnswerIdx = (questions: QuestionsWithAnswers[]) =>
      (this.answerIdx = questions?.findIndex((q) => q.answers.length < q.solutions.length));

    this.$watch('questions', updateAnswerIdx as any);

    updateAnswerIdx(this.questions);
  },

  /*   shuffleNodes() {
    const shuffled = fisherYatesShuffle([...this.$el.children].filter((el) => el.tagName == 'LI'));
    shuffled.forEach((child) => this.$el.appendChild(child));
  },
 */
  onRestartQuiz() {
    if (!this.questions) return;
    this.questions = this.questions.map((q) => ({ ...q, answers: [] }));
  },

  onSkipQuiz() {
    this.answerIdx = -1;
  },

  onCancel() {
    this.questions = null;
  },

  onUndo() {
    if (!this.questions) return;
    this.questions[this.answerIdx - 1].answers = [];
  },

  itemComponent: {
    init() {
      console.log((this as any).item);

      const shuffled = fisherYatesShuffle([...this.$el.children].filter((el) => el.tagName == 'LI'));

      shuffled.forEach((child) => this.$el.appendChild(child));

      this.$watch('item', (value: QuestionsWithAnswers & { isCorrect: boolean }) => {
        value.isCorrect = value.solutions.every((a) => value.answers.includes('' + a));
      });
    },

    attrs: {},
  },
}));

/**
 *
 * RESULTS
 *
 */
Alpine.data(
  'results',
  () =>
    ({
      correctLabel: '',
      rateLabel: '',

      init() {
        const [wrongQstIdxs, rightQstIds] = compareAnswers(this.questions, this.history);

        const correct = this.questions.length - wrongQstIdxs.length;

        const rate = Math.floor((correct / this.questions.length) * 100);

        // upper scope wrongQstIdxs
        this.wrongQstIdxs = wrongQstIdxs;

        this.correctLabel = `${correct} of ${this.questions.length}`;

        this.rateLabel = `${rate}% (${rate >= 70 ? 'PASS 🏆' : 'FAIL 💔'})`;

        if (rightQstIds.length) {
          //  this.reaIndexes[new Date().toISOString()] = rightQstIds;
        }
      },
    } as any)
);

Alpine.start();
