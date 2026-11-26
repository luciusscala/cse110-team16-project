import { describe, expect, test, vi } from "vitest";
import { SpeedModeScreenModel } from "./SpeedModeScreenModel.ts";
import { Fraction } from "../../models/Fraction.ts";
import { SPEED_MODE_DIFFICULTY } from "../../constants.ts";

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

    describe("problems", () => {
        const f = (n: number, d: number) => new Fraction(n, d);
        const problems = [
            { frac1: f(1, 4), frac2: f(1, 4), operation: "addition" as const },
            { frac1: f(1, 3), frac2: f(1, 6), operation: "addition" as const },
        ];
        const makeModel = () => {
            let next = 0;
            return new SpeedModeScreenModel(() => problems[next++ % problems.length]!);
        };

        test("starts with a generated problem at the speed difficulty", () => {
            const generate = vi.fn(() => problems[0]!);
            const model = new SpeedModeScreenModel(generate);
            expect(generate).toHaveBeenCalledWith(SPEED_MODE_DIFFICULTY);
            expect(model.getCurrentProblem()).toBe(problems[0]);
        });

        test("a correct answer scores and moves to the next problem", () => {
            const model = makeModel();
            expect(model.submit(f(1, 2))).toBe(true);
            expect(model.getScore()).toBe(1);
            expect(model.getCurrentProblem()).toBe(problems[1]);
        });

        test("a wrong answer or an unsimplified one does not score, but moves on", () => {
            const model = makeModel();
            expect(model.submit(f(2, 4))).toBe(false);
            expect(model.getScore()).toBe(0);
            expect(model.getCurrentProblem()).toBe(problems[1]);
            expect(model.submit(f(1, 3))).toBe(false);
        });

        test("reset picks a new problem", () => {
            const model = makeModel();
            model.reset();
            expect(model.getCurrentProblem()).toBe(problems[1]);
        });
    });
});
