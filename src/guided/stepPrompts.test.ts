import { describe, expect, test } from "vitest";
import { computeExpectedSolution } from "./expectedSolution.ts";
import { parseStepAnswer } from "./answerParsing.ts";
import type { StepKind } from "./GuidedTypes.ts";
import {
	countFields,
	formatEquation,
	getStepPrompt,
	STEP_NAMES,
} from "./stepPrompts.ts";
import { frac, makeQuestion } from "./testHelpers.ts";

// 1/3 + 1/6: LCD 6, scaled 2/6 and 1/6, combined 3/6, simplified 1/2
const addition = computeExpectedSolution(
	makeQuestion(frac(1, 3), "addition", frac(1, 6)),
);
// 5/6 - 1/3: scaled 5/6 and 2/6, combined 3/6
const subtraction = computeExpectedSolution(
	makeQuestion(frac(5, 6), "subtraction", frac(1, 3)),
);

describe("formatEquation", () => {
	test("writes additions and subtractions", () => {
		expect(formatEquation(addition.question)).toBe("1/3 + 1/6");
		expect(formatEquation(subtraction.question)).toBe("5/6 - 1/3");
	});
});

describe("getStepPrompt", () => {
	test("the LCD step teaches counting up, using the two denominators", () => {
		const prompt = getStepPrompt("lcd", addition);
		expect(prompt.tip).toContain("Count up by 3s and by 6s");
		expect(prompt.instruction).toContain("3 and 6");
		expect(prompt.inputs).toEqual([{ kind: "number", label: "LCD =" }]);
	});

	test("the matching step names the LCD and asks for both fractions", () => {
		const prompt = getStepPrompt("scaleNumerators", addition);
		expect(prompt.instruction).toContain("6 on the bottom");
		expect(prompt.inputs.map((input) => input.label)).toEqual(["1/3 =", "1/6 ="]);
		expect(prompt.inputs.every((input) => input.kind === "fraction")).toBe(true);
	});

	test("the combine step shows the scaled fractions with the right symbol", () => {
		expect(getStepPrompt("combine", addition).instruction).toContain("2/6 + 1/6");
		expect(getStepPrompt("combine", subtraction).instruction).toContain("5/6 - 2/6");
	});

	test("the combine title and tip match the operation", () => {
		expect(getStepPrompt("combine", addition).title).toContain("together");
		expect(getStepPrompt("combine", addition).tip).toContain("add the top numbers");
		expect(getStepPrompt("combine", subtraction).title).toContain("away");
		expect(getStepPrompt("combine", subtraction).tip).toContain("subtract the top numbers");
	});

	test("the combine tip says the bottom number stays the same", () => {
		expect(getStepPrompt("combine", addition).tip).toContain("bottom number stays the same");
	});

	test("every step has a tip that explains how to do it", () => {
		for (const step of Object.keys(STEP_NAMES) as StepKind[]) {
			expect(getStepPrompt(step, addition).tip.length).toBeGreaterThan(20);
		}
	});

	test("the simplify step shows the combined fraction", () => {
		const prompt = getStepPrompt("simplify", addition);
		expect(prompt.instruction).toContain("3/6");
		expect(prompt.inputs).toEqual([{ kind: "fraction", label: "3/6 =" }]);
	});

	test("tips never contain the answer to their own step", () => {
		// 1/4 + 1/6: LCD 12; 1/3 + 1/6 combines to 3/6 and simplifies to 1/2
		const fourAndSix = computeExpectedSolution(
			makeQuestion(frac(1, 4), "addition", frac(1, 6)),
		);
		expect(getStepPrompt("lcd", fourAndSix).tip).not.toContain("12");
		expect(getStepPrompt("combine", addition).tip).not.toContain("3/6");
		expect(getStepPrompt("simplify", addition).tip).not.toContain("1/2");
	});

	test("prompts never contain the answer to their own step", () => {
		// 1/4 + 1/6 has an LCD (12) that is not one of the denominators
		const fourAndSix = computeExpectedSolution(
			makeQuestion(frac(1, 4), "addition", frac(1, 6)),
		);
		expect(getStepPrompt("lcd", fourAndSix).instruction).not.toContain("12");
		expect(getStepPrompt("combine", addition).instruction).not.toContain("3/6");
		expect(getStepPrompt("simplify", addition).instruction).not.toContain("1/2");
	});

	test("every step has a distinct title and a name for the tracker", () => {
		const steps = Object.keys(STEP_NAMES) as StepKind[];
		const titles = steps.map((step) => getStepPrompt(step, addition).title);
		expect(new Set(titles).size).toBe(steps.length);
		for (const step of steps) expect(STEP_NAMES[step].length).toBeGreaterThan(0);
	});
});

describe("countFields", () => {
	test("counts one box per number and two per fraction", () => {
		expect(countFields(getStepPrompt("lcd", addition))).toBe(1);
		expect(countFields(getStepPrompt("scaleNumerators", addition))).toBe(4);
		expect(countFields(getStepPrompt("combine", addition))).toBe(2);
		expect(countFields(getStepPrompt("simplify", addition))).toBe(2);
	});

	test("matches the number of boxes the parser expects for each step", () => {
		for (const step of Object.keys(STEP_NAMES) as StepKind[]) {
			const blanks = new Array<string>(countFields(getStepPrompt(step, addition))).fill("1");
			expect(() => parseStepAnswer(step, blanks)).not.toThrow();
		}
	});
});
