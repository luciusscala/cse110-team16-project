import type { Fraction } from "../../models/Fraction.ts";
import { sameForm } from "../../guided/stepChecks.ts";
import { MASTERY_PROBLEMS, masteryAnswer } from "./masteryProblems.ts";
import type { MasteryProblem } from "./masteryProblems.ts";

export type MasteryEndReason = "wrongAnswer" | "exited";

export interface MissedProblem {
  readonly problem: MasteryProblem;
  readonly given: Fraction;
  readonly expected: Fraction;
}

export class MasteryScreenModel {
  private readonly problems: readonly MasteryProblem[];
  private index = 0;
  private correctCount = 0;
  private incorrectCount = 0;
  private endReason: MasteryEndReason | undefined;
  private missed: MissedProblem | undefined;

  constructor(problems: readonly MasteryProblem[] = MASTERY_PROBLEMS) {
    if (problems.length === 0) {
      throw new Error("Mastery needs at least one problem");
    }
    this.problems = problems;
  }

  reset(): void {
    this.index = 0;
    this.correctCount = 0;
    this.incorrectCount = 0;
    this.endReason = undefined;
    this.missed = undefined;
  }

  getCurrentProblem(): MasteryProblem {
    return this.problems[this.index];
  }

  getCorrectCount(): number {
    return this.correctCount;
  }

  getIncorrectCount(): number {
    return this.incorrectCount;
  }

  getAnsweredCount(): number {
    return this.correctCount + this.incorrectCount;
  }

  isOver(): boolean {
    return this.endReason !== undefined;
  }

  getEndReason(): MasteryEndReason | undefined {
    return this.endReason;
  }

  getMissedProblem(): MissedProblem | undefined {
    return this.missed;
  }

  submit(answer: Fraction): boolean {
    if (this.isOver()) {
      throw new Error("Cannot submit an answer after the game is over");
    }

    const problem = this.getCurrentProblem();
    const expected = masteryAnswer(problem);
    if (sameForm(answer, expected)) {
      this.correctCount++;
      this.index = (this.index + 1) % this.problems.length;
      return true;
    }

    this.incorrectCount++;
    this.missed = { problem, given: answer, expected };
    this.endReason = "wrongAnswer";
    return false;
  }

  exit(): void {
    if (!this.isOver()) this.endReason = "exited";
  }
}
