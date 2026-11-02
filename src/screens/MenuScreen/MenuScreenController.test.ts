import { describe, expect, test, vi } from "vitest";
import { MenuScreenController } from "./MenuScreenController.ts";
import { MenuScreenView } from "./MenuScreenView.ts";
import type { ScreenSwitcher } from "../../types.ts";

function makeController() {
	const switcher: ScreenSwitcher = { switchToScreen: vi.fn() };
	const controller = new MenuScreenController(switcher);
	return { controller, switcher };
}

describe("MenuScreenController", () => {
	test("creates a MenuScreenView", () => {
		const { controller } = makeController();
		expect(controller.getView()).toBeInstanceOf(MenuScreenView);
	});

	test("does not switch screens on construction", () => {
		const { switcher } = makeController();
		expect(switcher.switchToScreen).not.toHaveBeenCalled();
	});

	test("levels button switches to the levels screen", () => {
		const { controller, switcher } = makeController();
		controller.getView().getGroup().findOne(".levelsButton")!.fire("click");
		expect(switcher.switchToScreen).toHaveBeenCalledTimes(1);
		expect(switcher.switchToScreen).toHaveBeenCalledWith({ type: "levels" });
	});

	test("mastery button switches to the mastery screen", () => {
		const { controller, switcher } = makeController();
		controller.getView().getGroup().findOne(".masteryButton")!.fire("click");
		expect(switcher.switchToScreen).toHaveBeenCalledTimes(1);
		expect(switcher.switchToScreen).toHaveBeenCalledWith({ type: "mastery" });
	});

	test("speed button switches to the speed minigame screen", () => {
		const { controller, switcher } = makeController();
		controller.getView().getGroup().findOne(".speedButton")!.fire("click");
		expect(switcher.switchToScreen).toHaveBeenCalledTimes(1);
		expect(switcher.switchToScreen).toHaveBeenCalledWith({ type: "speed" });
	});

	test("hide and show toggle the view's visibility", () => {
		const { controller } = makeController();
		controller.hide();
		expect(controller.getView().getGroup().visible()).toBe(false);
		controller.show();
		expect(controller.getView().getGroup().visible()).toBe(true);
	});
});
