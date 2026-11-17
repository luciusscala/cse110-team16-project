import Konva from "konva";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MASTERY_COUNTDOWN_SECONDS } from "../../constants.ts";
import { Fraction } from "../../models/Fraction.ts";
import type { ScreenSwitcher } from "../../types.ts";
import {
	CORRECT_MESSAGE,
	LOWEST_TERMS_RULE,
	MasteryScreenController,
} from "./MasteryScreenController.ts";
import { MasteryScreenModel } from "./MasteryScreenModel.ts";
import type {
	MasteryScreenHandlers,
	MasteryScreenViewPort,
	MasterySummary,
} from "./MasteryScreenViewPort.ts";
import type { MasteryProblem } from "./masteryProblems.ts";


class FakeView implements MasteryScreenViewPort {
	countdowns: number[] = [];
	rule = "";
	equation = "";
	problemNumber = 0;
	score = -1;
	fields: readonly string[] = [];
	activeIndex = -1;
	message = "";
	summary: MasterySummary | undefined;

	private readonly group = new Konva.Group();
	getGroup(): Konva.Group {
		return this.group;
	}
	show(): void {}
	hide(): void {}

	showCountdown(secondsLeft: number, rule: string): void {
		this.countdowns.push(secondsLeft);
		this.rule = rule;
		this.summary = undefined;
	}
	showProblem(equation: string, problemNumber: number): void {
		this.equation = equation;
		this.problemNumber = problemNumber;
		this.message = "";
	}
	updateScore(correctCount: number): void {
		this.score = correctCount;
	}
	updateFields(fields: readonly string[], activeIndex: number): void {
		this.fields = fields;
		this.activeIndex = activeIndex;
	}
	showMessage(message: string): void {
		this.message = message;
	}
	showSummary(summary: MasterySummary): void {
		this.summary = summary;
	}
}

const f = (n: number, d: number) => new Fraction(n, d);


const PROBLEMS: MasteryProblem[] = [
	{ frac1: f(1, 4), frac2: f(1, 4), operation: "addition" },
	{ frac1: f(2, 3), frac2: f(1, 6), operation: "subtraction" },
];

function fromList(problems: MasteryProblem[]) {
	return (difficulty: number) => problems[difficulty % problems.length];
}

function setup() {
	const switcher: ScreenSwitcher = { switchToScreen: vi.fn() };
	let view!: FakeView;
	let handlers!: MasteryScreenHandlers;
	const controller = new MasteryScreenController(
		switcher,
		(h) => {
			handlers = h;
			view = new FakeView();
			return view;
		},
		new MasteryScreenModel(fromList(PROBLEMS)),
	);
	return { controller, switcher, view, handlers };
}

/** Starts a game and lets the countdown finish. */
function startPlaying() {
	const parts = setup();
	parts.controller.startGame();
	vi.advanceTimersByTime(MASTERY_COUNTDOWN_SECONDS * 1000);
	return parts;
}

function answer(handlers: MasteryScreenHandlers, top: string, bottom: string) {
	handlers.onFieldSelected(0);
	for (const digit of top) handlers.onDigit(digit);
	handlers.onFieldSelected(1);
	for (const digit of bottom) handlers.onDigit(digit);
	handlers.onCheck();
}

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("MasteryScreenController countdown", () => {
	test("counts 3, 2, 1 with the lowest terms rule before the first problem", () => {
		const { controller, view } = setup();
		controller.startGame();

		expect(view.countdowns).toEqual([3]);
		expect(view.rule).toBe(LOWEST_TERMS_RULE);
		expect(view.equation).toBe("");

		vi.advanceTimersByTime(1000);
		vi.advanceTimersByTime(1000);
		expect(view.countdowns).toEqual([3, 2, 1]);
		expect(view.equation).toBe("");

		vi.advanceTimersByTime(1000);
		expect(view.equation).toBe("1/4 + 1/4");
		expect(view.problemNumber).toBe(1);
		expect(view.score).toBe(0);
	});

	test("ignores the keypad during the countdown", () => {
		const { controller, view, handlers } = setup();
		controller.startGame();
		handlers.onDigit("1");
		handlers.onCheck();
		expect(view.fields).toEqual([]);
		expect(controller.getModel().getAnsweredCount()).toBe(0);
	});

	test("hiding the screen stops the countdown", () => {
		const { controller, view } = setup();
		controller.startGame();
		controller.hide();
		vi.advanceTimersByTime(10_000);
		expect(view.countdowns).toEqual([3]);
		expect(view.equation).toBe("");
	});

	test("does not run a game timer once playing", () => {
		startPlaying();
		expect(vi.getTimerCount()).toBe(0);
	});
});

describe("MasteryScreenController playing", () => {
	test("typing fills the answer boxes", () => {
		const { view, handlers } = startPlaying();
		handlers.onDigit("1");
		handlers.onFieldSelected(1);
		handlers.onDigit("2");
		expect(view.fields).toEqual(["1", "2"]);
		expect(view.activeIndex).toBe(1);

		handlers.onBackspace();
		expect(view.fields).toEqual(["1", ""]);
	});

	test("a correct answer updates the score and shows the next problem", () => {
		const { controller, view, handlers } = startPlaying();
		answer(handlers, "1", "2");

		expect(view.score).toBe(1);
		expect(view.equation).toBe("2/3 - 1/6");
		expect(view.problemNumber).toBe(2);
		expect(view.message).toBe(CORRECT_MESSAGE);
		expect(view.fields).toEqual(["", ""]);
		expect(view.summary).toBeUndefined();
		expect(controller.getModel().getCorrectCount()).toBe(1);
	});

	test("goes back to the first problem after the last one", () => {
		const { view, handlers } = startPlaying();
		answer(handlers, "1", "2");
		answer(handlers, "1", "2");
		expect(view.equation).toBe("1/4 + 1/4");
		expect(view.problemNumber).toBe(3);
		expect(view.score).toBe(2);
	});

	test("an empty box gets a message and does not end the game", () => {
		const { controller, view, handlers } = startPlaying();
		handlers.onDigit("1");
		handlers.onCheck();
		expect(view.message).toMatch(/whole numbers/);
		expect(view.summary).toBeUndefined();
		expect(controller.getModel().getAnsweredCount()).toBe(0);
	});

	test("0 on the bottom gets a message and does not end the game", () => {
		const { view, handlers } = startPlaying();
		answer(handlers, "1", "0");
		expect(view.message).toMatch(/can't be 0/);
		expect(view.summary).toBeUndefined();
	});
});


describe("MasteryScreenController end of game", () => {
	test("a wrong answer ends the game with the results", () => {
		const { switcher, handlers } = startPlaying();
		answer(handlers, "1", "2");
		answer(handlers, "1", "3");

		expect(switcher.switchToScreen).toHaveBeenCalledWith({
			type: "gameOver",
			gameId: "masteryMode",
			score: 1,
			summary: {
				title: "Game over!",
				correctCount: 1,
				incorrectCount: 1,
				detail: "2/3 - 1/6 = 1/2. You answered 1/3.",
			},
		});
	});

	test("an equal answer not in lowest terms ends the game with a reminder", () => {
		const { switcher, handlers } = startPlaying();
		answer(handlers, "2", "4");

		expect(switcher.switchToScreen).toHaveBeenCalledWith({
			type: "gameOver",
			gameId: "masteryMode",
			score: 0,
			summary: {
				title: "Game over!",
				correctCount: 0,
				incorrectCount: 1,
				detail: expect.stringContaining("You answered 2/4."),
			},
		});

		const call = vi.mocked(switcher.switchToScreen).mock.calls[0][0];
		if (call.type !== "gameOver") {
			throw new Error("Expected Game Over screen");
		}
		expect(call.summary?.detail).toMatch(/lowest terms/);
	});

	test("the keypad does nothing after the game is over", () => {
		const { controller, handlers, switcher } = startPlaying();
		answer(handlers, "1", "3");

		expect(() => answer(handlers, "1", "2")).not.toThrow();
		expect(controller.getModel().getAnsweredCount()).toBe(1);
		expect(switcher.switchToScreen).toHaveBeenCalledTimes(1);
	});

	test("exiting while playing shows the results so far", () => {
		const { switcher, handlers } = startPlaying();
		answer(handlers, "1", "2");
		handlers.onExit();

		expect(switcher.switchToScreen).toHaveBeenCalledWith({
			type: "gameOver",
			gameId: "masteryMode",
			score: 1,
			summary: {
				title: "Game ended",
				correctCount: 1,
				incorrectCount: 0,
				detail: "",
			},
		});
	});

	test("exiting during the countdown shows the results and stops the countdown", () => {
		const { controller, view, switcher, handlers } = setup();
		controller.startGame();
		handlers.onExit();
		vi.advanceTimersByTime(10_000);

		expect(switcher.switchToScreen).toHaveBeenCalledWith({
			type: "gameOver",
			gameId: "masteryMode",
			score: 0,
			summary: {
				title: "Game ended",
				correctCount: 0,
				incorrectCount: 0,
				detail: "",
			},
		});

		expect(switcher.switchToScreen).toHaveBeenCalledTimes(1);
		expect(view.equation).toBe("");
	});

	test("play again starts a new game from the countdown", () => {
		const { controller, view, handlers } = startPlaying();
		answer(handlers, "1", "2");
		answer(handlers, "1", "3");
		handlers.onPlayAgain();

		expect(view.summary).toBeUndefined();
		expect(view.score).toBe(0);
		expect(view.countdowns.at(-1)).toBe(MASTERY_COUNTDOWN_SECONDS);
		expect(controller.getModel().getAnsweredCount()).toBe(0);

		vi.advanceTimersByTime(MASTERY_COUNTDOWN_SECONDS * 1000);
		expect(view.equation).toBe("1/4 + 1/4");
		expect(view.problemNumber).toBe(1);
	});

	test("main menu goes back to the menu", () => {
		const { switcher, handlers } = startPlaying();
		handlers.onExit();
		handlers.onMainMenu();
		expect(switcher.switchToScreen).toHaveBeenCalledWith({ type: "menu" });
	});
});

