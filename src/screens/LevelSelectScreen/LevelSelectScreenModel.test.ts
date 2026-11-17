import { describe, expect, test } from "vitest";
import { LevelSelectScreenModel } from "./LevelSelectScreenModel.ts";
import { NUM_LVLS } from "../../constants.ts";
import { getAllLevels } from "../../models/level/levelRepository.ts";

const statuses = (model: LevelSelectScreenModel, progress: number) =>
	model.getLevels(progress).map((level) => level.status);

describe("LevelSelectScreenModel", () => {
	test("lists every campaign level in order", () => {
		const model = new LevelSelectScreenModel();
		const levels = model.getLevels(0);
		expect(levels).toHaveLength(NUM_LVLS);
		expect(levels.map((l) => l.id)).toEqual(getAllLevels().map((l) => l.id));
		expect(levels.map((l) => l.displayName)).toEqual(getAllLevels().map((l) => l.displayName));
	});

	test("with no progress only the first level is open", () => {
		const model = new LevelSelectScreenModel();
		const [first, ...rest] = statuses(model, 0);
		expect(first).toBe("current");
		expect(rest.every((s) => s === "locked")).toBe(true);
	});

	test("completed levels stay open and the next one becomes current", () => {
		const model = new LevelSelectScreenModel();
		expect(statuses(model, 3)).toEqual([
			"completed",
			"completed",
			"completed",
			"current",
			...Array(NUM_LVLS - 4).fill("locked"),
		]);
	});

	test("finishing the whole campaign completes every level", () => {
		const model = new LevelSelectScreenModel();
		expect(statuses(model, NUM_LVLS).every((s) => s === "completed")).toBe(true);
	});

	test.each([
		["negative", -2, 0],
		["NaN", Number.NaN, 0],
		["Infinity", Number.POSITIVE_INFINITY, 0],
		["a decimal", 2.9, 2],
		["more than the number of levels", NUM_LVLS + 5, NUM_LVLS],
	])("treats %s progress as sensible progress", (_label, progress, expected) => {
		const model = new LevelSelectScreenModel();
		expect(statuses(model, progress)).toEqual(statuses(model, expected));
	});

	test("isUnlocked allows completed and current levels only", () => {
		const model = new LevelSelectScreenModel();
		expect(model.isUnlocked(1, 1)).toBe(true);
		expect(model.isUnlocked(2, 1)).toBe(true);
		expect(model.isUnlocked(3, 1)).toBe(false);
	});

	test("isUnlocked rejects ids that are not levels", () => {
		const model = new LevelSelectScreenModel();
		for (const id of [0, -1, 1.5, NUM_LVLS + 1, Number.NaN]) {
			expect(model.isUnlocked(id, NUM_LVLS)).toBe(false);
		}
	});

	test("only guided levels are playable for now", () => {
		const model = new LevelSelectScreenModel();
		const guided = getAllLevels().map((l) => l.guided);
		expect(model.getLevels(0).map((l) => l.playable)).toEqual(guided);
	});

	test("canOpen needs the level to be both unlocked and playable", () => {
		const model = new LevelSelectScreenModel();
		const firstUnplayable = getAllLevels().find((l) => !l.guided)!;
		expect(model.canOpen(1, 0)).toBe(true);
		expect(model.canOpen(2, 0)).toBe(false); // locked
		expect(model.canOpen(firstUnplayable.id, NUM_LVLS)).toBe(false); // no screen yet
	});

	test("works from the level list it is given", () => {
		const twoLevels = getAllLevels().slice(0, 2);
		const model = new LevelSelectScreenModel(twoLevels);
		expect(statuses(model, 1)).toEqual(["completed", "current"]);
	});
});
