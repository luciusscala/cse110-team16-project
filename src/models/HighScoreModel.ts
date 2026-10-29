export type MinigameId = "masteryMode" | "speedMode";

type HighScores = {
    masteryMode: number;
    speedMode: number;
};

export class HighScoreModel {
    private highScores: HighScores;

    constructor() {
        this.highScores = this.loadHighScores();
    }

    getHighScore(gameId: MinigameId): number {
        return this.highScores[gameId];
    }

    loadHighScores(): HighScores { 
        return {
            masteryMode: 0,
            speedMode: 0
        };
    }

    saveHighScores(): void {

    }

    updateHighScore(): void {

    }

}