import { Problem } from "../Problem.ts";

export class HintModel{
    
    private incorrectAttempts = 0;
    private generalHintShown = false;

    /**
     * Increases the number of incorrect attempts made by user.
     */
    addIncorrectAttempt(): void {
        this.incorrectAttempts++;
    }

   /**
    * Decides which hint type to show based on if the first hint has been 
    * shown already.
    */
    generateHint(problem: Problem): string {
        if(this.generalHintShown){ 
            return this.generateSpecificHint(problem);
        }
        this.generalHintShown = true;
        return this.generateGeneralHint(problem);
    }

    /**
     * First hint given depends on the level of the Problem. 
     */
    generateGeneralHint(problem: Problem): string {
        switch(problem.getLevel()){
            case 1:
                return "Remember that pizza slices of the same size don't " +
                "need to be resized before adding. Keep the sizes fixed for " +
                "your final pizza portion.";
            case 2:
                return "Is there an simpler way to express your pizza portion? " +
                "Try increasing the size of the pizza slices by reducing the " +
                "number of overall slices.";
            case 3:
                return "Remember pizza slices must be the same size in order " +
                "to be added together. Try finding the Least Common Denominator " +
                "(LCD) of 'F1' and 'F2'.";
            case 4:
                return "Can the pizza slices be combined directly? Are the " +
                "slice sizes the same or do they need to be resized first?";
            case 5:
                return "Remember pizza slices must be the same size in order " +
                "to be added together. Are there any common factors that each " +
                "pizza slice size can be multiplied by to reach the same pizza " +
                "size? 
            case 6:
                return "Remember pizza slices must be the same size in order " +
                "to be added together. And remember to simplify your final " +
                "pizza portion into the biggest slice possible!";
            default:
                return "No hint available.";
        }
    }

    /**
     * Second hint given depends on the level of the Problem. 
     */
    generateSpecificHint(problem: Problem): string {
        switch(problem.getLevel()){
            case 1:
                return "Try adding the number of pizza slices together, " + 
                "'N1' and 'N2'. Did you remember to keep the slice size " +
                "fixed?";
            case 2:
                return "Do 'AN' and 'AD' have a common multiple that we " +
                "can divide by?";
            case 3:
                return "Can 'D1' be multiplied by a number to get 'D2'? " +
                "Remember to combine your final pizza portion into the " +
                "biggest slice size possible!";
            case 4:
                return "Try multiplying the larger pizza size by 'D2/D1' to " +
                "make a smaller pizza slice size. Or try simplifying by dividing " +
                "out any of the common factors both pizza slice sizes have.";
            case 5:
                return "Try multiplying 'D1' and 'D2' to get the new pizza " +
                "slice size. But remember that there could be a simpler pizza " +
                "size that works as well.";
            case 6:
                return "Find the Least Common Multiple (LCM) between the " +
                "pizza slice sizes. What number is needed to get each pizza " +
                "slice size to that same shared size?";
            default:
                return "No hint available.";
        }
    }
        
    /**
     * Decides the logic for if an automatic hint should be shown. 
     */
    shouldShowGeneralHint(): boolean { //auto at 3
        return this.incorrectAttempts >= 3 && !this.generalHintShown;
    }

    shouldShowSpecificHint(): boolean { //auto at 5
        return this.incorrectAttempts >= 5 && !this.specificHintShown;
    }

    /**
     * Resets the state for each new Problem. 
     */
    reset(): void {
        this.generalHintShown = false;
        this.incorrectAttempts = 0;
    }

}