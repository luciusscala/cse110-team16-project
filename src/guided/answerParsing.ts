import { Fraction } from "../models/Fraction.ts";
import type { StepAnswer, StepKind } from "./GuidedTypes.ts";

/** Why the text in the answer boxes could not be turned into an answer. */
export type InvalidInput = "notWholeNumber" | "zeroDenominator" | "notPositive";

export type ParseResult =
	| { readonly ok: true; readonly answer: StepAnswer }
	| { readonly ok: false; readonly problem: InvalidInput; readonly hint: string };

const INVALID_INPUT_HINTS: Record<InvalidInput, string> = {
	notWholeNumber: "Type whole numbers in the boxes, like 3 or 12.",
	zeroDenominator: "The bottom number can't be 0. A pizza can't have 0 slices!",
	notPositive: "The slice size has to be bigger than 0.",
};

/** How many answer boxes each step shows, in the order they are passed in. */
const FIELD_COUNTS: Record<StepKind, number> = {
	lcd: 1,
	scaleNumerators: 4, // top and bottom of the first fraction, then of the second
	combine: 2,
	simplify: 2,
};

/** Longest whole number accepted in an answer box, so arithmetic stays exact. */
export const MAX_ANSWER_DIGITS = 6;

const WHOLE_NUMBER = new RegExp(`^\\d{1,${MAX_ANSWER_DIGITS}}$`);

/**
 * Turns the text from a step's answer boxes into a typed answer.
 *
 * Fractions come from two boxes (top, then bottom). Anything that is not a
 * whole number, or that would make an impossible fraction, is rejected with
 * a hint instead of being treated as a wrong answer.
 */
export function parseStepAnswer(
	step: StepKind,
	fields: readonly string[],
): ParseResult {
	if (fields.length !== FIELD_COUNTS[step]) {
		throw new Error(
			`Step "${step}" takes ${FIELD_COUNTS[step]} boxes, got ${fields.length}`,
		);
	}

	const numbers: number[] = [];
	for (const field of fields) {
		const text = field.trim();
		if (!WHOLE_NUMBER.test(text)) return invalid("notWholeNumber");
		numbers.push(Number(text));
	}

	switch (step) {
		case "lcd":
			return numbers[0] === 0
				? invalid("notPositive")
				: valid({ step, lcd: numbers[0] });
		case "scaleNumerators": {
			const first = toFraction(numbers[0], numbers[1]);
			const second = toFraction(numbers[2], numbers[3]);
			return first && second
				? valid({ step, scaled: [first, second] })
				: invalid("zeroDenominator");
		}
		case "combine":
		case "simplify": {
			const result = toFraction(numbers[0], numbers[1]);
			return result ? valid({ step, result }) : invalid("zeroDenominator");
		}
	}
}

function toFraction(numerator: number, denominator: number): Fraction | undefined {
	return denominator === 0 ? undefined : new Fraction(numerator, denominator);
}

function valid(answer: StepAnswer): ParseResult {
	return { ok: true, answer };
}

function invalid(problem: InvalidInput): ParseResult {
	return { ok: false, problem, hint: INVALID_INPUT_HINTS[problem] };
}
