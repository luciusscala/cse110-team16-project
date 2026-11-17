import type { View } from "../../types.ts";

export interface MasteryScreenHandlers {
  onDigit(digit: string): void;
  onBackspace(): void;
  onFieldSelected(index: number): void;
  onCheck(): void;
  onExit(): void;
  onPlayAgain(): void;
  onMainMenu(): void;
}

export interface MasterySummary {
  readonly title: string;
  readonly correctCount: number;
  readonly incorrectCount: number;

  readonly detail: string;
}

export interface MasteryScreenViewPort extends View {
  showCountdown(secondsLeft: number, rule: string): void;

  showProblem(equation: string, problemNumber: number): void;
  updateScore(correctCount: number): void;
  updateFields(fields: readonly string[], activeIndex: number): void;

  showMessage(message: string): void;
  showSummary(summary: MasterySummary): void;
}

export type MasteryScreenViewFactory = (
  handlers: MasteryScreenHandlers,
) => MasteryScreenViewPort;
