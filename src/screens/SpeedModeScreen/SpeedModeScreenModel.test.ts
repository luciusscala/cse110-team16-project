import { describe, expect, test, vi } from "vitest";
import { SpeedModeScreenModel } from "./SpeedModeScreenModel.ts";

describe("SpeedModeScreenModel", () => {

    test("get score returns score, defaulting to 0", () => {
        const model = new SpeedModeScreenModel();
        expect(model.getScore()).toBe(0);
    });

    test("get score returns score after incrementation", () => {
        const model = new SpeedModeScreenModel();
        model.incrementScore();
        expect(model.getScore()).toBe(1);

        model.incrementScore();
        expect(model.getScore()).toBe(2);
    });

    test("reset returns score to 0", () => {
        const model = new SpeedModeScreenModel();
        expect(model.getScore()).toBe(0);

        model.incrementScore();
        expect(model.getScore()).toBe(1);

        model.incrementScore();
        expect(model.getScore()).toBe(2);

        model.reset();

        expect(model.getScore()).toBe(0);

        model.incrementScore();
        expect(model.getScore()).toBe(1);
    });

    test("reset when already at 0 does not cause issue", () => {
        const model = new SpeedModeScreenModel();
        expect(model.getScore()).toBe(0);

        model.reset();

        expect(model.getScore()).toBe(0);

        model.incrementScore();
        expect(model.getScore()).toBe(1);
    });
});