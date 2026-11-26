import Konva from "konva";
import { STAGE_WIDTH } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import { KeypadBuilder } from "../../components/Keypad.ts";
import { FractionAnswerBoxes } from "../../components/FractionAnswerBoxes.ts";
import { FractionFoodVisual } from "../../visuals/FractionFoodVisual.ts";
import type { FoodTile } from "../../visuals/FoodVisualState.ts";
import type {
	MasteryScreenHandlers,
	MasteryScreenViewPort,
} from "./MasteryScreenViewPort.ts";

const FONT = "Arial";
const COLORS = {
	text: "#222222",
	muted: "#777777",
	accent: "#3b7dd8",
	correct: "#1f8a3d",
	exit: "#d9534f",
	exitBorder: "#a83a36",
	backdrop: "lightblue",
	keyBackdrop: "lightgray",
	keyBackdropBorder: "black",
};

const TEXT_WIDTH = 700;

// Top of the answer boxes (one fraction, top box over bottom box)
const BOXES_TOP = 180;

// Number pad, placed like the guided levels'
const PAD_LEFT = 100;
const PAD_TOP = 440;
const PAD_KEY = 54;
const PAD_SPACING = 8;
const ACTION_WIDTH = 230;
const ACTION_HEIGHT = 46;

// Constants for decorative visuals
const BACKDROP_HEIGHT = 1000;
const KEY_BACKDROP_Y = 600;
const KEY_BACKDROP_YRAD = 200;

const BAKER_X = 300;
const BAKER_Y = 200;
const BAKER_SIZE = 400;

const CAKE_X = 250;
const CAKE_WIDTH = 500;
const CAKE_HEIGHT = 300;

// Fixed centers for Mastery's food visuals (stage coordinates).
const FOOD_FIRST_X = 76;
const FOOD_SECOND_X = 210;
const FOOD_CENTER_Y = 205;

/**
 * MasteryScreenView - Draws the Mastery minigame: the countdown, then one problem
 * at a time with the number pad. (The end-of-game results are on the game over screen.)
 *
 * Only one of the two parts is visible at a time. All behaviour lives in
 * MasteryScreenController. This class only draws and forwards clicks.
 */
export class MasteryScreenView implements MasteryScreenViewPort {
	private readonly foodVisual = new FractionFoodVisual();
	private readonly group = new Konva.Group({ visible: false });
	private readonly countdownGroup = new Konva.Group({ name: "countdown" });
	private readonly playGroup = new Konva.Group({ name: "play" });

	private readonly countdownNumber: Konva.Text;
	private readonly countdownRule: Konva.Text;

	private readonly scoreText: Konva.Text;
	private readonly problemNumberText: Konva.Text;
	private readonly equationText: Konva.Text;
	private readonly messageText: Konva.Text;
	private readonly answerBoxes: FractionAnswerBoxes;


	constructor(handlers: MasteryScreenHandlers) {
		this.group.add(this.countdownGroup, this.playGroup);

		// Countdown
		this.countdownGroup.add(this.centeredText("Mastery", 70, 40, COLORS.text, "bold"));
		this.countdownRule = this.centeredText("", 150, 26, COLORS.text, "normal", "countdownRule");
		this.countdownNumber = this.centeredText("", 260, 120, COLORS.accent, "bold", "countdownNumber");
		this.countdownGroup.add(this.countdownRule, this.countdownNumber);

		// Playing
		const screenBackdrop = new Konva.Rect({
			name: "backdrop",
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: BACKDROP_HEIGHT,
			fill: COLORS.backdrop,
		});

		const answerKeysBackdrop = new Konva.Ellipse({
			name: "keysBackdrop",
			x: STAGE_WIDTH / 2,
			y: KEY_BACKDROP_Y,
			radiusX: STAGE_WIDTH / 1.5,
			radiusY: KEY_BACKDROP_YRAD,
			fill: COLORS.keyBackdrop,
			stroke: COLORS.keyBackdropBorder,
		});
		this.playGroup.add(screenBackdrop);
		this.playGroup.add(answerKeysBackdrop);
		// Keep the artwork loaded asynchronously behind the gameplay UI.
		const artwork = new Konva.Group({ listening: false });
		this.playGroup.add(artwork);

		Konva.Image.fromURL("/baker_alright.png", (bakerImage) => {
			bakerImage.x(BAKER_X);
			bakerImage.y(BAKER_Y);
			bakerImage.width(BAKER_SIZE);
			bakerImage.height(BAKER_SIZE / 2);
			bakerImage.listening(false);
			artwork.add(bakerImage);
			this.redraw();
			bakerImage.name("baker-image");
		});

		Konva.Image.fromURL("/cake_plate_4+.png", (cakeImage) => {
			cakeImage.x(CAKE_X);
			cakeImage.y(0);
			cakeImage.width(CAKE_WIDTH);
			cakeImage.height(CAKE_HEIGHT);
			cakeImage.listening(false);
			artwork.add(cakeImage);
			this.redraw();
		});

		this.problemNumberText = this.centeredText("", 20, 20, COLORS.muted, "normal", "problemNumber");
		this.scoreText = new Konva.Text({
			name: "scoreDisplay",
			x: STAGE_WIDTH - 212,
			y: 18,
			width: 200,
			text: "Correct: 0",
			fontSize: 22,
			fontFamily: FONT,
			fontStyle: "bold",
			fill: COLORS.correct,
			align: "right",
			listening: false,
		});
		this.equationText = this.centeredText("", 80, 44, COLORS.text, "bold", "equation");
		this.messageText = this.centeredText("", 300, 20, COLORS.correct, "normal", "message");
		this.playGroup.add(
			this.problemNumberText,
			this.scoreText,
			this.equationText,
			this.messageText,
		);
		this.playGroup.add(this.foodVisual.getGroup());
		this.answerBoxes = new FractionAnswerBoxes(BOXES_TOP, handlers.onFieldSelected);
		this.playGroup.add(this.answerBoxes.getGroup());
		this.playGroup.add(
			KeypadBuilder.buildAnswerKeys({
				keySize: PAD_KEY,
				keySpacing: PAD_SPACING,
				distFromLeft: PAD_LEFT,
				distFromTop: PAD_TOP,
				actionWidth: ACTION_WIDTH,
				actionHeight: ACTION_HEIGHT,
				onKeyClick: (digit: string) => handlers.onDigit(digit),
				onBackspaceClick: () => handlers.onBackspace(),
				onCheckClick: () => handlers.onCheck(),
			}),
		);

		// Exit works during the countdown and while playing
		const exitButton = new Button({
			name: "exitButton",
			x: 12,
			y: 10,
			width: 90,
			height: 34,
			text: "Exit",
			fontSize: 18,
			fill: COLORS.exit,
			stroke: COLORS.exitBorder,
			onClick: () => handlers.onExit(),
		}).getGroup();
		this.group.add(exitButton);

		this.showOnly(this.countdownGroup);
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	show(): void {
		this.group.visible(true);
		this.redraw();
	}

	hide(): void {
		this.group.visible(false);
		this.redraw();
	}

	showCountdown(secondsLeft: number, rule: string): void {
		this.countdownRule.text(rule);
		this.countdownNumber.text(String(secondsLeft));
		this.showOnly(this.countdownGroup);
		this.redraw();
	}

	showFoodTiles(tiles: readonly FoodTile[], operator?: string): void {
		this.foodVisual.renderFixedPair(
			"cake", tiles, [FOOD_FIRST_X, FOOD_SECOND_X], FOOD_CENTER_Y, operator,
		);
	}

	showProblem(equation: string, problemNumber: number): void {
		this.problemNumberText.text(`Mastery  -  Problem ${problemNumber}`);
		this.equationText.text(`${equation} =`);
		this.messageText.text("");
		this.showOnly(this.playGroup);
		this.redraw();
	}

	updateScore(correctCount: number): void {
		this.scoreText.text(`Correct: ${correctCount}`);
		this.redraw();
	}

	updateFields(fields: readonly string[], activeIndex: number): void {
		this.answerBoxes.update(fields, activeIndex);
		this.redraw();
	}

	showMessage(message: string): void {
		this.messageText.text(message);
		this.redraw();
	}

	/** Shows one part of the screen. */
	private showOnly(part: Konva.Group): void {
		this.countdownGroup.visible(part === this.countdownGroup);
		this.playGroup.visible(part === this.playGroup);
	}

	private centeredText(
		text: string,
		y: number,
		fontSize: number,
		fill: string,
		fontStyle: string,
		name?: string,
	): Konva.Text {
		return new Konva.Text({
			name,
			x: (STAGE_WIDTH - TEXT_WIDTH) / 2,
			y,
			width: TEXT_WIDTH,
			text,
			fontSize,
			fontFamily: FONT,
			fontStyle,
			fill,
			align: "center",
			lineHeight: 1.3,
			listening: false,
		});
	}

	private redraw(): void {
		this.group.getLayer()?.batchDraw();
	}
}
