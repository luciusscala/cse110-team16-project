import { beforeEach, describe, expect, test, vi } from "vitest";
import Konva from "konva";
import { LevelSelectScreenController } from "./LevelSelectScreenController.ts";
import { LevelSelectScreenView } from "./LevelSelectScreenView.ts";
import { LevelSelectScreenModel } from "./LevelSelectScreenModel.ts";
import { ProgressManager } from "../../persistence/ProgressManager.ts";
import { getAllLevels } from "../../models/level/levelRepository.ts";
import type { ScreenSwitcher } from "../../types.ts";

function makeController(model?: LevelSelectScreenModel) {
	const switcher: ScreenSwitcher = { switchToScreen: vi.fn() };
	const controller = new LevelSelectScreenController(switcher, model);
	return { controller, switcher };
}

function clickTile(controller: LevelSelectScreenController, id: number) {
	controller.getView().getGroup().findOne<Konva.Group>(`.levelTile-${id}`)!.fire("click");
}

function tileText(controller: LevelSelectScreenController, id: number) {
	return controller.getView().getTiles().find((t) => t.getGroup().hasName(`levelTile-${id}`))!.getText();
}

describe("LevelSelectScreenController", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	test("creates a LevelSelectScreenView", () => {
		const { controller } = makeController();
		expect(controller.getView()).toBeInstanceOf(LevelSelectScreenView);
	});

	test("does not switch screens on construction", () => {
		const { switcher } = makeController();
		expect(switcher.switchToScreen).not.toHaveBeenCalled();
	});

	test("show draws a tile for every level and makes the screen visible", () => {
		const { controller } = makeController();
		controller.show();
		expect(controller.getView().getTiles()).toHaveLength(getAllLevels().length);
		expect(controller.getView().getGroup().visible()).toBe(true);
	});

	test("clicking the current level opens it", () => {
		const { controller, switcher } = makeController();
		controller.show();
		clickTile(controller, 1);
		expect(switcher.switchToScreen).toHaveBeenCalledWith({ type: "guided", levelId: 1 });
	});

	test("clicking a completed level lets the player replay it", () => {
		ProgressManager.updateProgress(2);
		const { controller, switcher } = makeController();
		controller.show();
		clickTile(controller, 1);
		expect(switcher.switchToScreen).toHaveBeenCalledWith({ type: "guided", levelId: 1 });
	});

	test("clicking a locked level does nothing", () => {
		const { controller, switcher } = makeController();
		controller.show();
		clickTile(controller, 2);
		expect(switcher.switchToScreen).not.toHaveBeenCalled();
	});

	test("an unlocked level without a screen yet does not open", () => {
		// Every real level is guided now, so mark one as not guided to test the guard.
		const levels = getAllLevels().map((l) => (l.id === 2 ? { ...l, guided: false } : l));
		const unplayable = levels[1];
		ProgressManager.updateProgress(unplayable.id - 1);
		const { controller, switcher } = makeController(new LevelSelectScreenModel(levels));
		controller.show();
		clickTile(controller, unplayable.id);
		expect(switcher.switchToScreen).not.toHaveBeenCalled();
	});

	test("progress saved while away is picked up the next time the screen shows", () => {
		const { controller } = makeController();
		controller.show();
		expect(tileText(controller, 2)).toContain("Locked");

		controller.hide();
		ProgressManager.updateProgress(1);
		controller.show();
		expect(tileText(controller, 1)).toContain("Done!");
		expect(tileText(controller, 2)).toContain("Play!");
	});

	test("does not open a level whose progress was lost after drawing", () => {
		ProgressManager.updateProgress(1);
		const { controller, switcher } = makeController();
		controller.show();
		ProgressManager.updateProgress(0);
		clickTile(controller, 2);
		expect(switcher.switchToScreen).not.toHaveBeenCalled();
	});

	test("back button returns to the menu", () => {
		const { controller, switcher } = makeController();
		controller.show();
		controller.getView().getGroup().findOne(".backButton")!.fire("click");
		expect(switcher.switchToScreen).toHaveBeenCalledWith({ type: "menu" });
	});

	test("hide makes the screen invisible", () => {
		const { controller } = makeController();
		controller.show();
		controller.hide();
		expect(controller.getView().getGroup().visible()).toBe(false);
	});
});
