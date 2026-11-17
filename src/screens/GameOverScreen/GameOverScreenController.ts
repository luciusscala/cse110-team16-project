import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { HighScoreModel } from "../../models/HighScoreModel.ts";
import type { MinigameId } from "../../models/HighScoreModel.ts";
import { GameOverScreenView } from "./GameOverScreenView.ts";

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

    /** Called once when a minigame ends. */
    showResults(gameId: MinigameId, score: number): void {
        this.currentMode = gameId;
        const leaderboard = this.highScores.recordScore(score, gameId);
        
        this.view.showResults(
            gameId,
            score,
            this.highScores.getHighScore(gameId),
            leaderboard,
        );
    }

    getView(): GameOverScreenView {
        return this.view;
    }
}
