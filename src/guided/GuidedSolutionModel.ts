import { Fraction } from "../models/Fraction.ts";
import type { Question } from "../models/level/LevelTypes.ts";
import { isCorrectAnswer } from "./stepChecks.ts";

/** The steps of a guided problem, in the order the player works through them. */
export type StepKind = "lcd" | "scaleNumerators" | "combine" | "simplify";

/** What the player entered for one step. */
export type StepAnswer =
	| { readonly step: "lcd"; readonly lcd: number }
	/** Both fractions rewritten over the common denominator, in question order. */
	| { readonly step: "scaleNumerators"; readonly scaled: readonly [Fraction, Fraction] }
	| { readonly step: "combine"; readonly result: Fraction }
	| { readonly step: "simplify"; readonly result: Fraction };

/** The correct value of every step for one question. */
export interface ExpectedSolution {
	readonly question: Question;
	/** Only the steps this question needs, in order. */
	readonly steps: readonly StepKind[];
	/** The lowest common denominator of the two fractions. */
	readonly lcd: number;
	/** Both fractions rewritten over the LCD. */
	readonly scaled: readonly [Fraction, Fraction];
	/** The two scaled fractions combined, not yet simplified. */
	readonly combined: Fraction;
	/** The combined fraction in lowest terms. */
	readonly simplified: Fraction;
}

/**
 * Works out the correct answer to every step of a question.
 *
 * Steps that would add nothing are left out: matching the slices only
 * matters when the denominators differ, and simplifying only matters when
 * the combined fraction is not already in lowest terms.
 */
export function computeExpectedSolution(question: Question): ExpectedSolution {
	const { frac1, frac2, operation } = question;

	const lcd = frac1.lcm(frac2);
	const scaled: readonly [Fraction, Fraction] = [
		rewriteOver(frac1, lcd),
		rewriteOver(frac2, lcd),
	];
	const combined =
		operation === "addition" ? frac1.add(frac2) : frac1.subtract(frac2);
	const simplified = combined.simplify();

	const needsMatching = frac1.denominator !== frac2.denominator;
	const steps: StepKind[] = [];
	if (needsMatching) steps.push("lcd", "scaleNumerators");
	steps.push("combine");
	if (!combined.isSimplified()) steps.push("simplify");

	return { question, steps, lcd, scaled, combined, simplified };
}

/** The same amount as `fraction`, written with `denominator` as its bottom number. */
function rewriteOver(fraction: Fraction, denominator: number): Fraction {
	const factor = denominator / fraction.denominator;
	return new Fraction(fraction.numerator * factor, denominator);
}

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

	/** The expected solution for this question (steps, LCD, scaled forms, etc.). */
	getSolution(): ExpectedSolution {
		return this.solution;
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
