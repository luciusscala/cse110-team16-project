import type { Fraction } from "../../models/Fraction.ts";
import { sameForm } from "../../guided/stepChecks.ts";
import { SPEED_MODE_DIFFICULTY } from "../../constants.ts";
import {
    generateMasteryProblem,
    masteryAnswer,
    type MasteryProblem,
} from "../MasteryScreen/masteryProblems.ts";
import type { MasteryProblemGenerator } from "../MasteryScreen/MasteryScreenModel.ts";

/**
 * Stores data associated with the Speed Challenge minigame: the score and the
 * current problem. Problems all come from the Mastery generator at one fixed difficulty.
 */
export class SpeedModeScreenModel {
    private score = 0;
    private readonly generate: MasteryProblemGenerator;
    private current: MasteryProblem;

    constructor(generate: MasteryProblemGenerator = generateMasteryProblem) {
        this.generate = generate;
        this.current = this.generate(SPEED_MODE_DIFFICULTY);
    }

    /**
     * Resets the score and picks a new problem (usually called after a run is finished).
     */
    reset(): void {
        this.score = 0;
        this.current = this.generate(SPEED_MODE_DIFFICULTY);
    }

    getCurrentProblem(): MasteryProblem {
        return this.current;
    }

    /**
     * Checks an answer to the current problem, scoring it if correct, and moves on to a new
     * problem either way.
     * @return true if the answer was correct
     */
    submit(answer: Fraction): boolean {
        const correct = sameForm(answer, masteryAnswer(this.current));
        if (correct) this.incrementScore();
        this.current = this.generate(SPEED_MODE_DIFFICULTY);
        return correct;
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