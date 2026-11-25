import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { SpeedModeScreenView } from "./SpeedModeScreenView.ts"
import { SpeedModeScreenModel } from "./SpeedModeScreenModel.ts"
import { SPEED_MODE_TIME_LIMIT, SPEED_COUNTDOWN_SECONDS } from "../../constants.ts";
import { LOWEST_TERMS_RULE } from "../MasteryScreen/MasteryScreenController.ts";

/**
 * Controls the functionality of the Speed Challenge Minigame by manipulating the view and model.
 */
export class SpeedModeScreenController extends ScreenController {
    private view: SpeedModeScreenView;
    private model: SpeedModeScreenModel;
    private screenSwitcher: ScreenSwitcher;

    private gameEnded = false;
    private minigameTimer: ReturnType<typeof setInterval> | null = null;
    private countdownTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Creates the controller by constructing a view and model for the Speed Mode Screen.
     */
    constructor(screenSwitcher: ScreenController)
    {
        super();
        this.screenSwitcher = screenSwitcher;

        this.view = new SpeedModeScreenView({
            onEndGameClick: () => this.handleEndGame(),
            onKeyClick: (digit) => this.handleKeyClick(digit),
            onCheckClick: () => this.handleCheckClick(),
            onBackspaceClick: () => this.handleBackspaceClick(),
        });
        this.model = new SpeedModeScreenModel();
    }

    /**
     * Sets the data of the Speed Mode classes for the start of a new game, and begins a new one by
     * starting the timer.
     */
    startSpeedGame(): void {
        this.endTimer();
        this.gameEnded = false;

        // Reset score stored in model, and the displayed score/time values
        this.model.reset();
        this.view.updateScore(this.model.getScore());
		this.view.updateTimer(SPEED_MODE_TIME_LIMIT);

        // Count down (3, 2, 1) with the lowest-terms reminder, then begin the game itself
        this.runCountdown(SPEED_COUNTDOWN_SECONDS);
    }

    /**
     * Shows the pre-game countdown one second at a time, then hides it and starts the timer.
     * @param secondsLeft the number to show now
     */
    private runCountdown(secondsLeft: number): void {
        if (secondsLeft <= 0) {
            this.countdownTimer = null;
            this.view.hideCountdown();
            this.startTimer();
            return;
        }
        this.view.showCountdown(secondsLeft, LOWEST_TERMS_RULE);
        this.countdownTimer = setTimeout(() => this.runCountdown(secondsLeft - 1), 1000);
    }

    /**
     * Returns true while the pre-game countdown is still running.
     */
    isCountingDown(): boolean {
        return this.countdownTimer !== null;
    }

    /**
     * Stops any running countdown or game timer when the screen is left.
     */
    override hide(): void {
        this.endTimer();
        super.hide();
    }

    /**
     * Starts the counting-down of the speed-mode timer, ensures its value is updated in the view,
     * and calls the handleEndGame function when it is finished.
     */
    startTimer(): void {
        let timeRemaining = SPEED_MODE_TIME_LIMIT;
        this.minigameTimer = setInterval(() => {

            // Update shown time every second
			timeRemaining--;
			this.view.updateTimer(timeRemaining);

            // Timer ending (clear the timer and end the game)
			if (timeRemaining <= 0) {
				this.handleEndGame();
			}
		}, 1000);
    }

    /**
     * Clears the current countdown and timer for the Speed Mode game, if they exist.
     */
    endTimer(): void {
        if (this.countdownTimer !== null) {
            clearTimeout(this.countdownTimer);
            this.countdownTimer = null;
        }
        if (this.minigameTimer !== null) {
			clearInterval(this.minigameTimer);
			this.minigameTimer = null;
		}
    }

    /**
     * Ends the current game session by deleting the timer and sending the user back to the menu.
     * NOTE: This currrently returns the player to the menu screen, but should take them to the
     * game over screen and display the appropriate information once it is implemented
     */
    private handleEndGame(): void {
        if(this.gameEnded) return;

        this.gameEnded = true;
        this.endTimer();
        
        this.screenSwitcher.switchToScreen({ 
            type: "gameOver",
            gameId: "speedMode",
            score: this.model.getScore(), 
        });
    }

    private handleKeyClick(digit: String): void {
        console.log(`Clicked digit ${digit}`);
    }

    private handleBackspaceClick(): void {
        console.log(`Clicked backspace`);
    }

    /**
     * Decides whether or not to increase score.
     * Because no check has been implemented yet, it always does.
     */
    private handleCheckClick(): void {
        if (this.isCountingDown()) return;
        // Needs proper checking functionality added; currently exists to test score increase
        this.model.incrementScore();
        this.view.updateScore(this.model.getScore());
    }

    /**
     * Returns the SpeedModeScreenView associated with this controller.
     */
    getView(): SpeedModeScreenView {
		return this.view;
	}

    /**
     * Returns the SpeedModeScreenModel associated with this controller.
     */
    getModel(): SpeedModeScreenModel {
        return this.model;
    } 
}