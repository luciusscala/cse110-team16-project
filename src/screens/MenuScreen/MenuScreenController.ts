import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { MenuScreenView } from "./MenuScreenView.ts";
import { ProgressManager } from "../../persistence/ProgressManager.ts";
import { NUM_LVLS } from "../../constants.ts";

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;
	private screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;

		// Note: Can remove handleCompleteLvl1Click from MenuScreenController once demo is done
		this.view = new MenuScreenView(() => this.handleStartClick(), () => this.handleCompleteLvl1Click(), () => this.handleDeleteProgressClick(), ProgressManager.getUserProgress());
	}

	/**
	 * Handle start button click: opens the first level the player has not
	 * completed yet (or the last level once they have finished them all).
	 */
	private handleStartClick(): void {
		const nextLevel = Math.min(ProgressManager.getUserProgress() + 1, NUM_LVLS);
		this.screenSwitcher.switchToScreen({ type: "guided", levelId: nextLevel });
	}

	/**
	 * Temporarily used on Main Menu to test persistence. 
	 * Updates the user's progress in storage to have completed level 1.
	 */
	private handleCompleteLvl1Click(): void {
		ProgressManager.updateProgress(1);
		console.log("Complete lvl 1 clicked");
		this.view.updateProgressText(ProgressManager.getUserProgress());
	}

	/**
	 * Temporarily used on Main Menu to reset progress after persistence testing.
	 * Updates the user's progress in local storage to be 0.
	 * Should we keep this button to delete progress in the long-term?
	 */
	private handleDeleteProgressClick(): void {
		ProgressManager.updateProgress(0);
		console.log("Delete progress clicked");
		this.view.updateProgressText(ProgressManager.getUserProgress());
	}

	/**
	 * Get the view
	 */
	getView(): MenuScreenView {
		return this.view;
	}
}
