import persist from '@alpinejs/persist';
import Alpine from 'alpinejs';
import { Amplify } from 'aws-amplify';
import '../style.css';
// import amplifyconfig from './amplifyconfiguration.json'; // Path may vary
import { getQuestions } from './api';
import { Question, QuestionsWithAnswers } from './types';
import { fisherYatesShuffle } from './utils';

Amplify.configure({} /* amplifyconfig */);
Alpine.plugin(persist);
window.Alpine = Alpine;

function goToSetup() {
  window.location.href = '/';
}

/*
 *
 * SETUP
 *
 */
Alpine.data('setup', () => ({
  questions: Alpine.$persist<QuestionsWithAnswers[] | null>(null).as('questions'),

  nrOfQuestions: Alpine.$persist(65),
  filter: Alpine.$persist('all'), // new, all, hard, insane
  keywords: '',

  questionList: [] as Question[],
  wrongQstIdxs: [] as number[],

  async init() {
    console.log('> entering setup');

    if (this.questions) {
      console.log('> going to quiz');
      return (window.location.href = 'quiz.html');
    }
  },

  async onStart() {
    const questions = await getQuestions();
    this.questions = questions.map((q) => ({ ...q, answers: [], isCorrect: false }));
    window.location.href = 'quiz.html';
  },

  goNormal() {
    /*   
    let excludeIdx: string[] = [];
    let includeKeywords: string[] = [];

    if (this.filter === 'new') {
      excludeIdx = Object.keys(this.groups).flatMap((item) => JSON.parse(item));
    }

    if (this.keywords.trim().length) {
      includeKeywords = this.keywords.split(',');
    }

      const result = filterQuestions(questions, includeKeywords, excludeIdx).sort(() => 0.5 - Math.random());
    if (!result.length) {
      return alert('No questions left');
    }

    this.questionList = result.slice(0, this.nrOfQuestions);
    this.questions = Array.from({ length: this.questionList.length }, () => []) as string[][]; */
  },
}));

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
    console.log('> entering to quiz');

    if (!this.questions) {
      console.log('> going to setup');
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
      return `section${(this as any).index}`;
    },

    ['x-show']() {
      return (this as any).index == this.answerIdx || this.finished;
    },

    [':class']() {
      return {
        'list-none p-2 rounded-lg bg-blue-50 ring-2 ring-blue-600 ring-inset': true,
        'bg-gray-50 ring-red-800': !(this as any).item.isCorrect && this.finished,
        'min-h-[calc(100dvh_-_4.5rem)]': !this.finished,
        'mb-2': this.finished,
      };
    },

    ['x-transition']: true,
  },

  /* RESULTS */
  resultsComponent: {
    ['x-data']() {
      const { questions } = this;

      return {
        failed: [] as QuestionsWithAnswers[],
        correctLabel: '',
        rateLabel: '',

        init() {
          if (!questions) return;

          this.failed = questions.filter((q: QuestionsWithAnswers) => !q.isCorrect);

          const correct = questions.filter((q: QuestionsWithAnswers) => q.isCorrect);
          const rate = Math.floor((correct?.length / questions.length) * 100);

          this.correctLabel = `${correct.length} of ${questions.length}`;
          this.rateLabel = `${rate}% (${rate >= 70 ? 'PASS 🏆' : 'FAIL 💔'})`;
        },
      };
    },
  },
}));

Alpine.start();
