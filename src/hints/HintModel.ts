export class HintModel{
    //what does the hint model care about? what does it need to know?
    //problem (question (number 1 (numer, denom), number 2, operation), answer)
    private incorrectAttempts = 0;
    private problemModel: ProblemModel;

    constructor(problemModel: ProblemModel){
        this.problemModel = problemModel;
    }

    //data from the problem generation
    //how many wrong answers there are : void
    numIncorrectAttempts(problem: Problem): number {
        return this.incorrectAttempts;
    }

    addIncorrectAttempt(): void {
        this.incorrectAttempts++;
    }

    resetIncorrectAttempts(): void {
        this.incorrectAttempts = 0;
    }

    //getGeneralHint : string
    //getSpecificHint : string
    generateHint(problem: Problem): string {
        //depending on incorrect attempts 
        if(this.incorrectAttempts >= 3){
            return this.generateSpecificHint(problem);
        }
        return this.generateGeneralHint(problem);
    }

    getGeneralHint(problem: Problem): string {
        //
        return "";
    }

    getSpecificHint(problem: Problem): string {
        //
        return "";
    }

    shouldShowGeneralHint(): boolean { //auto at 3
        return this.incorrectAttempts >= 3;
    }

    shouldShowSpecificHint(): boolean { //auto at 5
        return this.incorrectAttempts >= 5;
    }

}
