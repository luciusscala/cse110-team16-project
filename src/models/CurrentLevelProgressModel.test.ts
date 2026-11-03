import { describe, test, expect } from "vitest";
import { CurrentLevelProgressModel } from "./CurrentLevelProgressModel.ts";

describe("CurrentLevelProgressModel", () => {

    test("initializes with zero completed problems", () => {
        const model = new CurrentLevelProgressModel(10);

        expect(model.getProblemsCompleted()).toBe(0);
        expect(model.getTotalProblems()).toBe(10);
        expect(model.isLevelComplete()).toBe(false);
    });

    test("increments progress when a problem is completed", () => {
        const model = new CurrentLevelProgressModel(10);

        expect(model.completeProblem()).toBe(true);
        expect(model.getProblemsCompleted()).toBe(1);

        expect(model.completeProblem()).toBe(true);
        expect(model.getProblemsCompleted()).toBe(2);
    });

    test("detects when a level is complete", () => {
        const model = new CurrentLevelProgressModel(3);

        model.completeProblem();
        model.completeProblem();
        model.completeProblem();

        expect(model.getProblemsCompleted()).toBe(3);
        expect(model.isLevelComplete()).toBe(true);
    });

    test("does not exceed the total number of problems", () => {
        const model = new CurrentLevelProgressModel(2);

        model.completeProblem();
        model.completeProblem();

        expect(model.completeProblem()).toBe(false);
        expect(model.getProblemsCompleted()).toBe(2);
    });

    test("resets progress while keeping the same total", () => {
        const model = new CurrentLevelProgressModel(5);

        model.completeProblem();
        model.completeProblem();

        model.resetProgress();

        expect(model.getProblemsCompleted()).toBe(0);
        expect(model.getTotalProblems()).toBe(5);
        expect(model.isLevelComplete()).toBe(false);
    });

    test("resets progress with a new total number of problems", () => {
        const model = new CurrentLevelProgressModel(5);

        model.completeProblem();
        model.resetProgress(10);

        expect(model.getProblemsCompleted()).toBe(0);
        expect(model.getTotalProblems()).toBe(10);
        expect(model.isLevelComplete()).toBe(false);
    });

    test("rejects invalid total problems in constructor", () => {
        expect(() => new CurrentLevelProgressModel(0)).toThrow();
        expect(() => new CurrentLevelProgressModel(-1)).toThrow();
        expect(() => new CurrentLevelProgressModel(2.5)).toThrow();
    });

    test("rejects invalid total problems when resetting", () => {
        const model = new CurrentLevelProgressModel(5);

        expect(() => model.resetProgress(0)).toThrow();
        expect(() => model.resetProgress(-2)).toThrow();
        expect(() => model.resetProgress(3.5)).toThrow();

        // Invalid reset should not change existing progress
        expect(model.getTotalProblems()).toBe(5);
    });

});