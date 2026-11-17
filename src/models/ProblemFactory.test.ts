import { describe, test, expect } from "vitest";
import { Problem } from "./Problem.ts";
import { Fraction } from "./Fraction.ts";
import { ProblemType } from "./ProblemType.ts";
import { ProblemFactory } from "./ProblemFactory.ts";

describe("levels", () => {
    test("level 1 problem", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 1);

        expect(problem.getLevel()).toBe(2);
    });

    test("level 2 problem", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 2);

        expect(problem.getLevel()).toBe(2);
    });

    test("level 3 problem", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 3);

        expect(problem.getLevel()).toBe(4);
    });

    test("level 4 problem", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 4);

        expect(problem.getLevel()).toBe(4);
    });

    test("level 5 problem", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 5);

        expect(problem.getLevel()).toBe(5);
    });

    test("level 6 problem", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 6);

        expect(problem.getLevel()).toBe(6);
    });
});




describe("denominator checks", () => {
    test("level 2 equal denominators", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 2);

        expect(problem.getFrac1().denominator).toBe(problem.getFrac2().denominator);
    });

    test("level 4 denominator multiples", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 4);

        expect(
            gcd(
                problem.getFrac1().denominator, problem.getFrac2().denominator
            )).toBeGreaterThan(1);
    });

    test("level 5 denominators not same", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 4);

        expect(problem.getFrac1().denominator).not.toBe(getFrac2().denominator);
        expect(
            gcd(
                problem.getFrac1().denominator, problem.getFrac2().denominator
            )).ToBe(1);
    });

    test("level 6 denominators not same", () => {
        const factory = new ProblemFactory();
        const problem = factory.createProblem(ProblemType.ADDITION, 4);

        expect(problem.getFrac1().denominator).not.toBe(getFrac2().denominator);
        expect(
            gcd(
                problem.getFrac1().denominator, problem.getFrac2().denominator
            )).ToBe(1);
    });
});