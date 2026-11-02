import type { Fraction } from "../models/Fraction.ts";
import type { ExpectedSolution, LcdError, ScaleError } from "./GuidedTypes.ts";

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

/**
 * Checks the two fractions rewritten over the common denominator.
 * Reports the first fraction (in question order) that is wrong.
 */
export function checkScaleNumerators(
	answer: readonly [Fraction, Fraction],
	solution: ExpectedSolution,
): ScaleError | undefined {
	const { frac1, frac2 } = solution.question;
	const originals = [frac1, frac2] as const;

	for (let i = 0; i < originals.length; i++) {
		const given = answer[i];
		if (sameForm(given, solution.scaled[i])) continue;

		if (given.denominator !== solution.lcd) return "denominatorNotLcd";
		// The bottom is right, but the top was left alone or scaled wrongly.
		return given.numerator === originals[i].numerator
			? "numeratorNotScaled"
			: "numeratorWrong";
	}
	return undefined;
}

/** True when both fractions have the same top and bottom (3/6 is not 1/2). */
function sameForm(a: Fraction, b: Fraction): boolean {
	return a.numerator === b.numerator && a.denominator === b.denominator;
}
