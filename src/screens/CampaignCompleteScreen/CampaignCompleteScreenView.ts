import Konva from "konva";
import { Button } from "../../components/Button.ts";
import { NUM_LVLS, STAGE_HEIGHT, STAGE_WIDTH } from "../../constants.ts";
import type { View } from "../../types.ts";
import {
	BODY_FONT,
	DOUGH_CREAM,
	OUTLINE_BROWN,
	TITLE_FONT,
	TOMATO_RED,
} from "../MenuScreen/menuTheme.ts";

export interface CampaignCompleteHandlers {
	onLevelSelect(): void;
	onMenu(): void;
}

const TITLE_Y = 40;
const TITLE_SIZE = 52;
const MESSAGE_Y = 112;
const MESSAGE_SIZE = 24;

// The baker art is 1280x551, so keep that shape when scaling it down.
const BAKER_WIDTH = 520;
const BAKER_HEIGHT = BAKER_WIDTH * (551 / 1280);
const BAKER_Y = 180;

const BUTTON_WIDTH = 210;
const BUTTON_HEIGHT = 55;
const BUTTON_GAP = 50;
const BUTTON_Y = STAGE_HEIGHT - 110;

/**
 * CampaignCompleteScreenView - Congratulates the player for finishing the
 * last campaign level, with buttons back to level select or the menu.
 */
export class CampaignCompleteScreenView implements View {
	private readonly group = new Konva.Group({ visible: false });

	constructor(handlers: CampaignCompleteHandlers) {
		this.group.add(
			new Konva.Rect({
				x: 0,
				y: 0,
				width: STAGE_WIDTH,
				height: STAGE_HEIGHT,
				fill: DOUGH_CREAM,
				listening: false,
			}),
		);

		this.group.add(
			this.centeredText("Congratulations!", TITLE_Y, TITLE_SIZE, TITLE_FONT, TOMATO_RED),
			this.centeredText(
				`You finished all ${NUM_LVLS} levels!\nYou're a fraction master.`,
				MESSAGE_Y,
				MESSAGE_SIZE,
				BODY_FONT,
				OUTLINE_BROWN,
			),
		);

		// Keep the artwork behind the buttons while it loads.
		const artwork = new Konva.Group({ listening: false });
		this.group.add(artwork);
		Konva.Image.fromURL("/baker_happy.png", (image) => {
			image.x((STAGE_WIDTH - BAKER_WIDTH) / 2);
			image.y(BAKER_Y);
			image.width(BAKER_WIDTH);
			image.height(BAKER_HEIGHT);
			image.name("baker-image");
			artwork.add(image);
			this.redraw();
		});

		const left = (STAGE_WIDTH - BUTTON_WIDTH * 2 - BUTTON_GAP) / 2;
		this.group.add(
			new Button({
				x: left,
				y: BUTTON_Y,
				width: BUTTON_WIDTH,
				height: BUTTON_HEIGHT,
				text: "Level Select",
				name: "levelSelectButton",
				onClick: () => handlers.onLevelSelect(),
			}).getGroup(),
			new Button({
				x: left + BUTTON_WIDTH + BUTTON_GAP,
				y: BUTTON_Y,
				width: BUTTON_WIDTH,
				height: BUTTON_HEIGHT,
				text: "Main Menu",
				name: "menuButton",
				onClick: () => handlers.onMenu(),
			}).getGroup(),
		);
	}

	show(): void {
		this.group.visible(true);
		this.redraw();
	}

	hide(): void {
		this.group.visible(false);
		this.redraw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	private centeredText(
		text: string,
		y: number,
		fontSize: number,
		fontFamily: string,
		fill: string,
	): Konva.Text {
		return new Konva.Text({
			x: 0,
			y,
			width: STAGE_WIDTH,
			text,
			fontSize,
			fontFamily,
			fill,
			align: "center",
			lineHeight: 1.3,
			listening: false,
		});
	}

	private redraw(): void {
		this.group.getLayer()?.batchDraw();
	}
}
