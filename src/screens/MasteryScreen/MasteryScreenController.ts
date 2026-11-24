import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { MASTERY_COUNTDOWN_SECONDS } from "../../constants.ts";
import { AnswerEntryModel } from "../../guided/AnswerEntryModel.ts";
import { parseStepAnswer } from "../../guided/answerParsing.ts";
import { formatEquation } from "../../guided/stepPrompts.ts";
import { MasteryScreenModel } from "./MasteryScreenModel.ts";
import { MasteryScreenView } from "./MasteryScreenView.ts";
import { getFoodTiles, type FoodTile } from "../../visuals/FoodVisualState.ts";
import type {
  MasteryScreenViewFactory,
  MasteryScreenViewPort,
  MasterySummary,
} from "./MasteryScreenViewPort.ts";

export const LOWEST_TERMS_RULE =
  "Answers must be in lowest terms.\nWrite 1/2, not 2/4.";

/** Shown after each correct answer. Praise only, never a hint. */
export const CORRECT_MESSAGE = "Correct! Keep going.";

/** The answer is one fraction, typed in two boxes: top, then bottom. */
const ANSWER_FIELD_COUNT = 2;

const MS_PER_SECOND = 1000;

type Phase = "idle" | "countdown" | "playing" | "over";

export class MasteryScreenController extends ScreenController {
  private readonly view: MasteryScreenViewPort & { showFoodTiles?(tiles: readonly FoodTile[]): void };
  private readonly model: MasteryScreenModel;
  private readonly screenSwitcher: ScreenSwitcher;
  private readonly entry = new AnswerEntryModel(ANSWER_FIELD_COUNT);
  private phase: Phase = "idle";
  private countdownTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    screenSwitcher: ScreenSwitcher,
    createView: MasteryScreenViewFactory = (handlers) =>
      new MasteryScreenView(handlers),
    model: MasteryScreenModel = new MasteryScreenModel(),
  ) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.model = model;
    this.view = createView({
      onDigit: (digit) => this.handleDigit(digit),
      onBackspace: () => this.handleBackspace(),
      onFieldSelected: (index) => this.handleFieldSelected(index),
      onCheck: () => this.handleCheck(),
      onExit: () => this.handleExit(),
      onPlayAgain: () => this.startGame(),
      onMainMenu: () => this.screenSwitcher.switchToScreen({ type: "menu" }),
    });
  }

  getView(): MasteryScreenViewPort {
    return this.view;
  }

  getModel(): MasteryScreenModel {
    return this.model;
  }

  /** Starts a new game with a score of 0, beginning with the countdown. */
  startGame(): void {
    this.stopCountdown();
    this.model.reset();
    this.entry.clear();
    this.view.updateScore(0);
    this.phase = "countdown";
    this.runCountdown(MASTERY_COUNTDOWN_SECONDS);
  }

  override hide(): void {
    this.stopCountdown();
    if (this.phase === "countdown") this.phase = "idle";
    super.hide();
  }

  private runCountdown(secondsLeft: number): void {
    if (secondsLeft <= 0) {
      this.countdownTimer = null;
      this.phase = "playing";
      this.showCurrentProblem();
      return;
    }
    this.view.showCountdown(secondsLeft, LOWEST_TERMS_RULE);
    this.countdownTimer = setTimeout(
      () => this.runCountdown(secondsLeft - 1),
      MS_PER_SECOND,
    );
  }

  private stopCountdown(): void {
    if (this.countdownTimer !== null) {
      clearTimeout(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  private showCurrentProblem(): void {
    this.entry.clear();
    this.view.showProblem(
      formatEquation(this.model.getCurrentProblem()),
      this.model.getAnsweredCount() + 1,
    );
    this.view.showFoodTiles?.(getFoodTiles(this.model.getCurrentProblem(), "original"));
    this.refreshFields();
  }

  private handleDigit(digit: string): void {
    if (this.phase !== "playing") return;
    this.entry.typeDigit(digit);
    this.refreshFields();
  }

  private handleBackspace(): void {
    if (this.phase !== "playing") return;
    this.entry.backspace();
    this.refreshFields();
  }

  private handleFieldSelected(index: number): void {
    if (this.phase !== "playing") return;
    this.entry.selectField(index);
    this.refreshFields();
  }

  private handleCheck(): void {
    if (this.phase !== "playing") return;

    // The "simplify" step reads exactly one fraction from two boxes.
    const parsed = parseStepAnswer("simplify", this.entry.getFields());
    if (!parsed.ok) {
      this.view.showMessage(parsed.message);
      return;
    }
    if (parsed.answer.step !== "simplify") return;

    if (this.model.submit(parsed.answer.result)) {
      this.view.updateScore(this.model.getCorrectCount());
      this.showCurrentProblem();
      this.view.showMessage(CORRECT_MESSAGE);
    } else {
      this.endGame();
    }
  }

  private handleExit(): void {
    if (this.phase === "over") return;
    this.stopCountdown();
    this.model.exit();
    this.endGame();
  }

  private endGame(): void {
    if (this.phase === "over") return;
    
    this.stopCountdown();
    this.phase = "over";

    const summary = this.buildSummary();

    this.screenSwitcher.switchToScreen({
      type: "gameOver",
      gameId: "masteryMode",
      score: this.model.getCorrectCount(),
      summary,
    });
  }

  private buildSummary(): MasterySummary {
    const missed = this.model.getMissedProblem();
    let detail = "";
    if (missed !== undefined) {
      detail =
        `${formatEquation(missed.problem)} = ${missed.expected}. ` +
        `You answered ${missed.given}.`;
      if (missed.given.isEqual(missed.expected)) {
        detail += "\nSo close! Remember to use lowest terms.";
      }
    }
    return {
      title:
        this.model.getEndReason() === "exited" ? "Game ended" : "Game over!",
      correctCount: this.model.getCorrectCount(),
      incorrectCount: this.model.getIncorrectCount(),
      detail,
    };
  }

  private refreshFields(): void {
    this.view.updateFields(this.entry.getFields(), this.entry.getActiveIndex());
  }
}
