import type { Fraction } from "../models/Fraction.ts";
import type {
	CombineError,
	ExpectedSolution,
	LcdError,
	ScaleError,
	SimplifyError,
} from "./GuidedTypes.ts";

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

/**
 * Checks the two scaled fractions combined into one, before simplifying.
 * The answer must keep the common denominator, so 3/6 is correct here
 * while its simplified form 1/2 is not yet.
 */
export function checkCombine(
	answer: Fraction,
	solution: ExpectedSolution,
): CombineError | undefined {
	if (sameForm(answer, solution.combined)) return undefined;
	if (answer.isEqual(solution.combined)) return "simplifiedTooEarly";

	const { frac1, frac2, operation } = solution.question;
	if (answer.denominator === frac1.denominator + frac2.denominator) {
		return "addedDenominators";
	}
	if (answer.denominator !== solution.lcd) return "denominatorChanged";

	const [first, second] = solution.scaled;
	const otherOperationNumerator =
		operation === "addition"
			? first.numerator - second.numerator
			: first.numerator + second.numerator;
	return answer.numerator === otherOperationNumerator
		? "wrongOperation"
		: "wrongNumerator";
}

/** Checks the final fraction, which must be the combined fraction in lowest terms. */
export function checkSimplify(
	answer: Fraction,
	solution: ExpectedSolution,
): SimplifyError | undefined {
	if (sameForm(answer, solution.simplified)) return undefined;
	if (!answer.isEqual(solution.combined)) return "changedValue";

	// Same amount as before, so the only question is how far it was simplified.
	const madeNoProgress = answer.denominator >= solution.combined.denominator;
	return madeNoProgress ? "notSimplified" : "partlySimplified";
}

/** True when both fractions have the same top and bottom (3/6 is not 1/2). */
function sameForm(a: Fraction, b: Fraction): boolean {
	return a.numerator === b.numerator && a.denominator === b.denominator;
}
