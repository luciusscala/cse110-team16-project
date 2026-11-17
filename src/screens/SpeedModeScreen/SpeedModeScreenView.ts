import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import { KeypadBuilder } from "../../components/Keypad.ts";
import { SPEED_MODE_TIME_LIMIT } from "../../constants.ts";

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
const SPEED_BUTTON_WIDTH = 100;
const SPEED_BUTTON_HEIGHT = 40;
const END_COLOR = "red";
const END_OUTLINE = "darkred";
const END_TEXT_COLOR = "white";

// End button location constants
const END_TL_CORNER_DIST = 5;

// Keypad location constants
//const SPEED_CHECK_RIGHT_ALIGN = 170;
//const SPEED_CHECK_TOP_ALIGN = 400;
const PAD_LEFT = 190;
const PAD_TOP = 400;
const PAD_KEY = 54;
const PAD_SPACING = 2;
const ACTION_WIDTH = 230;
const ACTION_HEIGHT = 46;

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

    /**
     * Creates the screen as it is when starting the Speech Challenge minigame.
     */
    constructor(handlers: SpeedModeScreenHandlers)
    {
        this.group = new Konva.Group({visible: true});

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
            x: END_TL_CORNER_DIST,
            y: END_TL_CORNER_DIST,
            width: SPEED_BUTTON_WIDTH,
            height: SPEED_BUTTON_HEIGHT,
            text: "End",
            onClick: handlers.onEndGameClick, 
            name: "endGameButton",
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
        //this.group.add(checkButton.getGroup());
        this.group.add(secondsText);
        this.group.add(this.remainingTimeDisplay);
        this.group.add(scoreText);
        this.group.add(this.scoreDisplay);
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