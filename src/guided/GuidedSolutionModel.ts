import type { Fraction } from "../models/Fraction.ts";
import type { Question } from "../models/level/LevelTypes.ts";
import { computeExpectedSolution } from "./expectedSolution.ts";
import { getHint } from "./guidedHints.ts";
import type {
	ExpectedSolution,
	StepAnswer,
	StepError,
	StepFeedback,
	StepKind,
} from "./GuidedTypes.ts";
import {
	checkCombine,
	checkLcd,
	checkScaleNumerators,
	checkSimplify,
} from "./stepChecks.ts";

/**
 * Tracks a player working through one question a step at a time.
 *
 * The player can only answer the current step. A correct answer locks that
 * step and moves to the next. A wrong answer keeps the player on the same
 * step, with a hint for the mistake. Every step is checked on its own, so
 * a mistake on one step never makes a later step wrong.
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
	 * @throws if the question is already complete, or the answer is for a
	 * different step than the current one. Callers should only offer the
	 * current step.
	 */
	submit(answer: StepAnswer): StepFeedback {
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

		const error = this.findError(answer);
		if (error === undefined) {
			this.completedCount++;
			return { step: current, correct: true };
		}
		return { step: current, correct: false, error, hint: getHint(error, this.solution) };
	}

	private findError(answer: StepAnswer): StepError | undefined {
		switch (answer.step) {
			case "lcd":
				return checkLcd(answer.lcd, this.solution);
			case "scaleNumerators":
				return checkScaleNumerators(answer.scaled, this.solution);
			case "combine":
				return checkCombine(answer.result, this.solution);
			case "simplify":
				return checkSimplify(answer.result, this.solution);
		}
	}
}
