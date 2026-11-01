import { NUM_LVLS } from "../constants.ts";

const PROGRESS_KEY = "campaignProgress";
const INVALID_LVL_MSG = "Invalid level input";

export class ProgressManager {

    /**
     * Gets the number of levels the user has completed from local storage. 
     * 
     * @return a number representing the number of levels the user has completed
     */
    static getUserProgress(): number {
        const saved_string = localStorage.getItem(PROGRESS_KEY);
    
        if (saved_string !== null)
        {
            const loadedData: number = JSON.parse(saved_string);
            return loadedData;
        }
        else {
            // If save data is invalid, default to no progress
            return 0;
        }
    }

    /**
     * Updates the user's progress in local storage based on a given number of levels. 
     * 
     * @param lvlsCompleted: a number representing the number of levels the user has completed
     */
    static updateProgress(lvlsCompleted: number): void {
        // Case for if number of levels entered is invalid
        if (lvlsCompleted < 0 || lvlsCompleted > NUM_LVLS)
        {
            console.log(INVALID_LVL_MSG);
            return;
        }

        const jsonString = JSON.stringify(lvlsCompleted);
        localStorage.setItem(PROGRESS_KEY, jsonString);
    }

    /**
     * Function which only updates progress if it is greater than current progress.
     * Unless deleting progress, use this method instead of updateProgress to ensure
     * progress is not lost.
     * 
     * @param lvlsCompleted: a number representing the number of levels the user has completed
     */
    static increaseProgressTo(lvlsCompleted: number): void {
        if (lvlsCompleted > getUserProgress())
        {
            updateProgress(lvlsCompleted);
        }
    }
}