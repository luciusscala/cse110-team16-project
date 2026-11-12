import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { SpeedModeScreenView } from "./SpeedModeScreenView.ts"
import { SpeedModeScreenModel } from "./SpeedModeScreenModel.ts"
import { SPEED_MODE_TIME_LIMIT } from "../../constants.ts";

/**
 * Controls the functionality of the Speed Challenge Minigame by manipulating the view and model.
 */
export class SpeedModeScreenController extends ScreenController {
    private view: SpeedModeScreenView;
    private model: SpeedModeScreenModel;
    private screenSwitcher: ScreenSwitcher;

    /**
     * Creates the controller by constructing a view and model for the Speed Mode Screen.
     */
    constructor(screenSwitcher: ScreenController)
    {
        super();
        this.screenSwitcher = screenSwitcher;

        this.view = new SpeedModeScreenView({
            onEndGameClick: () => this.handleEndGame(),
            onCheckClick: () => this.handleCheckClick()
        });
        this.model = new SpeedModeScreenModel();
    }

    /**
     * Sets the data of the Speed Mode classes for the start of a new game, and begins a new one by
     * starting the timer.
     */
    startSpeedGame(): void {
        
        // Reset score stored in model, and the displayed score/time values
        this.model.reset();
        this.view.updateScore(this.model.getScore());
		this.view.updateTimer(SPEED_MODE_TIME_LIMIT);

        // Begin the game itself
		this.startTimer();
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
     * Clears the current timer for the Speed Mode game, if one exists.
     */
    endTimer(): void {
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
        this.endTimer();
        this.screenSwitcher.switchToScreen({ type: "menu" });
    }

    /**
     * Decides whether or not to increase score.
     * Because no check has been implemented yet, it always does.
     */
    private handleCheckClick(): void {
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