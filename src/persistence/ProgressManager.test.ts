import { expect, test } from 'vitest';
import { ProgressManager } from "./ProgressManager.ts";

test("getUserProgress default to 0", () => {
    const storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(0);
});

test("updateProgress stores progress correctly", () => {
    ProgressManager.updateProgress(1);
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(1);

    ProgressManager.updateProgress(0);
    storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(0);
});

test("updateProgress catch negative inputs", () => {
    ProgressManager.updateProgress(-1);
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(0);
});

test("updateProgress catch out of bounds input", () => {
    ProgressManager.updateProgress(8);
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(0);
});

test("progress remains after invalid updateProgress input", () => {
    ProgressManager.updateProgress(2);
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(2);

    ProgressManager.updateProgress(8);
    storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(2);

    ProgressManager.updateProgress(-1);
    storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(2)

    ProgressManager.updateProgress(0);
});

test("null updateProgress input", () => {
    ProgressManager.updateProgress(null);
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(0);
});

test("incorrect type of updateProgress input", () => {
    ProgressManager.updateProgress("six");
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(0);
});

test("updateProgress input is not a whole number", () => {
    ProgressManager.updateProgress(1.5);
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(1);
    
    ProgressManager.updateProgress(0);
});


test("increaseProgressTo stores progress correctly", () => {
    ProgressManager.increaseProgressTo(3);
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(3);

    ProgressManager.updateProgress(0);
});

test("increaseProgressTo does not decrease progress", () => {
    ProgressManager.increaseProgressTo(4);
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(4);

    ProgressManager.increaseProgressTo(1);
    storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(4);

    ProgressManager.updateProgress(0);
    storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(0);
});

test("increaseProgressTo out of bounds input", () => {
    ProgressManager.increaseProgressTo(10);
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(0);
});

test("null increaseProgressTo input", () => {
    ProgressManager.increaseProgressTo(null);
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(0);
});

test("incorrect type of increaseProgressTo input", () => {
    ProgressManager.updateProgress("six");
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(0);
});

test("increaseProgressTo input is not a whole number", () => {
    ProgressManager.increaseProgressTo(1.5);
    let storedVal = ProgressManager.getUserProgress();
    expect(storedVal).toBe(1);
    
    ProgressManager.updateProgress(0);
});