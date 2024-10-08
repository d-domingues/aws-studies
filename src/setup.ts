import persist from '@alpinejs/persist';
import Alpine from 'alpinejs';
import { Amplify } from 'aws-amplify';
import '../style.css';
import amplifyconfig from './amplifyconfiguration.json'; // Path may vary
import { getQuestions } from './api';
import { Question } from './types';
import { compareAnswers, filterQuestions } from './utils';

Amplify.configure(amplifyconfig);
Alpine.plugin(persist);
window.Alpine = Alpine;

/*
 *
 * SETUP
 *
 */
Alpine.data('setup', () => ({
  questions: [] as Question[],
  history: Alpine.$persist<string[][] | null>(null).as('history'),

  nrOfQuestions: Alpine.$persist(65),
  filter: Alpine.$persist('all'), // new, all, hard, insane
  keywords: '',

  questionList: [] as Question[],
  wrongQstIdxs: [] as number[],

  async init() {
    this.questions = await getQuestions();
  },

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
    this.history = Array.from({ length: this.questionList.length }, () => []) as string[][];
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

Alpine.start();
