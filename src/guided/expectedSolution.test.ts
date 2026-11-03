import { describe, expect, test } from "vitest";
import { computeExpectedSolution } from "./expectedSolution.ts";
import { frac, makeQuestion } from "./testHelpers.ts";

describe("computeExpectedSolution", () => {
	test("same denominators skip the matching steps", () => {
		const solution = computeExpectedSolution(
			makeQuestion(frac(1, 3), "addition", frac(1, 3)),
		);
		expect(solution.steps).toEqual(["combine"]);
		expect(solution.combined.toString()).toBe("2/3");
	});

	test("same denominators with a reducible answer end with simplify", () => {
		const solution = computeExpectedSolution(
			makeQuestion(frac(1, 4), "addition", frac(1, 4)),
		);
		expect(solution.steps).toEqual(["combine", "simplify"]);
		expect(solution.combined.toString()).toBe("2/4");
		expect(solution.simplified.toString()).toBe("1/2");
	});

	test("different denominators need every step", () => {
		const solution = computeExpectedSolution(
			makeQuestion(frac(1, 3), "addition", frac(1, 6)),
		);
		expect(solution.steps).toEqual([
			"lcd",
			"scaleNumerators",
			"combine",
			"simplify",
		]);
		expect(solution.lcd).toBe(6);
		expect(solution.scaled.map(String)).toEqual(["2/6", "1/6"]);
		expect(solution.combined.toString()).toBe("3/6");
		expect(solution.simplified.toString()).toBe("1/2");
	});

	test("different denominators with an already simple answer skip simplify", () => {
		const solution = computeExpectedSolution(
			makeQuestion(frac(1, 2), "addition", frac(1, 4)),
		);
		expect(solution.steps).toEqual(["lcd", "scaleNumerators", "combine"]);
		expect(solution.scaled.map(String)).toEqual(["2/4", "1/4"]);
		expect(solution.simplified.toString()).toBe("3/4");
	});

	test("the LCD is the lowest common multiple, not the product", () => {
		const solution = computeExpectedSolution(
			makeQuestion(frac(1, 4), "addition", frac(1, 6)),
		);
		expect(solution.lcd).toBe(12);
	});

	test("subtraction subtracts the scaled numerators", () => {
		const solution = computeExpectedSolution(
			makeQuestion(frac(5, 6), "subtraction", frac(1, 3)),
		);
		expect(solution.scaled.map(String)).toEqual(["5/6", "2/6"]);
		expect(solution.combined.toString()).toBe("3/6");
		expect(solution.simplified.toString()).toBe("1/2");
	});
});
