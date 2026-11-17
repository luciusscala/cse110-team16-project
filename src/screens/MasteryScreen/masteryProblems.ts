import { Fraction, gcd } from "../../models/Fraction.ts";
import type { Question } from "../../models/level/LevelTypes.ts";

export type MasteryProblem = Pick<Question, "frac1" | "frac2" | "operation">;

/** Returns a number in [0, 1). */
export type Rng = () => number;

const MAX_PART = 99;
const MAX_ATTEMPTS = 80;

const f = (numerator: number, denominator: number) =>
	new Fraction(numerator, denominator);

function int(rng: Rng, min: number, max: number): number {
	return min + Math.floor(rng() * (max - min + 1));
}

function pickOp(rng: Rng): "addition" | "subtraction" {
	return rng() < 0.5 ? "addition" : "subtraction";
}

function problem(
	frac1: Fraction,
	frac2: Fraction,
	operation: "addition" | "subtraction",
): MasteryProblem {
	return Object.freeze({ frac1, frac2, operation });
}

/** True if every numerator/denominator (operands + simplified answer) is in 1–99 and the answer is a proper positive fraction. */
export function isValidMasteryProblem(p: MasteryProblem): boolean {
	const parts = [
		p.frac1.numerator,
		p.frac1.denominator,
		p.frac2.numerator,
		p.frac2.denominator,
	];
	if (parts.some((n) => n < 1 || n > MAX_PART)) return false;
	if (p.frac1.numerator >= p.frac1.denominator) return false;
	if (p.frac2.numerator >= p.frac2.denominator) return false;

	const answer = masteryAnswer(p);
	if (answer.numerator < 1 || answer.numerator >= answer.denominator) return false;
	if (answer.numerator > MAX_PART || answer.denominator > MAX_PART) return false;
	return true;
}

export function masteryAnswer(problem: MasteryProblem): Fraction {
	const { frac1, frac2, operation } = problem;
	const combined =
		operation === "addition" ? frac1.add(frac2) : frac1.subtract(frac2);
	return combined.simplify();
}

/**
 * Difficulty ladder:
 * 0 — same den 2–12, usually already simplified
 * 1 — same den 2–12, usually needs simplify
 * 2 — related dens (one divides the other), ≤12
 * 3 — unlike dens ≤20
 * 4+ — unlike dens up to 99
 */
export function generateMasteryProblem(
	difficulty: number,
	rng: Rng = Math.random,
): MasteryProblem {
	const tier = Math.max(0, Math.floor(difficulty));
	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
		const candidate =
			tier <= 0
				? sameDenominator(rng, 2, 12, "simplified")
				: tier === 1
					? sameDenominator(rng, 2, 12, "unsimplified")
					: tier === 2
						? relatedDenominators(rng, 12)
						: tier === 3
							? unlikeDenominators(rng, 3, 20)
							: unlikeDenominators(rng, 5, MAX_PART);
		if (candidate && isValidMasteryProblem(candidate)) return candidate;
	}
	// Deterministic fallback if RNG is pathological.
	return problem(f(1, 3), f(1, 3), "addition");
}

function sameDenominator(
	rng: Rng,
	minDen: number,
	maxDen: number,
	simplifyBias: "simplified" | "unsimplified",
): MasteryProblem | undefined {
	const d = int(rng, minDen, maxDen);
	const op = pickOp(rng);
	let n1 = int(rng, 1, d - 1);
	let n2 = int(rng, 1, d - 1);

	if (op === "addition") {
		if (n1 + n2 >= d) {
			n1 = int(rng, 1, Math.max(1, Math.floor((d - 1) / 2)));
			n2 = int(rng, 1, d - 1 - n1);
		}
	} else if (n1 <= n2) {
		n1 = int(rng, Math.min(d - 1, n2 + 1), d - 1);
		n2 = int(rng, 1, n1 - 1);
		if (n1 <= n2) return undefined;
	}

	const raw = op === "addition" ? n1 + n2 : n1 - n2;
	if (raw <= 0 || raw >= d) return undefined;
	const needsSimplify = gcd(raw, d) > 1;
	if (simplifyBias === "simplified" && needsSimplify) return undefined;
	if (simplifyBias === "unsimplified" && !needsSimplify) return undefined;

	return problem(f(n1, d), f(n2, d), op);
}

function relatedDenominators(rng: Rng, maxDen: number): MasteryProblem | undefined {
	const smaller = int(rng, 2, Math.floor(maxDen / 2));
	const factor = int(rng, 2, Math.floor(maxDen / smaller));
	const larger = smaller * factor;
	if (larger > maxDen) return undefined;

	const [d1, d2] = rng() < 0.5 ? [smaller, larger] : [larger, smaller];
	return buildUnlike(rng, d1, d2);
}

function unlikeDenominators(
	rng: Rng,
	minDen: number,
	maxDen: number,
): MasteryProblem | undefined {
	const d1 = int(rng, minDen, maxDen);
	let d2 = int(rng, minDen, maxDen);
	if (d2 === d1) {
		d2 = d1 === maxDen ? d1 - 1 : d1 + 1;
	}
	return buildUnlike(rng, d1, d2);
}

function buildUnlike(
	rng: Rng,
	d1: number,
	d2: number,
): MasteryProblem | undefined {
	const op = pickOp(rng);
	const n1 = int(rng, 1, d1 - 1);
	const n2 = int(rng, 1, d2 - 1);
	const candidate = problem(f(n1, d1), f(n2, d2), op);
	return isValidMasteryProblem(candidate) ? candidate : undefined;
}
