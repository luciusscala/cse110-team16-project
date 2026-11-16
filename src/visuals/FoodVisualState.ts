import type { Fraction } from "../models/Fraction.ts";
import type { Question } from "../models/level/LevelTypes.ts";
import type { ExpectedSolution } from "../guided/GuidedTypes.ts";

export type BakeryFood = "pizza" | "cookie" | "cake";
export type VisualPhase = "original" | "equivalent" | "combined" | "simplified";

export interface FoodTile {
    readonly label: string;
    readonly fraction: Fraction;
}

/** Returns only information appropriate to the step already reached. */
export function getFoodTiles(
    question: Question,
    phase: VisualPhase,
    solution?: ExpectedSolution,
): readonly FoodTile[] {
    if (phase === "original") {
        return [
            { label: "First amount", fraction: question.frac1 },
            { label: question.operation === "addition" 
                                            ? "Add" 
                                            : "Take away",
                                            fraction: question.frac2 
            },
        ];
    }
    
    // Make sure calculated solution is provided
    if (!solution) throw new Error("A checked solution is required for later steps");
    
    if (phase === "equivalent") {
        return [
            { label: "Same-sized pieces",
              fraction: solution.scaled[0] },
            { label: "Same-sized pieces",
              fraction: solution.scaled[1] },
        ];
    }
    
    if (phase === "combined") {
        return [{ label: "Combined amount", fraction: solution.combined }];
    }
    
    return [{ label: "Simplified amount", fraction: solution.simplified }];
}
