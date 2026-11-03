import { ProgressManager } from "../persistence/ProgressManager.ts";
import { getLevelById } from "../models/level/levelRepository.ts";
import type { Level } from "../models/level/LevelTypes.ts";
import { ScreenController } from "../types.ts";
import type { ScreenSwitcher } from "../types.ts";
import { AnswerEntryModel } from "./AnswerEntryModel.ts";
import { parseStepAnswer } from "./answerParsing.ts";
import { computeExpectedSolution } from "./expectedSolution.ts";
import { GuidedSolutionModel } from "./GuidedSolutionModel.ts";
import type { ExpectedSolution } from "./GuidedTypes.ts";
import type {
	GuidedLevelViewFactory,
	GuidedLevelViewPort,
} from "./GuidedLevelViewPort.ts";
import {
	countFields,
	formatEquation,
	getStepPrompt,
	STEP_NAMES,
} from "./stepPrompts.ts";

const STEP_CORRECT_MESSAGE = "Nice work!";

/** The question the player is working on, with everything that goes with it. */
interface ActiveQuestion {
	readonly solution: ExpectedSolution;
	readonly model: GuidedSolutionModel;
	entry: AnswerEntryModel;
}

/**
 * GuidedLevelController - Walks the player through a guided level.
 *
 * Each question is solved one step at a time. The player types into the
 * boxes for the current step and checks them. Wrong answers show the hint
 * for that mistake and the player tries again. Finishing the last question
 * saves the level as completed and returns to the menu.
 */
export class GuidedLevelController extends ScreenController {
	private readonly view: GuidedLevelViewPort;
	private readonly screenSwitcher: ScreenSwitcher;

	private level: Level | undefined;
	private questionIndex = 0;
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
		this.questionIndex = 0;
		this.loadQuestion();
		return true;
	}

	private loadQuestion(): void {
		const level = this.requireLevel();
		const question = level.questions[this.questionIndex];

		this.questionComplete = false;
		this.active = {
			solution: computeExpectedSolution(question),
			model: new GuidedSolutionModel(question),
			entry: new AnswerEntryModel(1),
		};

		this.view.showQuestion({
			levelName: level.displayName,
			questionNumber: this.questionIndex + 1,
			questionCount: level.questions.length,
			equation: formatEquation(question),
		});
		this.showCurrentStep();
	}

	/** Shows the current step with fresh, empty answer boxes. */
	private showCurrentStep(): void {
		const active = this.requireActive();
		const step = active.model.getCurrentStep();
		if (step === undefined) return;

		const prompt = getStepPrompt(step, active.solution);
		const steps = active.model.getSteps();
		active.entry = new AnswerEntryModel(countFields(prompt));

		this.view.showStep(
			prompt,
			steps.map((name) => STEP_NAMES[name]),
			steps.indexOf(step),
		);
		this.refreshFields();
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
			this.view.showFeedback(parsed.hint, "hint");
			return;
		}

		const feedback = model.submit(parsed.answer);
		if (!feedback.correct) {
			// Keep what they typed so a small slip is easy to fix.
			this.view.showFeedback(feedback.hint ?? "", "hint");
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
		const { solution, model } = this.requireActive();
		const level = this.requireLevel();
		this.questionComplete = true;

		const finalAnswer = model.getFinalAnswer();
		this.view.showQuestionComplete(
			`${formatEquation(solution.question)} = ${finalAnswer}`,
			this.questionIndex === level.questions.length - 1,
		);
	}

	/** Moves on from a finished question to the next, or finishes the level. */
	private handleContinue(): void {
		if (!this.questionComplete) return;
		const level = this.requireLevel();

		if (this.questionIndex < level.questions.length - 1) {
			this.questionIndex++;
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

	private requireActive(): ActiveQuestion {
		if (this.active === undefined) throw new Error("No question is active");
		return this.active;
	}
}
