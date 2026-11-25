import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import backgroundUrl from "../../assets/menu-background.svg";
import { OvenFire } from "./OvenFire.ts";
import { HowToPlayPopup } from "./HowToPlayPopup.ts";
import { TOMATO_RED, CHEESE_YELLOW, OUTLINE_BROWN, TITLE_FONT } from "./menuTheme.ts";

const BUTTON_WIDTH = 300;
const BUTTON_HEIGHT = 60;
const BUTTON_START_Y = 235;
const BUTTON_SPACING = 80;

// Help icon in the top-right corner
const HELP_ICON_RADIUS = 24;
const HELP_ICON_MARGIN = 20;
const HELP_ICON_HOVER_SCALE = 1.1;

export interface MenuScreenHandlers {
	onLevelsClick: () => void;
	onMasteryClick: () => void;
	onSpeedClick: () => void;
}

export class MenuScreenView implements View {
	private group: Konva.Group;
	private buttons: Button[];
	private ovenFire: OvenFire;
	private helpIcon: Konva.Group;
	private howToPlay: HowToPlayPopup;

	constructor(handlers: MenuScreenHandlers) {
		this.group = new Konva.Group({ visible: true });

	
		this.group.add(this.createBackground());

		
		this.ovenFire = new OvenFire();
		this.group.add(this.ovenFire.getGroup());

		
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

		// Help icon and its popup. The popup goes last so it draws over everything.
		this.helpIcon = this.createHelpIcon();
		this.group.add(this.helpIcon);
		this.howToPlay = new HowToPlayPopup();
		this.group.add(this.howToPlay.getGroup());
	}

	
	private createHelpIcon(): Konva.Group {
		const icon = new Konva.Group({
			x: STAGE_WIDTH - HELP_ICON_MARGIN - HELP_ICON_RADIUS,
			y: HELP_ICON_MARGIN + HELP_ICON_RADIUS,
			name: "helpButton",
		});
		icon.add(
			new Konva.Circle({
				radius: HELP_ICON_RADIUS,
				fill: CHEESE_YELLOW,
				stroke: OUTLINE_BROWN,
				strokeWidth: 4,
				shadowColor: "black",
				shadowOpacity: 0.35,
				shadowBlur: 6,
				shadowOffsetY: 2,
			}),
			new Konva.Text({
				x: -HELP_ICON_RADIUS,
				y: -HELP_ICON_RADIUS,
				width: HELP_ICON_RADIUS * 2,
				height: HELP_ICON_RADIUS * 2,
				text: "?",
				fontSize: 30,
				fontFamily: TITLE_FONT,
				fill: OUTLINE_BROWN,
				align: "center",
				verticalAlign: "middle",
				listening: false,
			}),
		);

		icon.on("click tap", () => this.howToPlay.open());
		icon.on("mouseenter", () => {
			icon.scale({ x: HELP_ICON_HOVER_SCALE, y: HELP_ICON_HOVER_SCALE });
			this.setCursor("pointer");
			icon.getLayer()?.batchDraw();
		});
		icon.on("mouseleave", () => {
			icon.scale({ x: 1, y: 1 });
			this.setCursor("default");
			icon.getLayer()?.batchDraw();
		});
		return icon;
	}

	private setCursor(cursor: string): void {
		const container = this.group.getStage()?.container();
		if (container) {
			container.style.cursor = cursor;
		}
	}


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

	
	show(): void {
		this.group.visible(true);
		this.ovenFire.start();
		this.group.getLayer()?.draw();
	}

	
	hide(): void {
		
		this.howToPlay.close();
		this.group.visible(false);
		this.ovenFire.stop();
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	getOvenFire(): OvenFire {
		return this.ovenFire;
	}

	getButtons(): Button[] {
		return this.buttons;
	}

	getHelpIcon(): Konva.Group {
		return this.helpIcon;
	}

	getHowToPlayPopup(): HowToPlayPopup {
		return this.howToPlay;
	}
}
