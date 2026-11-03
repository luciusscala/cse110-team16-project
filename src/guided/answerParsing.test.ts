import { describe, expect, test } from "vitest";
import { parseStepAnswer } from "./answerParsing.ts";

describe("parseStepAnswer", () => {
	test("parses the LCD box", () => {
		const result = parseStepAnswer("lcd", ["12"]);
		expect(result).toEqual({ ok: true, answer: { step: "lcd", lcd: 12 } });
	});

	test("parses a fraction from two boxes, top then bottom", () => {
		const result = parseStepAnswer("combine", ["3", "6"]);
		expect(result.ok).toBe(true);
		if (result.ok && result.answer.step === "combine") {
			expect(result.answer.result.toString()).toBe("3/6");
		}
	});

	test("parses both fractions of the matching step", () => {
		const result = parseStepAnswer("scaleNumerators", ["2", "6", "1", "6"]);
		expect(result.ok).toBe(true);
		if (result.ok && result.answer.step === "scaleNumerators") {
			expect(result.answer.scaled.map(String)).toEqual(["2/6", "1/6"]);
		}
	});

	test("parses the simplify answer", () => {
		const result = parseStepAnswer("simplify", ["1", "2"]);
		expect(result.ok && result.answer.step).toBe("simplify");
	});

	test("ignores spaces around numbers", () => {
		expect(parseStepAnswer("lcd", ["  6 "])).toEqual({
			ok: true,
			answer: { step: "lcd", lcd: 6 },
		});
	});

	test("accepts a top number of 0", () => {
		expect(parseStepAnswer("combine", ["0", "5"]).ok).toBe(true);
	});

	test.each([
		["empty box", ""],
		["only spaces", "   "],
		["letters", "abc"],
		["a decimal", "2.5"],
		["a negative", "-3"],
		["a fraction", "1/2"],
		["a huge number", "99999999"],
	])("rejects %s as not a whole number", (_label, text) => {
		const result = parseStepAnswer("lcd", [text]);
		expect(result).toMatchObject({ ok: false, problem: "notWholeNumber" });
	});

	test("rejects a bad box in any position", () => {
		expect(parseStepAnswer("combine", ["3", ""]).ok).toBe(false);
		expect(parseStepAnswer("scaleNumerators", ["2", "6", "x", "6"]).ok).toBe(
			false,
		);
	});

	test("rejects an LCD of 0", () => {
		expect(parseStepAnswer("lcd", ["0"])).toMatchObject({
			ok: false,
			problem: "notPositive",
		});
	});

	test("rejects a bottom number of 0", () => {
		expect(parseStepAnswer("combine", ["3", "0"])).toMatchObject({
			ok: false,
			problem: "zeroDenominator",
		});
		expect(parseStepAnswer("scaleNumerators", ["2", "6", "1", "0"])).toMatchObject(
			{ ok: false, problem: "zeroDenominator" },
		);
	});

	test("gives a message for every rejection", () => {
		const result = parseStepAnswer("lcd", ["abc"]);
		expect(result.ok === false && result.message.length).toBeGreaterThan(0);
	});

	test("throws when the wrong number of boxes is passed", () => {
		expect(() => parseStepAnswer("combine", ["3"])).toThrow();
		expect(() => parseStepAnswer("lcd", ["1", "2"])).toThrow();
	});
});
