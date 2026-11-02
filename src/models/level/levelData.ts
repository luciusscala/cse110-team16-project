import { Fraction } from "../Fraction.ts";
import type {
  Level,
  LevelId,
  LevelOperation,
  Operation,
  Question,
} from "./LevelTypes.ts";

const f = (numerator: number, denominator: number) =>
  new Fraction(numerator, denominator);

type QuestionSpec = [
  frac1: Fraction,
  operation: Operation,
  frac2: Fraction,
  correctAnswer: Fraction,
];

function level(
  id: LevelId,
  displayName: string,
  description: string,
  operation: LevelOperation,
  guided: boolean,
  specs: QuestionSpec[],
): Level {
  const questions: Question[] = specs.map(
    ([frac1, op, frac2, correctAnswer], index) =>
      Object.freeze({
        id: `L${id}-Q${index + 1}`,
        levelId: id,
        frac1,
        frac2,
        operation: op,
        correctAnswer,
      }),
  );
  return Object.freeze({
    id,
    displayName,
    description,
    operation,
    difficulty: id,
    guided,
    questions: Object.freeze(questions),
  });
}

const ADD = "addition";
const SUB = "subtraction";

export const LEVELS: readonly Level[] = Object.freeze([
  level(
    1,
    "Same Size Slices",
    "Add slices that are the same size.",
    ADD,
    true,
    [
      // Easier to harder: denominators get bigger.
      [f(1, 3), ADD, f(1, 3), f(2, 3)],
      [f(1, 5), ADD, f(2, 5), f(3, 5)],
      [f(2, 7), ADD, f(3, 7), f(5, 7)],
      [f(2, 9), ADD, f(5, 9), f(7, 9)],
      [f(4, 11), ADD, f(5, 11), f(9, 11)],
    ],
  ),

  level(
    2,
    "Make It Simpler",
    "Add slices, then make the answer simpler.",
    ADD,
    true,
    [
      // Easier to harder: denominators get bigger.
      [f(1, 4), ADD, f(1, 4), f(1, 2)], // 2/4
      [f(1, 6), ADD, f(1, 6), f(1, 3)], // 2/6
      [f(3, 8), ADD, f(3, 8), f(3, 4)], // 6/8
      [f(2, 9), ADD, f(4, 9), f(2, 3)], // 6/9
      [f(1, 10), ADD, f(3, 10), f(2, 5)], // 4/10
    ],
  ),

  level(
    3,
    "Match the Slices",
    "Change one fraction so the slices match, then add.",
    ADD,
    true,
    [
      // Easier to harder: no simplifying first, then answers that need simplifying.
      [f(1, 2), ADD, f(1, 4), f(3, 4)], // 2/4 + 1/4
      [f(1, 4), ADD, f(3, 8), f(5, 8)], // 2/8 + 3/8
      [f(1, 3), ADD, f(2, 9), f(5, 9)], // 3/9 + 2/9
      [f(1, 3), ADD, f(1, 6), f(1, 2)], // 2/6 + 1/6 = 3/6
      [f(2, 5), ADD, f(1, 10), f(1, 2)], // 4/10 + 1/10 = 5/10
    ],
  ),

  level(4, "Take Some Away", "Add and take away slices.", "mixed", false, [
    // Easier to harder: same denominators, then simplifying, then matching denominators.
    [f(4, 5), SUB, f(1, 5), f(3, 5)],
    [f(5, 6), SUB, f(1, 6), f(2, 3)], // 4/6
    [f(1, 2), ADD, f(1, 8), f(5, 8)], // 4/8 + 1/8
    [f(3, 4), SUB, f(1, 2), f(1, 4)], // 3/4 - 2/4
    [f(5, 6), SUB, f(1, 3), f(1, 2)], // 5/6 - 2/6 = 3/6
  ]),

  level(5, "Different Slices", "Add slices of different sizes.", ADD, false, [
    // Easier to harder: common denominator gets bigger. The last one's common
    // denominator (12) is smaller than 4 x 6, which is the trickiest case.
    [f(1, 2), ADD, f(1, 3), f(5, 6)], // 3/6 + 2/6
    [f(1, 2), ADD, f(2, 5), f(9, 10)], // 5/10 + 4/10
    [f(1, 3), ADD, f(1, 4), f(7, 12)], // 4/12 + 3/12
    [f(2, 5), ADD, f(1, 3), f(11, 15)], // 6/15 + 5/15
    [f(1, 4), ADD, f(1, 6), f(5, 12)], // 3/12 + 2/12
  ]),

  level(
    6,
    "Put It All Together",
    "Add and take away different slices, then make it simpler.",
    "mixed",
    false,
    [
      // Easier to harder: subtraction with no simplifying first, then answers
      // that need simplifying, ending with subtraction that needs simplifying.
      [f(1, 2), SUB, f(1, 3), f(1, 6)], // 3/6 - 2/6
      [f(3, 4), SUB, f(1, 6), f(7, 12)], // 9/12 - 2/12
      [f(1, 6), ADD, f(1, 10), f(4, 15)], // 5/30 + 3/30 = 8/30
      [f(3, 10), ADD, f(1, 6), f(7, 15)], // 9/30 + 5/30 = 14/30
      [f(5, 6), SUB, f(3, 10), f(8, 15)], // 25/30 - 9/30 = 16/30
    ],
  ),

  level(7, "Final Challenge", "Use everything you learned!", "mixed", false, [
    // Easier to harder: same denominators, then multiples, then unrelated.
    [f(5, 12), ADD, f(1, 12), f(1, 2)], // 6/12
    [f(7, 10), SUB, f(3, 10), f(2, 5)], // 4/10
    [f(2, 3), SUB, f(1, 6), f(1, 2)], // 4/6 - 1/6 = 3/6
    [f(2, 3), ADD, f(1, 5), f(13, 15)], // 10/15 + 3/15
    [f(5, 6), SUB, f(1, 4), f(7, 12)], // 10/12 - 3/12
  ]),
]);
