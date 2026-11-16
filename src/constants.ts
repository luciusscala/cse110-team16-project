import { LEVELS } from "./models/level/levelData.ts";

// Stage dimensions
export const STAGE_WIDTH = 800;
export const STAGE_HEIGHT = 600;

// Main campaign properties
// Derived from the level data so it always matches the number of campaign levels.
export const NUM_LVLS = LEVELS.length;

// Minigame properties
export const SPEED_MODE_TIME_LIMIT = 300;
/** Seconds counted down (3, 2, 1) before a Mastery game begins. */
export const MASTERY_COUNTDOWN_SECONDS = 3;
