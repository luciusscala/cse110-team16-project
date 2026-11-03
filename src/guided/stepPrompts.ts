import type { Operation, Question } from "../models/level/LevelTypes.ts";
import type { ExpectedSolution, StepKind } from "./GuidedTypes.ts";

/** One thing the player types: a single number, or a fraction in two boxes. */
export interface InputGroup {
	readonly kind: "number" | "fraction";
	/** Shown beside the boxes, e.g. "1/2 =". */
	readonly label: string;
}

/** What the screen shows while the player is on one step. */
export interface StepPrompt {
	readonly title: string;
	readonly instruction: string;
	readonly inputs: readonly InputGroup[];
}

/** Short names for the step tracker, in the same words as the step titles. */
export const STEP_NAMES: Record<StepKind, string> = {
	lcd: "Find the LCD",
	scaleNumerators: "Match the slices",
	combine: "Combine",
	simplify: "Simplify",
};

const OPERATION_SYMBOLS: Record<Operation, string> = {
	addition: "+",
	subtraction: "-",
};

/** The question written as a sum, e.g. "1/2 + 1/4". */
export function formatEquation(question: Question): string {
	const symbol = OPERATION_SYMBOLS[question.operation];
	return `${question.frac1} ${symbol} ${question.frac2}`;
}

/**
 * The instruction and answer boxes for a step.
 *
 * Wording only uses values from earlier steps, which are always the correct
 * ones, and never reveals the answer to the step itself.
 */
export function getStepPrompt(
	step: StepKind,
	solution: ExpectedSolution,
): StepPrompt {
	const { question } = solution;
	const [first, second] = solution.scaled;

	switch (step) {
		case "lcd":
			return {
				title: "Find the lowest common denominator",
				instruction: `What is the smallest number that both ${question.frac1.denominator} and ${question.frac2.denominator} fit into evenly?`,
				inputs: [{ kind: "number", label: "LCD =" }],
			};
		case "scaleNumerators":
			return {
				title: "Make the slices match",
				instruction: `Rewrite each fraction so it has ${solution.lcd} on the bottom.`,
				inputs: [
					{ kind: "fraction", label: `${question.frac1} =` },
					{ kind: "fraction", label: `${question.frac2} =` },
				],
			};
		case "combine": {
			const symbol = OPERATION_SYMBOLS[question.operation];
			return {
				title:
					question.operation === "addition"
						? "Put the slices together"
						: "Take the slices away",
				instruction: `Work out ${first} ${symbol} ${second}.`,
				inputs: [{ kind: "fraction", label: "=" }],
			};
		}
		case "simplify":
			return {
				title: "Make it simpler",
				instruction: `Write ${solution.combined} using the biggest slices possible.`,
				inputs: [{ kind: "fraction", label: `${solution.combined} =` }],
			};
	}
}

/** How many text boxes a prompt needs: one per number, two per fraction. */
export function countFields(prompt: StepPrompt): number {
	return prompt.inputs.reduce(
		(total, input) => total + (input.kind === "fraction" ? 2 : 1),
		0,
	);
}
