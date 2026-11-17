import Konva from "konva";
import { Button } from "../../components/Button.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import type { View } from "../../types.ts";
import type { MinigameId, ScoreEntry } from "../../models/HighScoreModel.ts";

export interface GameOverHandlers {
    onPlayAgain(): void;
    onMenu(): void;
}

export class GameOverScreenView implements View {
    private readonly group = new Konva.Group({ visible: false });
    private readonly title: Konva.Text;
    private readonly scoreText: Konva.Text;
    private readonly bestText: Konva.Text;
    private readonly leaderboardText: Konva.Text;

    constructor(handlers: GameOverHandlers) {
        const center = STAGE_WIDTH / 2;
        const makeText = (text: string, y: number, fontSize: number) => new Konva.Text({
            x: center - 260, y, width: 520, text, align: "center",
            fontFamily: "Arial", fontSize, fill: "#292929",
        });

        this.title = makeText("Game Over!", 50, 40);
        this.scoreText = makeText("Your score: 0", 112, 30);
        this.bestText = makeText("Personal best: 0", 155, 22);
        const leaderboardTitle = makeText("Top 5 scores", 215, 26);
        this.leaderboardText = makeText("No previous scores", 257, 22);
        this.leaderboardText.lineHeight(1.6);
        this.group.add(this.title, this.scoreText, this.bestText, leaderboardTitle, this.leaderboardText);

        const buttonY = STAGE_HEIGHT - 100;
        this.group.add(new Button({
            x: center - 235, y: buttonY, width: 210, height: 55,
            text: "Play Again", name: "playAgainButton", onClick: handlers.onPlayAgain,
        }).getGroup());
        this.group.add(new Button({
            x: center + 25, y: buttonY, width: 210, height: 55,
            text: "Main Menu", name: "menuButton", onClick: handlers.onMenu,
        }).getGroup());
    }

    showResults(gameId: MinigameId, score: number, personalBest: number, leaderboard: readonly ScoreEntry[]): void {
        this.title.text(gameId === "speedMode" ? "Speed Mode Complete!" : "Mastery Mode Complete!");
        this.scoreText.text(`Your score: ${score}`);
        this.bestText.text(`Personal best: ${personalBest}`);
        this.leaderboardText.text(leaderboard.length === 0
            ? "No scores yet"
            : leaderboard.map((entry, i) => `${i + 1}.  ${entry.score}`).join("\n"));
        this.group.getLayer()?.batchDraw();
    }

    show(): void { this.group.visible(true); this.group.getLayer()?.batchDraw(); }
    hide(): void { this.group.visible(false); this.group.getLayer()?.batchDraw(); }
    getGroup(): Konva.Group { return this.group; }
}
