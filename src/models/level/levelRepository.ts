import { LEVELS } from "./levelData.ts";
import type { Level } from "./LevelTypes.ts";

const levelsById = new Map<number, Level>(LEVELS.map((level) => [level.id, level]));

/**
 * Returns the level with this id, or undefined if there is none.
 *
 * Never throws. Unknown ids, 0, negatives, decimals, NaN and non-number
 * values all return undefined, so callers can fall back to the level
 * select screen.
 */
export function getLevelById(id: number): Level | undefined {
	return levelsById.get(id);
}

/** All levels, easiest first. */
export function getAllLevels(): readonly Level[] {
	return [...LEVELS].sort((a, b) => a.difficulty - b.difficulty);
}
