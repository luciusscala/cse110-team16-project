import { ProblemModel } from "./ProblemModel.ts";
import { HintModel } from "./HintModel.ts":
import { HintView } from "./HintView.ts";

//will probably merge with GameController when it's made though
export class HintController{
    
    constructor(
        private problemModel: ProblemModel,
        private hintModel: HintModel,
        private hintView: HintView,
    ){}

    /**
     * Decides if hints will automatically appear when an incorrect
     * answer is entered. 
     */
    handleIncorrectAnswer(): void {
        this.hintModel.addIncorrectAttempt();

        if(this.hintModel.shouldShowSpecificHint() || 
            this.hintModel.shouldShowGeneralHint()
        ){
            this.displayCurrentHint();
        }
    }

    /**
     * Forwards the current hint to HintView to display.
     */
    displayCurrentHint(): void {
        const problem = this.problemModel.getCurrentProblem();
        const hint = this.hintModel.generateHint(problem);
        this.hintView.displayHint(hint);
    }

}

