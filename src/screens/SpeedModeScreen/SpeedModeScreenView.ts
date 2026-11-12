import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import { SPEED_MODE_TIME_LIMIT } from "../../constants.ts";

/**
 * Ensures that the appropriate handler functions are passed into SpeedModeScreenView's convstructor
 */
export interface SpeedModeScreenHandlers {
    onEndGameClick: () => void;
    onCheckClick: () => void;
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
			x: STAGE_WIDTH - 200,
			y: 50,
			width: 200,
			text: "Seconds Left",
			fontSize: 28,
			fontFamily: "Arial",
			fill: "black",
			align: "left",
            name: "secondsLabel"
		});

        this.remainingTimeDisplay = new Konva.Text({
            x: STAGE_WIDTH - 210,
            y: 10,
            width: 200,
            text: `${SPEED_MODE_TIME_LIMIT}`,
            fontSize: 32,
            fontFamily: "Arial",
            fill: "red",
            align: "center",
            name: "remainingTime"
        });

        const scoreText = new Konva.Text({
            x: STAGE_WIDTH - 200,
			y: 90,
			width: 200,
			text: "Score:",
			fontSize: 28,
			fontFamily: "Arial",
			fill: "black",
			align: "left",
            name: "scoreLabel"
        });

        this.scoreDisplay = new Konva.Text({
            x: STAGE_WIDTH - 100,
            y: 88,
            width: 200,
            text: `0`,
            fontSize: 32,
            fontFamily: "Arial",
            fill: "green",
            align: "left",
            name: "scoreDisplay"
        });

        const endButton = new Button({
            x: 5,
            y: 5,
            width: 100,
            height: 40,
            text: "End",
            onClick: handlers.onEndGameClick, 
            name: "endGameButton",
            fill: "red",
            stroke: "darkred",
            textColor: "white",
        });

        const checkButton = new Button({
            x: STAGE_WIDTH - 170,
            y: 400,
            width: 100,
            height: 40,
            text: "Check",
            onClick: handlers.onCheckClick, 
            name: "checkButton"
        });

        this.group.add(endButton.getGroup());
        this.group.add(checkButton.getGroup());
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