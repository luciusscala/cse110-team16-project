import { NUM_LVLS } from "../constants.ts";

const PROGRESS_KEY = "campaignProgress";
const INVALID_LVL_MSG = "Invalid level input";

export class ProgressManager {

    // Use local storage to obtain the number of levels the user has completed
    static getUserProgress(): number {
        const saved_string = localStorage.getItem(PROGRESS_KEY);
    
        if (saved_string !== null)
        {
            const loadedData: number = JSON.parse(saved_string);
            console.log(loadedData);
        }
        else {
            console.log(0);
            return 0;
        }
    }

    // Update the number of levels the user has completed in local storage
    static updateProgress(lvlsCompleted: number): void {
        if (lvlsCompleted < 0 || lvlsCompleted > NUM_LVLS)
        {
            console.log(INVALID_LVL_MSG);
            return;
        }

        const jsonString = JSON.stringify(lvlsCompleted);
        localStorage.setItem(PROGRESS_KEY, jsonString);
    }
}