/**
 * Identifies the two minigames that support high scores.
 */
export type MinigameId = "masteryMode" | "speedMode";

export type ScoreEntry = {
    score: number;
    timestamp: string;
};

type ScoreHistory = {
    masteryMode: ScoreEntry[];
    speedMode: ScoreEntry[];
};

const SAVEDSCORES_KEY = "highScore"; 
const SCORE_HISTORY_KEY = "minigameScoreHistory";
const MAX_LEADERBOARD_ENTRIES = 5;

// Stores the highest score achieved in each minigame.
type HighScore = {
    masteryMode: number;
    speedMode: number;
};

function defaultScores(): HighScore {
    return { masteryMode: 0, speedMode: 0 };
}

function emptyHistory(): ScoreHistory {
    return { masteryMode: [], speedMode: [] };
}

function isValidScore(score: number): boolean {
    return Number.isFinite(score) && score >= 0;
}

export class HighScoreModel {
    private highScore: HighScore;
    private history: ScoreHistory;

    constructor() {
        this.highScore = this.loadHighScore();
        this.history = this.loadHistory();
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

        const savedData = localStorage.getItem(SAVEDSCORES_KEY);
        
        if (savedData === null) {
            return defaultScores();
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
            return defaultScores();
        }

        return defaultScores();
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
        if  (!isValidScore(score)) {
            return false;
        }

        if (score > this.highScore[gameId]) {
            this.highScore[gameId] = score;
            this.saveHighScores();
            return true;
        }
        return false;
    }

    /**
     * Records a completed game, updates its personal best, and saves the
     * five highest attempts for that mode. Call this ONCE at game over.
     */
    recordScore(score: number, gameId: MinigameId): readonly ScoreEntry[] {
        if (!isValidScore(score)) {
            throw new Error("Score must be a finite, nonnegative number");
        }

        this.updateHighScore(score, gameId);
        const next = [
            ...this.history[gameId],
            { score, timestamp: new Date().toISOString() },
        ];
        next.sort((a, b) => b.score - a.score);
        this.history[gameId] = next.slice(0, MAX_LEADERBOARD_ENTRIES);
        this.saveHistory();
        return this.getLeaderboard(gameId);
    }

    /** Returns a copy of the five highest recorded attempts for one mode. */
    getLeaderboard(gameId: MinigameId): readonly ScoreEntry[] {
        return this.history[gameId].map((entry) => ({ ...entry }));
    }
    
    private loadHistory(): ScoreHistory {
        const savedData = localStorage.getItem(SCORE_HISTORY_KEY);
        if (savedData === null) return emptyHistory();

        try {
            const data: unknown = JSON.parse(savedData);
            if (typeof data !== "object" || data === null) return emptyHistory();
            const record = data as {
                masteryMode?: unknown;
                speedMode?: unknown;
            };
            const result = emptyHistory();

            for (const gameId of ["masteryMode", "speedMode"] as const) {
                const entries = record[gameId];
                if (!Array.isArray(entries)) continue;
                result[gameId] = entries
                    .filter((entry): entry is ScoreEntry =>
                        typeof entry === "object" && entry !== null &&
                        typeof entry.score === "number" &&
                        isValidScore(entry.score) &&
                        typeof entry.timestamp === "string")
                    .map((entry) => ({ score: entry.score, timestamp: entry.timestamp }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, MAX_LEADERBOARD_ENTRIES);
            }
            return result;
        } catch {
            return emptyHistory();
        }
    }

    private saveHistory(): void {
        localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(this.history));
    }
}