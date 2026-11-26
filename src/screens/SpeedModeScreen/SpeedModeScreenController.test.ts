import { describe, expect, test, vi } from "vitest";
import { SpeedModeScreenController } from "./SpeedModeScreenController.ts";
import { SpeedModeScreenView } from "./SpeedModeScreenView.ts";
import { SpeedModeScreenModel } from "./SpeedModeScreenModel.ts";
import { CORRECT_MESSAGE } from "../MasteryScreen/MasteryScreenController.ts";
import { masteryAnswer } from "../MasteryScreen/masteryProblems.ts";
import { formatEquation } from "../../guided/stepPrompts.ts";
import type { ScreenSwitcher } from "../../types.ts";
import type Konva from "konva";

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
		expect(switcher.switchToScreen).toHaveBeenCalledWith({ type: "gameOver", gameId: "speedMode", score: 0 });
    });

    /** Starts a game and runs the countdown, so input is accepted. */
    function startPlaying() {
        vi.useFakeTimers();
        const made = makeController();
        made.controller.startSpeedGame();
        vi.advanceTimersByTime(3000);
        return made;
    }

    function type(controller: SpeedModeScreenController, top: number, bottom: number) {
        const keys = controller.getView().answerKeys;
        for (const digit of String(top)) keys.findOne(`.digit-${digit}`)!.fire("click");
        controller.getView().getGroup().findOne(".field-1")!.fire("click");
        for (const digit of String(bottom)) keys.findOne(`.digit-${digit}`)!.fire("click");
        keys.findOne(".check")!.fire("click");
    }

    function text(controller: SpeedModeScreenController, name: string) {
        return controller.getView().getGroup().findOne<Konva.Text>(`.${name}`)!.text();
    }

    test("shows the current problem once the countdown ends", () => {
        const { controller } = startPlaying();
        const problem = controller.getModel().getCurrentProblem();
        expect(text(controller, "equation")).toBe(`${formatEquation(problem)} =`);
        controller.endTimer();
        vi.useRealTimers();
    });

    test("a correct answer scores and shows a new problem", () => {
        const { controller } = startPlaying();
        const answer = masteryAnswer(controller.getModel().getCurrentProblem());
        type(controller, answer.numerator, answer.denominator);

        expect(controller.getModel().getScore()).toBe(1);
        expect(text(controller, "message")).toBe(CORRECT_MESSAGE);
        controller.endTimer();
        vi.useRealTimers();
    });

    test("a wrong answer shows the right answer without scoring", () => {
        const { controller } = startPlaying();
        const answer = masteryAnswer(controller.getModel().getCurrentProblem());
        type(controller, answer.numerator, answer.denominator + 1);

        expect(controller.getModel().getScore()).toBe(0);
        expect(text(controller, "message")).toBe(`Answer: ${answer}`);
        controller.endTimer();
        vi.useRealTimers();
    });

    test("an incomplete answer shows a message and keeps the problem", () => {
        const { controller } = startPlaying();
        const problem = controller.getModel().getCurrentProblem();
        controller.getView().answerKeys.findOne(".check")!.fire("click");

        expect(text(controller, "message")).not.toBe("");
        expect(controller.getModel().getCurrentProblem()).toBe(problem);
        controller.endTimer();
        vi.useRealTimers();
    });

    test("check does nothing during the countdown", () => {
        const { controller } = makeController();
        controller.startSpeedGame();
        const problem = controller.getModel().getCurrentProblem();
        controller.getView().answerKeys.findOne(".check")!.fire("click");

        expect(controller.getModel().getCurrentProblem()).toBe(problem);
        controller.endTimer();
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