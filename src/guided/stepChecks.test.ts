import { describe, expect, test } from "vitest";
import { computeExpectedSolution } from "./expectedSolution.ts";
import {
	checkCombine,
	checkLcd,
	checkScaleNumerators,
	checkSimplify,
} from "./stepChecks.ts";
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

describe("checkCombine", () => {
	test("accepts the sum over the common denominator", () => {
		const solution = solutionFor(frac(1, 3), "addition", frac(1, 6));
		expect(checkCombine(frac(3, 6), solution)).toBeUndefined();
	});

	test("accepts the difference over the common denominator", () => {
		const solution = solutionFor(frac(5, 6), "subtraction", frac(1, 3));
		expect(checkCombine(frac(3, 6), solution)).toBeUndefined();
	});

	test("accepts the sum when the denominators already matched", () => {
		const solution = solutionFor(frac(1, 5), "addition", frac(2, 5));
		expect(checkCombine(frac(3, 5), solution)).toBeUndefined();
	});

	test("flags simplifying before the simplify step", () => {
		const solution = solutionFor(frac(1, 3), "addition", frac(1, 6));
		expect(checkCombine(frac(1, 2), solution)).toBe("simplifiedTooEarly");
	});

	test("flags adding the denominators", () => {
		const solution = solutionFor(frac(1, 3), "addition", frac(1, 3));
		expect(checkCombine(frac(2, 6), solution)).toBe("addedDenominators");
	});

	test("flags adding the denominators even when they differ", () => {
		const solution = solutionFor(frac(1, 2), "addition", frac(1, 4));
		expect(checkCombine(frac(3, 6), solution)).toBe("addedDenominators");
	});

	test("flags a denominator other than the common denominator", () => {
		const solution = solutionFor(frac(1, 3), "addition", frac(1, 6));
		expect(checkCombine(frac(3, 12), solution)).toBe("denominatorChanged");
		expect(checkCombine(frac(3, 3), solution)).toBe("denominatorChanged");
	});

	test("flags subtracting on an addition question", () => {
		// 2/6 + 1/6 would be 3/6; 2/6 - 1/6 is 1/6
		const solution = solutionFor(frac(1, 3), "addition", frac(1, 6));
		expect(checkCombine(frac(1, 6), solution)).toBe("wrongOperation");
	});

	test("flags adding on a subtraction question", () => {
		// 5/6 - 2/6 is 3/6; 5/6 + 2/6 is 7/6
		const solution = solutionFor(frac(5, 6), "subtraction", frac(1, 3));
		expect(checkCombine(frac(7, 6), solution)).toBe("wrongOperation");
	});

	test("flags any other wrong numerator", () => {
		const solution = solutionFor(frac(1, 3), "addition", frac(1, 6));
		expect(checkCombine(frac(4, 6), solution)).toBe("wrongNumerator");
	});
});

describe("checkSimplify", () => {
	// 1/12 + 5/12 = 6/12, which simplifies to 1/2 (halving to 3/6 is only partway)
	const sixTwelfths = solutionFor(frac(1, 12), "addition", frac(5, 12));

	test("accepts the fraction in lowest terms", () => {
		expect(checkSimplify(frac(1, 2), sixTwelfths)).toBeUndefined();
	});

	test("flags handing back the unsimplified fraction", () => {
		expect(checkSimplify(frac(6, 12), sixTwelfths)).toBe("notSimplified");
	});

	test("flags an equal fraction that is bigger than the combined one", () => {
		expect(checkSimplify(frac(12, 24), sixTwelfths)).toBe("notSimplified");
	});

	test("flags simplifying only part of the way", () => {
		expect(checkSimplify(frac(3, 6), sixTwelfths)).toBe("partlySimplified");
	});

	test("flags an answer with a different value", () => {
		expect(checkSimplify(frac(1, 3), sixTwelfths)).toBe("changedValue");
		expect(checkSimplify(frac(1, 4), sixTwelfths)).toBe("changedValue");
	});

	test("works for a different question", () => {
		// 2/9 + 4/9 = 6/9 -> 2/3
		const solution = solutionFor(frac(2, 9), "addition", frac(4, 9));
		expect(checkSimplify(frac(2, 3), solution)).toBeUndefined();
		expect(checkSimplify(frac(6, 9), solution)).toBe("notSimplified");
		expect(checkSimplify(frac(2, 9), solution)).toBe("changedValue");
	});
});
