import type { Fraction } from "../Fraction.ts";

/** What a single question asks the player to do. */
export type Operation = "addition" | "subtraction";

/** A level can hold questions of one operation, or a mix of both. */
export type LevelOperation = Operation | "mixed";

export type LevelId = number;

export interface Question {
	/** Unique across the whole campaign, e.g. "L3-Q2". */
	readonly id: string;
	/** The level this question belongs to. */
	readonly levelId: LevelId;
	readonly frac1: Fraction;
	readonly frac2: Fraction;
	readonly operation: Operation;
	/** Always positive and in lowest terms. */
	readonly correctAnswer: Fraction;
}

export interface Level {
	readonly id: LevelId;
	/** Short, kid-friendly name for the level select screen. */
	readonly displayName: string;
	/** One simple sentence about what the level teaches. */
	readonly description: string;
	readonly operation: LevelOperation;
	/** 1 is easiest. Strictly increases with campaign order. */
	readonly difficulty: number;
	/** If true, the game walks the player through each step (story #12). */
	readonly guided: boolean;
	readonly questions: readonly Question[];
}
