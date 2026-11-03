import type { Fraction } from "../models/Fraction.ts";
import type { Question } from "../models/level/LevelTypes.ts";
import { computeExpectedSolution } from "./expectedSolution.ts";
import type { ExpectedSolution, StepAnswer, StepKind } from "./GuidedTypes.ts";
import { isCorrectAnswer } from "./stepChecks.ts";

/**
 * Tracks a player working through one question a step at a time.
 *
 * The player can only answer the current step. A correct answer locks that
 * step and moves to the next. A wrong answer keeps the player on the same
 * step to try again. Every step is checked on its own, so a mistake on one
 * step never makes a later step wrong.
 */
export class GuidedSolutionModel {
	private readonly solution: ExpectedSolution;
	private completedCount = 0;
	private readonly attempts = new Map<StepKind, number>();

	constructor(question: Question) {
		this.solution = computeExpectedSolution(question);
	}

	getQuestion(): Question {
		return this.solution.question;
	}

	/** Every step this question needs, in order. */
	getSteps(): readonly StepKind[] {
		return this.solution.steps;
	}

	/** The step the player is on, or undefined once every step is done. */
	getCurrentStep(): StepKind | undefined {
		return this.solution.steps[this.completedCount];
	}

	getCompletedSteps(): readonly StepKind[] {
		return this.solution.steps.slice(0, this.completedCount);
	}

	isComplete(): boolean {
		return this.completedCount === this.solution.steps.length;
	}

	/** How many answers the player has submitted for a step, right or wrong. */
	getAttemptCount(step: StepKind): number {
		return this.attempts.get(step) ?? 0;
	}

	/** The question's answer in lowest terms, once every step is done. */
	getFinalAnswer(): Fraction | undefined {
		return this.isComplete() ? this.solution.simplified : undefined;
	}

	/**
	 * Checks an answer for the current step.
	 *
	 * @return true if it was correct, which moves on to the next step
	 * @throws if the question is already complete, or the answer is for a
	 * different step than the current one. Callers should only offer the
	 * current step.
	 */
	submit(answer: StepAnswer): boolean {
		const current = this.getCurrentStep();
		if (current === undefined) {
			throw new Error("Cannot submit an answer to a completed question");
		}
		if (answer.step !== current) {
			throw new Error(
				`Expected an answer for "${current}" but got one for "${answer.step}"`,
			);
		}

		this.attempts.set(current, this.getAttemptCount(current) + 1);

		const correct = isCorrectAnswer(answer, this.solution);
		if (correct) this.completedCount++;
		return correct;
	}
}
