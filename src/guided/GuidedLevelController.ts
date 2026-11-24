import { ProgressManager } from "../persistence/ProgressManager.ts";
import { CurrentLevelProgressModel } from "../models/CurrentLevelProgressModel.ts";
import { getLevelById } from "../models/level/levelRepository.ts";
import type { Level } from "../models/level/LevelTypes.ts";
import { ScreenController } from "../types.ts";
import type { ScreenSwitcher } from "../types.ts";
import { AnswerEntryModel } from "./AnswerEntryModel.ts";
import { parseStepAnswer } from "./answerParsing.ts";
import { GuidedSolutionModel } from "./GuidedSolutionModel.ts";
import { getFoodTiles, type VisualPhase } from "../visuals/FoodVisualState.ts";
import type {
	GuidedLevelViewFactory,
	GuidedLevelViewPort,
} from "./GuidedLevelView.ts";
import {
	countFields,
	formatEquation,
	getStepPrompt,
	STEP_NAMES,
} from "./stepPrompts.ts";

const STEP_CORRECT_MESSAGE = "Nice work!";
const TRY_AGAIN_MESSAGE = "Not quite. Read the tip and try again!";

/** The question the player is working on, with everything that goes with it. */
interface ActiveQuestion {
	readonly model: GuidedSolutionModel;
	entry: AnswerEntryModel;
}

/**
 * GuidedLevelController - Walks the player through a guided level.
 *
 * Each question is solved one step at a time. The player types into the
 * boxes for the current step and checks them. A wrong answer just asks the
 * player to try again, since the tutorial text already explains the step.
 * Finishing the last question saves the level as completed and returns to
 * the menu.
 */
export class GuidedLevelController extends ScreenController {
	private readonly view: GuidedLevelViewPort;
	private readonly screenSwitcher: ScreenSwitcher;

	private level: Level | undefined;
	private levelProgress: CurrentLevelProgressModel | undefined;
	private active: ActiveQuestion | undefined;
	private questionComplete = false;

	constructor(screenSwitcher: ScreenSwitcher, createView: GuidedLevelViewFactory) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = createView({
			onDigit: (digit) => this.handleDigit(digit),
			onBackspace: () => this.handleBackspace(),
			onFieldSelected: (index) => this.handleFieldSelected(index),
			onCheck: () => this.handleCheck(),
			onContinue: () => this.handleContinue(),
			onBack: () => this.handleBack(),
		});
	}

	getView(): GuidedLevelViewPort {
		return this.view;
	}

	/**
	 * Starts a level from its first question.
	 *
	 * @return false, leaving the screen unchanged, if there is no guided level
	 * with this id. The caller should show a different screen.
	 */
	startLevel(levelId: number): boolean {
		const level = getLevelById(levelId);
		if (level === undefined || !level.guided) return false;

		this.level = level;
		this.levelProgress = new CurrentLevelProgressModel(level.questions.length);
		this.loadQuestion();
		return true;
	}

	private loadQuestion(): void {
		const level = this.requireLevel();
		const progress = this.requireLevelProgress();
		const question = level.questions[progress.getProblemsCompleted()];

		this.questionComplete = false;
		const model = new GuidedSolutionModel(question);
		this.active = {
			model,
			entry: this.makeEntry(model),
		};

		this.view.showQuestion({
			levelName: level.displayName,
			questionNumber: progress.getProblemsCompleted() + 1,
			questionCount: progress.getTotalProblems(),
			equation: formatEquation(question),
		});
		this.showCurrentStep();
	}

	/** Shows the current step with fresh, empty answer boxes. */
	private showCurrentStep(): void {
		const active = this.requireActive();
		const step = active.model.getCurrentStep();
		if (step === undefined) return;

		const prompt = getStepPrompt(step, active.model.getSolution());
		const fieldCount = countFields(prompt);
		const steps = active.model.getSteps();

		if (active.entry.getFields().length === fieldCount) {
			active.entry.clear();
		} else {
			active.entry = new AnswerEntryModel(fieldCount);
		}

		this.view.showStep(
			prompt,
			steps.map((name) => STEP_NAMES[name]),
			steps.indexOf(step),
		);
		this.refreshFields();
		this.refreshFoodVisual();
	}

	private refreshFoodVisual() : void {
		const { model } = this.requireActive();
		const completed = model.getCompletedSteps();
		const phase: VisualPhase = model.isComplete() ? "simplified"
			: completed.includes("combine") ? "combined"
			: completed.includes("scaleNumerators") ? "equivalent" : "original";
		this.view.showFoodTiles?.(getFoodTiles(model.getQuestion(), phase, model.getSolution()));
	}
	/** Builds an empty entry sized for the model's current step. */
	private makeEntry(model: GuidedSolutionModel): AnswerEntryModel {
		const step = model.getCurrentStep();
		if (step === undefined) {
			throw new Error("Cannot build answer boxes for a completed question");
		}
		return new AnswerEntryModel(
			countFields(getStepPrompt(step, model.getSolution())),
		);
	}

	private refreshFields(): void {
		const { entry } = this.requireActive();
		this.view.updateFields(entry.getFields(), entry.getActiveIndex());
	}

	private handleDigit(digit: string): void {
		if (!this.isAcceptingAnswers()) return;
		this.requireActive().entry.typeDigit(digit);
		this.refreshFields();
	}

	private handleBackspace(): void {
		if (!this.isAcceptingAnswers()) return;
		this.requireActive().entry.backspace();
		this.refreshFields();
	}

	private handleFieldSelected(index: number): void {
		if (!this.isAcceptingAnswers()) return;
		this.requireActive().entry.selectField(index);
		this.refreshFields();
	}

	/** Checks what the player typed for the current step. */
	private handleCheck(): void {
		if (!this.isAcceptingAnswers()) return;
		const { model, entry } = this.requireActive();
		const step = model.getCurrentStep();
		if (step === undefined) return;

		const parsed = parseStepAnswer(step, entry.getFields());
		if (!parsed.ok) {
			this.view.showFeedback(parsed.message, "tryAgain");
			return;
		}

		if (!model.submit(parsed.answer)) {
			// Keep what they typed so a small slip is easy to fix.
			this.view.showFeedback(TRY_AGAIN_MESSAGE, "tryAgain");
			return;
		}

		if (model.isComplete()) {
			this.finishQuestion();
		} else {
			this.showCurrentStep();
			this.view.showFeedback(STEP_CORRECT_MESSAGE, "correct");
		}
	}

	private finishQuestion(): void {
		const { model } = this.requireActive();
		const progress = this.requireLevelProgress();
		this.questionComplete = true;
		this.refreshFoodVisual();

		const finalAnswer = model.getFinalAnswer();
		this.view.showQuestionComplete(
			`${formatEquation(model.getQuestion())} = ${finalAnswer}`,
			progress.getProblemsCompleted() === progress.getTotalProblems() - 1,
		);
	}

	/** Moves on from a finished question to the next, or finishes the level. */
	private handleContinue(): void {
		if (!this.questionComplete) return;
		const level = this.requireLevel();
		const progress = this.requireLevelProgress();

		progress.completeProblem();
		if (!progress.isLevelComplete()) {
			this.loadQuestion();
			return;
		}

		ProgressManager.increaseProgressTo(level.id);
		this.leaveLevel();
	}

	private handleBack(): void {
		this.leaveLevel();
	}

	private leaveLevel(): void {
		this.level = undefined;
		this.levelProgress = undefined;
		this.active = undefined;
		this.questionComplete = false;
		this.screenSwitcher.switchToScreen({ type: "menu" });
	}

	/** True while the player is on a question that still needs answers. */
	private isAcceptingAnswers(): boolean {
		return this.active !== undefined && !this.questionComplete;
	}

	private requireLevel(): Level {
		if (this.level === undefined) throw new Error("No level has been started");
		return this.level;
	}

	private requireLevelProgress(): CurrentLevelProgressModel {
		if (this.levelProgress === undefined) {
			throw new Error("No level has been started");
		}
		return this.levelProgress;
	}

	private requireActive(): ActiveQuestion {
		if (this.active === undefined) throw new Error("No question is active");
		return this.active;
	}
}
