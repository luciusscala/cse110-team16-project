import type { View } from "../types.ts";
import type { StepPrompt } from "./stepPrompts.ts";

/** Whether feedback is praise or a nudge to try again, so the view can style it. */
export type FeedbackTone = "correct" | "tryAgain";

/** What the screen shows about the question as a whole. */
export interface QuestionHeader {
	readonly levelName: string;
	readonly questionNumber: number;
	readonly questionCount: number;
	/** The question written as a sum, e.g. "1/2 + 1/4". */
	readonly equation: string;
}

/** Everything the player can do on the screen. The controller reacts to these. */
export interface GuidedLevelHandlers {
	onDigit(digit: string): void;
	onBackspace(): void;
	onFieldSelected(index: number): void;
	onCheck(): void;
	onContinue(): void;
	onBack(): void;
}

/**
 * What the controller needs from a guided level screen.
 *
 * The controller only talks to this interface, so it can be tested with a
 * fake view and never depends on Konva.
 */
export interface GuidedLevelViewPort extends View {
	showQuestion(header: QuestionHeader): void;
	/** Shows a step's instruction and boxes, and where the player is in the steps. */
	showStep(
		prompt: StepPrompt,
		stepNames: readonly string[],
		currentStepIndex: number,
	): void;
	updateFields(fields: readonly string[], activeIndex: number): void;
	showFeedback(message: string, tone: FeedbackTone): void;
	/** Shows the finished question and the button to move on. */
	showQuestionComplete(summary: string, isLastQuestion: boolean): void;
}

/** Builds the view for a controller, handing it the player's actions. */
export type GuidedLevelViewFactory = (
	handlers: GuidedLevelHandlers,
) => GuidedLevelViewPort;
