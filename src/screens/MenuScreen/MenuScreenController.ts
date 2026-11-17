import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { MenuScreenView } from "./MenuScreenView.ts";

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;
	private screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;

		this.view = new MenuScreenView({
			onLevelsClick: () => this.handleLevelsClick(),
			onMasteryClick: () => this.handleMasteryClick(),
			onSpeedClick: () => this.handleSpeedClick(),
		});
	}

	/**
	 * Handle levels button click
	 */
	private handleLevelsClick(): void {
		this.screenSwitcher.switchToScreen({ type: "levels" });
	}

	/**
	 * Handle mastery button click
	 */
	private handleMasteryClick(): void {
		this.screenSwitcher.switchToScreen({ type: "mastery" });
	}

	/**
	 * Handle speed minigame button click
	 */
	private handleSpeedClick(): void {
		this.screenSwitcher.switchToScreen({ type: "speed" });
	}

	/**
	 * Get the view
	 */
	getView(): MenuScreenView {
		return this.view;
	}
}
