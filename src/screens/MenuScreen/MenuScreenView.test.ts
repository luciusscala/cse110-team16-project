import { describe, expect, test, vi } from "vitest";
import Konva from "konva";
import { MenuScreenView } from "./MenuScreenView.ts";
import { STAGE_WIDTH } from "../../constants.ts";

function makeHandlers() {
	return {
		onLevelsClick: vi.fn(),
		onMasteryClick: vi.fn(),
		onSpeedClick: vi.fn(),
	};
}

describe("MenuScreenView", () => {
	test("renders the title centered across the stage", () => {
		const view = new MenuScreenView(makeHandlers());
		const title = view.getGroup().findOne<Konva.Text>(".title");
		expect(title).toBeDefined();
		expect(title!.text()).toBe("TEAM 16 GAME");
		expect(title!.x()).toBe(0);
		expect(title!.width()).toBe(STAGE_WIDTH);
		expect(title!.align()).toBe("center");
	});

	test("renders exactly three buttons in order: levels, mastery, speed", () => {
		const view = new MenuScreenView(makeHandlers());
		expect(view.getButtons().map((b) => b.getText())).toEqual(["LEVELS", "MASTERY", "SPEED MINIGAME"]);
		expect(view.getGroup().find(".levelsButton")).toHaveLength(1);
		expect(view.getGroup().find(".masteryButton")).toHaveLength(1);
		expect(view.getGroup().find(".speedButton")).toHaveLength(1);
	});

	test("buttons are horizontally centered and stacked without overlapping", () => {
		const view = new MenuScreenView(makeHandlers());
		const groups = view.getButtons().map((b) => b.getGroup());
		for (const group of groups) {
			const rect = group.findOne<Konva.Rect>("Rect")!;
			expect(group.x() + rect.width() / 2).toBe(STAGE_WIDTH / 2);
		}
		for (let i = 1; i < groups.length; i++) {
			const prevRect = groups[i - 1].findOne<Konva.Rect>("Rect")!;
			expect(groups[i].y()).toBeGreaterThanOrEqual(groups[i - 1].y() + prevRect.height());
		}
	});

	test("levels button calls only onLevelsClick", () => {
		const handlers = makeHandlers();
		const view = new MenuScreenView(handlers);
		view.getGroup().findOne(".levelsButton")!.fire("click");
		expect(handlers.onLevelsClick).toHaveBeenCalledTimes(1);
		expect(handlers.onMasteryClick).not.toHaveBeenCalled();
		expect(handlers.onSpeedClick).not.toHaveBeenCalled();
	});

	test("mastery button calls only onMasteryClick", () => {
		const handlers = makeHandlers();
		const view = new MenuScreenView(handlers);
		view.getGroup().findOne(".masteryButton")!.fire("click");
		expect(handlers.onMasteryClick).toHaveBeenCalledTimes(1);
		expect(handlers.onLevelsClick).not.toHaveBeenCalled();
		expect(handlers.onSpeedClick).not.toHaveBeenCalled();
	});

	test("speed button calls only onSpeedClick", () => {
		const handlers = makeHandlers();
		const view = new MenuScreenView(handlers);
		view.getGroup().findOne(".speedButton")!.fire("click");
		expect(handlers.onSpeedClick).toHaveBeenCalledTimes(1);
		expect(handlers.onLevelsClick).not.toHaveBeenCalled();
		expect(handlers.onMasteryClick).not.toHaveBeenCalled();
	});

	test("is visible by default", () => {
		const view = new MenuScreenView(makeHandlers());
		expect(view.getGroup().visible()).toBe(true);
	});

	test("hide and show toggle visibility", () => {
		const view = new MenuScreenView(makeHandlers());
		view.hide();
		expect(view.getGroup().visible()).toBe(false);
		view.show();
		expect(view.getGroup().visible()).toBe(true);
	});

	test("show and hide redraw the layer when attached to one", () => {
		const layer = new Konva.Layer();
		const drawSpy = vi.spyOn(layer, "draw").mockImplementation(() => layer);
		const view = new MenuScreenView(makeHandlers());
		layer.add(view.getGroup());

		view.hide();
		view.show();
		expect(drawSpy).toHaveBeenCalledTimes(2);
	});
});
