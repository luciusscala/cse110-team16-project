import type { ExpectedSolution, LcdError } from "./GuidedTypes.ts";

/**
 * Per-step answer checks.
 *
 * Each check compares one answer with the expected solution and returns the
 * kind of mistake made, or undefined when the answer is correct. Checks are
 * pure and independent: they never look at what the player entered for any
 * other step.
 */

/** Checks the lowest common denominator the player entered. */
export function checkLcd(
	answer: number,
	solution: ExpectedSolution,
): LcdError | undefined {
	if (answer === solution.lcd) return undefined;

	const { frac1, frac2 } = solution.question;
	const first = frac1.denominator;
	const second = frac2.denominator;

	const fitsBoth = answer % first === 0 && answer % second === 0;
	if (!fitsBoth) {
		const isOneOfTheDenominators = answer === first || answer === second;
		return isOneOfTheDenominators ? "oneDenominatorOnly" : "notCommonMultiple";
	}

	// A common multiple, but not the lowest one.
	return answer === first * second ? "productNotLowest" : "notLowest";
}
