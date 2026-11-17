import { describe, expect, test } from "vitest";
import { LEVELS } from "../../models/level/levelData.ts";
import { formatEquation } from "../../guided/stepPrompts.ts";
import { MASTERY_PROBLEMS, masteryAnswer } from "./masteryProblems.ts";

describe("MASTERY_PROBLEMS", () => {
	test("has problems to play", () => {
		expect(MASTERY_PROBLEMS.length).toBeGreaterThanOrEqual(10);
	});

	test.each(MASTERY_PROBLEMS.map((p) => [formatEquation(p), p] as const))(
		"%s has an answer between 0 and 1, in lowest terms",
		(_, problem) => {
			const answer = masteryAnswer(problem);
			expect(answer.numerator).toBeGreaterThan(0);
			expect(answer.numerator).toBeLessThan(answer.denominator);
			expect(answer.isSimplified()).toBe(true);
		},
	);

	test("every problem is different", () => {
		const equations = MASTERY_PROBLEMS.map(formatEquation);
		expect(new Set(equations).size).toBe(equations.length);
	});

	test("is separate from the campaign questions", () => {
		const campaign = new Set(
			LEVELS.flatMap((level) => level.questions).map(formatEquation),
		);
		for (const problem of MASTERY_PROBLEMS) {
			expect(campaign.has(formatEquation(problem))).toBe(false);
		}
	});

	test("starts with matching slices and ends with different ones", () => {
		const first = MASTERY_PROBLEMS[0];
		const last = MASTERY_PROBLEMS[MASTERY_PROBLEMS.length - 1];
		expect(first.frac1.denominator).toBe(first.frac2.denominator);
		expect(last.frac1.denominator).not.toBe(last.frac2.denominator);
	});
});

describe("masteryAnswer", () => {
	test("adds and simplifies", () => {
		expect(masteryAnswer(MASTERY_PROBLEMS[4]).toString()).toBe("1/2"); // 1/8 + 3/8
	});

	test("subtracts over a common denominator", () => {
		expect(masteryAnswer(MASTERY_PROBLEMS[13]).toString()).toBe("1/12"); // 3/4 - 2/3
	});
});
