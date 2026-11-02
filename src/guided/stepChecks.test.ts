import { describe, expect, test } from "vitest";
import { computeExpectedSolution } from "./expectedSolution.ts";
import { checkLcd, checkScaleNumerators } from "./stepChecks.ts";
import { frac, makeQuestion } from "./testHelpers.ts";

const solutionFor = (
	a: ReturnType<typeof frac>,
	op: "addition" | "subtraction",
	b: ReturnType<typeof frac>,
) => computeExpectedSolution(makeQuestion(a, op, b));

describe("checkLcd", () => {
	// 1/4 + 1/6: LCD 12, product 24
	const fourAndSix = solutionFor(frac(1, 4), "addition", frac(1, 6));

	test("accepts the lowest common denominator", () => {
		expect(checkLcd(12, fourAndSix)).toBeUndefined();
	});

	test("accepts a denominator that is a multiple of the other", () => {
		// 1/2 + 1/4: the LCD is just 4
		const solution = solutionFor(frac(1, 2), "addition", frac(1, 4));
		expect(checkLcd(4, solution)).toBeUndefined();
	});

	test("accepts the product when the denominators share no factors", () => {
		const solution = solutionFor(frac(1, 2), "addition", frac(1, 3));
		expect(checkLcd(6, solution)).toBeUndefined();
	});

	test("flags a number that does not fit both denominators", () => {
		expect(checkLcd(10, fourAndSix)).toBe("notCommonMultiple");
	});

	test("flags a number smaller than both denominators", () => {
		expect(checkLcd(2, fourAndSix)).toBe("notCommonMultiple");
	});

	test("flags picking just one of the denominators", () => {
		expect(checkLcd(4, fourAndSix)).toBe("oneDenominatorOnly");
		expect(checkLcd(6, fourAndSix)).toBe("oneDenominatorOnly");
	});

	test("flags the product when a smaller common multiple exists", () => {
		expect(checkLcd(24, fourAndSix)).toBe("productNotLowest");
	});

	test("flags a common multiple that is neither lowest nor the product", () => {
		expect(checkLcd(36, fourAndSix)).toBe("notLowest");
	});
});

describe("checkScaleNumerators", () => {
	// 1/3 + 1/6: LCD 6, scaled 2/6 and 1/6
	const thirdAndSixth = solutionFor(frac(1, 3), "addition", frac(1, 6));

	test("accepts both fractions scaled correctly", () => {
		expect(
			checkScaleNumerators([frac(2, 6), frac(1, 6)], thirdAndSixth),
		).toBeUndefined();
	});

	test("accepts a fraction that already has the LCD as its denominator", () => {
		// 1/2 + 1/4: the second fraction is already over 4 and stays 1/4
		const solution = solutionFor(frac(1, 2), "addition", frac(1, 4));
		expect(
			checkScaleNumerators([frac(2, 4), frac(1, 4)], solution),
		).toBeUndefined();
	});

	test("flags a bottom number that is not the LCD", () => {
		expect(
			checkScaleNumerators([frac(1, 3), frac(1, 6)], thirdAndSixth),
		).toBe("denominatorNotLcd");
		expect(
			checkScaleNumerators([frac(2, 6), frac(1, 12)], thirdAndSixth),
		).toBe("denominatorNotLcd");
	});

	test("flags a top number that was not scaled", () => {
		expect(
			checkScaleNumerators([frac(1, 6), frac(1, 6)], thirdAndSixth),
		).toBe("numeratorNotScaled");
	});

	test("flags a top number that was scaled by the wrong amount", () => {
		expect(
			checkScaleNumerators([frac(3, 6), frac(1, 6)], thirdAndSixth),
		).toBe("numeratorWrong");
		expect(
			checkScaleNumerators([frac(2, 6), frac(2, 6)], thirdAndSixth),
		).toBe("numeratorWrong");
	});

	test("reports the first wrong fraction when both are wrong", () => {
		expect(
			checkScaleNumerators([frac(1, 3), frac(3, 6)], thirdAndSixth),
		).toBe("denominatorNotLcd");
	});

	test("scales both fractions when neither denominator is the LCD", () => {
		// 1/4 + 1/6: scaled 3/12 and 2/12
		const solution = solutionFor(frac(1, 4), "addition", frac(1, 6));
		expect(
			checkScaleNumerators([frac(3, 12), frac(2, 12)], solution),
		).toBeUndefined();
		expect(
			checkScaleNumerators([frac(3, 12), frac(1, 12)], solution),
		).toBe("numeratorNotScaled");
	});
});
