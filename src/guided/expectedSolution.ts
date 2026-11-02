import { Fraction } from "../models/Fraction.ts";
import type { Question } from "../models/level/LevelTypes.ts";
import type { ExpectedSolution, StepKind } from "./GuidedTypes.ts";

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
