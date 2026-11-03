import { describe, expect, test } from "vitest";
import { computeExpectedSolution } from "./expectedSolution.ts";
import type { StepAnswer } from "./GuidedTypes.ts";
import { isCorrectAnswer } from "./stepChecks.ts";
import { frac, makeQuestion } from "./testHelpers.ts";

const lcd = (value: number): StepAnswer => ({ step: "lcd", lcd: value });
const scale = (a: [number, number], b: [number, number]): StepAnswer => ({
	step: "scaleNumerators",
	scaled: [frac(...a), frac(...b)],
});
const combine = (n: number, d: number): StepAnswer => ({
	step: "combine",
	result: frac(n, d),
});
const simplify = (n: number, d: number): StepAnswer => ({
	step: "simplify",
	result: frac(n, d),
});

// 1/3 + 1/6: LCD 6, scaled 2/6 and 1/6, combined 3/6, simplified 1/2
const addition = computeExpectedSolution(
	makeQuestion(frac(1, 3), "addition", frac(1, 6)),
);
// 5/6 - 1/3: scaled 5/6 and 2/6, combined 3/6
const subtraction = computeExpectedSolution(
	makeQuestion(frac(5, 6), "subtraction", frac(1, 3)),
);
// 1/4 + 1/6: LCD 12, product 24
const fourAndSix = computeExpectedSolution(
	makeQuestion(frac(1, 4), "addition", frac(1, 6)),
);

describe("isCorrectAnswer", () => {
	describe("lcd step", () => {
		test("accepts only the lowest common denominator", () => {
			expect(isCorrectAnswer(lcd(12), fourAndSix)).toBe(true);
			for (const wrong of [2, 4, 6, 10, 24, 36]) {
				expect(isCorrectAnswer(lcd(wrong), fourAndSix)).toBe(false);
			}
		});

		test("accepts a denominator that is a multiple of the other", () => {
			const solution = computeExpectedSolution(
				makeQuestion(frac(1, 2), "addition", frac(1, 4)),
			);
			expect(isCorrectAnswer(lcd(4), solution)).toBe(true);
		});

		test("accepts the product when the denominators share no factors", () => {
			const solution = computeExpectedSolution(
				makeQuestion(frac(1, 2), "addition", frac(1, 3)),
			);
			expect(isCorrectAnswer(lcd(6), solution)).toBe(true);
		});
	});

	describe("scaleNumerators step", () => {
		test("accepts both fractions scaled correctly", () => {
			expect(isCorrectAnswer(scale([2, 6], [1, 6]), addition)).toBe(true);
			expect(isCorrectAnswer(scale([3, 12], [2, 12]), fourAndSix)).toBe(true);
		});

		test("accepts a fraction that already has the LCD as its denominator", () => {
			const solution = computeExpectedSolution(
				makeQuestion(frac(1, 2), "addition", frac(1, 4)),
			);
			expect(isCorrectAnswer(scale([2, 4], [1, 4]), solution)).toBe(true);
		});

		test("rejects a wrong bottom number", () => {
			expect(isCorrectAnswer(scale([1, 3], [1, 6]), addition)).toBe(false);
			expect(isCorrectAnswer(scale([2, 6], [1, 12]), addition)).toBe(false);
		});

		test("rejects a top number that was not scaled or scaled wrongly", () => {
			expect(isCorrectAnswer(scale([1, 6], [1, 6]), addition)).toBe(false);
			expect(isCorrectAnswer(scale([3, 6], [1, 6]), addition)).toBe(false);
			expect(isCorrectAnswer(scale([2, 6], [2, 6]), addition)).toBe(false);
		});

		test("rejects the right fractions in the wrong order", () => {
			expect(isCorrectAnswer(scale([1, 6], [2, 6]), addition)).toBe(false);
		});
	});

	describe("combine step", () => {
		test("accepts the sum or difference over the common denominator", () => {
			expect(isCorrectAnswer(combine(3, 6), addition)).toBe(true);
			expect(isCorrectAnswer(combine(3, 6), subtraction)).toBe(true);
		});

		test("accepts the sum when the denominators already matched", () => {
			const solution = computeExpectedSolution(
				makeQuestion(frac(1, 5), "addition", frac(2, 5)),
			);
			expect(isCorrectAnswer(combine(3, 5), solution)).toBe(true);
		});

		test("rejects the simplified form until the simplify step", () => {
			expect(isCorrectAnswer(combine(1, 2), addition)).toBe(false);
		});

		test("rejects adding the denominators", () => {
			const solution = computeExpectedSolution(
				makeQuestion(frac(1, 3), "addition", frac(1, 3)),
			);
			expect(isCorrectAnswer(combine(2, 6), solution)).toBe(false);
		});

		test("rejects changing the bottom number", () => {
			expect(isCorrectAnswer(combine(3, 12), addition)).toBe(false);
		});

		test("rejects the wrong operation", () => {
			expect(isCorrectAnswer(combine(1, 6), addition)).toBe(false);
			expect(isCorrectAnswer(combine(7, 6), subtraction)).toBe(false);
		});

		test("rejects any other wrong numerator", () => {
			expect(isCorrectAnswer(combine(4, 6), addition)).toBe(false);
		});
	});

	describe("simplify step", () => {
		// 1/12 + 5/12 = 6/12, which simplifies to 1/2
		const sixTwelfths = computeExpectedSolution(
			makeQuestion(frac(1, 12), "addition", frac(5, 12)),
		);

		test("accepts the fraction in lowest terms", () => {
			expect(isCorrectAnswer(simplify(1, 2), sixTwelfths)).toBe(true);
		});

		test("rejects an unsimplified or only partly simplified fraction", () => {
			expect(isCorrectAnswer(simplify(6, 12), sixTwelfths)).toBe(false);
			expect(isCorrectAnswer(simplify(3, 6), sixTwelfths)).toBe(false);
		});

		test("rejects a different value", () => {
			expect(isCorrectAnswer(simplify(1, 3), sixTwelfths)).toBe(false);
			expect(isCorrectAnswer(simplify(1, 4), sixTwelfths)).toBe(false);
		});
	});
});
