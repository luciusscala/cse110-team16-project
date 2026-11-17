import { describe, test, expect } from "vitest";
import { Problem } from "./Problem.ts";
import { Fraction } from "./Fraction.ts";
import { ProblemType } from "./ProblemType.ts";


test("computes addition", () => {
    const problem = new Problem(
        1, 
        new Fraction(1, 3), 
        new Fraction(1, 3), 
        ProblemType.ADDITION
    );
    expect(problem.computeAnswer().isEqual(new Fraction(2, 3))).toBe(true);
});

test("computes subtraction", () => {
    const problem = new Problem(
        1, 
        new Fraction(2, 3), 
        new Fraction(1, 3), 
        ProblemType.SUBTRACTION
    );
    expect(problem.computeAnswer().isEqual(new Fraction(1, 3))).toBe(true);
});


test("check answer", () => {
    const problem = new Problem(
        1, 
        new Fraction(2, 4), 
        new Fraction(1, 4), 
        ProblemType.ADDITION
    );
    expect(problem.checkAnswer(new Fraction(3, 4))).toBe(true);
});










