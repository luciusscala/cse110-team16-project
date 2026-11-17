import { describe, expect, test, vi } from "vitest";
import Konva from "konva";
import { SpeedModeScreenView } from "./SpeedModeScreenView.ts";
import { STAGE_WIDTH } from "../../constants.ts";
import { SPEED_MODE_TIME_LIMIT } from "../../constants.ts";

function makeHandlers()
{
    return {
        onEndGameClick: vi.fn(),
        onCheckClick: vi.fn(),
    }
}

describe("SpeedModeScreenView", () => {
    test("loads the text label for both remaining time and score, at same x, width, and alignment", () => {
        const view = new SpeedModeScreenView(makeHandlers());
        const scoreLabel = view.getGroup().findOne<Konva.Text>(".scoreLabel");
        const timeLabel = view.getGroup().findOne<Konva.Text>(".secondsLabel");

        expect(scoreLabel).toBeDefined();
        expect(scoreLabel!.text()).toBe("Score:");

        expect(timeLabel).toBeDefined();
        expect(timeLabel!.text()).toBe("Seconds Left");

        expect(timeLabel!.x()).toBe(scoreLabel.x());
        expect(scoreLabel!.width()).toBe(timeLabel!.width());
        expect(timeLabel!.align()).toBe(scoreLabel.align());
    });

    test("score display exists and shows 0 by default", () => {
        const view = new SpeedModeScreenView(makeHandlers());
        const scoreDisplay = view.getGroup().findOne<Konva.Text>(".scoreDisplay");

        expect(scoreDisplay).toBeDefined();
        expect(scoreDisplay!.text()).toBe("0");
    });

    test("update score changes the dipslayed score", () => {
        const view = new SpeedModeScreenView(makeHandlers());
        const scoreDisplay = view.getGroup().findOne<Konva.Text>(".scoreDisplay");

        expect(scoreDisplay!.text()).toBe("0");
        view.updateScore(7);
        expect(scoreDisplay!.text()).toBe("7");
        view.updateScore(1);
        expect(scoreDisplay!.text()).toBe("1");
        view.updateScore(100);
        expect(scoreDisplay!.text()).toBe("100");
    });

    test("remaining time display exists and shows the time limit of the game by default", () => {
        const view = new SpeedModeScreenView(makeHandlers());
        const timeDisplay = view.getGroup().findOne<Konva.Text>(".remainingTime");

        expect(timeDisplay).toBeDefined();
        expect(timeDisplay!.text()).toBe(`${SPEED_MODE_TIME_LIMIT}`);
    });

    test("update timer changes the displayed time remaining", () => {
        const view = new SpeedModeScreenView(makeHandlers());
        const timeDisplay = view.getGroup().findOne<Konva.Text>(".remainingTime");

        expect(timeDisplay!.text()).toBe(`${SPEED_MODE_TIME_LIMIT}`);
        view.updateTimer(250);
        expect(timeDisplay!.text()).toBe("250");
        view.updateTimer(275);
        expect(timeDisplay!.text()).toBe("275");
        view.updateTimer(10);
        expect(timeDisplay!.text()).toBe("10");
        view.updateTimer(2);
        expect(timeDisplay!.text()).toBe("2");
    });

    test("both check and end buttons are rendered correctly", () => {
        const view = new SpeedModeScreenView(makeHandlers());
        expect(view.getGroup().find(".checkButton")).toBeDefined();
        expect(view.getGroup().find(".endGameButton")).toBeDefined();
    });

    test("check button calls its handler function", () => {
        const handlers = makeHandlers();
        const view = new SpeedModeScreenView(handlers);
        view.getGroup().findOne(".checkButton")!.fire("click");

        expect(handlers.onCheckClick).toHaveBeenCalledTimes(1);
        expect(handlers.onEndGameClick).toHaveBeenCalledTimes(0);
    });

    test("end game button calls its handler function", () => {
        const handlers = makeHandlers();
        const view = new SpeedModeScreenView(handlers);
        view.getGroup().findOne(".endGameButton")!.fire("click");

        expect(handlers.onCheckClick).toHaveBeenCalledTimes(0);
        expect(handlers.onEndGameClick).toHaveBeenCalledTimes(1);
    });

    test("hide and show functions work as expected", () => {
		const view = new SpeedModeScreenView(makeHandlers());
		view.hide();
		expect(view.getGroup().visible()).toBe(false);
		view.show();
		expect(view.getGroup().visible()).toBe(true);
	});

    test("elements in view are visible when created", () => {
		const view = new SpeedModeScreenView(makeHandlers());
		expect(view.getGroup().visible()).toBe(true);
	});
});