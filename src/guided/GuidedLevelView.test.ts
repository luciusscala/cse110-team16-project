import Konva from "konva";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { GuidedLevelView } from "./GuidedLevelView.ts";
import type { GuidedLevelHandlers } from "./GuidedLevelViewPort.ts";
import type { StepPrompt } from "./stepPrompts.ts";

const FRACTION_PROMPT: StepPrompt = {
	title: "Put the slices together",
	tip: "Add the top numbers.",
	instruction: "Work out 2/6 + 1/6.",
	inputs: [{ kind: "fraction", label: "=" }],
};
const NUMBER_PROMPT: StepPrompt = {
	title: "Find the lowest common denominator",
	tip: "Count up by 3s and by 6s.",
	instruction: "What is the smallest number that both 3 and 6 fit into evenly?",
	inputs: [{ kind: "number", label: "LCD =" }],
};
const TWO_FRACTIONS_PROMPT: StepPrompt = {
	title: "Make the slices match",
	tip: "Multiply the top and the bottom by the same number.",
	instruction: "Rewrite each fraction so it has 6 on the bottom.",
	inputs: [
		{ kind: "fraction", label: "1/3 =" },
		{ kind: "fraction", label: "1/6 =" },
	],
};

function makeHandlers() {
	return {
		onDigit: vi.fn(),
		onBackspace: vi.fn(),
		onFieldSelected: vi.fn(),
		onCheck: vi.fn(),
		onContinue: vi.fn(),
		onBack: vi.fn(),
	} satisfies GuidedLevelHandlers;
}

/** All the text currently drawn by the view. */
const textsIn = (group: Konva.Group): string[] =>
	group.find<Konva.Text>("Text").map((node) => node.text());

describe("GuidedLevelView", () => {
	let handlers: ReturnType<typeof makeHandlers>;
	let view: GuidedLevelView;
	let group: Konva.Group;

	const named = (name: string): Konva.Group => {
		const node = group.findOne<Konva.Group>(`.${name}`);
		if (!node) throw new Error(`No node named ${name}`);
		return node;
	};
	const click = (name: string) => named(name).fire("click");

	beforeEach(() => {
		handlers = makeHandlers();
		view = new GuidedLevelView(handlers);
		group = view.getGroup();
		new Konva.Layer().add(group);
	});

	describe("visibility", () => {
		test("starts hidden", () => {
			expect(group.visible()).toBe(false);
		});

		test("show and hide toggle the group", () => {
			view.show();
			expect(group.visible()).toBe(true);
			view.hide();
			expect(group.visible()).toBe(false);
		});
	});

	describe("question header", () => {
		test("shows the level, question number and equation", () => {
			view.showQuestion({
				levelName: "Match the Slices",
				questionNumber: 2,
				questionCount: 5,
				equation: "1/4 + 3/8",
			});
			const texts = textsIn(group);
			expect(texts).toContain("Match the Slices  -  Question 2 of 5");
			expect(texts).toContain("1/4 + 3/8");
		});
	});

	describe("buttons", () => {
		test.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])("digit %i sends that digit", (digit) => {
			click(`digit-${digit}`);
			expect(handlers.onDigit).toHaveBeenCalledExactlyOnceWith(String(digit));
		});

		test("Delete, Check and Back send their actions", () => {
			click("backspace");
			click("check");
			click("back");
			expect(handlers.onBackspace).toHaveBeenCalledOnce();
			expect(handlers.onCheck).toHaveBeenCalledOnce();
			expect(handlers.onBack).toHaveBeenCalledOnce();
		});

		test("buttons also respond to taps", () => {
			named("check").fire("tap");
			expect(handlers.onCheck).toHaveBeenCalledOnce();
		});
	});

	describe("answer boxes", () => {
		test("a number step draws one box", () => {
			view.showStep(NUMBER_PROMPT, ["Find the LCD"], 0);
			expect(group.find(".field-0")).toHaveLength(1);
			expect(group.find(".field-1")).toHaveLength(0);
			expect(textsIn(group)).toContain("LCD =");
		});

		test("a fraction step draws a top and a bottom box", () => {
			view.showStep(FRACTION_PROMPT, ["Combine"], 0);
			expect(group.find(".field-0")).toHaveLength(1);
			expect(group.find(".field-1")).toHaveLength(1);
			expect(group.find(".field-2")).toHaveLength(0);
		});

		test("the top box sits above the bottom box", () => {
			view.showStep(FRACTION_PROMPT, ["Combine"], 0);
			expect(named("field-0").findOne("Rect")!.y()).toBeLessThan(
				named("field-1").findOne("Rect")!.y(),
			);
		});

		test("two fractions draw four boxes, the second pair to the right", () => {
			view.showStep(TWO_FRACTIONS_PROMPT, ["Match the slices"], 0);
			expect(group.find(".field-3")).toHaveLength(1);
			expect(group.find(".field-4")).toHaveLength(0);
			expect(named("field-2").findOne("Rect")!.x()).toBeGreaterThan(
				named("field-0").findOne("Rect")!.x(),
			);
		});

		test("the boxes are centered on the stage", () => {
			view.showStep(TWO_FRACTIONS_PROMPT, ["Match the slices"], 0);
			const boxes = [0, 1, 2, 3].map((i) => named(`field-${i}`).findOne("Rect")!);
			const labels = group.find<Konva.Text>("Text").filter((t) => t.text().endsWith(" ="));
			const left = Math.min(...labels.map((l) => l.x()));
			const right = Math.max(...boxes.map((b) => b.x() + b.width()));
			expect(left + right).toBeCloseTo(800, 0);
		});

		test("clicking a box selects it", () => {
			view.showStep(TWO_FRACTIONS_PROMPT, ["Match the slices"], 0);
			click("field-2");
			expect(handlers.onFieldSelected).toHaveBeenCalledExactlyOnceWith(2);
		});

		test("a new step replaces the old boxes", () => {
			view.showStep(TWO_FRACTIONS_PROMPT, ["Match the slices"], 0);
			view.showStep(NUMBER_PROMPT, ["Find the LCD"], 0);
			expect(group.find(".field-1")).toHaveLength(0);
		});

		test("updateFields writes the digits into the boxes", () => {
			view.showStep(FRACTION_PROMPT, ["Combine"], 0);
			view.updateFields(["3", "12"], 1);
			const shown = [0, 1].map((i) => named(`field-${i}`).findOne<Konva.Text>("Text")!.text());
			expect(shown).toEqual(["3", "12"]);
		});

		test("updateFields highlights only the active box", () => {
			view.showStep(FRACTION_PROMPT, ["Combine"], 0);
			view.updateFields(["", ""], 1);
			const widths = [0, 1].map((i) => named(`field-${i}`).findOne<Konva.Rect>("Rect")!.strokeWidth());
			expect(widths[1]).toBeGreaterThan(widths[0]);
		});

		test("updateFields tolerates having fewer fields than boxes", () => {
			view.showStep(FRACTION_PROMPT, ["Combine"], 0);
			expect(() => view.updateFields(["1"], 0)).not.toThrow();
		});
	});

	describe("step display", () => {
		test("shows the step title, the how-to tip and the instruction", () => {
			view.showStep(FRACTION_PROMPT, ["Combine"], 0);
			const texts = textsIn(group);
			expect(texts).toContain("Put the slices together");
			expect(texts).toContain("Add the top numbers.");
			expect(texts).toContain("Work out 2/6 + 1/6.");
		});

		test("draws the tip in a panel that a new step replaces", () => {
			view.showStep(FRACTION_PROMPT, ["Combine"], 0);
			expect(group.find(".tip")).toHaveLength(1);
			view.showStep(NUMBER_PROMPT, ["Find the LCD"], 0);
			expect(group.find(".tip")).toHaveLength(1);
			expect(textsIn(group)).toContain("Count up by 3s and by 6s.");
			expect(textsIn(group)).not.toContain("Add the top numbers.");
		});

		test("the tip panel sits above the answer boxes", () => {
			view.showStep(FRACTION_PROMPT, ["Combine"], 0);
			const tip = group.findOne<Konva.Rect>(".tip")!;
			const firstBox = named("field-0").findOne<Konva.Rect>("Rect")!;
			expect(tip.y() + tip.height()).toBeLessThan(firstBox.y());
		});

		test("ticks finished steps and shows every step name", () => {
			view.showStep(FRACTION_PROMPT, ["Find the LCD", "Match the slices", "Combine"], 2);
			const texts = textsIn(group);
			expect(texts).toContain("✓ Find the LCD");
			expect(texts).toContain("✓ Match the slices");
			expect(texts).toContain("Combine");
		});

		test("does not tick the current or later steps", () => {
			view.showStep(FRACTION_PROMPT, ["Find the LCD", "Combine"], 0);
			expect(textsIn(group).some((t) => t.startsWith("✓"))).toBe(false);
		});
	});

	describe("feedback", () => {
		const feedbackText = () =>
			group.find<Konva.Text>("Text").find((t) => t.text() === "Try again!")!;

		test("praise and try-again messages use different colours", () => {
			view.showFeedback("Try again!", "tryAgain");
			const tryAgainColor = feedbackText().fill();
			view.showFeedback("Try again!", "correct");
			expect(feedbackText().fill()).not.toBe(tryAgainColor);
		});

		test("moving to a new step clears the feedback", () => {
			view.showFeedback("Try again!", "tryAgain");
			view.showStep(NUMBER_PROMPT, ["Find the LCD"], 0);
			expect(textsIn(group)).not.toContain("Try again!");
		});
	});

	describe("finishing a question", () => {
		beforeEach(() => {
			// isVisible() is false for everything inside a hidden screen
			view.show();
			view.showQuestion({
				levelName: "Same Size Slices",
				questionNumber: 1,
				questionCount: 5,
				equation: "1/3 + 1/3",
			});
		});

		test("shows the number pad and Check, and hides Continue, while answering", () => {
			expect(named("check").isVisible()).toBe(true);
			expect(named("digit-5").isVisible()).toBe(true);
			expect(named("continue").isVisible()).toBe(false);
		});

		test("swaps the pad for a Continue button when the question is done", () => {
			view.showQuestionComplete("1/3 + 1/3 = 2/3", false);
			expect(named("continue").isVisible()).toBe(true);
			expect(named("check").isVisible()).toBe(false);
			expect(named("digit-5").isVisible()).toBe(false);
			expect(textsIn(group)).toContain("1/3 + 1/3 = 2/3  Great job!");
		});

		test("Continue sends its action", () => {
			view.showQuestionComplete("1/3 + 1/3 = 2/3", false);
			click("continue");
			expect(handlers.onContinue).toHaveBeenCalledOnce();
		});

		test("the button says Next question, or Finish level on the last question", () => {
			view.showQuestionComplete("1/3 + 1/3 = 2/3", false);
			expect(textsIn(named("continue"))).toEqual(["Next question"]);
			view.showQuestionComplete("1/3 + 1/3 = 2/3", true);
			expect(textsIn(named("continue"))).toEqual(["Finish level"]);
		});

		test("the next question brings the pad back", () => {
			view.showQuestionComplete("1/3 + 1/3 = 2/3", false);
			view.showQuestion({
				levelName: "Same Size Slices",
				questionNumber: 2,
				questionCount: 5,
				equation: "1/5 + 2/5",
			});
			expect(named("check").isVisible()).toBe(true);
			expect(named("continue").isVisible()).toBe(false);
		});
	});
});
