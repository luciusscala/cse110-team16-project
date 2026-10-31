export class HintModel{
    //what does the hint model care about? what does it need to know?
    //problem (question (number 1 (numer, denom), number 2, operation), answer)

    constructor(private problemModel: ProblemModel){
        //
    }

    //data from the problem generation
    //how many wrong answers there are : void
    numIncorrectAttempts(problem: Problem): number {
        //
        return 0;
    }

    addIncorrectAttempt(): void {
        //
    }

    //getGeneralHint : string
    //getSpecificHint : string
    generateHint(problem: Problem): string {
        //depending on incorrect attempts 
        return "";
    }

    getGeneralHint(): string {
        //
        return "";
    }

    shouldShowGeneralHint(): boolean { //auto at 3
        //
        return false;
    }

    getSpecificHint(): string {
        //
        return "";
    }

    shouldShowSpecificHint(): boolean { //auto at 5
        //
        return false;
    }

}
