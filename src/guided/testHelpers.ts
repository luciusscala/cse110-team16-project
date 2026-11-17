import { Fraction } from "../models/Fraction.ts";
import type { Operation, Question } from "../models/level/LevelTypes.ts";

/** Shorthand for building a fraction in tests. */
export const frac = (numerator: number, denominator: number) =>
	new Fraction(numerator, denominator);

/** Builds a question whose answer is computed, so tests only state the inputs. */
export function makeQuestion(
	frac1: Fraction,
	operation: Operation,
	frac2: Fraction,
): Question {
	const raw =
		operation === "addition" ? frac1.add(frac2) : frac1.subtract(frac2);
	return {
		id: "TEST-Q",
		levelId: 0,
		frac1,
		frac2,
		operation,
		correctAnswer: raw.simplify(),
	};
}
