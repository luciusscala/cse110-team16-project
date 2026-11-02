import { describe, expect, test } from "vitest";
import { GuidedSolutionModel } from "./GuidedSolutionModel.ts";
import { computeExpectedSolution } from "./expectedSolution.ts";
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
	test("the early levels are the guided ones", () => {
		expect(guidedLevels.map((level) => level.id)).toEqual([1, 2, 3]);
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
					const feedback = model.submit({ step: "lcd", lcd: attempt });

					expect(feedback.correct).toBe(attempt === lcd);
					expect(model.getCurrentStep()).toBe(
						attempt === lcd ? "scaleNumerators" : "lcd",
					);
					if (attempt !== lcd) expect(feedback.hint).toBeTruthy();
				}
			}
		});

		test("holds the player on the LCD step until they enter it", () => {
			const question = level3.questions[0]; // 1/2 + 1/4, LCD 4
			const model = new GuidedSolutionModel(question);

			expect(model.submit({ step: "lcd", lcd: 2 }).correct).toBe(false);
			expect(model.submit({ step: "lcd", lcd: 8 }).correct).toBe(false);
			expect(model.getCurrentStep()).toBe("lcd");

			expect(model.submit({ step: "lcd", lcd: 4 }).correct).toBe(true);
			expect(model.getCurrentStep()).toBe("scaleNumerators");
			expect(model.getAttemptCount("lcd")).toBe(3);
		});
	});
});
