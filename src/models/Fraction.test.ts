import { describe, expect, test } from "vitest";
import { Fraction } from "./Fraction.ts";

const f = (n: number, d: number) => new Fraction(n, d);

describe("Fraction", () => {
	test("adds fractions with the same denominator", () => {
		expect(f(1, 5).add(f(2, 5)).toString()).toBe("3/5");
	});

	test("adds fractions with different denominators over the lowest common denominator", () => {
		expect(f(1, 3).add(f(1, 6)).toString()).toBe("3/6"); // LCD is 6, not 18
		expect(f(1, 4).add(f(1, 6)).toString()).toBe("5/12"); // LCD is 12, not 24
	});

	test("subtracts fractions with the same and different denominators", () => {
		expect(f(4, 5).subtract(f(1, 5)).toString()).toBe("3/5");
		expect(f(3, 4).subtract(f(1, 6)).toString()).toBe("7/12");
	});

	test("adding and subtracting do not simplify on their own", () => {
		expect(f(1, 4).add(f(1, 4)).toString()).toBe("2/4");
		expect(f(5, 6).subtract(f(1, 3)).toString()).toBe("3/6");
	});

	test("simplify reduces to lowest terms", () => {
		expect(f(2, 4).simplify().toString()).toBe("1/2");
		expect(f(16, 30).simplify().toString()).toBe("8/15");
	});

	test("isEqual compares values, so 3/6 equals 1/2", () => {
		expect(f(3, 6).isEqual(f(1, 2))).toBe(true);
		expect(f(1, 3).isEqual(f(1, 2))).toBe(false);
	});

	test("a denominator of 0 is rejected", () => {
		expect(() => f(1, 0)).toThrow();
	});
});
