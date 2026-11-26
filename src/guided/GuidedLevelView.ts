import Konva from "konva";
import { STAGE_WIDTH } from "../constants.ts";
import { Button } from "../components/Button.ts";
import { KeypadBuilder } from "../components/Keypad.ts";
import type { View } from "../types.ts";
import type { StepPrompt } from "./stepPrompts.ts";
import { FractionFoodVisual } from "../visuals/FractionFoodVisual.ts";
import type { FoodTile } from "../visuals/FoodVisualState.ts";

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
	onHintClick(): void;
}

/**
 * What the controller needs from a guided level screen.
 *
 * The controller only talks to this interface, so it can be tested with a
 * fake view and never depends on Konva.
 */
export interface GuidedLevelViewPort extends View {
	showQuestion(header: QuestionHeader): void;
	showFoodTiles?(tiles: readonly FoodTile[], operator?: string): void;
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
	showHint(hint: string): void;
	clearHint(): void;
}

/** Builds the view for a controller, handing it the player's actions. */
export type GuidedLevelViewFactory = (
	handlers: GuidedLevelHandlers,
) => GuidedLevelViewPort;

const FONT = "Arial";
const COLORS = {
	text: "#222222",
	muted: "#777777",
	button: "#2e9e4f",
	buttonBorder: "#1f6e36",
	back: "#777777",
	backBorder: "#555555",
	hint: "#d9534f",
	hintBorder: "#a83a36",
	boxBorder: "#999999",
	boxActive: "#3b7dd8",
	correct: "#1f8a3d",
	tryAgain: "#c2410c",
	stepDone: "#1f8a3d",
	stepCurrent: "#3b7dd8",
	stepTodo: "#aaaaaa",
	tipFill: "#fff7d6",
	tipBorder: "#e6d58a",
};

// The tip panel under the step title
const TIP_TOP = 166;
const TIP_WIDTH = 680;
const TIP_HEIGHT = 56;
const TIP_PADDING = 10;

// Answer boxes
const BOX_WIDTH = 70;
const BOX_HEIGHT = 44;
const FRACTION_GAP = 10;
const LABEL_GAP = 12;
const GROUP_GAP = 50;
const BOXES_TOP = 266;

// Number pad and action buttons
const PAD_LEFT = 100;
const PAD_TOP = 440;
const PAD_KEY = 54;
const PAD_SPACING = 8;
const ACTION_LEFT = 470;
const ACTION_WIDTH = 230;
const ACTION_HEIGHT = 46;

// Food visuals use only the empty space beside the answer content.
const FOOD_LEFT = 12;
const FOOD_GAP = 6;

interface AnswerBox {
	readonly rect: Konva.Rect;
	readonly text: Konva.Text;
}

/**
 * GuidedLevelView - Renders a guided level: the question, the steps, the
 * answer boxes and a number pad.
 *
 * Konva has no text inputs, so answers are typed on an on-screen number
 * pad, which also suits young players on touch screens. All behaviour lives
 * in GuidedLevelController. This class only draws and forwards clicks.
 */
export class GuidedLevelView implements GuidedLevelViewPort {
	private readonly foodVisual = new FractionFoodVisual();
	private readonly handlers: GuidedLevelHandlers;
	private readonly group = new Konva.Group({ visible: false });
	private readonly headerText: Konva.Text;
	private readonly equationText: Konva.Text;
	private readonly feedbackText: Konva.Text;
	private readonly stepContent = new Konva.Group();
	private readonly answerKeys: Konva.Group;
	private readonly continueButton: Konva.Group;
	private readonly continueLabel: Konva.Text;
	private hintText: Konva.Text;
	private boxes: AnswerBox[] = [];

	constructor(handlers: GuidedLevelHandlers) {
		this.handlers = handlers;

		this.headerText = this.addCenteredText("", 18, 20, COLORS.muted);
		this.equationText = this.addCenteredText("", 52, 40, COLORS.text);
		this.feedbackText = this.addCenteredText("", 376, 20, COLORS.text);

		this.group.add(this.foodVisual.getGroup());
		this.group.add(this.stepContent);
		this.group.add(
			new Button({
				name: "back",
				x: 12,
				y: 10,
				width: 90,
				height: 34,
				text: "Back",
				fill: COLORS.back,
				stroke: COLORS.backBorder,
				fontSize: 18,
				onClick: () => this.handlers.onBack(),
			}).getGroup(),
		);

		this.hintButton = new Button({
			name: "hint",
			x: STAGE_WIDTH - 90 - 12,
			y: 10,
			width: 90,
			height: 34,
			text: "Hint?",
			fill: COLORS.hint,
			stroke: COLORS.hintBorder,
			fontSize: 18,
			onClick: () => this.handlers.onHintClick(),
		});
		this.group.add(this.hintButton.getGroup());

		this.hintText = new Konva.Text({
            x: (STAGE_WIDTH - 160) * 3/4,
            y: 260,
            width: 300, 
            text: "",
            fontSize: 20,
            fontFamily: FONT,
            fill: COLORS.text,
			align: "center",
        });
		this.group.add(this.hintText);

		this.answerKeys = KeypadBuilder.buildAnswerKeys({
			keySize: PAD_KEY,
			keySpacing: PAD_SPACING,
			distFromLeft: PAD_LEFT,
			distFromTop: PAD_TOP,
			actionWidth: ACTION_WIDTH,
			actionHeight: ACTION_HEIGHT,
			onKeyClick: (digit: string) => handlers.onDigit(digit),
			onBackspaceClick: () => handlers.onBackspace(),
			onCheckClick: () => handlers.onCheck(),
		});
		this.group.add(this.answerKeys);

		this.continueButton = new Button({
			name: "continue",
			x: ACTION_LEFT,
			y: PAD_TOP,
			width: ACTION_WIDTH,
			height: ACTION_HEIGHT,
			text: "Next Question",
			fill: COLORS.button,
			stroke: COLORS.buttonBorder,
			fontSize: 22,
			onClick: () => this.handlers.onContinue(),
		}).getGroup();
		this.continueLabel = this.continueButton.findOne<Konva.Text>("Text")!;
		this.continueButton.visible(false);
		this.group.add(this.continueButton);
	}

	show(): void {
		this.group.visible(true);
		this.redraw();
	}

	hide(): void {
		this.group.visible(false);
		this.redraw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	showFoodTiles(tiles: readonly FoodTile[], operator?: string): void {
		let top = BOXES_TOP - 4;
		const bottom = this.feedbackText.y() - FOOD_GAP;
		let right = STAGE_WIDTH / 2;
		const children = this.stepContent.getChildren();
		const bounds = children.map((node) =>
			node.getClientRect({ relativeTo: this.stepContent }),
		);

		// Only tutorial text above the answers can lower the top boundary.
		// Answer-box strokes may extend above BOXES_TOP, but must not lower it.
		children.forEach((node, index) => {
			if (node instanceof Konva.Text && node.y() < BOXES_TOP) {
				const rect = bounds[index];
				top = Math.max(top, rect.y + rect.height + FOOD_GAP);
			}
		});
		// Keep the food to the left of all answer boxes and their labels.
		for (const rect of bounds) {
			if (rect.y < bottom && rect.y + rect.height > top) {
				right = Math.min(right, rect.x - FOOD_GAP);
			}
		}

		this.foodVisual.renderInArea("pizza", tiles, {
			x: FOOD_LEFT,
			y: top,
			width: Math.max(0, right - FOOD_LEFT),
			height: Math.max(0, bottom - top),
		}, "horizontal", operator);
	}

	showQuestion(header: QuestionHeader): void {
		this.headerText.text(
			`${header.levelName}  -  Question ${header.questionNumber} of ${header.questionCount}`,
		);
		this.equationText.text(header.equation);
		this.setAnswering(true);
		this.feedbackText.text("");
		this.redraw();
	}

	showStep(
		prompt: StepPrompt,
		stepNames: readonly string[],
		currentStepIndex: number,
	): void {
		this.stepContent.destroyChildren();
		this.boxes = [];

		this.drawStepTracker(stepNames, currentStepIndex);
		this.drawText(prompt.title, 132, 26, COLORS.text, "bold");
		this.drawTip(prompt.tip);
		this.drawText(prompt.instruction, 232, 20, COLORS.text, "bold", 700);
		this.drawInputs(prompt);

		this.feedbackText.text("");
		this.redraw();
	}

	updateFields(fields: readonly string[], activeIndex: number): void {
		this.boxes.forEach((box, index) => {
			box.text.text(fields[index] ?? "");
			const active = index === activeIndex;
			box.rect.stroke(active ? COLORS.boxActive : COLORS.boxBorder);
			box.rect.strokeWidth(active ? 4 : 2);
		});
		this.redraw();
	}

	showFeedback(message: string, tone: FeedbackTone): void {
		this.feedbackText.text(message);
		this.feedbackText.fill(tone === "correct" ? COLORS.correct : COLORS.tryAgain);
		this.redraw();
	}

	/** Displays the hint for the problem. */
    showHint(hint: string): void {
        this.hintText.text(hint);
		this.redraw();
    }

    /** Clears the hint for the next problem. */
    clearHint(): void {
        this.hintText.text("");
		this.redraw();
    }

	showQuestionComplete(summary: string, isLastQuestion: boolean): void {
		this.feedbackText.text(`${summary}  Great job!`);
		this.feedbackText.fill(COLORS.correct);
		this.continueLabel.text(isLastQuestion ? "Finish Level" : "Next Question");
		this.setAnswering(false);
		this.redraw();
	}

	/** Shows the number pad and Check button while answering, or Continue when done. */
	private setAnswering(answering: boolean): void {
		this.answerKeys.visible(answering);
		this.continueButton.visible(!answering);
	}

	/** Draws each step's name, with a tick for finished steps and colour for the current one. */
	private drawStepTracker(stepNames: readonly string[], currentIndex: number): void {
		const spacing = 170;
		const startX = (STAGE_WIDTH - spacing * (stepNames.length - 1)) / 2;

		stepNames.forEach((name, index) => {
			const done = index < currentIndex;
			const label = done ? `✓ ${name}` : name;
			const color = done
				? COLORS.stepDone
				: index === currentIndex
					? COLORS.stepCurrent
					: COLORS.stepTodo;
			const text = new Konva.Text({
				text: label,
				fontSize: 17,
				fontFamily: FONT,
				fontStyle: index === currentIndex ? "bold" : "normal",
				fill: color,
			});
			text.x(startX + index * spacing - text.width() / 2);
			text.y(100);
			this.stepContent.add(text);
		});
	}

	/** Draws the how-to tip in a soft panel so it reads as a note from the tutorial. */
	private drawTip(tip: string): void {
		const left = (STAGE_WIDTH - TIP_WIDTH) / 2;
		this.stepContent.add(
			new Konva.Rect({
				name: "tip",
				x: left,
				y: TIP_TOP,
				width: TIP_WIDTH,
				height: TIP_HEIGHT,
				fill: COLORS.tipFill,
				stroke: COLORS.tipBorder,
				strokeWidth: 2,
				cornerRadius: 10,
				listening: false,
			}),
		);
		this.stepContent.add(
			new Konva.Text({
				x: left + TIP_PADDING,
				y: TIP_TOP,
				width: TIP_WIDTH - TIP_PADDING * 2,
				height: TIP_HEIGHT,
				text: tip,
				fontSize: 17,
				lineHeight: 1.25,
				fontFamily: FONT,
				fill: COLORS.text,
				align: "center",
				verticalAlign: "middle",
				listening: false,
			}),
		);
	}

	/** Lays out the answer groups side by side, centered on the stage. */
	private drawInputs(prompt: StepPrompt): void {
		const labels = prompt.inputs.map((input) =>
			new Konva.Text({ text: input.label, fontSize: 26, fontFamily: FONT }),
		);
		const groupWidths = labels.map((label) => label.width() + LABEL_GAP + BOX_WIDTH);
		const totalWidth =
			groupWidths.reduce((sum, width) => sum + width, 0) +
			GROUP_GAP * (prompt.inputs.length - 1);

		const fractionHeight = BOX_HEIGHT * 2 + FRACTION_GAP;
		const centerY = BOXES_TOP + fractionHeight / 2;

		let x = (STAGE_WIDTH - totalWidth) / 2;
		prompt.inputs.forEach((input, groupIndex) => {
			const label = labels[groupIndex];
			label.fill(COLORS.text);
			label.x(x);
			label.y(centerY - label.height() / 2);
			this.stepContent.add(label);

			const boxX = x + label.width() + LABEL_GAP;
			if (input.kind === "number") {
				this.addBox(boxX, centerY - BOX_HEIGHT / 2);
			} else {
				this.addBox(boxX, BOXES_TOP);
				this.stepContent.add(
					new Konva.Line({
						points: [boxX, centerY, boxX + BOX_WIDTH, centerY],
						stroke: COLORS.text,
						strokeWidth: 3,
						listening: false,
					}),
				);
				this.addBox(boxX, BOXES_TOP + BOX_HEIGHT + FRACTION_GAP);
			}
			x += groupWidths[groupIndex] + GROUP_GAP;
		});
	}

	private addBox(x: number, y: number): void {
		const index = this.boxes.length;
		const boxGroup = new Konva.Group({ name: `field-${index}` });
		const rect = new Konva.Rect({
			x,
			y,
			width: BOX_WIDTH,
			height: BOX_HEIGHT,
			fill: "white",
			stroke: COLORS.boxBorder,
			strokeWidth: 2,
			cornerRadius: 6,
		});
		// The text spans the whole box so it can be centered without measuring.
		const text = new Konva.Text({
			x,
			y,
			width: BOX_WIDTH,
			height: BOX_HEIGHT,
			text: "",
			fontSize: 30,
			fontFamily: FONT,
			fill: COLORS.text,
			align: "center",
			verticalAlign: "middle",
			listening: false,
		});
		boxGroup.add(rect);
		boxGroup.add(text);
		boxGroup.on("click tap", () => this.handlers.onFieldSelected(index));
		this.stepContent.add(boxGroup);
		this.boxes.push({ rect, text });
	}

	private drawText(
		text: string,
		y: number,
		fontSize: number,
		fill: string,
		fontStyle: string,
		width = STAGE_WIDTH,
	): void {
		const node = new Konva.Text({
			x: (STAGE_WIDTH - width) / 2,
			y,
			width,
			text,
			fontSize,
			fontFamily: FONT,
			fontStyle,
			fill,
			align: "center",
			listening: false,
		});
		this.stepContent.add(node);
	}

	private addCenteredText(
		text: string,
		y: number,
		fontSize: number,
		fill: string,
	): Konva.Text {
		const width = 700;
		const node = new Konva.Text({
			x: (STAGE_WIDTH - width) / 2,
			y,
			width,
			text,
			fontSize,
			fontFamily: FONT,
			fill,
			align: "center",
			listening: false,
		});
		this.group.add(node);
		return node;
	}

	private redraw(): void {
		this.group.getLayer()?.batchDraw();
	}
}
