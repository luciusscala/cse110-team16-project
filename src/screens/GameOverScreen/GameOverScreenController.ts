import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { HighScoreModel } from "../../models/HighScoreModel.ts";
import type { MinigameId } from "../../models/HighScoreModel.ts";
import { GameOverScreenView } from "./GameOverScreenView.ts";
import type { MasterySummary } from "../MasteryScreen/MasteryScreenViewPort.ts";

export class GameOverScreenController extends ScreenController {
    private readonly highScores = new HighScoreModel();
    private readonly view: GameOverScreenView;
    private readonly screenSwitcher: ScreenSwitcher;
    private currentMode: MinigameId = "speedMode";

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        
        this.view = new GameOverScreenView({
            onPlayAgain: () => this.screenSwitcher.switchToScreen({
                type: this.currentMode === "speedMode" ? "speed" : "mastery",
            }),
            onMenu: () => this.screenSwitcher.switchToScreen({ type: "menu" }),
        });
    }

    /**
     * Called once when a minigame ends. A Mastery game ended before any answer
     * (Exit at once) is shown but not recorded, so it can't fill the leaderboard with zeros.
     */
    showResults(gameId: MinigameId, score: number, summary?: MasterySummary): void {
        this.currentMode = gameId;
        const answered = summary === undefined || summary.correctCount + summary.incorrectCount > 0;
        const leaderboard = answered
            ? this.highScores.recordScore(score, gameId)
            : this.highScores.getLeaderboard(gameId);
        
        this.view.showResults(
            gameId,
            score,
            this.highScores.getHighScore(gameId),
            leaderboard,
            summary,
        );
    }

    getView(): GameOverScreenView {
        return this.view;
    }
}
