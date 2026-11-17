import { describe, expect, test } from "vitest";
import {
	generateMasteryProblem,
	isValidMasteryProblem,
	masteryAnswer,
	type MasteryProblem,
	type Rng,
} from "./masteryProblems.ts";
import { Fraction } from "../../models/Fraction.ts";

/** Deterministic LCG so tests don't depend on Math.random. */
function seededRng(seed: number): Rng {
	let state = seed >>> 0;
	return () => {
		state = (Math.imul(1664525, state) + 1013904223) >>> 0;
		return state / 0x100000000;
	};
}

function dens(p: MasteryProblem): [number, number] {
	return [p.frac1.denominator, p.frac2.denominator];
}

describe("generateMasteryProblem", () => {
	test("always returns a valid problem for each tier", () => {
		const rng = seededRng(42);
		for (const difficulty of [0, 1, 2, 3, 4, 8, 20]) {
			for (let i = 0; i < 40; i++) {
				const problem = generateMasteryProblem(difficulty, rng);
				expect(isValidMasteryProblem(problem)).toBe(true);
			}
		}
	});

	test("tier 0 uses matching denominators ≤ 12", () => {
		const rng = seededRng(7);
		for (let i = 0; i < 30; i++) {
			const [d1, d2] = dens(generateMasteryProblem(0, rng));
			expect(d1).toBe(d2);
			expect(d1).toBeLessThanOrEqual(12);
		}
	});

	test("tier 1 uses matching denominators that need simplify", () => {
		const rng = seededRng(11);
		for (let i = 0; i < 40; i++) {
			const problem = generateMasteryProblem(1, rng);
			const [d1, d2] = dens(problem);
			expect(d1).toBe(d2);
			const raw =
				problem.operation === "addition"
					? problem.frac1.numerator + problem.frac2.numerator
					: problem.frac1.numerator - problem.frac2.numerator;
			expect(new Fraction(raw, d1).isSimplified()).toBe(false);
		}
	});

	test("tier 2 uses related denominators ≤ 12", () => {
		const rng = seededRng(19);
		for (let i = 0; i < 30; i++) {
			const [d1, d2] = dens(generateMasteryProblem(2, rng));
			expect(Math.max(d1, d2) % Math.min(d1, d2)).toBe(0);
			expect(Math.max(d1, d2)).toBeLessThanOrEqual(12);
			expect(d1).not.toBe(d2);
		}
	});

	test("tier 3 keeps denominators ≤ 20 and usually unlike", () => {
		const rng = seededRng(23);
		let unlike = 0;
		for (let i = 0; i < 40; i++) {
			const [d1, d2] = dens(generateMasteryProblem(3, rng));
			expect(d1).toBeLessThanOrEqual(20);
			expect(d2).toBeLessThanOrEqual(20);
			if (d1 !== d2) unlike++;
		}
		expect(unlike).toBeGreaterThan(30);
	});

	test("tier 4+ may use two-digit denominators up to 99", () => {
		const rng = seededRng(29);
		let twoDigit = 0;
		for (let i = 0; i < 60; i++) {
			const [d1, d2] = dens(generateMasteryProblem(4, rng));
			expect(d1).toBeLessThanOrEqual(99);
			expect(d2).toBeLessThanOrEqual(99);
			if (d1 >= 10 || d2 >= 10) twoDigit++;
		}
		expect(twoDigit).toBeGreaterThan(0);
	});

	test("operand and answer parts never exceed two digits", () => {
		const rng = seededRng(31);
		for (let difficulty = 0; difficulty <= 10; difficulty++) {
			for (let i = 0; i < 20; i++) {
				const p = generateMasteryProblem(difficulty, rng);
				const answer = masteryAnswer(p);
				for (const n of [
					p.frac1.numerator,
					p.frac1.denominator,
					p.frac2.numerator,
					p.frac2.denominator,
					answer.numerator,
					answer.denominator,
				]) {
					expect(n).toBeGreaterThanOrEqual(1);
					expect(n).toBeLessThanOrEqual(99);
				}
			}
		}
	});
});

describe("masteryAnswer", () => {
	test("adds and simplifies", () => {
		expect(
			masteryAnswer({
				frac1: new Fraction(1, 8),
				frac2: new Fraction(3, 8),
				operation: "addition",
			}).toString(),
		).toBe("1/2");
	});

	test("subtracts over a common denominator", () => {
		expect(
			masteryAnswer({
				frac1: new Fraction(3, 4),
				frac2: new Fraction(2, 3),
				operation: "subtraction",
			}).toString(),
		).toBe("1/12");
	});
});
