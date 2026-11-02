import { expect, test } from 'vitest';
import { ProgressManager } from "./ProgressManager.ts";

test("getUserProgress default to 0", () => {
    const storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(0);
});

test("updateProgress stores progress correctly", () => {
    ProgressManager.updateProgress(1);
    const storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(1);
});