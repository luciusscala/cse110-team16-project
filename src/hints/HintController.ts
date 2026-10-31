export default class HintController{

    //needs to have access to this information
    constructor(
        private problemModel: ProblemModel,
        private hintModel: HintModel,
        private hintView: HintView,
    ){}

    //asks ProblemModel for problem
    const problem = this.problemModel.getCurrentProblem();

    //passes problem to HintModel
    const hint = this.hintModel.generateHint();

    //sends results to HintView
    this.hintView.displayHint(hint);

    //decides when hints appear


}



