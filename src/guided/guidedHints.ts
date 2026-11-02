import type { ExpectedSolution, StepError } from "./GuidedTypes.ts";

type HintWriter = (solution: ExpectedSolution) => string;

const denominators = (solution: ExpectedSolution) => {
	const { frac1, frac2 } = solution.question;
	return `${frac1.denominator} and ${frac2.denominator}`;
};

/**
 * One hint for every kind of mistake, written for a young player.
 *
 * Hints point at the mistake without giving the answer away, and only talk
 * about the step the player is on.
 */
const HINTS: Record<StepError, HintWriter> = {
	// Step 1: lowest common denominator
	notCommonMultiple: (s) =>
		`The new slice size has to fit into both ${denominators(s)} evenly. ` +
		"Try counting up by each number and look for one that is in both lists.",
	oneDenominatorOnly: (s) =>
		`That slice size only fits one of the fractions. Find one that both ${denominators(s)} fit into evenly.`,
	productNotLowest: (s) =>
		`Multiplying ${s.question.frac1.denominator} × ${s.question.frac2.denominator} works, but there is a smaller slice size that still fits both. ` +
		"Look at the lists of counting-up numbers again.",
	notLowest: () =>
		"That slice size works, but it is not the smallest one. Look for a smaller number that is in both counting-up lists.",

	// Step 2: matching the slices
	denominatorNotLcd: (s) =>
		`Both fractions need the same slice size now. Write each one with ${s.lcd} on the bottom.`,
	numeratorNotScaled: () =>
		"When the slices get cut smaller, you have more of them. Whatever you multiply the bottom by, multiply the top by too.",
	numeratorWrong: (s) =>
		`Check your multiplying for ${s.question.frac1} and ${s.question.frac2}. ` +
		"The top and the bottom must be multiplied by the same number.",

	// Step 3: combining the slices
	addedDenominators: () =>
		"The slices are all the same size, so the bottom number stays the same. Only the top numbers change.",
	denominatorChanged: (s) =>
		`The slices are all the same size now, so the bottom number stays ${s.lcd}.`,
	simplifiedTooEarly: (s) =>
		`That is the right amount! For now, keep ${s.lcd} on the bottom. You will make it simpler in the next step.`,
	wrongOperation: (s) =>
		s.question.operation === "addition"
			? "This question puts slices together. Add the top numbers."
			: "This question takes slices away. Subtract the top numbers.",
	wrongNumerator: (s) => {
		const [first, second] = s.scaled;
		const action =
			s.question.operation === "addition" ? "Add" : "Subtract";
		return `Count the slices again. ${action} the top numbers of ${first} and ${second}.`;
	},

	// Step 4: simplifying
	notSimplified: () =>
		"That is the same fraction as before. Find a number that divides both the top and the bottom evenly.",
	partlySimplified: () =>
		"Good start! You can still make the slices bigger. Can the top and the bottom both be divided by something again?",
	changedValue: () =>
		"Simplifying should not change how much pizza you have. Divide the top and the bottom by the same number.",
};

/** The hint for a mistake made on a question. */
export function getHint(error: StepError, solution: ExpectedSolution): string {
	return HINTS[error](solution);
}
