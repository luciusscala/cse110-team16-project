import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT, MASTERY_COUNTDOWN_SECONDS, SPEED_COUNTDOWN_SECONDS, SPEED_MODE_TIME_LIMIT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import {
	TOMATO_RED,
	CHEESE_YELLOW,
	OUTLINE_BROWN,
	DOUGH_CREAM,
	TITLE_FONT,
	BODY_FONT,
} from "./menuTheme.ts";

export interface InstructionTopic {
	readonly heading: string;
	readonly body: string;
}

export interface InstructionSection {
	readonly mode: string;
	readonly topics: readonly InstructionTopic[];
}

export const HOW_TO_PLAY_SECTIONS: readonly InstructionSection[] = [
	{
		mode: "Levels",
		topics: [
			{
				heading: "Choosing a level",
				body:
					"Press LEVELS and pick a tile. Gold tiles say Play! and are your next level. " +
					"Green tiles say Done! and can be replayed. Gray tiles are Locked until you " +
					"finish the levels before them.",
			},
			{
				heading: "How to answer",
				body:
					"Each question is solved one step at a time, such as Find the LCD, Match the slices, " +
					"Combine, and Simplify. Read the tip for the current step, tap a box, type with the " +
					"number pad, and press Check. A wrong answer just asks you to try again.",
			},
			{
				heading: "Finishing a level",
				body:
					"After the last step, press Next question to move on. Finish every question and press " +
					"Finish level to complete it and unlock the next level. Press Back at any time to " +
					"return to the menu.",
			},
		],
	},
	{
		mode: "Mastery Mode",
		topics: [
			{
				heading: "How to answer",
				body:
					`After a ${MASTERY_COUNTDOWN_SECONDS}-second countdown, you get one fraction problem at a time. ` +
					"Tap the top box and type the numerator, then tap the bottom box and type the denominator " +
					"using the number pad. Press Delete to fix a mistake, then press Check to submit.\n" +
					"Answers must be in lowest terms: write 1/2, not 2/4.",
			},
			{
				heading: "Scoring",
				body:
					"Each correct answer adds 1 to your Correct count. " +
					"The problems get harder the more you get right.",
			},
			{
				heading: "How the game ends",
				body:
					"One wrong answer ends the game, including a correct value that is not in lowest terms. " +
					"You can also press Exit at any time. The game over screen shows your score and, " +
					"if you missed a problem, the correct answer.",
			},
		],
	},
	{
		mode: "Speed Mode",
		topics: [
			{
				heading: "How to answer",
				body:
					`After a ${SPEED_COUNTDOWN_SECONDS}-second countdown, solve as many fraction problems as you can. ` +
					"Type your answer with the number pad and press Check to submit it. " +
					"Press Delete to fix a mistake.\n" +
					"Answers must be in lowest terms: write 1/2, not 2/4.",
			},
			{
				heading: "Scoring",
				body: "Each correct answer adds 1 to your Score.",
			},
			{
				heading: "How the game ends",
				body:
					`You have ${SPEED_MODE_TIME_LIMIT} seconds, shown as Seconds Left. ` +
					"The game ends when the timer reaches 0, or when you press End. " +
					"The game over screen shows your final score.",
			},
		],
	},
];

const PANEL_WIDTH = 620;
const PANEL_HEIGHT = 520;
const PANEL_X = (STAGE_WIDTH - PANEL_WIDTH) / 2;
const PANEL_Y = (STAGE_HEIGHT - PANEL_HEIGHT) / 2;
const PANEL_PADDING = 30;
const BACKDROP_OPACITY = 0.6;

const TITLE_TOP = 20;
const TITLE_SIZE = 40;
const CONTENT_TOP = 80;
const CLOSE_WIDTH = 180;
const CLOSE_HEIGHT = 50;
const CLOSE_BOTTOM_MARGIN = 20;
const CONTENT_BOTTOM_GAP = 14;
const CONTENT_HEIGHT = PANEL_HEIGHT - CONTENT_TOP - CLOSE_HEIGHT - CLOSE_BOTTOM_MARGIN - CONTENT_BOTTOM_GAP;

const SCROLLBAR_WIDTH = 8;
const SCROLLBAR_GAP = 12;
const MIN_THUMB_HEIGHT = 30;
const CONTENT_WIDTH = PANEL_WIDTH - PANEL_PADDING * 2 - SCROLLBAR_WIDTH - SCROLLBAR_GAP;

const MODE_SIZE = 26;
const TOPIC_SIZE = 18;
const BODY_SIZE = 17;
const BODY_LINE_HEIGHT = 1.3;
const SECTION_GAP = 26;
const MODE_GAP = 14;
const TOPIC_GAP = 4;
const BODY_GAP = 14;

const SCROLL_STEP = 1;

export class HowToPlayPopup {
	private readonly group: Konva.Group;
	private readonly content: Konva.Group;
	private readonly scrollThumb: Konva.Rect;
	private readonly scrollTrack: Konva.Rect;
	private readonly closeButton: Button;
	private scrollY = 0;

	private readonly onKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Escape") this.close();
	};

	constructor() {
		this.group = new Konva.Group({ visible: false, name: "howToPlay" });

		const backdrop = new Konva.Rect({
			name: "howToPlayBackdrop",
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			fill: "black",
			opacity: BACKDROP_OPACITY,
		});
		backdrop.on("click tap", () => this.close());
		this.group.add(backdrop);

		const panel = new Konva.Group({ x: PANEL_X, y: PANEL_Y, name: "howToPlayPanel" });
		this.group.add(panel);

		panel.add(
			new Konva.Rect({
				width: PANEL_WIDTH,
				height: PANEL_HEIGHT,
				fill: DOUGH_CREAM,
				stroke: OUTLINE_BROWN,
				strokeWidth: 6,
				cornerRadius: 16,
				shadowColor: "black",
				shadowOpacity: 0.5,
				shadowBlur: 20,
				shadowOffsetY: 6,
			}),
			new Konva.Text({
				name: "howToPlayTitle",
				x: 0,
				y: TITLE_TOP,
				width: PANEL_WIDTH,
				text: "How to Play",
				fontSize: TITLE_SIZE,
				fontFamily: TITLE_FONT,
				fill: CHEESE_YELLOW,
				stroke: OUTLINE_BROWN,
				strokeWidth: 6,
				fillAfterStrokeEnabled: true,
				align: "center",
				listening: false,
			}),
		);

		const viewport = new Konva.Group({
			name: "howToPlayViewport",
			x: PANEL_PADDING,
			y: CONTENT_TOP,
			clip: { x: 0, y: 0, width: CONTENT_WIDTH, height: CONTENT_HEIGHT },
		});
		viewport.add(new Konva.Rect({ width: CONTENT_WIDTH, height: CONTENT_HEIGHT, fill: "transparent" }));
		this.content = this.buildContent();
		viewport.add(this.content);
		panel.add(viewport);

		this.scrollTrack = new Konva.Rect({
			x: PANEL_WIDTH - PANEL_PADDING - SCROLLBAR_WIDTH,
			y: CONTENT_TOP,
			width: SCROLLBAR_WIDTH,
			height: CONTENT_HEIGHT,
			fill: OUTLINE_BROWN,
			opacity: 0.15,
			cornerRadius: SCROLLBAR_WIDTH / 2,
			listening: false,
		});
		this.scrollThumb = new Konva.Rect({
			name: "howToPlayScrollThumb",
			x: this.scrollTrack.x(),
			y: CONTENT_TOP,
			width: SCROLLBAR_WIDTH,
			height: CONTENT_HEIGHT,
			fill: TOMATO_RED,
			cornerRadius: SCROLLBAR_WIDTH / 2,
			listening: false,
		});
		panel.add(this.scrollTrack, this.scrollThumb);

		this.closeButton = new Button({
			name: "howToPlayClose",
			x: (PANEL_WIDTH - CLOSE_WIDTH) / 2,
			y: PANEL_HEIGHT - CLOSE_BOTTOM_MARGIN - CLOSE_HEIGHT,
			width: CLOSE_WIDTH,
			height: CLOSE_HEIGHT,
			text: "CLOSE",
			fill: TOMATO_RED,
			stroke: OUTLINE_BROWN,
			onClick: () => this.close(),
		});
		panel.add(this.closeButton.getGroup());

		this.enableScrolling(panel, viewport);
		this.scrollTo(0);
	}

	private buildContent(): Konva.Group {
		const content = new Konva.Group({ name: "howToPlayContent" });
		let y = 0;

		HOW_TO_PLAY_SECTIONS.forEach((section, i) => {
			if (i > 0) y += SECTION_GAP;

			const modeText = new Konva.Text({
				name: "modeHeading",
				y,
				width: CONTENT_WIDTH,
				text: section.mode,
				fontSize: MODE_SIZE,
				fontFamily: TITLE_FONT,
				fill: TOMATO_RED,
			});
			content.add(modeText);
			y += modeText.height() + 4;

			content.add(
				new Konva.Line({
					points: [0, y, CONTENT_WIDTH, y],
					stroke: OUTLINE_BROWN,
					strokeWidth: 2,
					opacity: 0.3,
				}),
			);
			y += MODE_GAP;

			for (const topic of section.topics) {
				const heading = new Konva.Text({
					y,
					width: CONTENT_WIDTH,
					text: topic.heading,
					fontSize: TOPIC_SIZE,
					fontFamily: BODY_FONT,
					fontStyle: "bold",
					fill: OUTLINE_BROWN,
				});
				content.add(heading);
				y += heading.height() + TOPIC_GAP;

				const body = new Konva.Text({
					y,
					width: CONTENT_WIDTH,
					text: topic.body,
					fontSize: BODY_SIZE,
					fontFamily: BODY_FONT,
					lineHeight: BODY_LINE_HEIGHT,
					fill: OUTLINE_BROWN,
				});
				content.add(body);
				y += body.height() + BODY_GAP;
			}
		});

		content.setAttr("contentHeight", y);
		return content;
	}

	private enableScrolling(panel: Konva.Group, viewport: Konva.Group): void {
		panel.on("wheel", (e) => {
			e.evt.preventDefault();
			this.scrollTo(this.scrollY + e.evt.deltaY * SCROLL_STEP);
		});

		let dragStartPointerY: number | null = null;
		let dragStartScroll = 0;
		viewport.on("mousedown touchstart", () => {
			dragStartPointerY = this.group.getStage()?.getPointerPosition()?.y ?? null;
			dragStartScroll = this.scrollY;
		});
		viewport.on("mousemove touchmove", (e) => {
			if (dragStartPointerY === null) return;
			const pointerY = this.group.getStage()?.getPointerPosition()?.y;
			if (pointerY === undefined) return;
			e.evt.preventDefault();
			this.scrollTo(dragStartScroll + (dragStartPointerY - pointerY));
		});
		const endDrag = () => {
			dragStartPointerY = null;
		};
		viewport.on("mouseup mouseleave touchend", endDrag);
	}

	getMaxScroll(): number {
		const contentHeight = this.content.getAttr("contentHeight") as number;
		return Math.max(0, contentHeight - CONTENT_HEIGHT);
	}

	getScrollY(): number {
		return this.scrollY;
	}

	scrollTo(y: number): void {
		const maxScroll = this.getMaxScroll();
		this.scrollY = Math.min(Math.max(0, y), maxScroll);
		this.content.y(-this.scrollY);

		const scrollable = maxScroll > 0;
		this.scrollTrack.visible(scrollable);
		this.scrollThumb.visible(scrollable);
		if (scrollable) {
			const contentHeight = CONTENT_HEIGHT + maxScroll;
			const thumbHeight = Math.max(MIN_THUMB_HEIGHT, (CONTENT_HEIGHT / contentHeight) * CONTENT_HEIGHT);
			const thumbTravel = CONTENT_HEIGHT - thumbHeight;
			this.scrollThumb.height(thumbHeight);
			this.scrollThumb.y(CONTENT_TOP + (this.scrollY / maxScroll) * thumbTravel);
		}
		this.group.getLayer()?.batchDraw();
	}

	open(): void {
		if (this.isOpen()) return;
		this.scrollTo(0);
		this.group.visible(true);
		this.group.moveToTop();
		window.addEventListener("keydown", this.onKeyDown);
		this.group.getLayer()?.batchDraw();
	}

	close(): void {
		window.removeEventListener("keydown", this.onKeyDown);
		if (!this.isOpen()) return;
		this.group.visible(false);
		const container = this.group.getStage()?.container();
		if (container) container.style.cursor = "default";
		this.group.getLayer()?.batchDraw();
	}

	isOpen(): boolean {
		return this.group.visible();
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}
