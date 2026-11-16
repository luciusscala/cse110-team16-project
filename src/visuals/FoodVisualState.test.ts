import { describe, expect, test } from "vitest";
import { Fraction } from "../models/Fraction.ts";
import type { Question } from "../models/level/LevelTypes.ts";
import { computeExpectedSolution } from "../guided/expectedSolution.ts";
import { getFoodTiles } from "./FoodVisualState.ts";

const question: Question = {
    id: "L3-Q1", levelId: 3, frac1: new Fraction(1, 2),
    frac2: new Fraction(1, 4), operation: "addition",
    correctAnswer: new Fraction(3, 4),
};
const solution = computeExpectedSolution(question);

describe("bakery fraction visual data", () => {
    test("starts with the original two fractions", () => {
        expect(getFoodTiles(question, "original").map(t => t.fraction.toString()))
            .toEqual(["1/2", "1/4"]);
    });
    test("shows equal-sized pieces only at the equivalent phase", () => {
        expect(getFoodTiles(question, "equivalent", solution).map(t => t.fraction.toString()))
            .toEqual(["2/4", "1/4"]);
    });
    test("shows the combined value when reached", () => {
        expect(getFoodTiles(question, "combined", solution)[0].fraction.toString())
            .toBe("3/4");
    });
    test("shows the simplified value when reached", () => {
        expect(getFoodTiles(question, "simplified", solution)[0].fraction.toString())
            .toBe("3/4");
    });
    test("does not reveal future steps without a solution", () => {
        expect(() => getFoodTiles(question, "combined")).toThrow();
    });
    test("subtraction labels the second amount correctly", () => {
        const subtractQuestion = { ...question, operation: "subtraction" as const };
        expect(getFoodTiles(subtractQuestion, "original")[1].label).toBe("Take away");
    });
});
