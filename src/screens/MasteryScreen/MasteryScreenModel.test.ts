import { describe, expect, test } from "vitest";
import { Fraction } from "../../models/Fraction.ts";
import { MasteryScreenModel } from "./MasteryScreenModel.ts";
import type { MasteryProblem } from "./masteryProblems.ts";

const f = (n: number, d: number) => new Fraction(n, d);

const PROBLEMS: MasteryProblem[] = [
	{ frac1: f(1, 4), frac2: f(1, 4), operation: "addition" },
	{ frac1: f(2, 3), frac2: f(1, 6), operation: "subtraction" },
	{ frac1: f(1, 5), frac2: f(1, 5), operation: "addition" },
];

/** Maps difficulty → fixture so tests stay deterministic. */
function fromList(problems: MasteryProblem[]) {
	return (difficulty: number) => problems[difficulty % problems.length];
}

function makeModel() {
	return new MasteryScreenModel(fromList(PROBLEMS));
}

describe("MasteryScreenModel", () => {
	test("starts on the first problem with no answers", () => {
		const model = makeModel();
		expect(model.getCurrentProblem()).toBe(PROBLEMS[0]);
		expect(model.getDifficulty()).toBe(0);
		expect(model.getCorrectCount()).toBe(0);
		expect(model.getIncorrectCount()).toBe(0);
		expect(model.isOver()).toBe(false);
	});

	test("a correct answer scores a point and raises difficulty", () => {
		const model = makeModel();
		expect(model.submit(f(1, 2))).toBe(true);
		expect(model.getCorrectCount()).toBe(1);
		expect(model.getDifficulty()).toBe(1);
		expect(model.getCurrentProblem()).toBe(PROBLEMS[1]);
		expect(model.isOver()).toBe(false);
	});

	test("an answer that is not in lowest terms is wrong", () => {
		const model = makeModel();
		expect(model.submit(f(2, 4))).toBe(false);
		expect(model.isOver()).toBe(true);
	});

	test("a wrong answer ends the game and remembers the problem", () => {
		const model = makeModel();
		model.submit(f(1, 2));
		expect(model.submit(f(1, 3))).toBe(false);

		expect(model.isOver()).toBe(true);
		expect(model.getEndReason()).toBe("wrongAnswer");
		expect(model.getCorrectCount()).toBe(1);
		expect(model.getIncorrectCount()).toBe(1);
		expect(model.getAnsweredCount()).toBe(2);

		const missed = model.getMissedProblem()!;
		expect(missed.problem).toBe(PROBLEMS[1]);
		expect(missed.given.toString()).toBe("1/3");
		expect(missed.expected.toString()).toBe("1/2");
	});

	test("cannot answer after the game is over", () => {
		const model = makeModel();
		model.submit(f(9, 10));
		expect(() => model.submit(f(1, 2))).toThrow();
	});

	test("keeps generating after many correct answers", () => {
		const model = makeModel();
		model.submit(f(1, 2));
		model.submit(f(1, 2));
		model.submit(f(2, 5));
		expect(model.getCurrentProblem()).toBe(PROBLEMS[0]);
		expect(model.getCorrectCount()).toBe(3);
		expect(model.getDifficulty()).toBe(3);
		expect(model.isOver()).toBe(false);
	});

	test("exiting ends the game without counting a wrong answer", () => {
		const model = makeModel();
		model.submit(f(1, 2));
		model.exit();
		expect(model.isOver()).toBe(true);
		expect(model.getEndReason()).toBe("exited");
		expect(model.getIncorrectCount()).toBe(0);
		expect(model.getMissedProblem()).toBeUndefined();
	});

	test("exiting after a wrong answer keeps the wrong-answer result", () => {
		const model = makeModel();
		model.submit(f(1, 3));
		model.exit();
		expect(model.getEndReason()).toBe("wrongAnswer");
	});

	test("reset starts a fresh game at difficulty 0", () => {
		const model = makeModel();
		model.submit(f(1, 2));
		model.submit(f(1, 3));
		model.reset();
		expect(model.getCurrentProblem()).toBe(PROBLEMS[0]);
		expect(model.getDifficulty()).toBe(0);
		expect(model.getCorrectCount()).toBe(0);
		expect(model.getIncorrectCount()).toBe(0);
		expect(model.isOver()).toBe(false);
		expect(model.getMissedProblem()).toBeUndefined();
	});
});
