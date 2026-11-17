import { getAllLevels } from "../../models/level/levelRepository.ts";
import type { Level, LevelId } from "../../models/level/LevelTypes.ts";

/**
 * - "completed": the player has finished this level and can replay it
 * - "current": the next level to play
 * - "locked": not reachable until earlier levels are completed
 */
export type LevelStatus = "completed" | "current" | "locked";

/** Everything the level select screen needs to draw one level tile. */
export interface LevelSummary {
	readonly id: LevelId;
	readonly displayName: string;
	readonly status: LevelStatus;
	/** False if the level has no screen to play it on yet. */
	readonly playable: boolean;
}

/**
 * LevelSelectScreenModel - Decides which campaign levels the player may open
 *
 * Progress is the number of levels completed, as saved by ProgressManager.
 * Levels are unlocked in order: every completed level plus the next one.
 */
export class LevelSelectScreenModel {
	private readonly levels: readonly Level[];

	constructor(levels: readonly Level[] = getAllLevels()) {
		this.levels = levels;
	}

	/** All levels in campaign order, with their status for this progress. */
	getLevels(progress: number): LevelSummary[] {
		const completed = this.clampProgress(progress);
		return this.levels.map((level, index) => ({
			id: level.id,
			displayName: level.displayName,
			status: statusFor(index, completed),
			// Only guided levels have a screen so far.
			playable: level.guided,
		}));
	}

	/** True if the level exists and the player has reached it. */
	isUnlocked(levelId: number, progress: number): boolean {
		const index = this.levels.findIndex((level) => level.id === levelId);
		if (index === -1) return false;
		return statusFor(index, this.clampProgress(progress)) !== "locked";
	}

	/** True if the level is unlocked and has a screen to play it on. */
	canOpen(levelId: number, progress: number): boolean {
		const level = this.levels.find((l) => l.id === levelId);
		return level !== undefined && level.guided && this.isUnlocked(levelId, progress);
	}

	/**
	 * Saved progress is not validated, so treat anything strange (NaN,
	 * negatives, decimals, too large) as the nearest sensible value.
	 */
	private clampProgress(progress: number): number {
		if (!Number.isFinite(progress)) return 0;
		return Math.min(Math.max(Math.floor(progress), 0), this.levels.length);
	}
}

function statusFor(index: number, completed: number): LevelStatus {
	if (index < completed) return "completed";
	if (index === completed) return "current";
	return "locked";
}
