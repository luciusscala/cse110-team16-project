import type { Fraction } from "../../models/Fraction.ts";
import { sameForm } from "../../guided/stepChecks.ts";
import {
	generateMasteryProblem,
	masteryAnswer,
	type MasteryProblem,
} from "./masteryProblems.ts";

export type MasteryEndReason = "wrongAnswer" | "exited";

export type MasteryProblemGenerator = (difficulty: number) => MasteryProblem;

export interface MissedProblem {
  readonly problem: MasteryProblem;
  readonly given: Fraction;
  readonly expected: Fraction;
}

export class MasteryScreenModel {
  private readonly generate: MasteryProblemGenerator;
  private difficulty = 0;
  private current: MasteryProblem;
  private correctCount = 0;
  private incorrectCount = 0;
  private endReason: MasteryEndReason | undefined;
  private missed: MissedProblem | undefined;

  constructor(
    generate: MasteryProblemGenerator = generateMasteryProblem,
  ) {
    this.generate = generate;
    this.current = this.generate(0);
  }

  reset(): void {
    this.difficulty = 0;
    this.correctCount = 0;
    this.incorrectCount = 0;
    this.endReason = undefined;
    this.missed = undefined;
    this.current = this.generate(0);
  }

  getCurrentProblem(): MasteryProblem {
    return this.current;
  }

  getDifficulty(): number {
    return this.difficulty;
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
      this.difficulty++;
      this.current = this.generate(this.difficulty);
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
