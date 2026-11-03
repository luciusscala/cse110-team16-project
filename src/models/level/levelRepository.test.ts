import { describe, expect, test } from "vitest";
import { LEVELS } from "./levelData.ts";
import { getAllLevels, getLevelById } from "./levelRepository.ts";
import type { Question } from "./LevelTypes.ts";

function rawAnswer(question: Question) {
  return question.operation === "addition"
    ? question.frac1.add(question.frac2)
    : question.frac1.subtract(question.frac2);
}

describe("level data", () => {
  test("every level has a unique id", () => {
    const ids = LEVELS.map((level) => level.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every level has a difficulty value, and difficulty increases level by level", () => {
    const difficulties = getAllLevels().map((level) => level.difficulty);
    for (const difficulty of difficulties) {
      expect(Number.isFinite(difficulty)).toBe(true);
    }
    for (let i = 1; i < difficulties.length; i++) {
      expect(difficulties[i]).toBeGreaterThan(difficulties[i - 1]);
    }
  });

  test("every level has a name, an operation and at least one question", () => {
    for (const level of LEVELS) {
      expect(level.displayName.trim()).not.toBe("");
      expect(["addition", "subtraction", "mixed"]).toContain(level.operation);
      expect(level.questions.length).toBeGreaterThan(0);
    }
  });

  test("every question belongs to the level that contains it", () => {
    for (const level of LEVELS) {
      for (const question of level.questions) {
        expect(question.levelId).toBe(level.id);
      }
    }
  });

  test.each(LEVELS.flatMap((level) => level.questions))(
    "question $id stores the correct answer in lowest terms",
    (question) => {
      expect(question.correctAnswer.isEqual(rawAnswer(question))).toBe(true);
      expect(question.correctAnswer.isSimplified()).toBe(true);
    },
  );
});

describe("getLevelById", () => {
  test.each(LEVELS.map((level) => level.id))(
    "returns level %i when asked for it",
    (id) => {
      const level = getLevelById(id);
      expect(level).toBeDefined();
      expect(level?.id).toBe(id);
    },
  );

  test.each([0, -1, 99, 1.5, Number.NaN])(
    "returns undefined for invalid id %s without crashing",
    (id) => {
      expect(() => getLevelById(id)).not.toThrow();
      expect(getLevelById(id)).toBeUndefined();
    },
  );
});
