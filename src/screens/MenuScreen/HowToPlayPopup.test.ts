import { describe, expect, test } from "vitest";
import Konva from "konva";
import { HowToPlayPopup, HOW_TO_PLAY_SECTIONS } from "./HowToPlayPopup.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

function openPopup(): HowToPlayPopup {
	const popup = new HowToPlayPopup();
	new Konva.Layer().add(popup.getGroup());
	popup.open();
	return popup;
}

describe("HowToPlayPopup", () => {
	test("starts closed", () => {
		const popup = new HowToPlayPopup();
		expect(popup.isOpen()).toBe(false);
		expect(popup.getGroup().visible()).toBe(false);
	});

	test("is titled How to Play", () => {
		const popup = new HowToPlayPopup();
		const title = popup.getGroup().findOne<Konva.Text>(".howToPlayTitle");
		expect(title!.text()).toBe("How to Play");
	});

	test("lists Levels, then Mastery Mode, then Speed Mode", () => {
		const popup = new HowToPlayPopup();
		const headings = popup.getGroup().find<Konva.Text>(".modeHeading");
		expect(headings.map((h) => h.text())).toEqual(["Levels", "Mastery Mode", "Speed Mode"]);
		expect(headings[0].y()).toBeLessThan(headings[1].y());
		expect(headings[1].y()).toBeLessThan(headings[2].y());
	});

	test("Levels explains choosing a level, answering, and finishing", () => {
		const levels = HOW_TO_PLAY_SECTIONS.find((s) => s.mode === "Levels")!;
		expect(levels.topics.map((t) => t.heading)).toEqual([
			"Choosing a level",
			"How to answer",
			"Finishing a level",
		]);
	});

	test("each minigame explains answering, scoring, and how the game ends", () => {
		for (const section of HOW_TO_PLAY_SECTIONS.filter((s) => s.mode !== "Levels")) {
			expect(section.topics.map((t) => t.heading)).toEqual([
				"How to answer",
				"Scoring",
				"How the game ends",
			]);
			for (const topic of section.topics) expect(topic.body.length).toBeGreaterThan(0);
		}
	});

	test("dims the whole stage behind the panel", () => {
		const popup = new HowToPlayPopup();
		const backdrop = popup.getGroup().findOne<Konva.Rect>(".howToPlayBackdrop")!;
		expect(backdrop.width()).toBe(STAGE_WIDTH);
		expect(backdrop.height()).toBe(STAGE_HEIGHT);
		expect(backdrop.opacity()).toBeLessThan(1);
	});

	test("panel is centered and fits inside the stage", () => {
		const popup = new HowToPlayPopup();
		const panel = popup.getGroup().findOne<Konva.Group>(".howToPlayPanel")!;
		const rect = panel.findOne<Konva.Rect>("Rect")!;
		expect(panel.x()).toBeGreaterThanOrEqual(0);
		expect(panel.y()).toBeGreaterThanOrEqual(0);
		expect(panel.x() + rect.width()).toBeLessThanOrEqual(STAGE_WIDTH);
		expect(panel.y() + rect.height()).toBeLessThanOrEqual(STAGE_HEIGHT);
		expect(panel.x() + rect.width() / 2).toBe(STAGE_WIDTH / 2);
		expect(panel.y() + rect.height() / 2).toBe(STAGE_HEIGHT / 2);
	});

	test("clicking the close button closes the popup", () => {
		const popup = openPopup();
		popup.getGroup().findOne(".howToPlayClose")!.fire("click");
		expect(popup.isOpen()).toBe(false);
	});

	test("clicking outside the panel closes the popup", () => {
		const popup = openPopup();
		popup.getGroup().findOne(".howToPlayBackdrop")!.fire("click");
		expect(popup.isOpen()).toBe(false);
	});

	test("pressing Escape closes the popup", () => {
		const popup = openPopup();
		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
		expect(popup.isOpen()).toBe(false);
	});

	test("instructions scroll as one group and clamp at both ends", () => {
		const popup = openPopup();
		const content = popup.getGroup().findOne<Konva.Group>(".howToPlayContent")!;
		const max = popup.getMaxScroll();
		expect(max).toBeGreaterThan(0);

		popup.scrollTo(50);
		expect(content.y()).toBe(-50);

		popup.scrollTo(max + 1000);
		expect(popup.getScrollY()).toBe(max);

		popup.scrollTo(-1000);
		expect(popup.getScrollY()).toBe(0);
	});

	test("the mouse wheel scrolls the instructions", () => {
		const popup = openPopup();
		const panel = popup.getGroup().findOne(".howToPlayPanel")!;
		panel.fire("wheel", { evt: new WheelEvent("wheel", { deltaY: 40 }) });
		expect(popup.getScrollY()).toBe(40);
	});

	test("reopening starts at the top", () => {
		const popup = openPopup();
		popup.scrollTo(80);
		popup.close();
		popup.open();
		expect(popup.getScrollY()).toBe(0);
	});
});
