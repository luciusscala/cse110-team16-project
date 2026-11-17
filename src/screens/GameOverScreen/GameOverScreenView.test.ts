// @vitest-environment jsdom
import "vitest-canvas-mock";
import Konva from "konva";
import { describe, expect, test, vi } from "vitest";
import { GameOverScreenView } from "./GameOverScreenView.ts";
import type { ScoreEntry } from "../../models/HighScoreModel.ts";

function makeView() {
    const onPlayAgain = vi.fn();
    const onMenu = vi.fn();
    const view = new GameOverScreenView({ onPlayAgain, onMenu });
    return { view, onPlayAgain, onMenu };
}

function displayedText(view: GameOverScreenView): string[] {
    return (view.getGroup().find("Text") as Konva.Text[])
        .map((node) => node.text());
}

const scores: ScoreEntry[] = [
    { score: 100, timestamp: "2026-11-16T10:00:00.000Z" },
    { score: 80, timestamp: "2026-11-15T10:00:00.000Z" },
    { score: 60, timestamp: "2026-11-14T10:00:00.000Z" },
];

describe("GameOverScreenView", () => {
    test("starts hidden", () => {
        const { view } = makeView();
        expect(view.getGroup().visible()).toBe(false);
    });

    test("shows Speed Mode's score, personal best, and leaderboard", () => {
        const { view } = makeView();
        view.showResults("speedMode", 80, 100, scores);

        expect(displayedText(view)).toContain("Speed Mode Complete!");
        expect(displayedText(view)).toContain("Your score: 80");
        expect(displayedText(view)).toContain("Personal best: 100");
        expect(displayedText(view)).toContain("1.  100\n2.  80\n3.  60");
    });

    test("uses the Mastery Mode heading", () => {
        const { view } = makeView();
        view.showResults("masteryMode", 4, 8, scores);
        expect(displayedText(view)).toContain("Mastery Mode Complete!");
        expect(displayedText(view)).toContain("Your score: 4");
    });

    test("shows a helpful message when there are no leaderboard entries", () => {
        const { view } = makeView();
        view.showResults("speedMode", 0, 0, []);
        expect(displayedText(view)).toContain("No scores yet");
    });

    test("replaces old results when a new game finishes", () => {
        const { view } = makeView();
        view.showResults("speedMode", 10, 10, scores);
        view.showResults("masteryMode", 3, 5, []);

        const text = displayedText(view);
        expect(text).toContain("Mastery Mode Complete!");
        expect(text).toContain("Your score: 3");
        expect(text).toContain("Personal best: 5");
        expect(text).toContain("No scores yet");
        expect(text).not.toContain("Speed Mode Complete!");
    });

    test("show and hide change the group's visibility", () => {
        const { view } = makeView();
        view.show();
        expect(view.getGroup().visible()).toBe(true);
        view.hide();
        expect(view.getGroup().visible()).toBe(false);
    });

    test("Play Again button calls its handler", () => {
        const { view, onPlayAgain, onMenu } = makeView();
        const button = view.getGroup().findOne(".playAgainButton");
        expect(button).not.toBeNull();
        button!.fire("click");
        expect(onPlayAgain).toHaveBeenCalledOnce();
        expect(onMenu).not.toHaveBeenCalled();
    });

    test("Main Menu button calls its handler", () => {
        const { view, onPlayAgain, onMenu } = makeView();
        const button = view.getGroup().findOne(".menuButton");
        expect(button).not.toBeNull();
        button!.fire("click");
        expect(onMenu).toHaveBeenCalledOnce();
        expect(onPlayAgain).not.toHaveBeenCalled();
    });
});
