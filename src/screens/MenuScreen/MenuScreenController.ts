import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { MenuScreenView } from "./MenuScreenView.ts";

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;

	// TODO: Store as this.screenSwitcher once there is another screen to switch to
	constructor(_screenSwitcher: ScreenSwitcher) {
		super();
		this.view = new MenuScreenView(() => this.handleStartClick());
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
	 * Get the view
	 */
	getView(): MenuScreenView {
		return this.view;
	}
}
