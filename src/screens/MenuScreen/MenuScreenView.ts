import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH } from "../../constants.ts";
import { Button } from "../../components/Button.ts";

const BUTTON_WIDTH = 300;
const BUTTON_HEIGHT = 60;
const BUTTON_START_Y = 260;
const BUTTON_SPACING = 90;

export interface MenuScreenHandlers {
	onLevelsClick: () => void;
	onMasteryClick: () => void;
	onSpeedClick: () => void;
}

/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
	private group: Konva.Group;
	private buttons: Button[];

	constructor(handlers: MenuScreenHandlers) {
		this.group = new Konva.Group({ visible: true });

		// Title text, spanning the stage width so align centers it
		const title = new Konva.Text({
			x: 0,
			y: 150,
			width: STAGE_WIDTH,
			text: "TEAM 16 GAME",
			fontSize: 48,
			fontFamily: "Arial",
			fill: "black",
			align: "center",
			name: "title",
		});
		this.group.add(title);

		const buttonX = STAGE_WIDTH / 2 - BUTTON_WIDTH / 2;
		const buttonSpecs = [
			{ name: "levelsButton", text: "LEVELS", onClick: handlers.onLevelsClick },
			{ name: "masteryButton", text: "MASTERY MINIGAME", onClick: handlers.onMasteryClick },
			{ name: "speedButton", text: "SPEED MINIGAME", onClick: handlers.onSpeedClick },
		];

		this.buttons = buttonSpecs.map(
			(spec, i) =>
				new Button({
					...spec,
					x: buttonX,
					y: BUTTON_START_Y + i * BUTTON_SPACING,
					width: BUTTON_WIDTH,
					height: BUTTON_HEIGHT,
				}),
		);
		this.buttons.forEach((button) => this.group.add(button.getGroup()));
	}

	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	getButtons(): Button[] {
		return this.buttons;
	}
}
