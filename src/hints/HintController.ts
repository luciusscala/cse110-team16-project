//will probably merge with GameController
export class HintController{
    //needs to have access to this information
    constructor(
        private problemModel: ProblemModel,
        private hintModel: HintModel,
        private hintView: HintView,
    ){}

    //decides when hints appear
    //updates if there is another incorrect answer
    handleIncorrectAnswer(): void {
        this.hintModel.addIncorrectAttempt();

        //auto display hint
        if(this.hintModel.shouldShowHint()){
            this.displayCurrentHint(hint);
        }
    }

    //on click
    displayCurrentHint(problemModel: ProblemModel): void {
        //asks ProblemModel for problem
        const problem = this.problemModel.getCurrentProblem();

        //passes problem to HintModel to generate hint
        const hint = this.hintModel.generateHint(problem);

        //sends results to HintView
        this.hintView.displayHint(hint);
    }
}

