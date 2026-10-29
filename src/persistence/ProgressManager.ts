import { NUM_LVLS } from "../../constants.ts";

class ProgressManager {

    // Use local storage to obtain the number of levels the user has completed
    static getUserProgress(): number {
        const saved_string = localStorage.getItem("campaignProgress");

        if (saved_string != null)
        {
            const loadedData: number = JSON.parse(saved_string);
            console.log(loadedData);
        }
    }

    // Update the number of levels the user has completed in local storage
    static updateProgress(lvlsCompleted: number): void {
        if (lvlsCompleted < 0 || lvlsCompleted > NUM_LVLS)
        {
            console.log("Invalid level input");
            return;
        }

        const jsonString = JSON.stringify(lvlsCompleted);
        localStorage.setItem("campaignProgress", jsonString);
    }
}