import { describe, expect, test, vi } from "vitest";
import Konva from "konva";
import { KeypadBuilder } from "./Keypad.ts";

const ACTION_ADL_DIST_FROM_LEFT = 370;

interface keypadHandlers {
    onKey: () => void;
    onBackspace: () => void;
    onCheck: () => void;
}

function makeHandlers () {
    return {
        onKey: vi.fn(),
        onBackspace: vi.fn(),
        onCheck: vi.fn(),
    };
}

function makeKeypad (handlers: keypadHandlers): Konva.Group {
    return KeypadBuilder.buildAnswerKeys({
            keySize: 54,
    		keySpacing: 8,
    		distFromLeft: 100,
    		distFromTop: 440,
   			actionWidth: 230,
    		actionHeight: 46,
    		onKeyClick: (digit: String) => handlers.onKey(digit),
    		onBackspaceClick: () => handlers.onBackspace(),
    		onCheckClick: () => handlers.onCheck(),
        });
}

function makeKeypadWithCustoms (handlers: keypadHandlers, keyFill: String, keyStroke: String, checkFill: String, checkStroke: String,
    backspaceFill: String, backspaceStroke: String): Konva.Group {
    return KeypadBuilder.buildAnswerKeys({
            keySize: 54,
    		keySpacing: 8,
    		distFromLeft: 100,
    		distFromTop: 440,
   			actionWidth: 230,
    		actionHeight: 46,
    		onKeyClick: (digit: String) => handlers.onKey(digit),
    		onBackspaceClick: () => handlers.onBackspace(),
    		onCheckClick: () => handlers.onCheck(),
            keyColor: keyFill,
            keyBoarderColor: keyStroke,
            backspaceColor: backspaceFill,
            backspaceBoarderColor: backspaceStroke,
            checkColor: checkFill,
            checkBoarderColor: checkStroke,
        });
}

describe("KeypadBuilder", () => {
    test("keys exist and have correct traits", () => {
        const handlers = makeHandlers();
        const answerKeys = makeKeypad(handlers);

        const key0 = answerKeys.findOne<Konva.Group>(".digit-0");
        expect(key0).toBeDefined();
        
        expect(key0!.x()).toBe(100);
        expect(key0!.y()).toBe(440);

        const key0rect = key0.findOne<Konva.Rect>("Rect");
        const key0text = key0.findOne<Konva.Text>("Text");
        expect(key0rect).toBeDefined();
        expect(key0text).toBeDefined();
        expect(key0text.text()).toBe("0");

        expect(key0rect.width()).toBe(54);
        expect(key0rect.height()).toBe(54);
        expect(key0rect.fill()).toBe("#3b7dd8");
        expect(key0rect.stroke()).toBe("#2a5aa0");
    });

    test("action keys exist and have correct traits", () => {
        const handlers = makeHandlers();
        const answerKeys = makeKeypad(handlers);

        const checkButton = answerKeys.findOne<Konva.Group>(".check");
        const backspaceButton = answerKeys.findOne<Konva.Group>(".backspace");
        expect(checkButton).toBeDefined();
        expect(backspaceButton).toBeDefined();

        expect(checkButton.x()).toBe(100 + ACTION_ADL_DIST_FROM_LEFT);
        expect(backspaceButton.x()).toBe(100 + ACTION_ADL_DIST_FROM_LEFT);
        expect(checkButton.y()).toBe(440);
        expect(backspaceButton.y()).toBe(440 + 54 + 8);

        const checkRect = checkButton.findOne<Konva.Rect>("Rect");
        const backspaceRect = backspaceButton.findOne<Konva.Rect>("Rect");
        expect(checkRect.width()).toBe(230);
        expect(backspaceRect.width()).toBe(230);
        expect(checkRect.height()).toBe(46);
        expect(backspaceRect.height()).toBe(46);

        expect(checkRect.fill()).toBe("#2e9e4f");
        expect(checkRect.stroke()).toBe("#1f6e36");
        expect(backspaceRect.fill()).toBe("#777777");
        expect(backspaceRect.stroke()).toBe("#555555");
    });

    test("keys are positioned correctly relative to each other", () => {
        const handlers = makeHandlers();
        const answerKeys = makeKeypad(handlers);

        const key0 = answerKeys.findOne<Konva.Group>(".digit-0");
        const key2 = answerKeys.findOne<Konva.Group>(".digit-2");
        const key5 = answerKeys.findOne<Konva.Group>(".digit-5");

        expect(key0.y()).toBe(key2.y());
        expect(key0.x()).toBe(key5.x());
    });

    test("additional parameters change the colors correctly", () => {
        const handlers = makeHandlers();
        const answerKeys = makeKeypadWithCustoms(handlers, "yellow", "brown", "blue", "darkblue", "red", "darkred");

        const key0rect = (answerKeys.findOne<Konva.Group>(".digit-0")).findOne<Konva.Rect>("Rect");
        const checkRect = (answerKeys.findOne<Konva.Group>(".check")).findOne<Konva.Rect>("Rect");
        const backspaceRect = (answerKeys.findOne<Konva.Group>(".backspace")).findOne<Konva.Rect>("Rect");

        expect(key0rect.fill()).toBe("yellow");
        expect(key0rect.stroke()).toBe("brown");
        expect(checkRect.fill()).toBe("blue");
        expect(checkRect.stroke()).toBe("darkblue");
        expect(backspaceRect.fill()).toBe("red");
        expect(backspaceRect.stroke()).toBe("darkred");
    });

    test("clicking keys calls the correct functions", () => {
        const handlers = makeHandlers();
        const answerKeys = makeKeypad(handlers);

        answerKeys.findOne<Konva.Group>(".check").fire("click");
        expect(handlers.onCheck).toHaveBeenCalled();

        answerKeys.findOne<Konva.Group>(".backspace").fire("click");
        expect(handlers.onBackspace).toHaveBeenCalled();

        answerKeys.findOne<Konva.Group>(".digit-3").fire("click");
        expect(handlers.onKey).toHaveBeenCalledWith("3");
        answerKeys.findOne<Konva.Group>(".digit-9").fire("click");
        expect(handlers.onKey).toHaveBeenCalledWith("9");
        answerKeys.findOne<Konva.Group>(".digit-7").fire("click");
        expect(handlers.onKey).toHaveBeenCalledWith("7");
    });
});

