import Konva from "konva";
import { describe, expect, test, vi } from "vitest";
import { MasteryScreenView } from "./MasteryScreenView.ts";
import { STAGE_WIDTH } from "../../constants.ts";
import type { MasteryScreenHandlers } from "./MasteryScreenViewPort.ts";

function makeHandlers(): MasteryScreenHandlers {
	return {
		onDigit: vi.fn(),
		onBackspace: vi.fn(),
		onFieldSelected: vi.fn(),
		onCheck: vi.fn(),
		onExit: vi.fn(),
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

	test("buttons and keys call the handlers", () => {
		const { handlers, find } = makeView();
		find("digit-7").fire("click");
		find("backspace").fire("click");
		find("check").fire("click");
		find("field-1").fire("click");
		find("exitButton").fire("click");

		expect(handlers.onDigit).toHaveBeenCalledWith("7");
		expect(handlers.onBackspace).toHaveBeenCalled();
		expect(handlers.onCheck).toHaveBeenCalled();
		expect(handlers.onFieldSelected).toHaveBeenCalledWith(1);
		expect(handlers.onExit).toHaveBeenCalled();
	});

	test("backdrop is located behind all other onscreen elements and is the right color", () => {
		const { find } = makeView();
		const backdrop = find<Konva.Rect>("backdrop");

		expect(backdrop).toBeDefined();
		expect(backdrop.zIndex()).toBe(0);
		expect(backdrop.fill()).toBe("lightblue");
	});

	test("keypad backdrop is rendered with correct components", () => {
		const { find } = makeView();
		const keysBackdrop = find<Konva.Ellipse>("keysBackdrop");

		expect(keysBackdrop).toBeDefined();
		expect(keysBackdrop.x()).toBe(STAGE_WIDTH / 2);
		expect(keysBackdrop.radiusX()).toBe(STAGE_WIDTH / 1.5);
		expect(keysBackdrop.fill()).toBe("lightgray");
		expect(keysBackdrop.stroke()).toBe("black");
	});
});
