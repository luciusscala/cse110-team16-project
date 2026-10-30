export type MinigameId = "masteryMode" | "speedMode";

const SAVEDSCORES_KEY = "highScore"; 


type HighScore = {
    masteryMode: number;
    speedMode: number;
};

export class HighScoreModel {
    private highScore: HighScore;

    constructor() {
        this.highScore = this.loadHighScore();
    }

    getHighScore(gameId: MinigameId): number {
        return this.highScore[gameId];
    }

    private loadHighScore(): HighScore {
        const savedData = localStorage.getItem(SAVEDSCORES_KEY);
        
        if (savedData === null) {
            return {
            masteryMode: 0,
            speedMode: 0
            };
        }

        try {
            return JSON.parse(savedData) as HighScore;
        } catch {
            return {
                masteryMode: 0,
                speedMode: 0
            };
        }
    }

    private saveHighScores(): void {
        const jsonString = JSON.stringify(this.highScore);
        localStorage.setItem(SAVEDSCORES_KEY, jsonString);
    }

    updateHighScore(score: number, gameId: MinigameId): boolean {
        if  (!Number.isFinite(score) || score < 0) {
            return false;
        }

        else if (score > this.highScore[gameId]) {
            this.highScore[gameId] = score;
            this.saveHighScores();
            return true;
        }
        return false;
    }

}