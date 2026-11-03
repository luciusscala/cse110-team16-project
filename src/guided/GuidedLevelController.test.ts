import Konva from "konva";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ProgressManager } from "../persistence/ProgressManager.ts";
import type { Screen, ScreenSwitcher } from "../types.ts";
import { GuidedLevelController } from "./GuidedLevelController.ts";
import type {
	FeedbackTone,
	GuidedLevelHandlers,
	GuidedLevelViewPort,
	QuestionHeader,
} from "./GuidedLevelViewPort.ts";
import type { StepPrompt } from "./stepPrompts.ts";

/** Records everything the controller shows, so tests can read it back. */
class FakeView implements GuidedLevelViewPort {
	header: QuestionHeader | undefined;
	prompt: StepPrompt | undefined;
	stepNames: readonly string[] = [];
	currentStepIndex = -1;
	fields: readonly string[] = [];
	activeIndex = -1;
	feedback: { message: string; tone: FeedbackTone } | undefined;
	completion: { summary: string; isLastQuestion: boolean } | undefined;
	questionsShown = 0;

	private readonly group = new Konva.Group();
	getGroup(): Konva.Group {
		return this.group;
	}
	show(): void {}
	hide(): void {}

	showQuestion(header: QuestionHeader): void {
		this.header = header;
		this.questionsShown++;
		this.feedback = undefined;
		this.completion = undefined;
	}
	showStep(prompt: StepPrompt, stepNames: readonly string[], index: number): void {
		this.prompt = prompt;
		this.stepNames = stepNames;
		this.currentStepIndex = index;
		this.feedback = undefined;
	}
	updateFields(fields: readonly string[], activeIndex: number): void {
		this.fields = fields;
		this.activeIndex = activeIndex;
	}
	showFeedback(message: string, tone: FeedbackTone): void {
		this.feedback = { message, tone };
	}
	showQuestionComplete(summary: string, isLastQuestion: boolean): void {
		this.completion = { summary, isLastQuestion };
	}
}

interface Harness {
	controller: GuidedLevelController;
	view: FakeView;
	handlers: GuidedLevelHandlers;
	screens: Screen[];
}

function setUp(): Harness {
	const view = new FakeView();
	const screens: Screen[] = [];
	const switcher: ScreenSwitcher = { switchToScreen: (s) => screens.push(s) };
	let handlers!: GuidedLevelHandlers;
	const controller = new GuidedLevelController(switcher, (h) => {
		handlers = h;
		return view;
	});
	return { controller, view, handlers, screens };
}

/** Types a number or fraction into the boxes, one box per value. */
function enter(h: Harness, ...values: number[]): void {
	values.forEach((value, index) => {
		h.handlers.onFieldSelected(index);
		for (const digit of String(value)) h.handlers.onDigit(digit);
	});
	h.handlers.onCheck();
}

describe("GuidedLevelController", () => {
	let h: Harness;

	beforeEach(() => {
		localStorage.clear();
		vi.restoreAllMocks();
		h = setUp();
	});

	describe("starting a level", () => {
		test("shows the first question of a guided level", () => {
			expect(h.controller.startLevel(1)).toBe(true);
			expect(h.view.header).toEqual({
				levelName: "Same Size Slices",
				questionNumber: 1,
				questionCount: 5,
				equation: "1/3 + 1/3",
			});
		});

		test("shows the first step with empty boxes", () => {
			h.controller.startLevel(3);
			expect(h.view.prompt?.title).toBe("Find the lowest common denominator");
			expect(h.view.stepNames).toEqual([
				"Find the LCD",
				"Match the slices",
				"Combine",
			]);
			expect(h.view.currentStepIndex).toBe(0);
			expect(h.view.fields).toEqual([""]);
			expect(h.view.activeIndex).toBe(0);
		});

		test("refuses a level that does not exist", () => {
			expect(h.controller.startLevel(99)).toBe(false);
			expect(h.controller.startLevel(0)).toBe(false);
			expect(h.controller.startLevel(1.5)).toBe(false);
			expect(h.view.header).toBeUndefined();
		});

		test("refuses a level that is not guided", () => {
			expect(h.controller.startLevel(4)).toBe(false);
			expect(h.view.header).toBeUndefined();
		});

		test("restarting a level goes back to its first question", () => {
			h.controller.startLevel(1);
			enter(h, 2, 3);
			h.handlers.onContinue();
			expect(h.view.header?.questionNumber).toBe(2);

			h.controller.startLevel(1);
			expect(h.view.header?.questionNumber).toBe(1);
		});
	});

	describe("typing", () => {
		beforeEach(() => h.controller.startLevel(3));

		test("digits go into the active box", () => {
			h.handlers.onDigit("1");
			h.handlers.onDigit("2");
			expect(h.view.fields).toEqual(["12"]);
		});

		test("backspace removes the last digit", () => {
			h.handlers.onDigit("1");
			h.handlers.onDigit("2");
			h.handlers.onBackspace();
			expect(h.view.fields).toEqual(["1"]);
		});

		test("selecting a box changes where digits go", () => {
			enter(h, 4); // LCD for 1/2 + 1/4; moves to the matching step (4 boxes)
			h.handlers.onFieldSelected(2);
			h.handlers.onDigit("7");
			expect(h.view.activeIndex).toBe(2);
			expect(h.view.fields).toEqual(["", "", "7", ""]);
		});

		test("typing before a level is started does nothing", () => {
			const fresh = setUp();
			fresh.handlers.onDigit("1");
			fresh.handlers.onBackspace();
			fresh.handlers.onFieldSelected(0);
			fresh.handlers.onCheck();
			expect(fresh.view.fields).toEqual([]);
		});
	});

	describe("checking the LCD step (level 3)", () => {
		// Question 1 is 1/2 + 1/4, so the LCD is 4.
		beforeEach(() => h.controller.startLevel(3));

		test("a correct LCD moves on to matching the slices", () => {
			enter(h, 4);
			expect(h.view.currentStepIndex).toBe(1);
			expect(h.view.prompt?.title).toBe("Make the slices match");
			expect(h.view.feedback).toEqual({ message: "Nice work!", tone: "correct" });
			expect(h.view.fields).toEqual(["", "", "", ""]);
		});

		test("a wrong LCD shows the hint for that mistake and stays put", () => {
			enter(h, 12); // a common multiple, but neither the lowest nor 2 x 4
			expect(h.view.currentStepIndex).toBe(0);
			expect(h.view.feedback?.tone).toBe("hint");
			expect(h.view.feedback?.message).toContain("not the smallest");
		});

		test("a wrong LCD keeps what was typed so it can be fixed", () => {
			enter(h, 8);
			expect(h.view.fields).toEqual(["8"]);
			h.handlers.onBackspace();
			h.handlers.onDigit("4");
			h.handlers.onCheck();
			expect(h.view.currentStepIndex).toBe(1);
		});

		test("different mistakes get different hints", () => {
			enter(h, 3);
			const notFit = h.view.feedback?.message;
			h.handlers.onBackspace();
			h.handlers.onDigit("2");
			h.handlers.onCheck();
			const oneDenominator = h.view.feedback?.message;
			expect(notFit).toBeTruthy();
			expect(oneDenominator).toBeTruthy();
			expect(notFit).not.toBe(oneDenominator);
		});

		test("an empty box asks for a number instead of counting as wrong", () => {
			h.handlers.onCheck();
			expect(h.view.feedback).toEqual({
				message: "Type whole numbers in the boxes, like 3 or 12.",
				tone: "hint",
			});
			expect(h.view.currentStepIndex).toBe(0);
		});

		test("an LCD of 0 asks for a bigger number", () => {
			enter(h, 0);
			expect(h.view.feedback?.message).toContain("bigger than 0");
		});
	});

	describe("every step, in a question that needs them all", () => {
		// Level 3 question 4 is 1/3 + 1/6: lcd 6, scaled 2/6 + 1/6, combined 3/6, simplified 1/2
		beforeEach(() => {
			h.controller.startLevel(3);
			// Questions 1-3 have LCDs of 4, 8 and 9.
			for (const lcd of [4, 8, 9]) {
				finishQuestion(h, lcd);
				h.handlers.onContinue();
			}
		});

		test("is on question 4 with four steps", () => {
			expect(h.view.header?.equation).toBe("1/3 + 1/6");
			expect(h.view.stepNames).toHaveLength(4);
		});

		test("walks through LCD, matching, combining and simplifying", () => {
			enter(h, 6);
			expect(h.view.prompt?.title).toBe("Make the slices match");
			enter(h, 2, 6, 1, 6);
			expect(h.view.prompt?.title).toBe("Put the slices together");
			enter(h, 3, 6);
			expect(h.view.prompt?.title).toBe("Make it simpler");
			expect(h.view.completion).toBeUndefined();
			enter(h, 1, 2);
			expect(h.view.completion?.summary).toBe("1/3 + 1/6 = 1/2");
		});

		test("a wrong simplification after earlier steps are right keeps the player on simplify", () => {
			enter(h, 6);
			enter(h, 2, 6, 1, 6);
			enter(h, 3, 6);
			enter(h, 3, 6); // unchanged, so not simplified
			expect(h.view.currentStepIndex).toBe(3);
			expect(h.view.feedback?.message).toContain("same fraction as before");
			expect(h.view.completion).toBeUndefined();
		});

		test("a wrong matching step gets the matching hint", () => {
			enter(h, 6);
			enter(h, 1, 6, 1, 6); // first top left unscaled
			expect(h.view.currentStepIndex).toBe(1);
			expect(h.view.feedback?.message).toContain("multiply the top by too");
		});

		test("combining on its own can be wrong and retried", () => {
			enter(h, 6);
			enter(h, 2, 6, 1, 6);
			enter(h, 3, 12);
			expect(h.view.feedback?.message).toContain("bottom number stays 6");
			h.handlers.onFieldSelected(1);
			h.handlers.onBackspace();
			h.handlers.onBackspace();
			h.handlers.onDigit("6");
			h.handlers.onCheck();
			expect(h.view.prompt?.title).toBe("Make it simpler");
		});
	});

	describe("finishing questions and the level", () => {
		test("shows the finished question and waits for Continue", () => {
			h.controller.startLevel(1);
			enter(h, 2, 3); // 1/3 + 1/3 = 2/3, level 1 needs only the combine step
			expect(h.view.completion).toEqual({
				summary: "1/3 + 1/3 = 2/3",
				isLastQuestion: false,
			});
		});

		test("does not take answers while a finished question waits for Continue", () => {
			h.controller.startLevel(1);
			enter(h, 2, 3);
			const before = h.view.fields;
			h.handlers.onDigit("5");
			h.handlers.onCheck();
			expect(h.view.fields).toEqual(before);
		});

		test("Continue moves to the next question with fresh boxes", () => {
			h.controller.startLevel(1);
			enter(h, 2, 3);
			h.handlers.onContinue();
			expect(h.view.header?.questionNumber).toBe(2);
			expect(h.view.header?.equation).toBe("1/5 + 2/5");
			expect(h.view.completion).toBeUndefined();
			expect(h.view.fields).toEqual(["", ""]);
		});

		test("Continue does nothing before the question is finished", () => {
			h.controller.startLevel(1);
			h.handlers.onContinue();
			expect(h.view.header?.questionNumber).toBe(1);
			expect(h.screens).toEqual([]);
		});

		test("marks the last question as the last", () => {
			h.controller.startLevel(1);
			playLevel1ToLastQuestion(h);
			enter(h, 9, 11);
			expect(h.view.completion?.isLastQuestion).toBe(true);
		});

		test("finishing the last question saves progress and returns to the menu", () => {
			const spy = vi.spyOn(ProgressManager, "increaseProgressTo");
			h.controller.startLevel(1);
			playLevel1ToLastQuestion(h);
			enter(h, 9, 11);
			h.handlers.onContinue();

			expect(spy).toHaveBeenCalledExactlyOnceWith(1);
			expect(ProgressManager.getUserProgress()).toBe(1);
			expect(h.screens).toEqual([{ type: "menu" }]);
		});

		test("replaying an earlier level never lowers saved progress", () => {
			ProgressManager.updateProgress(3);
			h.controller.startLevel(1);
			playLevel1ToLastQuestion(h);
			enter(h, 9, 11);
			h.handlers.onContinue();
			expect(ProgressManager.getUserProgress()).toBe(3);
		});

		test("Continue after leaving the level does nothing", () => {
			h.controller.startLevel(1);
			playLevel1ToLastQuestion(h);
			enter(h, 9, 11);
			h.handlers.onContinue();
			h.handlers.onContinue();
			expect(h.screens).toHaveLength(1);
		});
	});

	describe("going back", () => {
		test("returns to the menu without saving progress", () => {
			h.controller.startLevel(1);
			enter(h, 2, 3);
			h.handlers.onContinue();
			h.handlers.onBack();

			expect(h.screens).toEqual([{ type: "menu" }]);
			expect(ProgressManager.getUserProgress()).toBe(0);
		});

		test("typing after going back does nothing", () => {
			h.controller.startLevel(1);
			h.handlers.onBack();
			const before = h.view.fields;
			h.handlers.onDigit("1");
			expect(h.view.fields).toEqual(before);
		});
	});

	describe("every guided level can be played to the end", () => {
		test.each([1, 2, 3])("level %i", (levelId) => {
			const spy = vi.spyOn(ProgressManager, "increaseProgressTo");
			h.controller.startLevel(levelId);
			const total = h.view.header!.questionCount;

			for (let question = 0; question < total; question++) {
				expect(h.view.header?.questionNumber).toBe(question + 1);
				solveCurrentQuestion(h);
				expect(h.view.completion).toBeDefined();
				h.handlers.onContinue();
			}
			expect(spy).toHaveBeenCalledWith(levelId);
			expect(h.screens).toEqual([{ type: "menu" }]);
		});
	});
});

/**
 * Plays whichever question is on screen by reading the right answers off the
 * screen's own prompts. Only the LCD is passed in (it is the one value a
 * prompt can't show), so this also proves the prompts carry enough
 * information to finish each step.
 */
function finishQuestion(h: Harness, lcd: number): void {
	enter(h, lcd);
	solveRemainingSteps(h);
}

/** Pulls the numbers out of "a/b" strings. */
const parts = (text: string): number[] => text.split("/").map(Number);

function solveRemainingSteps(h: Harness): void {
	while (h.view.completion === undefined) {
		const title = h.view.prompt!.title;
		const instruction = h.view.prompt!.instruction;
		const fractions = [...instruction.matchAll(/(\d+)\/(\d+)/g)].map((m) => parts(m[0]));

		if (title === "Make the slices match") {
			const lcd = Number(/(\d+) on the bottom/.exec(instruction)![1]);
			const labels = h.view.prompt!.inputs.map((input) => parts(input.label.replace(" =", "")));
			const scaled = labels.flatMap(([n, d]) => [n * (lcd / d), lcd]);
			enter(h, ...scaled);
		} else if (title === "Put the slices together" || title === "Take the slices away") {
			const [[n1, d], [n2]] = fractions;
			enter(h, instruction.includes("+") ? n1 + n2 : n1 - n2, d);
		} else if (title === "Make it simpler") {
			const [[n, d]] = fractions;
			const divisor = greatestCommonDivisor(n, d);
			enter(h, n / divisor, d / divisor);
		} else {
			throw new Error(`Unexpected step: ${title}`);
		}
	}
}

function greatestCommonDivisor(a: number, b: number): number {
	return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

/** Solves the question on screen, working out the LCD from its equation. */
function solveCurrentQuestion(h: Harness): void {
	if (h.view.prompt!.title === "Find the lowest common denominator") {
		const [d1, d2] = [...h.view.prompt!.instruction.matchAll(/\d+/g)].map((m) => Number(m[0]));
		enter(h, (d1 * d2) / greatestCommonDivisor(d1, d2));
	}
	solveRemainingSteps(h);
}

/** Plays level 1's first four questions (all single-step: combine). */
function playLevel1ToLastQuestion(h: Harness): void {
	const answers: [number, number][] = [
		[2, 3],
		[3, 5],
		[5, 7],
		[7, 9],
	];
	for (const [n, d] of answers) {
		enter(h, n, d);
		h.handlers.onContinue();
	}
}
