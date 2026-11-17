import { describe, expect, test, vi } from "vitest";
import Konva from "konva";
import { LevelSelectScreenView } from "./LevelSelectScreenView.ts";
import type { LevelSummary } from "./LevelSelectScreenModel.ts";
import { STAGE_WIDTH } from "../../constants.ts";

function makeHandlers() {
	return { onLevelSelected: vi.fn(), onBack: vi.fn() };
}

const LEVELS: LevelSummary[] = [
	{ id: 1, displayName: "One", status: "completed", playable: true },
	{ id: 2, displayName: "Two", status: "current", playable: true },
	{ id: 3, displayName: "Three", status: "locked", playable: true },
	{ id: 4, displayName: "Four", status: "locked", playable: false },
	{ id: 5, displayName: "Five", status: "locked", playable: false },
];

function tile(view: LevelSelectScreenView, id: number) {
	return view.getGroup().findOne<Konva.Group>(`.levelTile-${id}`)!;
}

function tileFill(view: LevelSelectScreenView, id: number) {
	return tile(view, id).findOne<Konva.Rect>("Rect")!.fill();
}

describe("LevelSelectScreenView", () => {
	test("renders a centered title", () => {
		const view = new LevelSelectScreenView(makeHandlers());
		const title = view.getGroup().findOne<Konva.Text>(".title")!;
		expect(title.text()).toBe("CHOOSE A LEVEL");
		expect(title.width()).toBe(STAGE_WIDTH);
		expect(title.align()).toBe("center");
	});

	test("starts hidden with no tiles until rendered", () => {
		const view = new LevelSelectScreenView(makeHandlers());
		expect(view.getGroup().visible()).toBe(false);
		expect(view.getTiles()).toHaveLength(0);
	});

	test("renders one tile per level showing its number and name", () => {
		const view = new LevelSelectScreenView(makeHandlers());
		view.render(LEVELS);
		expect(view.getGroup().find(".levelTile")).toHaveLength(LEVELS.length);
		expect(view.getTiles()[0].getText()).toBe("Level 1\nOne\nDone!");
		expect(view.getTiles()[1].getText()).toBe("Level 2\nTwo\nPlay!");
		expect(view.getTiles()[2].getText()).toBe("Level 3\nThree\nLocked");
	});

	test("colors tiles by status", () => {
		const view = new LevelSelectScreenView(makeHandlers());
		view.render(LEVELS);
		expect(tileFill(view, 1)).toBe("green");
		expect(tileFill(view, 2)).toBe("gold");
		expect(tileFill(view, 3)).toBe("lightgray");
	});

	test("unlocked levels without a screen say coming soon", () => {
		const view = new LevelSelectScreenView(makeHandlers());
		view.render([{ id: 4, displayName: "Four", status: "current", playable: false }]);
		expect(view.getTiles()[0].getText()).toBe("Level 4\nFour\nComing soon");
	});

	test("clicking an open tile selects that level", () => {
		const handlers = makeHandlers();
		const view = new LevelSelectScreenView(handlers);
		view.render(LEVELS);
		tile(view, 1).fire("click");
		tile(view, 2).fire("click");
		expect(handlers.onLevelSelected.mock.calls).toEqual([[1], [2]]);
	});

	test("clicking a locked or unplayable tile does nothing", () => {
		const handlers = makeHandlers();
		const view = new LevelSelectScreenView(handlers);
		view.render([...LEVELS, { id: 6, displayName: "Six", status: "current", playable: false }]);
		tile(view, 3).fire("click");
		tile(view, 6).fire("click");
		expect(handlers.onLevelSelected).not.toHaveBeenCalled();
	});

	test("lays tiles out in rows of four that stay on the stage and do not overlap", () => {
		const view = new LevelSelectScreenView(makeHandlers());
		view.render(LEVELS);
		const groups = view.getTiles().map((t) => t.getGroup());
		const rects = groups.map((g) => g.findOne<Konva.Rect>("Rect")!);

		// First row has 4 tiles sharing a y, the fifth wraps below.
		expect(new Set(groups.slice(0, 4).map((g) => g.y())).size).toBe(1);
		expect(groups[4].y()).toBeGreaterThanOrEqual(groups[0].y() + rects[0].height());

		for (let i = 0; i < groups.length; i++) {
			expect(groups[i].x()).toBeGreaterThanOrEqual(0);
			expect(groups[i].x() + rects[i].width()).toBeLessThanOrEqual(STAGE_WIDTH);
		}
		for (let i = 1; i < 4; i++) {
			expect(groups[i].x()).toBeGreaterThanOrEqual(groups[i - 1].x() + rects[i - 1].width());
		}
	});

	test("rendering again replaces the old tiles", () => {
		const handlers = makeHandlers();
		const view = new LevelSelectScreenView(handlers);
		view.render(LEVELS);
		view.render([{ id: 1, displayName: "One", status: "current", playable: true }]);
		expect(view.getGroup().find(".levelTile")).toHaveLength(1);
		expect(view.getTiles()[0].getText()).toBe("Level 1\nOne\nPlay!");
	});

	test("back button calls onBack", () => {
		const handlers = makeHandlers();
		const view = new LevelSelectScreenView(handlers);
		view.getGroup().findOne(".backButton")!.fire("click");
		expect(handlers.onBack).toHaveBeenCalledTimes(1);
		expect(handlers.onLevelSelected).not.toHaveBeenCalled();
	});

	test("hide and show toggle visibility", () => {
		const view = new LevelSelectScreenView(makeHandlers());
		view.show();
		expect(view.getGroup().visible()).toBe(true);
		view.hide();
		expect(view.getGroup().visible()).toBe(false);
	});
});
