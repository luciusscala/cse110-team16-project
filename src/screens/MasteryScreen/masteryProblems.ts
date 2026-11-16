import { Fraction } from "../../models/Fraction.ts";
import type { Question } from "../../models/level/LevelTypes.ts";

export type MasteryProblem = Pick<Question, "frac1" | "frac2" | "operation">;

const f = (numerator: number, denominator: number) =>
	new Fraction(numerator, denominator);

const add = (frac1: Fraction, frac2: Fraction): MasteryProblem =>
	Object.freeze({ frac1, frac2, operation: "addition" });
const sub = (frac1: Fraction, frac2: Fraction): MasteryProblem =>
	Object.freeze({ frac1, frac2, operation: "subtraction" });


export const MASTERY_PROBLEMS: readonly MasteryProblem[] = Object.freeze([
	
	add(f(1, 5), f(2, 5)), // 3/5
	add(f(2, 7), f(4, 7)), // 6/7
	add(f(3, 11), f(5, 11)), // 8/11
	sub(f(5, 7), f(2, 7)), // 3/7

	
	add(f(1, 8), f(3, 8)), // 4/8 = 1/2
	sub(f(7, 9), f(4, 9)), // 3/9 = 1/3
	add(f(1, 12), f(7, 12)), // 8/12 = 2/3
	sub(f(9, 10), f(3, 10)), // 6/10 = 3/5

	
	add(f(1, 3), f(1, 9)), // 3/9 + 1/9 = 4/9
	add(f(1, 2), f(3, 8)), // 4/8 + 3/8 = 7/8
	sub(f(3, 4), f(3, 8)), // 6/8 - 3/8 = 3/8
	add(f(1, 5), f(3, 10)), // 2/10 + 3/10 = 5/10 = 1/2

	
	add(f(1, 3), f(1, 5)), // 5/15 + 3/15 = 8/15
	sub(f(3, 4), f(2, 3)), // 9/12 - 8/12 = 1/12
	add(f(2, 5), f(1, 4)), // 8/20 + 5/20 = 13/20
	sub(f(5, 7), f(1, 3)), // 15/21 - 7/21 = 8/21


	add(f(3, 8), f(1, 6)), // 9/24 + 4/24 = 13/24
	sub(f(5, 12), f(1, 8)), // 10/24 - 3/24 = 7/24
	add(f(7, 10), f(1, 6)), // 21/30 + 5/30 = 26/30 = 13/15
	sub(f(9, 14), f(1, 6)), // 27/42 - 7/42 = 20/42 = 10/21
]);


export function masteryAnswer(problem: MasteryProblem): Fraction {
	const { frac1, frac2, operation } = problem;
	const combined =
		operation === "addition" ? frac1.add(frac2) : frac1.subtract(frac2);
	return combined.simplify();
}
