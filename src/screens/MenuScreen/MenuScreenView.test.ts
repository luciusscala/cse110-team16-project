import { describe, expect, test, vi } from "vitest";
import Konva from "konva";
import { MenuScreenView } from "./MenuScreenView.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

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
		expect(title!.text()).toBe("FRIZZA");
		expect(title!.x()).toBe(0);
		expect(title!.width()).toBe(STAGE_WIDTH);
		expect(title!.align()).toBe("center");
	});

	test("renders the background behind everything and lets clicks pass through", () => {
		const view = new MenuScreenView(makeHandlers());
		const background = view.getGroup().findOne<Konva.Image>(".background");
		expect(background).toBeDefined();
		expect(background!.zIndex()).toBe(0);
		expect(background!.width()).toBe(STAGE_WIDTH);
		expect(background!.height()).toBe(STAGE_HEIGHT);
		expect(background!.listening()).toBe(false);
	});

	test("draws the oven fire above the background", () => {
		const view = new MenuScreenView(makeHandlers());
		const fire = view.getGroup().findOne(".ovenFire");
		expect(fire).toBeDefined();
		expect(fire!.zIndex()).toBe(1);
	});

	test("animates the oven fire only while the menu is shown", () => {
		const view = new MenuScreenView(makeHandlers());
		new Konva.Layer().add(view.getGroup());
		view.show();
		expect(view.getOvenFire().isRunning()).toBe(true);
		view.hide();
		expect(view.getOvenFire().isRunning()).toBe(false);
	});

	test("renders the subtitle centered across the stage", () => {
		const view = new MenuScreenView(makeHandlers());
		const subtitle = view.getGroup().findOne<Konva.Text>(".subtitle");
		expect(subtitle!.text()).toBe("Fraction Pizzeria");
		expect(subtitle!.x()).toBe(0);
		expect(subtitle!.width()).toBe(STAGE_WIDTH);
		expect(subtitle!.align()).toBe("center");
	});

	test("renders exactly three buttons in order: levels, mastery, speed", () => {
		const view = new MenuScreenView(makeHandlers());
		expect(view.getButtons().map((b) => b.getText())).toEqual(["LEVELS", "MASTERY MINIGAME", "SPEED MINIGAME"]);
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

	test("shows a help icon in the top-right corner", () => {
		const view = new MenuScreenView(makeHandlers());
		const icon = view.getHelpIcon();
		const circle = icon.findOne<Konva.Circle>("Circle")!;
		expect(icon.findOne<Konva.Text>("Text")!.text()).toBe("?");
		expect(icon.x() + circle.radius()).toBeLessThanOrEqual(STAGE_WIDTH);
		expect(icon.x()).toBeGreaterThan(STAGE_WIDTH / 2);
		expect(icon.y()).toBeLessThan(STAGE_HEIGHT / 4);
	});

	test("clicking the help icon opens How to Play without triggering any menu button", () => {
		const handlers = makeHandlers();
		const view = new MenuScreenView(handlers);
		new Konva.Layer().add(view.getGroup());
		view.getGroup().findOne(".helpButton")!.fire("click");
		expect(view.getHowToPlayPopup().isOpen()).toBe(true);
		expect(handlers.onLevelsClick).not.toHaveBeenCalled();
		expect(handlers.onMasteryClick).not.toHaveBeenCalled();
		expect(handlers.onSpeedClick).not.toHaveBeenCalled();
	});

	test("leaving the menu closes the How to Play popup", () => {
		const view = new MenuScreenView(makeHandlers());
		new Konva.Layer().add(view.getGroup());
		view.getHowToPlayPopup().open();
		view.hide();
		view.show();
		expect(view.getHowToPlayPopup().isOpen()).toBe(false);
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
