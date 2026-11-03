import type { Fraction } from "../models/Fraction.ts";
import type { ExpectedSolution, StepAnswer } from "./GuidedTypes.ts";

/**
 * Whether an answer is the correct one for its step.
 *
 * The answer is compared with the expected solution, never with what the
 * player entered for any other step. Fractions must be written the way the
 * step asks: the combine step needs the result over the common denominator
 * (3/6), so the simplified form (1/2) is not correct until the simplify step.
 */
export function isCorrectAnswer(
	answer: StepAnswer,
	solution: ExpectedSolution,
): boolean {
	switch (answer.step) {
		case "lcd":
			return answer.lcd === solution.lcd;
		case "scaleNumerators":
			return (
				sameForm(answer.scaled[0], solution.scaled[0]) &&
				sameForm(answer.scaled[1], solution.scaled[1])
			);
		case "combine":
			return sameForm(answer.result, solution.combined);
		case "simplify":
			return sameForm(answer.result, solution.simplified);
	}
}

/** True when both fractions have the same top and bottom (3/6 is not 1/2). */
function sameForm(a: Fraction, b: Fraction): boolean {
	return a.numerator === b.numerator && a.denominator === b.denominator;
}
