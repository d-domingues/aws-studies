import persist from '@alpinejs/persist';
import Alpine from 'alpinejs';
// import { Amplify } from 'aws-amplify';
import '../style.css';
// import amplifyconfig from './amplifyconfiguration.json'; // Path may vary
import { QuestionsWithAnswers } from './types';
import { fisherYatesShuffle } from './utils';

// Amplify.configure(amplifyconfig);
Alpine.plugin(persist);
window.Alpine = Alpine;

function goToSetup() {
  window.location.href = '/';
}

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
      return goToSetup();
    }

    this.$watch('answerIdx', (value: number) => (this.finished = value < 0));

    const updateAnswerIdx = (questions: QuestionsWithAnswers[]) =>
      (this.answerIdx = questions.findIndex((q) => q.answers.length < q.solutions.length));

    this.$watch('questions', updateAnswerIdx as any);

    updateAnswerIdx(this.questions);
  },

  onRestartQuiz() {
    if (!this.questions) return;
    this.questions = this.questions.map((q) => ({ ...q, answers: [] }));
  },

  onSkipQuiz() {
    this.answerIdx = -1;
  },

  onCancel() {
    this.questions = null;
    return goToSetup();
  },

  onUndo() {
    if (!this.questions) return;
    this.questions[this.answerIdx - 1].answers = [];
  },

  /* EACH ITEM */
  itemComponent: {
    ['x-init']() {
      this.$watch('item', (value: QuestionsWithAnswers) => {
        value.isCorrect = value.solutions.every((a) => value.answers.includes('' + a));
      });

      this.$nextTick(() => {
        const shuffled = fisherYatesShuffle([...this.$el.children].filter((el) => el.tagName == 'LI'));
        shuffled.forEach((child) => this.$el.appendChild(child));
      });
    },

    [':id']() {
      return `section${this.index}`;
    },

    ['x-show']() {
      return this.index == this.answerIdx || this.finished;
    },

    [':class']() {
      return {
        'list-none p-2 rounded-lg bg-blue-50 ring-2 ring-blue-600 ring-inset': true,
        'bg-gray-50 ring-red-800': !this.item.isCorrect && this.finished,
        'min-h-[calc(100dvh_-_4.5rem)]': !this.finished,
        'mb-2': this.finished,
      };
    },

    ['x-transition']: true,
  } as any,

  /* RESULTS */
  resultsComponent: {
    ['x-data']: () => ({
      failed: [],
      correctLabel: '',
      rateLabel: '',

      init() {
        if (!this.questions) return;

        this.failed = this.questions.filter((q: QuestionsWithAnswers) => !q.isCorrect);

        const correct = this.questions.filter((q: QuestionsWithAnswers) => q.isCorrect);
        const rate = Math.floor((correct?.length / this.questions.length) * 100);

        this.correctLabel = `${correct.length} of ${this.questions.length}`;
        this.rateLabel = `${rate}% (${rate >= 70 ? 'PASS 🏆' : 'FAIL 💔'})`;
      },
    }),
  },
}));

Alpine.start();
