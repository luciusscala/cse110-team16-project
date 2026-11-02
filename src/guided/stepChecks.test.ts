import { describe, expect, test } from "vitest";
import { computeExpectedSolution } from "./expectedSolution.ts";
import { checkLcd } from "./stepChecks.ts";
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
