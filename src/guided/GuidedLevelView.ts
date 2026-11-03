import Konva from "konva";
import { STAGE_WIDTH } from "../constants.ts";
import type {
	FeedbackTone,
	GuidedLevelHandlers,
	GuidedLevelViewPort,
	QuestionHeader,
} from "./GuidedLevelViewPort.ts";
import type { StepPrompt } from "./stepPrompts.ts";

const FONT = "Arial";
const COLORS = {
	text: "#222222",
	muted: "#777777",
	button: "#2e9e4f",
	buttonBorder: "#1f6e36",
	back: "#777777",
	backBorder: "#555555",
	pad: "#3b7dd8",
	padBorder: "#2a5aa0",
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

interface ButtonConfig {
	name: string;
	x: number;
	y: number;
	width: number;
	height: number;
	text: string;
	fill: string;
	stroke: string;
	fontSize: number;
	onClick: () => void;
}

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
	private readonly handlers: GuidedLevelHandlers;
	private readonly group = new Konva.Group({ visible: false });
	private readonly headerText: Konva.Text;
	private readonly equationText: Konva.Text;
	private readonly feedbackText: Konva.Text;
	private readonly stepContent = new Konva.Group();
	private readonly answerKeys = new Konva.Group();
	private readonly continueButton: Konva.Group;
	private readonly continueLabel: Konva.Text;
	private boxes: AnswerBox[] = [];

	constructor(handlers: GuidedLevelHandlers) {
		this.handlers = handlers;

		this.headerText = this.addCenteredText("", 18, 20, COLORS.muted);
		this.equationText = this.addCenteredText("", 52, 40, COLORS.text);
		this.feedbackText = this.addCenteredText("", 376, 20, COLORS.text);

		this.group.add(this.stepContent);
		this.group.add(
			this.createButton({
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
			}),
		);

		this.buildAnswerKeys();
		this.group.add(this.answerKeys);

		this.continueButton = this.createButton({
			name: "continue",
			x: ACTION_LEFT,
			y: PAD_TOP,
			width: ACTION_WIDTH,
			height: ACTION_HEIGHT,
			text: "Next question",
			fill: COLORS.button,
			stroke: COLORS.buttonBorder,
			fontSize: 22,
			onClick: () => this.handlers.onContinue(),
		});
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

	showQuestionComplete(summary: string, isLastQuestion: boolean): void {
		this.feedbackText.text(`${summary}  Great job!`);
		this.feedbackText.fill(COLORS.correct);
		this.continueLabel.text(isLastQuestion ? "Finish level" : "Next question");
		this.setAnswering(false);
		this.redraw();
	}

	/** Shows the number pad and Check button while answering, or Continue when done. */
	private setAnswering(answering: boolean): void {
		this.answerKeys.visible(answering);
		this.continueButton.visible(!answering);
	}

	private buildAnswerKeys(): void {
		for (let digit = 0; digit <= 9; digit++) {
			const column = digit % 5;
			const row = Math.floor(digit / 5);
			this.answerKeys.add(
				this.createButton({
					name: `digit-${digit}`,
					x: PAD_LEFT + column * (PAD_KEY + PAD_SPACING),
					y: PAD_TOP + row * (PAD_KEY + PAD_SPACING),
					width: PAD_KEY,
					height: PAD_KEY,
					text: String(digit),
					fill: COLORS.pad,
					stroke: COLORS.padBorder,
					fontSize: 26,
					onClick: () => this.handlers.onDigit(String(digit)),
				}),
			);
		}
		this.answerKeys.add(
			this.createButton({
				name: "check",
				x: ACTION_LEFT,
				y: PAD_TOP,
				width: ACTION_WIDTH,
				height: ACTION_HEIGHT,
				text: "Check",
				fill: COLORS.button,
				stroke: COLORS.buttonBorder,
				fontSize: 24,
				onClick: () => this.handlers.onCheck(),
			}),
		);
		this.answerKeys.add(
			this.createButton({
				name: "backspace",
				x: ACTION_LEFT,
				y: PAD_TOP + PAD_KEY + PAD_SPACING,
				width: ACTION_WIDTH,
				height: ACTION_HEIGHT,
				text: "Delete",
				fill: COLORS.back,
				stroke: COLORS.backBorder,
				fontSize: 22,
				onClick: () => this.handlers.onBackspace(),
			}),
		);
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

	private createButton(config: ButtonConfig): Konva.Group {
		const button = new Konva.Group({ x: config.x, y: config.y, name: config.name });
		button.add(
			new Konva.Rect({
				width: config.width,
				height: config.height,
				fill: config.fill,
				stroke: config.stroke,
				strokeWidth: 3,
				cornerRadius: 10,
			}),
		);
		// The label spans the whole button so it can be centered without measuring.
		button.add(
			new Konva.Text({
				width: config.width,
				height: config.height,
				text: config.text,
				fontSize: config.fontSize,
				fontFamily: FONT,
				fill: "white",
				align: "center",
				verticalAlign: "middle",
				listening: false,
			}),
		);
		button.on("click tap", config.onClick);
		button.on("mouseenter", () => this.setCursor(button, "pointer"));
		button.on("mouseleave", () => this.setCursor(button, "default"));
		return button;
	}

	private setCursor(node: Konva.Node, cursor: string): void {
		const container = node.getStage()?.container();
		if (container) container.style.cursor = cursor;
	}

	private redraw(): void {
		this.group.getLayer()?.batchDraw();
	}
}
