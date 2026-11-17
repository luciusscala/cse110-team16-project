import type { Group } from "konva/lib/Group";

export interface View {
	getGroup(): Group;
	show(): void;
	hide(): void;
}

/**
 * Screen types for navigation
 *
 * - "menu": Main menu screen
 * - "levels": Campaign level select
 * - "mastery": Mastery mode
 * - "speed": Speed minigame
 * - "guided": Step-by-step walkthrough of a guided campaign level
 */
export type Screen =
	| { type: "menu" }
	| { type: "levels" }
	| { type: "mastery" }
	| { type: "speed" }
	| { type: "guided"; levelId: number };

export abstract class ScreenController {
	abstract getView(): View;

	show(): void {
		this.getView().show();
	}

	hide(): void {
		this.getView().hide();
	}
}

export interface ScreenSwitcher {
	switchToScreen(screen: Screen): void;
}
