/**
 * Tracks progress through the currently active story-mode level.
 *
 * This model tracks how many problems have been completed in one level. 
 * Progress is simply kept in memory and resets when a new level starts.
 */

export class CurrentLevelProgressModel {
    private problemsCompleted: number = 0;
    private totalProblems: number;

    constructor (totalProblems: number) {
        if (!Number.isInteger(totalProblems) || totalProblems <= 0) {
            throw new Error("totalProblems needs to be a positive integer");
        }
        this.totalProblems = totalProblems;
    }
   
    getProblemsCompleted(): number {
        return this.problemsCompleted;
    }

    getTotalProblems() : number {
        return this.totalProblems;
    }

    isLevelComplete() : boolean {
        return this.problemsCompleted >= this.totalProblems;
    }
    

    /** Resets completed problems to zero. */
    resetProgress(totalProblems: number = this.totalProblems): void {
        if (!Number.isInteger(totalProblems) || totalProblems <= 0) {
            throw new Error("totalProblems must be a positive integer");
        }

        this.totalProblems = totalProblems;
        this.problemsCompleted = 0;
    }
    
    /**
     * Records one completed problem, without exceeding the level's total.
     * The game controller decides when a problem counts as completed.
     *
     * @returns true if progress increased; false if the level is already complete.
     */
    completeProblem(): boolean {
        if (this.isLevelComplete()) {
            return false;
        }

        this.problemsCompleted++;
        return true;
    }
}