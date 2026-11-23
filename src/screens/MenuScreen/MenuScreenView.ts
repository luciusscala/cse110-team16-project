import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import backgroundUrl from "../../assets/menu-background.svg";

const BUTTON_WIDTH = 300;
const BUTTON_HEIGHT = 60;
const BUTTON_START_Y = 235;
const BUTTON_SPACING = 80;

// Pizza shop palette, shared with the background art
const TOMATO_RED = "#d9412b";
const CHEESE_YELLOW = "#ffd45c";
const OUTLINE_BROWN = "#4a2511";
const TITLE_FONT = '"Arial Black", Arial, sans-serif';

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

		// Background art goes first so it's drawn behind everything else
		this.group.add(this.createBackground());

		// Title text, spanning the stage width so align centers it
		const title = new Konva.Text({
			x: 0,
			y: 115,
			width: STAGE_WIDTH,
			text: "FRIZZA",
			fontSize: 72,
			fontFamily: TITLE_FONT,
			fontStyle: "bold",
			fill: CHEESE_YELLOW,
			stroke: OUTLINE_BROWN,
			strokeWidth: 8,
			fillAfterStrokeEnabled: true,
			align: "center",
			name: "title",
			listening: false,
		});
		this.group.add(title);

		const subtitle = new Konva.Text({
			x: 0,
			y: 195,
			width: STAGE_WIDTH,
			text: "Fraction Pizzeria",
			fontSize: 22,
			fontFamily: TITLE_FONT,
			fill: TOMATO_RED,
			align: "center",
			name: "subtitle",
			listening: false,
		});
		this.group.add(subtitle);

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
					fill: TOMATO_RED,
					stroke: OUTLINE_BROWN,
				}),
		);
		this.buttons.forEach((button) => this.group.add(button.getGroup()));
	}

	/**
	 * Full-stage background image. The SVG loads asynchronously, so the node
	 * starts empty and the layer is redrawn once the image is ready.
	 */
	private createBackground(): Konva.Image {
		const background = new Konva.Image({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			image: undefined,
			name: "background",
			listening: false, // never intercept clicks meant for the buttons
		});

		const img = new window.Image();
		img.onload = () => {
			background.image(img);
			this.group.getLayer()?.batchDraw();
		};
		img.src = backgroundUrl;

		return background;
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
