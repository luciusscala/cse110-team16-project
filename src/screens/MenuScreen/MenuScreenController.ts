import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { MenuScreenView } from "./MenuScreenView.ts";
import { ProgressManager } from "../../persistence/ProgressManager.ts";

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;

	// TODO: Store as this.screenSwitcher once there is another screen to switch to
	constructor(_screenSwitcher: ScreenSwitcher) {
		super();

		// Note: Can remove handleCompleteLvl1Click from MenuScreenController once demo is done
		this.view = new MenuScreenView(() => this.handleStartClick(), () => this.handleCompleteLvl1Click(), () => this.handleDeleteProgressClick(), ProgressManager.getUserProgress());
	}

	/**
	 * Handle start button click
	 */
	private handleStartClick(): void {
		// TODO: Switch to the game screen once it exists:
		// this.screenSwitcher.switchToScreen({ type: "game" });
		console.log("Start clicked");
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
