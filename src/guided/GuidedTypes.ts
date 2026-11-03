import type { Fraction } from "../models/Fraction.ts";
import type { Question } from "../models/level/LevelTypes.ts";

/** The steps of a guided problem, in the order the player works through them. */
export type StepKind = "lcd" | "scaleNumerators" | "combine" | "simplify";

/** What the player entered for one step. */
export type StepAnswer =
	| { readonly step: "lcd"; readonly lcd: number }
	/** Both fractions rewritten over the common denominator, in question order. */
	| { readonly step: "scaleNumerators"; readonly scaled: readonly [Fraction, Fraction] }
	| { readonly step: "combine"; readonly result: Fraction }
	| { readonly step: "simplify"; readonly result: Fraction };

/** The correct value of every step for one question. */
export interface ExpectedSolution {
	readonly question: Question;
	/** Only the steps this question needs, in order. */
	readonly steps: readonly StepKind[];
	/** The lowest common denominator of the two fractions. */
	readonly lcd: number;
	/** Both fractions rewritten over the LCD. */
	readonly scaled: readonly [Fraction, Fraction];
	/** The two scaled fractions combined, not yet simplified. */
	readonly combined: Fraction;
	/** The combined fraction in lowest terms. */
	readonly simplified: Fraction;
}
