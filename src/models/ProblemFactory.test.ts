import { describe, test, expect } from "vitest";
import { Problem } from "./Problem.ts";
import { Fraction, gcd } from "./Fraction.ts";
import { ProblemType } from "./ProblemType.ts";
import { ProblemFactory } from "./ProblemFactory.ts";

describe("levels", () => {
    test("level 1 problem", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 1);

        expect(problem.getLevel()).toBe(1);
    });

    test("level 2 problem", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 2);

        expect(problem.getLevel()).toBe(2);
    });

    test("level 3 problem", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 3);

        expect(problem.getLevel()).toBe(3);
    });

    test("level 4 problem", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 4);

        expect(problem.getLevel()).toBe(4);
    });
});

describe("denominator checks", () => {
    test("level 1 have equal denominators", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 1);

        expect(problem.getFrac1().denominator).toBe(problem.getFrac2().denominator);
    });

    test("level 2 denominators have a common factor", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 2);

        expect(
            gcd(
                problem.getFrac1().denominator, problem.getFrac2().denominator
            )).toBeGreaterThan(1);
    });

    test("level 3 denominators are not equal", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 3);

        expect(problem.getFrac1().denominator).not.toBe(problem.getFrac2().denominator);
    });

    test("level 4 denominators are not equal", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 4);

        expect(problem.getFrac1().denominator).not.toBe(problem.getFrac2().denominator);
    });
});