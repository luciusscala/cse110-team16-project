export class HintModel{
    //what does the hint model care about? what does it need to know?
    //problem (question (number 1 (numer, denom), number 2, operation), answer)
    private incorrectAttempts = 0;
    /*
    private generalHint: string;
    private specificHint: string;
    */

    constructor(problem: Problem){}

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

    //which hint do you need?
    generateHint(problem: Problem): string {
        if(this.incorrectAttempts >= 3){
            return this.generateSpecificHint(problem);
        }
        return this.generateGeneralHint(problem);
    }

    generateGeneralHint(problem: Problem): string {
        //level 1

        //level 2

        //level 3

        //level 4

        //level 5

        //level 6

        return "";
    }

    generateSpecificHint(problem: Problem): string {
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
