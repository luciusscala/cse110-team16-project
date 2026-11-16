import Konva from "konva";
import { describe, expect, test, vi } from "vitest";
import { MasteryScreenView } from "./MasteryScreenView.ts";
import type { MasteryScreenHandlers } from "./MasteryScreenViewPort.ts";

function makeHandlers(): MasteryScreenHandlers {
	return {
		onDigit: vi.fn(),
		onBackspace: vi.fn(),
		onFieldSelected: vi.fn(),
		onCheck: vi.fn(),
		onExit: vi.fn(),
		onPlayAgain: vi.fn(),
		onMainMenu: vi.fn(),
	};
}

function makeView() {
	const handlers = makeHandlers();
	const view = new MasteryScreenView(handlers);
	const find = <T extends Konva.Node>(name: string) =>
		view.getGroup().findOne<T>(`.${name}`)!;
	return { view, handlers, find };
}

describe("MasteryScreenView", () => {
	test("starts hidden", () => {
		const { view } = makeView();
		expect(view.getGroup().visible()).toBe(false);
		view.show();
		expect(view.getGroup().visible()).toBe(true);
	});

	test("the countdown shows the number and the rule", () => {
		const { view, find } = makeView();
		view.showCountdown(3, "Lowest terms only");

		expect(find<Konva.Text>("countdownNumber").text()).toBe("3");
		expect(find<Konva.Text>("countdownRule").text()).toBe("Lowest terms only");
		expect(find("countdown").visible()).toBe(true);
		expect(find("play").visible()).toBe(false);
		expect(find("exitButton").visible()).toBe(true);
	});

	test("a problem shows the equation, the keypad, and no timer", () => {
		const { view, find } = makeView();
		view.showProblem("1/3 + 1/5", 4);

		expect(find<Konva.Text>("equation").text()).toBe("1/3 + 1/5 =");
		expect(find<Konva.Text>("problemNumber").text()).toMatch(/Problem 4/);
		expect(find("play").visible()).toBe(true);
		expect(find("countdown").visible()).toBe(false);
		expect(find("check")).toBeDefined();
		expect(view.getGroup().findOne(".remainingTime")).toBeUndefined();
	});

	test("the score and answer boxes update", () => {
		const { view, find } = makeView();
		view.updateScore(5);
		view.updateFields(["3", "12"], 1);

		expect(find<Konva.Text>("scoreDisplay").text()).toBe("Correct: 5");
		expect(find<Konva.Group>("field-0").findOne<Konva.Text>("Text")!.text()).toBe("3");
		expect(find<Konva.Group>("field-1").findOne<Konva.Text>("Text")!.text()).toBe("12");
	});

	test("the summary shows the results and hides Exit", () => {
		const { view, find } = makeView();
		view.showSummary({
			title: "Game over!",
			correctCount: 7,
			incorrectCount: 1,
			detail: "1/2 + 1/3 = 5/6. You answered 2/5.",
		});

		expect(find<Konva.Text>("summaryTitle").text()).toBe("Game over!");
		expect(find<Konva.Text>("summaryCorrect").text()).toBe("Correct answers: 7");
		expect(find<Konva.Text>("summaryIncorrect").text()).toBe("Incorrect answers: 1");
		expect(find<Konva.Text>("summaryDetail").text()).toMatch(/You answered 2\/5/);
		expect(find("summary").visible()).toBe(true);
		expect(find("play").visible()).toBe(false);
		expect(find("exitButton").visible()).toBe(false);
	});

	test("buttons and keys call the handlers", () => {
		const { handlers, find } = makeView();
		find("digit-7").fire("click");
		find("backspace").fire("click");
		find("check").fire("click");
		find("field-1").fire("click");
		find("exitButton").fire("click");
		find("playAgainButton").fire("click");
		find("mainMenuButton").fire("click");

		expect(handlers.onDigit).toHaveBeenCalledWith("7");
		expect(handlers.onBackspace).toHaveBeenCalled();
		expect(handlers.onCheck).toHaveBeenCalled();
		expect(handlers.onFieldSelected).toHaveBeenCalledWith(1);
		expect(handlers.onExit).toHaveBeenCalled();
		expect(handlers.onPlayAgain).toHaveBeenCalled();
		expect(handlers.onMainMenu).toHaveBeenCalled();
	});
});
