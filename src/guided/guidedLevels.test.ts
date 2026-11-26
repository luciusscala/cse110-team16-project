import { describe, expect, test } from "vitest";
import {
	GuidedSolutionModel,
	computeExpectedSolution,
} from "./GuidedSolutionModel.ts";
import { getStepPrompt } from "./stepPrompts.ts";
import { getAllLevels, getLevelById } from "../models/level/levelRepository.ts";
import type { Question } from "../models/level/LevelTypes.ts";

const guidedLevels = getAllLevels().filter((level) => level.guided);

/** Answers every step of a question correctly, using the expected solution. */
function solveCompletely(question: Question): GuidedSolutionModel {
	const solution = computeExpectedSolution(question);
	const model = new GuidedSolutionModel(question);
	for (const step of solution.steps) {
		switch (step) {
			case "lcd":
				model.submit({ step, lcd: solution.lcd });
				break;
			case "scaleNumerators":
				model.submit({ step, scaled: solution.scaled });
				break;
			case "combine":
				model.submit({ step, result: solution.combined });
				break;
			case "simplify":
				model.submit({ step, result: solution.simplified });
				break;
		}
	}
	return model;
}

describe("guided campaign levels", () => {
	test("every campaign level is guided", () => {
		expect(guidedLevels.map((level) => level.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	test.each(guidedLevels.flatMap((level) => level.questions))(
		"question $id can be walked through to its correct answer",
		(question) => {
			const model = solveCompletely(question);
			expect(model.isComplete()).toBe(true);
			expect(model.getFinalAnswer()?.isEqual(question.correctAnswer)).toBe(true);
			expect(model.getFinalAnswer()?.isSimplified()).toBe(true);
		},
	);

	test.each(guidedLevels.flatMap((level) => level.questions))(
		"question $id has a short tip for every step, ready to show",
		(question) => {
			const solution = computeExpectedSolution(question);
			for (const step of solution.steps) {
				const { tip } = getStepPrompt(step, solution);
				// Long enough to teach, short enough to fit the tip panel
				expect(tip.length).toBeGreaterThan(20);
				expect(tip.length).toBeLessThanOrEqual(150);
			}
		},
	);

	describe("level 1 (same-size slices)", () => {
		test("never asks for the LCD", () => {
			for (const question of getLevelById(1)!.questions) {
				const steps = new GuidedSolutionModel(question).getSteps();
				expect(steps).toEqual(["combine"]);
			}
		});
	});

	describe("level 2 (make it simpler)", () => {
		test("combines, then simplifies, without asking for the LCD", () => {
			for (const question of getLevelById(2)!.questions) {
				const steps = new GuidedSolutionModel(question).getSteps();
				expect(steps).toEqual(["combine", "simplify"]);
			}
		});
	});

	describe("level 3 (match the slices)", () => {
		const level3 = getLevelById(3)!;

		test("starts every question by asking for the LCD, then matching the slices", () => {
			for (const question of level3.questions) {
				const steps = new GuidedSolutionModel(question).getSteps();
				expect(steps.slice(0, 3)).toEqual(["lcd", "scaleNumerators", "combine"]);
			}
		});

		test("only simplifies on questions whose answer needs it", () => {
			const stepsPerQuestion = level3.questions.map((question) =>
				new GuidedSolutionModel(question).getSteps(),
			);
			const needsSimplify = stepsPerQuestion.map((steps) =>
				steps.includes("simplify"),
			);
			// Q1-Q3 are already simple; Q4 (3/6) and Q5 (5/10) are not.
			expect(needsSimplify).toEqual([false, false, false, true, true]);
		});

		test("accepts only the lowest common denominator", () => {
			for (const question of level3.questions) {
				const { lcd } = computeExpectedSolution(question);
				for (let attempt = 1; attempt <= 60; attempt++) {
					const model = new GuidedSolutionModel(question);
					const correct = model.submit({ step: "lcd", lcd: attempt });

					expect(correct).toBe(attempt === lcd);
					expect(model.getCurrentStep()).toBe(
						attempt === lcd ? "scaleNumerators" : "lcd",
					);
				}
			}
		});

		test("holds the player on the LCD step until they enter it", () => {
			const question = level3.questions[0]; // 1/2 + 1/4, LCD 4
			const model = new GuidedSolutionModel(question);

			expect(model.submit({ step: "lcd", lcd: 2 })).toBe(false);
			expect(model.submit({ step: "lcd", lcd: 8 })).toBe(false);
			expect(model.getCurrentStep()).toBe("lcd");

			expect(model.submit({ step: "lcd", lcd: 4 })).toBe(true);
			expect(model.getCurrentStep()).toBe("scaleNumerators");
			expect(model.getAttemptCount("lcd")).toBe(3);
		});
	});

	/** The steps each question in a level asks for, in question order. */
	const stepsIn = (levelId: number) =>
		getLevelById(levelId)!.questions.map((question) =>
			new GuidedSolutionModel(question).getSteps(),
		);
	const SAME = ["combine"];
	const SAME_SIMPLIFY = ["combine", "simplify"];
	const MATCH = ["lcd", "scaleNumerators", "combine"];
	const MATCH_SIMPLIFY = ["lcd", "scaleNumerators", "combine", "simplify"];

	describe("level 4 (take some away)", () => {
		test("starts with same-size slices, then needs matching", () => {
			expect(stepsIn(4)).toEqual([SAME, SAME_SIMPLIFY, MATCH, MATCH, MATCH_SIMPLIFY]);
		});

		test("is mostly taking away", () => {
			const operations = getLevelById(4)!.questions.map((q) => q.operation);
			expect(operations.filter((op) => op === "subtraction")).toHaveLength(4);
		});
	});

	describe("level 5 (different slices)", () => {
		test("asks for the LCD on every question and never needs simplifying", () => {
			expect(stepsIn(5)).toEqual([MATCH, MATCH, MATCH, MATCH, MATCH]);
		});

		test("ends with an LCD smaller than the two denominators multiplied", () => {
			const last = getLevelById(5)!.questions[4]; // 1/4 + 1/6
			expect(computeExpectedSolution(last).lcd).toBe(12);
		});
	});

	describe("level 6 (put it all together)", () => {
		test("asks for the LCD every time, and simplifies the last three", () => {
			expect(stepsIn(6)).toEqual([MATCH, MATCH, MATCH_SIMPLIFY, MATCH_SIMPLIFY, MATCH_SIMPLIFY]);
		});
	});

	describe("level 7 (final challenge)", () => {
		test("mixes same-size slices with slices that need matching", () => {
			expect(stepsIn(7)).toEqual([SAME_SIMPLIFY, SAME_SIMPLIFY, MATCH_SIMPLIFY, MATCH, MATCH]);
		});
	});
});
