import { describe, expect, test } from "vitest";
import { AnswerEntryModel } from "./AnswerEntryModel.ts";

describe("AnswerEntryModel", () => {
	test("starts with empty boxes and the first one active", () => {
		const entry = new AnswerEntryModel(2);
		expect(entry.getFields()).toEqual(["", ""]);
		expect(entry.getActiveIndex()).toBe(0);
	});

	test("rejects a box count below one", () => {
		expect(() => new AnswerEntryModel(0)).toThrow();
		expect(() => new AnswerEntryModel(-1)).toThrow();
		expect(() => new AnswerEntryModel(1.5)).toThrow();
	});

	test("typing adds digits to the active box only", () => {
		const entry = new AnswerEntryModel(2);
		entry.typeDigit("1");
		entry.typeDigit("2");
		expect(entry.getFields()).toEqual(["12", ""]);

		entry.selectField(1);
		entry.typeDigit("7");
		expect(entry.getFields()).toEqual(["12", "7"]);
		expect(entry.getActiveIndex()).toBe(1);
	});

	test("selecting a box that does not exist is ignored", () => {
		const entry = new AnswerEntryModel(2);
		entry.selectField(5);
		entry.selectField(-1);
		entry.selectField(0.5);
		expect(entry.getActiveIndex()).toBe(0);
	});

	test.each(["a", "", "12", "-", ".", " "])(
		"ignores %j because it is not a single digit",
		(text) => {
			const entry = new AnswerEntryModel(1);
			entry.typeDigit(text);
			expect(entry.getFields()).toEqual([""]);
		},
	);

	test("stops accepting digits at the longest allowed number", () => {
		const entry = new AnswerEntryModel(1);
		for (const digit of "12345678") entry.typeDigit(digit);
		expect(entry.getFields()).toEqual(["123456"]);
	});

	test("replaces a lone zero instead of building a leading zero", () => {
		const entry = new AnswerEntryModel(1);
		entry.typeDigit("0");
		entry.typeDigit("5");
		expect(entry.getFields()).toEqual(["5"]);
	});

	test("backspace removes the last digit of the active box", () => {
		const entry = new AnswerEntryModel(2);
		entry.typeDigit("1");
		entry.typeDigit("2");
		entry.selectField(1);
		entry.typeDigit("9");

		entry.backspace();
		expect(entry.getFields()).toEqual(["12", ""]);
		entry.selectField(0);
		entry.backspace();
		expect(entry.getFields()).toEqual(["1", ""]);
	});

	test("backspace on an empty box does nothing", () => {
		const entry = new AnswerEntryModel(1);
		entry.backspace();
		expect(entry.getFields()).toEqual([""]);
	});

	test("clear empties every box and returns to the first", () => {
		const entry = new AnswerEntryModel(2);
		entry.typeDigit("3");
		entry.selectField(1);
		entry.typeDigit("4");
		entry.clear();
		expect(entry.getFields()).toEqual(["", ""]);
		expect(entry.getActiveIndex()).toBe(0);
	});

	test("the returned fields cannot be used to change the entry", () => {
		const entry = new AnswerEntryModel(1);
		const fields = entry.getFields() as string[];
		fields[0] = "99";
		expect(entry.getFields()).toEqual([""]);
	});
});
