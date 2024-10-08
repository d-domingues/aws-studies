import persist from '@alpinejs/persist';
import Alpine from 'alpinejs';
import { Amplify } from 'aws-amplify';
import '../style.css';
//import amplifyconfig from './amplifyconfiguration.json'; // Path may vary
import { getQuestions } from './api';
import { Question } from './types';
import { filterQuestions } from './utils';

Amplify.configure({} /* amplifyconfig */);
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

  async onStart() {
    const q = await getQuestions();

    console.log(q);
  },

  goNormal() {
    let excludeIdx: string[] = [];
    let includeKeywords: any[] = [];

    if (this.filter === 'new') {
      // excludeIdx = Object.keys(this.groups).flatMap((item) => JSON.parse(item));
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
}));

Alpine.start();
