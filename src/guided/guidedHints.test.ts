import { describe, expect, test } from "vitest";
import { computeExpectedSolution } from "./expectedSolution.ts";
import { getHint } from "./guidedHints.ts";
import type { StepError } from "./GuidedTypes.ts";
import { frac, makeQuestion } from "./testHelpers.ts";

const ALL_ERRORS: readonly StepError[] = [
	"notCommonMultiple",
	"oneDenominatorOnly",
	"productNotLowest",
	"notLowest",
	"denominatorNotLcd",
	"numeratorNotScaled",
	"numeratorWrong",
	"addedDenominators",
	"denominatorChanged",
	"simplifiedTooEarly",
	"wrongOperation",
	"wrongNumerator",
	"notSimplified",
	"partlySimplified",
	"changedValue",
];

// 1/4 + 1/6: LCD 12, scaled 3/12 and 2/12, combined 5/12
const addition = computeExpectedSolution(
	makeQuestion(frac(1, 4), "addition", frac(1, 6)),
);
const subtraction = computeExpectedSolution(
	makeQuestion(frac(5, 6), "subtraction", frac(1, 3)),
);

describe("getHint", () => {
	test("every kind of mistake has a non-empty hint", () => {
		for (const error of ALL_ERRORS) {
			expect(getHint(error, addition).length).toBeGreaterThan(0);
		}
	});

	test("every kind of mistake has its own hint", () => {
		const hints = ALL_ERRORS.map((error) => getHint(error, addition));
		expect(new Set(hints).size).toBe(ALL_ERRORS.length);
	});

	test("LCD hints mention the denominators but do not give away the LCD", () => {
		for (const error of [
			"notCommonMultiple",
			"oneDenominatorOnly",
		] as const) {
			const hint = getHint(error, addition);
			expect(hint).toContain("4 and 6");
			expect(hint).not.toContain("12");
		}
	});

	test("the match-the-slices hint names the denominator to use", () => {
		expect(getHint("denominatorNotLcd", addition)).toContain("12");
	});

	test("the wrong-operation hint matches the question's operation", () => {
		expect(getHint("wrongOperation", addition)).toContain("Add");
		expect(getHint("wrongOperation", subtraction)).toContain("Subtract");
	});

	test("the wrong-numerator hint shows the scaled fractions", () => {
		expect(getHint("wrongNumerator", addition)).toContain("3/12 and 2/12");
		expect(getHint("wrongNumerator", subtraction)).toContain("Subtract");
	});

	test("the simplify hints do not give away the simplified fraction", () => {
		// 1/12 + 5/12 = 6/12 -> 1/2
		const solution = computeExpectedSolution(
			makeQuestion(frac(1, 12), "addition", frac(5, 12)),
		);
		for (const error of [
			"notSimplified",
			"partlySimplified",
			"changedValue",
		] as const) {
			expect(getHint(error, solution)).not.toContain("1/2");
		}
	});
});
