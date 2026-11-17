/**
 * Identifies the two minigames that support high scores.
 */
export type MinigameId = "masteryMode" | "speedMode";

const SAVEDSCORES_KEY = "highScore"; 

// Stores the highest score achieved in each minigame.
type HighScore = {
    masteryMode: number;
    speedMode: number;
};

export class HighScoreModel {
    private highScore: HighScore;

    constructor() {
        this.highScore = this.loadHighScore();
    }

    /** Gets the highest score for the specified minigame.
     * 
     * @param gameId - The minigame to retrieve the score for.
     * @returns The saved high score for the minigame.
     */
    getHighScore(gameId: MinigameId): number {
        return this.highScore[gameId];
    }

    /**
     * Loads previously saved high scores from local storage.
     *
     * @returns Either the saved high scores, or default scores
     * if no data exists or the JSON cannot be parsed.
     */
    private loadHighScore(): HighScore {
        const defaultScores: HighScore = {
            masteryMode: 0,
            speedMode: 0
        };

        const savedData = localStorage.getItem(SAVEDSCORES_KEY);
        
        if (savedData === null) {
            return defaultScores;
        }

        try {
            const scores: unknown = JSON.parse(savedData);

            if (
                typeof scores === "object" &&
                scores !== null &&
                "masteryMode" in scores &&
                "speedMode" in scores &&
                typeof scores.masteryMode === "number" &&
                Number.isFinite(scores.masteryMode) &&
                scores.masteryMode >= 0 &&
                typeof scores.speedMode === "number" &&
                Number.isFinite(scores.speedMode) &&
                scores.speedMode >= 0
            ) {
                return {
                    masteryMode: scores.masteryMode,
                    speedMode: scores.speedMode
                };
            }
        } catch {
            return defaultScores;
        }

        return defaultScores;
    }

    /**
     * Loads previously saved high scores from local storage.
     *
     * @returns The saved high scores, or default scores
     * if no data exists or the JSON cannot be parsed.
     */
    private saveHighScores(): void {
        const jsonString = JSON.stringify(this.highScore);
        localStorage.setItem(SAVEDSCORES_KEY, jsonString);
    }


    /**
     * Updates the high score for a minigame, if new score
     * is greater than existing high score.
     *
     * @param score - The new score.
     * @param gameId - The minigame to update.
     * @returns True if a new high score was saved,
     * false otherwise.
     */
    updateHighScore(score: number, gameId: MinigameId): boolean {
        if  (!Number.isFinite(score) || score < 0) {
            return false;
        }

        if (score > this.highScore[gameId]) {
            this.highScore[gameId] = score;
            this.saveHighScores();
            return true;
        }
        return false;
    }
}