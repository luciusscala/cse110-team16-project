import { describe, expect, test, vi } from "vitest";
import { SpeedModeScreenController } from "./SpeedModeScreenController.ts";
import { SpeedModeScreenView } from "./SpeedModeScreenView.ts";
import { SpeedModeScreenModel } from "./SpeedModeScreenModel.ts";
import type { ScreenSwitcher } from "../../types.ts";

function makeController() {
	const switcher: ScreenSwitcher = { switchToScreen: vi.fn() };
	const controller = new SpeedModeScreenController(switcher);
	return { controller, switcher };
}

describe("SpeedModeScreenController", () => {
    test("correctly creates a view and model", () => {
        const { controller } = makeController();
        expect(controller.getView()).toBeInstanceOf(SpeedModeScreenView);
        expect(controller.getModel()).toBeInstanceOf(SpeedModeScreenModel);
    });

    test("back button returns user to menu and ends the current timer", () => {
        const { controller, switcher } = makeController();
        const spy = vi.spyOn(controller, 'endTimer');
        controller.getView().getGroup().findOne(".endGameButton")!.fire("click");

        expect(spy).toHaveBeenCalled();

        expect(switcher.switchToScreen).toHaveBeenCalledTimes(1);
		expect(switcher.switchToScreen).toHaveBeenCalledWith({ type: "menu" });
    });

    // change this test once actual checks are implemented
    test("check button increases score", () => {
        const { controller, switcher } = makeController();
        controller.getView().getGroup().findOne(".checkButton")!.fire("click");

        expect(controller.getModel().getScore()).toBe(1);
        controller.getModel().reset();
    });

    test("starting the game resets the score", () => {
        const { controller, switcher } = makeController();
        controller.getModel().incrementScore();

        expect(controller.getModel().getScore()).toBe(1);

        controller.startSpeedGame();
        expect(controller.getModel().getScore()).toBe(0);
        
        controller.endTimer();
    })
});