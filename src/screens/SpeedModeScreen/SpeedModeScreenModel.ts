/**
 * Stores data associated with the Speed Challenge minigame.
 */
export class SpeedModeScreenModel {
    private score = 0;

    /**
     * Resets the score for the Speed Challenge minigame (usually called after a run is finished).
     */
    reset(): void {
        this.score = 0;
    }

    /**
     * Increases the current attempt's score for the Speed Challenge minigame by 1.
     */
	incrementScore(): void {
		this.score++;
	}

    /**
     * Returns the current attempt's current score for the Speed Challenge minigame.
     * @return a number representing the number of questions correctly answered under the current time limit
     */
	getScore(): number {
		return this.score;
	}
}