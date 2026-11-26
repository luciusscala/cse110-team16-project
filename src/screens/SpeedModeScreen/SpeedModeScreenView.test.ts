import { describe, expect, test, vi } from "vitest";
import Konva from "konva";
import { SpeedModeScreenView } from "./SpeedModeScreenView.ts";
import { STAGE_WIDTH } from "../../constants.ts";
import { SPEED_MODE_TIME_LIMIT } from "../../constants.ts";

const IDEAL_KEY_SIZE = 54;
const PAD_LEFT = 190;
const PAD_TOP = 400;
const IDEAL_BACKDROP_KEY_SEPERATION = 30;

function makeHandlers()
{
    return {
        onEndGameClick: vi.fn(),
        onKeyClick: vi.fn(),
        onCheckClick: vi.fn(),
        onBackspaceClick: vi.fn(),
        onFieldSelected: vi.fn(),
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

    test("both the keypad and end button are rendered correctly", () => {
        const view = new SpeedModeScreenView(makeHandlers());

        expect(view.answerKeys).toBeDefined();
        expect(view.getGroup().find(".endGameButton")).toBeDefined();
    });

    test("keys function correctly independent of each other", () => {
        const handlers = makeHandlers();
        const view = new SpeedModeScreenView(handlers);
        const answerKeys = view.answerKeys;
        
        const key4 = answerKeys.findOne<Konva.Group>(".digit-4");
        key4.fire("click");
        expect(handlers.onKeyClick).toHaveBeenCalledWith("4");
        expect(handlers.onKeyClick).not.toHaveBeenCalledWith("3");

        const key3 = answerKeys.findOne<Konva.Group>(".digit-3");
        key3.fire("click");
        expect(handlers.onKeyClick).toHaveBeenCalledWith("3");
    });

    test("keys are colored with the cookie theme and are spaced correctly", () => {
        const view = new SpeedModeScreenView(makeHandlers());
        const answerKeys = view.answerKeys;
        
        const key4 = answerKeys.findOne<Konva.Group>(".digit-4");
        const key4rect = key4.findOne<Konva.Rect>("Rect");
        expect(key4rect).toBeDefined();
        expect(key4rect.fill()).toBe("#b44c10");
        expect(key4rect.stroke()).toBe("#823001");
        expect(key4rect.width()).toBe(IDEAL_KEY_SIZE);
        expect(key4rect.height()).toBe(IDEAL_KEY_SIZE);

        const key3 = answerKeys.findOne<Konva.Group>(".digit-3");
        const key9 = answerKeys.findOne<Konva.Group>(".digit-9");
        expect(key4.x() - (key3.x() + IDEAL_KEY_SIZE)).toBe(2);
        expect(key9.y() - (key4.y() + IDEAL_KEY_SIZE)).toBe(2);
    });

    test("check button calls its handler function", () => {
        const handlers = makeHandlers();
        const view = new SpeedModeScreenView(handlers);
        const answerKeys = view.answerKeys;

        answerKeys.findOne(".check")!.fire("click");

        expect(handlers.onCheckClick).toHaveBeenCalledTimes(1);
        expect(handlers.onBackspaceClick).toHaveBeenCalledTimes(0);
    });

    test("delete button calls its handler function", () => {
        const handlers = makeHandlers();
        const view = new SpeedModeScreenView(handlers);

        view.answerKeys.findOne(".backspace").fire("click");

        expect(handlers.onCheckClick).toHaveBeenCalledTimes(0);
        expect(handlers.onBackspaceClick).toHaveBeenCalledTimes(1);
    });

    test("end game button calls its handler function", () => {
        const handlers = makeHandlers();
        const view = new SpeedModeScreenView(handlers);
        view.getGroup().findOne(".endGameButton")!.fire("click");

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

    test("backdrop is behind all other elements onscreen, and is the correct color", () => {
        const view = new SpeedModeScreenView(makeHandlers());
        const backdrop = view.getGroup().findOne<Konva.Rect>(".backdrop");
        expect(backdrop).toBeDefined();

        expect(backdrop.zIndex()).toBe(0);
        expect(backdrop.fill()).toBe("#edc0e8");
    });

    test("key backdrop is behind the keypad", () => {
        const view = new SpeedModeScreenView(makeHandlers());
        const answerKeys = view.answerKeys;
        const keyBackdrop = view.getGroup().findOne<Konva.Rect>(".keyBackdrop");
        
        expect(keyBackdrop).toBeDefined();
        expect(keyBackdrop.zIndex()).toBeLessThan(answerKeys.zIndex());
    });

    test("key backdrop is rendered with correct properties", () => {
        const view = new SpeedModeScreenView(makeHandlers());
        const keyBackdrop = view.getGroup().findOne<Konva.Rect>(".keyBackdrop");

        expect(keyBackdrop.fill()).toBe("lightgray");
        expect(keyBackdrop.stroke()).toBe("gray");
        expect(keyBackdrop.strokeWidth()).toBe(15);
        expect(keyBackdrop.width()).toBe(STAGE_WIDTH);
        expect(keyBackdrop.x()).toBe(PAD_LEFT - IDEAL_BACKDROP_KEY_SEPERATION);
        expect(keyBackdrop.y()).toBe(PAD_TOP - IDEAL_BACKDROP_KEY_SEPERATION); 
    });

    test("line image is rendered correctly", () => {
        const view = new SpeedModeScreenView(makeHandlers());

        expect(view.lineImage).toBeDefined();
    });

    test("shows the problem, the typed answer and messages", () => {
        const view = new SpeedModeScreenView(makeHandlers());
        const find = <T extends Konva.Node>(name: string) => view.getGroup().findOne<T>(`.${name}`)!;

        view.showProblem("1/2 + 1/4");
        view.updateFields(["3", "4"], 1);
        view.showMessage("Answer: 3/4");

        expect(find<Konva.Text>("equation").text()).toBe("1/2 + 1/4 =");
        expect(find<Konva.Group>("field-0").findOne<Konva.Text>("Text")!.text()).toBe("3");
        expect(find<Konva.Group>("field-1").findOne<Konva.Text>("Text")!.text()).toBe("4");
        expect(find<Konva.Text>("message").text()).toBe("Answer: 3/4");
    });

    test("clicking an answer box reports its index", () => {
        const handlers = makeHandlers();
        const view = new SpeedModeScreenView(handlers);
        view.getGroup().findOne(".field-1")!.fire("click");
        expect(handlers.onFieldSelected).toHaveBeenCalledWith(1);
    });
});
