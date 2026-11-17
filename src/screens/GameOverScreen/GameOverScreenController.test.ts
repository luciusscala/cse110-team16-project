// @vitest-environment jsdom
import "vitest-canvas-mock";
import Konva from "konva";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { ScreenSwitcher } from "../../types.ts";
import { HighScoreModel } from "../../models/HighScoreModel.ts";
import { GameOverScreenController } from "./GameOverScreenController.ts";

function makeController() {
    const switchToScreen = vi.fn();
    // The real ScreenSwitcher uses this method; the mock records navigation.
    const screenSwitcher = { switchToScreen } as unknown as ScreenSwitcher;
    const controller = new GameOverScreenController(screenSwitcher);
    return { controller, switchToScreen };
}

function displayedText(controller: GameOverScreenController): string[] {
    return (controller.getView().getGroup().find("Text") as Konva.Text[])
        .map((node) => node.text());
}

describe("GameOverScreenController", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test("starts with a hidden view", () => {
        const { controller } = makeController();
        expect(controller.getView().getGroup().visible()).toBe(false);
    });

    test("records Speed Mode's score and displays the personal best", () => {
        const { controller } = makeController();
        controller.showResults("speedMode", 12);

        const data = new HighScoreModel();
        expect(data.getHighScore("speedMode")).toBe(12);
        expect(data.getLeaderboard("speedMode").map((entry) => entry.score))
            .toEqual([12]);
        expect(displayedText(controller)).toContain("Your score: 12");
        expect(displayedText(controller)).toContain("Personal best: 12");
    });

    test("keeps the higher personal best and ranks multiple attempts", () => {
        const { controller } = makeController();
        controller.showResults("speedMode", 10);
        controller.showResults("speedMode", 4);
        controller.showResults("speedMode", 8);

        const data = new HighScoreModel();
        expect(data.getHighScore("speedMode")).toBe(10);
        expect(data.getLeaderboard("speedMode").map((entry) => entry.score))
            .toEqual([10, 8, 4]);
        expect(displayedText(controller)).toContain("Your score: 8");
        expect(displayedText(controller)).toContain("Personal best: 10");
        expect(displayedText(controller)).toContain("1.  10\n2.  8\n3.  4");
    });

    test("keeps Mastery and Speed Mode scores separate", () => {
        const { controller } = makeController();
        controller.showResults("speedMode", 20);
        controller.showResults("masteryMode", 5);

        const data = new HighScoreModel();
        expect(data.getHighScore("speedMode")).toBe(20);
        expect(data.getHighScore("masteryMode")).toBe(5);
        expect(data.getLeaderboard("speedMode")).toHaveLength(1);
        expect(data.getLeaderboard("masteryMode")).toHaveLength(1);
        expect(displayedText(controller)).toContain("Mastery Mode Complete!");
    });

    test("Play Again returns to Speed Mode after Speed results", () => {
        const { controller, switchToScreen } = makeController();
        controller.showResults("speedMode", 7);
        controller.getView().getGroup().findOne(".playAgainButton")!.fire("click");
        expect(switchToScreen).toHaveBeenCalledWith({ type: "speed" });
    });

    test("Play Again returns to Mastery Mode after Mastery results", () => {
        const { controller, switchToScreen } = makeController();
        controller.showResults("masteryMode", 7);
        controller.getView().getGroup().findOne(".playAgainButton")!.fire("click");
        expect(switchToScreen).toHaveBeenCalledWith({ type: "mastery" });
    });

    test("Main Menu returns to the menu", () => {
        const { controller, switchToScreen } = makeController();
        controller.showResults("speedMode", 7);
        controller.getView().getGroup().findOne(".menuButton")!.fire("click");
        expect(switchToScreen).toHaveBeenCalledWith({ type: "menu" });
    });

    test("rejects an invalid final score instead of saving it", () => {
        const { controller } = makeController();
        expect(() => controller.showResults("speedMode", -1)).toThrow();
        const data = new HighScoreModel();
        expect(data.getLeaderboard("speedMode")).toEqual([]);
    });
});
