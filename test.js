this: {
    step: number;

    questionList: never[];
    nrOfQuestions: number;
    lastStoragekey: any;
    
    
    onBegin(): void;
    onContinue(): void;


    group: any;
    historyIdx: number;
    history: any;
    answerIdx: number;
    finished: boolean;

    wrongQstIdxs: never[];
    
    shuffleNodes(): void;
    onRestartQuiz(): void;
    onSkipQuiz(): void;
    onUndo(): void;
    goBack(): void;
    goNext(): void;



    correctLabel: string;
    rateLabel: string;
    init(): void;
}