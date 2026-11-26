import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { SpeedModeScreenView } from "./SpeedModeScreenView.ts"
import { SpeedModeScreenModel } from "./SpeedModeScreenModel.ts"
import { SPEED_MODE_TIME_LIMIT, SPEED_COUNTDOWN_SECONDS } from "../../constants.ts";
import { LOWEST_TERMS_RULE, CORRECT_MESSAGE } from "../MasteryScreen/MasteryScreenController.ts";
import { masteryAnswer } from "../MasteryScreen/masteryProblems.ts";
import { AnswerEntryModel } from "../../guided/AnswerEntryModel.ts";
import { parseStepAnswer } from "../../guided/answerParsing.ts";
import { formatEquation } from "../../guided/stepPrompts.ts";
import { getFoodTiles, getFoodOperator } from "../../visuals/FoodVisualState.ts";

/**
 * Controls the functionality of the Speed Challenge Minigame by manipulating the view and model.
 */
export class SpeedModeScreenController extends ScreenController {
    private view: SpeedModeScreenView;
    private model: SpeedModeScreenModel;
    /** The answer is one fraction, typed in two boxes: top, then bottom. */
    private entry = new AnswerEntryModel(2);
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
            onFieldSelected: (index) => this.handleFieldSelected(index),
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
            this.showCurrentProblem();
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

    /** Input only counts once the countdown is over and until the game ends. */
    private isPlaying(): boolean {
        return !this.gameEnded && !this.isCountingDown();
    }

    private showCurrentProblem(): void {
        const problem = this.model.getCurrentProblem();
        this.entry.clear();
        this.view.showProblem(formatEquation(problem));
        this.view.showFoodTiles(getFoodTiles(problem, "original"), getFoodOperator(problem.operation));
        this.refreshFields();
    }

    private refreshFields(): void {
        this.view.updateFields(this.entry.getFields(), this.entry.getActiveIndex());
    }

    private handleKeyClick(digit: string): void {
        if (!this.isPlaying()) return;
        this.entry.typeDigit(digit);
        this.refreshFields();
    }

    private handleBackspaceClick(): void {
        if (!this.isPlaying()) return;
        this.entry.backspace();
        this.refreshFields();
    }

    private handleFieldSelected(index: number): void {
        if (!this.isPlaying()) return;
        this.entry.selectField(index);
        this.refreshFields();
    }

    /**
     * Checks the typed answer. A correct answer scores a point; a wrong one shows the right
     * answer. Either way the next problem follows.
     */
    private handleCheckClick(): void {
        if (!this.isPlaying()) return;

        const parsed = parseStepAnswer("simplify", this.entry.getFields());
        if (!parsed.ok) {
            this.view.showMessage(parsed.message);
            return;
        }
        if (parsed.answer.step !== "simplify") return;

        const expected = masteryAnswer(this.model.getCurrentProblem());
        const correct = this.model.submit(parsed.answer.result);
        this.view.updateScore(this.model.getScore());
        this.showCurrentProblem();
        this.view.showMessage(correct ? CORRECT_MESSAGE : `Answer: ${expected}`);
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