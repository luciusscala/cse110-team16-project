import Konva from "konva";
import { describe, expect, test, vi } from "vitest";
import { NUM_LVLS } from "../../constants.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { CampaignCompleteScreenController } from "./CampaignCompleteScreenController.ts";

function makeController() {
	const switcher: ScreenSwitcher = { switchToScreen: vi.fn() };
	const controller = new CampaignCompleteScreenController(switcher);
	return { controller, switcher };
}

function displayedText(controller: CampaignCompleteScreenController): string[] {
	return controller
		.getView()
		.getGroup()
		.find<Konva.Text>("Text")
		.map((node) => node.text());
}

function click(controller: CampaignCompleteScreenController, name: string): void {
	controller.getView().getGroup().findOne<Konva.Group>(`.${name}`)!.fire("click");
}

describe("CampaignCompleteScreenController", () => {
	test("starts hidden and can be shown and hidden", () => {
		const { controller } = makeController();
		const group = controller.getView().getGroup();
		expect(group.visible()).toBe(false);
		controller.show();
		expect(group.visible()).toBe(true);
		controller.hide();
		expect(group.visible()).toBe(false);
	});

	test("congratulates the player for finishing every level", () => {
		const { controller } = makeController();
		const text = displayedText(controller);
		expect(text).toContain("Congratulations!");
		expect(text.some((t) => t.includes(`You finished all ${NUM_LVLS} levels!`))).toBe(true);
	});

	test("does not switch screens on construction", () => {
		const { switcher } = makeController();
		expect(switcher.switchToScreen).not.toHaveBeenCalled();
	});

	test("Level Select goes to the level select screen", () => {
		const { controller, switcher } = makeController();
		click(controller, "levelSelectButton");
		expect(switcher.switchToScreen).toHaveBeenCalledWith({ type: "levels" });
	});

	test("Main Menu goes to the menu", () => {
		const { controller, switcher } = makeController();
		click(controller, "menuButton");
		expect(switcher.switchToScreen).toHaveBeenCalledWith({ type: "menu" });
	});
});
