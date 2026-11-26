import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import { KeypadBuilder } from "../../components/Keypad.ts";
import { SPEED_MODE_TIME_LIMIT } from "../../constants.ts";
import { FractionFoodVisual } from "../../visuals/FractionFoodVisual.ts";
import type { FoodTile } from "../../visuals/FoodVisualState.ts";

// General-use text constants
const LABEL_RIGHT_ALIGN = 200;
const SPEED_TEXT_UI_WIDTH = 200;
const LABEL_FONTSIZE = 28;
const NUMBER_FONTSIZE = 32;
const LABEL_COLOR = "black";
const SPEED_FONT = "Arial";
const TIME_COLOR = "red";
const SPEED_SCORE_COLOR = "green";

// Timer location constants
const TIME_RIGHT_ALIGN = 210;
const TIME_LABEL_TOP_ALIGN = 50;
const TIME_DISPLAY_TOP_ALIGN = 10;

// Score location constants
const SPEED_SCORE_LABEL_TOP_ALIGN = 90;
const SPEED_SCORE_DISPLAY_RIGHT_ALIGN = 100;
const SPEED_SCORE_DISPLAY_TOP_ALIGN = 88;

// General-use button constants
const SPEED_BUTTON_WIDTH = 90;
const SPEED_BUTTON_HEIGHT = 34;
const END_COLOR = "#d9534f";
const END_OUTLINE = "#a83a36";
const END_TEXT_COLOR = "white";
const END_FONT_SIZE = 18;

// End button location constants
const END_TL_CORNER_DIST_X = 12;
const END_TL_CORNER_DIST_Y = 10;

// Keypad location constants
const PAD_LEFT = 190;
const PAD_TOP = 400;
const PAD_KEY = 54;
const PAD_SPACING = 2;
const ACTION_WIDTH = 230;
const ACTION_HEIGHT = 46;

// Visual element constants
const BACKDROP_HEIGHT = 1000;
const BACKDROP_COLOR = "#edc0e8";

const KEY_BACKDROP_SEPERATION = 30;
const KEY_BACKDROP_HEIGHT = 200;
const KEY_BACKDROP_RADIUS = 20;
const KEY_BACKDROP_STROKE_WIDTH = 15;

const SHOP_IMAGE_SIZE = 400;
const SHOP_IMAGE_KEY_SEPERATION = 30;

// Fixed horizontal centers for Speed's food visuals (stage coordinates).
const FOOD_FIRST_X = 76;
const FOOD_SECOND_X = 210;
const FOOD_CENTER_Y = 205;

/**
 * Ensures that the appropriate handler functions are passed into SpeedModeScreenView's convstructor
 */
export interface SpeedModeScreenHandlers {
    onEndGameClick: () => void;
    onKeyClick: () => void;
    onCheckClick: () => void;
    onBackspaceClick: () => void;
}

/**
 * Manages the user interface while playing the Speed Challenge minigame.
 */
export class SpeedModeScreenView implements View {
    private group = Konva.group;
    private readonly foodVisual = new FractionFoodVisual();

    /**
     * Creates the screen as it is when starting the Speech Challenge minigame.
     */
    constructor(handlers: SpeedModeScreenHandlers)
    {
        this.group = new Konva.Group({visible: true});
        const screenBackdrop = new Konva.Rect({
            name: "backdrop",
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: BACKDROP_HEIGHT,
            fill: BACKDROP_COLOR,
        });
        this.group.add(screenBackdrop);

        const answerKeysBackdrop = new Konva.Rect({
            name: "keyBackdrop",
            X: PAD_LEFT - KEY_BACKDROP_SEPERATION,
            y: PAD_TOP - KEY_BACKDROP_SEPERATION,
            width: STAGE_WIDTH,
            height: KEY_BACKDROP_HEIGHT,
            cornerRadius: KEY_BACKDROP_RADIUS,
            fill: "lightgray",
            stroke: "gray",
            strokeWidth: KEY_BACKDROP_STROKE_WIDTH,
        });
        this.group.add(answerKeysBackdrop);

        // Keep artwork behind the food visuals and gameplay UI.
        const artwork = new Konva.Group({ listening: false });
        this.group.add(artwork);
        this.group.add(this.foodVisual.getGroup());

        this.lineImage = null;
        Konva.Image.fromURL("/cookie_line.png", (image) => {
            image.width(SHOP_IMAGE_SIZE);
            image.height(SHOP_IMAGE_SIZE / 2);
            image.x(STAGE_WIDTH / 2);
            image.y(PAD_TOP - (SHOP_IMAGE_SIZE / 2) - SHOP_IMAGE_KEY_SEPERATION);
            image.listening(false);
            image.id('lineImage');
            artwork.add(image);
            this.group.getLayer()?.batchDraw();
            this.lineImage = image;
        });

        const secondsText = new Konva.Text({
			x: STAGE_WIDTH - LABEL_RIGHT_ALIGN,
			y: TIME_LABEL_TOP_ALIGN,
			width: SPEED_TEXT_UI_WIDTH,
			text: "Seconds Left",
			fontSize: LABEL_FONTSIZE,
			fontFamily: SPEED_FONT,
			fill: LABEL_COLOR,
			align: "left",
            name: "secondsLabel"
		});

        this.remainingTimeDisplay = new Konva.Text({
            x: STAGE_WIDTH - TIME_RIGHT_ALIGN,
            y: TIME_DISPLAY_TOP_ALIGN,
            width: SPEED_TEXT_UI_WIDTH,
            text: `${SPEED_MODE_TIME_LIMIT}`,
            fontSize: NUMBER_FONTSIZE,
            fontFamily: SPEED_FONT,
            fill: TIME_COLOR,
            align: "center",
            name: "remainingTime"
        });

        const scoreText = new Konva.Text({
            x: STAGE_WIDTH - LABEL_RIGHT_ALIGN,
			y: SPEED_SCORE_LABEL_TOP_ALIGN,
			width: SPEED_TEXT_UI_WIDTH,
			text: "Score:",
			fontSize: LABEL_FONTSIZE,
			fontFamily: SPEED_FONT,
			fill: LABEL_COLOR,
			align: "left",
            name: "scoreLabel"
        });

        this.scoreDisplay = new Konva.Text({
            x: STAGE_WIDTH - SPEED_SCORE_DISPLAY_RIGHT_ALIGN,
            y: SPEED_SCORE_DISPLAY_TOP_ALIGN,
            width: SPEED_TEXT_UI_WIDTH,
            text: `0`,
            fontSize: NUMBER_FONTSIZE,
            fontFamily: SPEED_FONT,
            fill: SPEED_SCORE_COLOR,
            align: "left",
            name: "scoreDisplay"
        });

        const endButton = new Button({
            x: END_TL_CORNER_DIST_X,
            y: END_TL_CORNER_DIST_Y,
            width: SPEED_BUTTON_WIDTH,
            height: SPEED_BUTTON_HEIGHT,
            text: "Exit",
            onClick: handlers.onEndGameClick, 
            name: "endGameButton",
            fontSize: END_FONT_SIZE,
            fill: END_COLOR,
            stroke: END_OUTLINE,
            textColor: END_TEXT_COLOR,
        });

        this.answerKeys = KeypadBuilder.buildAnswerKeys({
            keySize: PAD_KEY,
            keySpacing: PAD_SPACING,
            distFromLeft: PAD_LEFT,
            distFromTop: PAD_TOP,
            actionWidth: ACTION_WIDTH,
            actionHeight: ACTION_HEIGHT,
            onKeyClick: (digit: String) => handlers.onKeyClick(digit),
            onBackspaceClick: () => handlers.onBackspaceClick(),
            onCheckClick: () => handlers.onCheckClick(),
            keyColor: "#b44c10",
            keyBoarderColor: "#823001"
        });

        this.group.add(this.answerKeys);

        this.group.add(endButton.getGroup());
        this.group.add(secondsText);
        this.group.add(this.remainingTimeDisplay);
        this.group.add(scoreText);
        this.group.add(this.scoreDisplay);
    }

    /** Displays the existing problem fractions at fixed horizontal positions. */
    showFoodTiles(tiles: readonly FoodTile[], operator?: string): void {
        this.foodVisual.renderFixedPair(
            "cookie", tiles, [FOOD_FIRST_X, FOOD_SECOND_X], FOOD_CENTER_Y, operator,
        );
    }

    /**
     * Changes the number of seconds shown to be remaining on the timer that the user sees.
     * @param timeRemaining a number representing the number of seconds before the game ends
     */
    updateTimer(timeRemaining: number): void {
		this.remainingTimeDisplay.text(`${timeRemaining}`);
		this.group.getLayer()?.draw();
	}

    /**
     * Changes the displayed number of points that the user has on the screen.
     * @param score a number representing the number of problems the user has correctly answered
     */
    updateScore(score: number): void {
		this.scoreDisplay.text(`${score}`);
		this.group.getLayer()?.draw();
	}

    /**
     * Shows the contents of the Speed Mode screen.
     */
    show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

    /**
     * Hides the contents of the Speed Mode screen.
     */
    hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

    /**
     * Returns the group of objects that make up the Speed Mode screen.
     * @return the Konva group of all screen elements in SpeedModeScreenView
     */
	getGroup(): Konva.Group {
		return this.group;
	}
}   