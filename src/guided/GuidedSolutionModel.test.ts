import { describe, expect, test } from "vitest";
import { GuidedSolutionModel } from "./GuidedSolutionModel.ts";
import type { StepAnswer } from "./GuidedTypes.ts";
import { frac, makeQuestion } from "./testHelpers.ts";

// 1/3 + 1/6: steps lcd -> scaleNumerators -> combine -> simplify
const thirdPlusSixth = () =>
	new GuidedSolutionModel(makeQuestion(frac(1, 3), "addition", frac(1, 6)));

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

const RIGHT = {
	lcd: lcd(6),
	scale: scale([2, 6], [1, 6]),
	combine: combine(3, 6),
	simplify: simplify(1, 2),
};

describe("GuidedSolutionModel", () => {
	describe("walking through a question", () => {
		test("starts on the first step with nothing completed", () => {
			const model = thirdPlusSixth();
			expect(model.getSteps()).toEqual([
				"lcd",
				"scaleNumerators",
				"combine",
				"simplify",
			]);
			expect(model.getCurrentStep()).toBe("lcd");
			expect(model.getCompletedSteps()).toEqual([]);
			expect(model.isComplete()).toBe(false);
			expect(model.getFinalAnswer()).toBeUndefined();
		});

		test("a correct answer moves on to the next step", () => {
			const model = thirdPlusSixth();
			expect(model.submit(RIGHT.lcd)).toBe(true);
			expect(model.getCurrentStep()).toBe("scaleNumerators");
			expect(model.getCompletedSteps()).toEqual(["lcd"]);
		});

		test("answering every step correctly completes the question", () => {
			const model = thirdPlusSixth();
			for (const answer of [RIGHT.lcd, RIGHT.scale, RIGHT.combine, RIGHT.simplify]) {
				expect(model.submit(answer)).toBe(true);
			}
			expect(model.isComplete()).toBe(true);
			expect(model.getCurrentStep()).toBeUndefined();
			expect(model.getFinalAnswer()?.toString()).toBe("1/2");
		});

		test("a question that needs fewer steps completes sooner", () => {
			const model = new GuidedSolutionModel(
				makeQuestion(frac(1, 3), "addition", frac(1, 3)),
			);
			expect(model.getSteps()).toEqual(["combine"]);
			model.submit(combine(2, 3));
			expect(model.isComplete()).toBe(true);
			expect(model.getFinalAnswer()?.toString()).toBe("2/3");
		});
	});

	describe("wrong answers", () => {
		test("stay on the same step", () => {
			const model = thirdPlusSixth();
			expect(model.submit(lcd(18))).toBe(false);
			expect(model.getCurrentStep()).toBe("lcd");
			expect(model.getCompletedSteps()).toEqual([]);
		});

		test("can be retried until correct", () => {
			const model = thirdPlusSixth();
			model.submit(lcd(5));
			model.submit(lcd(18));
			expect(model.submit(RIGHT.lcd)).toBe(true);
			expect(model.getCurrentStep()).toBe("scaleNumerators");
		});

		test("count every attempt, right or wrong, per step", () => {
			const model = thirdPlusSixth();
			model.submit(lcd(5));
			model.submit(lcd(18));
			model.submit(RIGHT.lcd);
			model.submit(RIGHT.scale);
			expect(model.getAttemptCount("lcd")).toBe(3);
			expect(model.getAttemptCount("scaleNumerators")).toBe(1);
			expect(model.getAttemptCount("combine")).toBe(0);
		});
	});

	describe("every combination of right and wrong steps", () => {
		// A wrong answer on one step must never change how later steps are
		// judged, so every mix of "wrong once, then right" must still finish.
		const wrong = {
			lcd: lcd(5),
			scale: scale([1, 3], [1, 6]),
			combine: combine(4, 6),
			simplify: simplify(1, 3),
		};
		const steps = ["lcd", "scale", "combine", "simplify"] as const;

		// 2^4 combinations of which steps get a wrong attempt first.
		for (let mask = 0; mask < 16; mask++) {
			const wrongOnce = steps.filter((_, i) => mask & (1 << i));
			const label = wrongOnce.length ? wrongOnce.join(" + ") : "none";

			test(`wrong first on: ${label}`, () => {
				const model = thirdPlusSixth();
				for (const name of steps) {
					if (wrongOnce.includes(name)) {
						expect(model.submit(wrong[name])).toBe(false);
					}
					expect(model.submit(RIGHT[name])).toBe(true);
				}
				expect(model.isComplete()).toBe(true);
				expect(model.getFinalAnswer()?.toString()).toBe("1/2");
			});
		}

		test("correct LCD but incorrect simplification", () => {
			const model = thirdPlusSixth();
			expect(model.submit(RIGHT.lcd)).toBe(true);
			expect(model.submit(RIGHT.scale)).toBe(true);
			expect(model.submit(RIGHT.combine)).toBe(true);
			expect(model.submit(simplify(3, 6))).toBe(false);
			expect(model.getCurrentStep()).toBe("simplify");
			expect(model.isComplete()).toBe(false);
		});
	});

	describe("misuse", () => {
		test("throws when answering a step that is not the current one", () => {
			const model = thirdPlusSixth();
			expect(() => model.submit(RIGHT.combine)).toThrow(/lcd/);
		});

		test("a rejected answer is not counted as an attempt", () => {
			const model = thirdPlusSixth();
			expect(() => model.submit(RIGHT.combine)).toThrow();
			expect(model.getAttemptCount("combine")).toBe(0);
			expect(model.getAttemptCount("lcd")).toBe(0);
		});

		test("throws when answering a completed question", () => {
			const model = new GuidedSolutionModel(
				makeQuestion(frac(1, 3), "addition", frac(1, 3)),
			);
			model.submit(combine(2, 3));
			expect(() => model.submit(combine(2, 3))).toThrow(/completed/);
		});
	});

	describe("subtraction", () => {
		test("walks through the same steps", () => {
			// 5/6 - 1/3: lcd 6, scaled 5/6 and 2/6, combined 3/6, simplified 1/2
			const model = new GuidedSolutionModel(
				makeQuestion(frac(5, 6), "subtraction", frac(1, 3)),
			);
			expect(model.submit(lcd(6))).toBe(true);
			expect(model.submit(scale([5, 6], [2, 6]))).toBe(true);
			expect(model.submit(combine(7, 6))).toBe(false); // added instead of subtracted
			expect(model.submit(combine(3, 6))).toBe(true);
			expect(model.submit(simplify(1, 2))).toBe(true);
			expect(model.isComplete()).toBe(true);
		});
	});
});
