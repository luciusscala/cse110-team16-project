import { beforeEach, describe, expect, it } from "vitest";
import { HighScoreModel } from "./HighScoreModel.ts";

const STORAGE_KEY = "highScore";

describe("HighScoreModel", () => {
    beforeEach(() => {
        // Each test starts with an empty browser storage.
        localStorage.clear();
    });

    it("starts both minigames with a high score of zero", () => {
        const model = new HighScoreModel();

        expect(model.getHighScore("masteryMode")).toBe(0);
        expect(model.getHighScore("speedMode")).toBe(0);
    });

    it("saves the higher score for Mastery Mode", () => {
        const model = new HighScoreModel();

        expect(model.updateHighScore(100, "masteryMode")).toBe(true);
        expect(model.getHighScore("masteryMode")).toBe(100);
    });

    it("does not replace a record with a lower or equal score", () => {
        const model = new HighScoreModel();
        model.updateHighScore(100, "masteryMode");

        expect(model.updateHighScore(50, "masteryMode")).toBe(false);
        expect(model.updateHighScore(100, "masteryMode")).toBe(false);
        expect(model.getHighScore("masteryMode")).toBe(100);
    });

    it("Keep the two minigame records separate from each other", () => {
        const model = new HighScoreModel();
        model.updateHighScore(120, "masteryMode");
        model.updateHighScore(80, "speedMode");

        expect(model.getHighScore("masteryMode")).toBe(120);
        expect(model.getHighScore("speedMode")).toBe(80);
    });

    it("persists scores in localStorage and reloads them in a new instance", () => {
        const firstModel = new HighScoreModel();
        firstModel.updateHighScore(120, "masteryMode");
        firstModel.updateHighScore(80, "speedMode");

        expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
            masteryMode: 120,
            speedMode: 80,
        });

        const secondModel = new HighScoreModel();
        expect(secondModel.getHighScore("masteryMode")).toBe(120);
        expect(secondModel.getHighScore("speedMode")).toBe(80);
    });

    it("rejects negative, NaN, and infinite scores", () => {
        const model = new HighScoreModel();

        expect(model.updateHighScore(-5, "masteryMode")).toBe(false);
        expect(model.updateHighScore(NaN, "masteryMode")).toBe(false);
        expect(model.updateHighScore(Infinity, "speedMode")).toBe(false);
        expect(model.getHighScore("masteryMode")).toBe(0);
        expect(model.getHighScore("speedMode")).toBe(0);
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("defaults to zero if stored JSON cannot be parsed", () => {
        localStorage.setItem(STORAGE_KEY, "not valid JSON");

        const model = new HighScoreModel();
        expect(model.getHighScore("masteryMode")).toBe(0);
        expect(model.getHighScore("speedMode")).toBe(0);
    });
});