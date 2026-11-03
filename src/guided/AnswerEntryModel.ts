import { MAX_ANSWER_DIGITS } from "./answerParsing.ts";

/**
 * The digits typed so far into a step's answer boxes.
 *
 * Players type on an on-screen number pad, so only one box is active at a
 * time and only digits can be entered. The values stay as text; turning them
 * into numbers is the job of `parseStepAnswer`.
 */
export class AnswerEntryModel {
	private readonly values: string[];
	private activeIndex = 0;

	constructor(fieldCount: number) {
		if (!Number.isInteger(fieldCount) || fieldCount < 1) {
			throw new Error(`An answer needs at least one box, got ${fieldCount}`);
		}
		this.values = new Array<string>(fieldCount).fill("");
	}

	/** The text in each box, in order. */
	getFields(): readonly string[] {
		return [...this.values];
	}

	getActiveIndex(): number {
		return this.activeIndex;
	}

	/** Makes a box the one that receives digits. Unknown boxes are ignored. */
	selectField(index: number): void {
		if (Number.isInteger(index) && index >= 0 && index < this.values.length) {
			this.activeIndex = index;
		}
	}

	/**
	 * Adds a digit to the active box. Anything that is not a single digit is
	 * ignored, as is a digit that would make the number too long.
	 */
	typeDigit(digit: string): void {
		if (!/^\d$/.test(digit)) return;

		const current = this.values[this.activeIndex];
		if (current.length >= MAX_ANSWER_DIGITS) return;
		// Avoid leading zeros like "07".
		this.values[this.activeIndex] = current === "0" ? digit : current + digit;
	}

	/** Removes the last digit from the active box. */
	backspace(): void {
		this.values[this.activeIndex] = this.values[this.activeIndex].slice(0, -1);
	}

	/** Empties every box and goes back to the first one. */
	clear(): void {
		this.values.fill("");
		this.activeIndex = 0;
	}
}
