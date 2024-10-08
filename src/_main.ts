import persist from '@alpinejs/persist';
import Alpine from 'alpinejs';
import { Amplify } from 'aws-amplify';
import '../style.css';
import amplifyconfig from './amplifyconfiguration.json'; // Path may vary
import { getQuestions } from './api';
import { handleSignIn } from './auth';
import { Question } from './types';
import { compareAnswers, filterQuestions, fisherYatesShuffle } from './utils';

Amplify.configure(amplifyconfig);
Alpine.plugin(persist);
window.Alpine = Alpine;

Alpine.data('main', () => ({
  questions: [] as Question[],
  groups: Alpine.$persist<Record<string, string[][][]>>({}).as('groups'),
  lastStoragekey: Alpine.$persist<null | string>(null).as('lastStoragekey'),

  nrOfQuestions: Alpine.$persist(65),
  filter: Alpine.$persist('new'), // new, all, hard, insane
  keywords: '',

  questionList: [] as Question[],
  wrongQstIdxs: [] as number[],

  async init() {
    this.questions = await getQuestions();
  },

  handleSignIn: () => handleSignIn({ username: 'user1', password: 'MyN3wP455' }),

  onStart() {
    if (this.filter === 'new') {
      return this.goNormal();
    }

    if (this.filter === 'hard') {
      return this.goHard();
    }
  },

  goNormal() {
    let excludeIdx = [];
    let includeKeywords: any[] = [];

    if (this.filter === 'new') {
      excludeIdx = Object.keys(this.groups).flatMap((item) => JSON.parse(item));
    }

    if (this.keywords.trim().length) {
      includeKeywords = this.keywords.split(',');
    }

    const result = filterQuestions(this.questions, includeKeywords, excludeIdx).sort(() => 0.5 - Math.random());
    if (!result.length) {
      return alert('No questions left');
    }

    this.questionList = result.slice(0, this.nrOfQuestions);
    this.lastStoragekey = JSON.stringify(this.questionList.map((q) => q.id));
    this.groups[this.lastStoragekey] = [Array.from({ length: this.questionList.length }, () => [])];
  },

  goHard() {
    const wrongIds = Object.entries(this.groups).reduce((acc, [qIds, answers]) => {
      const questionList = JSON.parse(qIds).map((qId: string) => this.questions.find((q) => q.id === qId));

      const res = answers.reduce((ans, next) => {
        const comp = compareAnswers(questionList, next);
        return [...ans, ...comp[2]];
      }, [] as number[]);

      return new Set([...acc, ...res]);
    }, new Set<number>());

    ////
    const wrongIdsAsArray: number[] = Array.from(wrongIds)
      .sort(() => 0.5 - Math.random())
      .slice(0, this.nrOfQuestions);
    //   this.questionList = Array.from(wrongIdsAsArray).map((qIds) => questions.find((q) => q.id === qIds));
    this.lastStoragekey = JSON.stringify(wrongIdsAsArray);

    ///
    this.groups[this.lastStoragekey] = [];
  },
}));

/**
 *
 * Step 2
 * MODEL
 *
 */
const model = Alpine.data(
  'model',
  () =>
    ({
      answerIdx: 0,
      finished: false,

      get history(): string[][] {
        if (this.lastStoragekey) {
          const idx = this.groups[this.lastStoragekey].length - 1;
          return this.groups[this.lastStoragekey][idx];
        }

        return [];
      },

      set history(value: string[][]) {
        if (this.lastStoragekey) {
          const idx = this.groups[this.lastStoragekey].length - 1;
          this.groups[this.lastStoragekey][idx] = value;
        }
      },

      init() {
        if (this.lastStoragekey) {
          this.questionList = JSON.parse(this.lastStoragekey).map((qId: string) =>
            this.questions.find((q: Question) => q.id === qId)
          );

          if (!this.groups[this.lastStoragekey].length) {
            this.groups[this.lastStoragekey].push(Array.from({ length: this.questionList.length }, () => []));
          }
        }

        this.$watch('answerIdx', (value: number) => (this.finished = value < 0));

        const updateAnswerIdx = (history: string[][]) =>
          (this.answerIdx = history?.findIndex((inner, idx) => inner.length < this.questionList[idx].solutions.length));

        this.$watch('history', updateAnswerIdx);

        updateAnswerIdx(this.history);
      },

      shuffleNodes() {
        const shuffled = fisherYatesShuffle([...this.$el.children].filter((el) => el.tagName == 'LI'));
        shuffled.forEach((child) => this.$el.appendChild(child));
      },

      onRestartQuiz() {
        if (!this.lastStoragekey) return;
        this.wrongQstIdxs = [];
        this.groups[this.lastStoragekey].push(Array.from({ length: this.questionList.length }, () => []));
      },

      onSkipQuiz() {
        this.answerIdx = -1;
      },

      onCancel() {
        this.questionList = [];
        this.lastStoragekey = null;
      },

      onUndo() {
        this.history[this.answerIdx - 1] = [];
      },
    } as any)
);

model;

/**
 *
 * RESULTS Component
 *
 */
Alpine.data(
  'resultComp',
  () =>
    ({
      correctLabel: '',
      rateLabel: '',

      init() {
        const [wrongQstIdxs, rightQstIds] = compareAnswers(this.questionList, this.history);

        const correct = this.questionList.length - wrongQstIdxs.length;

        const rate = Math.floor((correct / this.questionList.length) * 100);

        // upper scope wrongQstIdxs
        this.wrongQstIdxs = wrongQstIdxs;

        this.correctLabel = `${correct} of ${this.questionList.length}`;

        this.rateLabel = `${rate}% (${rate >= 70 ? 'PASS 🏆' : 'FAIL 💔'})`;

        if (rightQstIds.length) {
          //  this.reaIndexes[new Date().toISOString()] = rightQstIds;
        }
      },
    } as any)
);

Alpine.start();
