import { describe, expect, test } from "vitest";
import { HintModel } from "./HintModel.ts";
import { Problem } from "./Problem.ts";
import { Fraction } from "./Fraction.ts";

function createProblem(level: number): Problem {
    return new Problem(
        level, 
        new Fraction(1, 1),
        new Fraction(1, 1)
    );
}

describe("check auto display of hints from incorrect attempts", () => {
    test("increments incorrect attempts", () => {
        const hintModel = new HintModel();
        hintModel.addIncorrectAttempt();

        expect(hintModel.shouldShowGeneralHint()).toBe(false);
    });

    test("auto displays general hint after 3 incorrect attempts", () => {
        const hintModel = new HintModel();
        hintModel.addIncorrectAttempt();
        hintModel.addIncorrectAttempt();
        hintModel.addIncorrectAttempt();

        expect(hintModel.shouldShowGeneralHint()).toBe(true);
    });

    test("auto displays specific hint after 5 incorrect attempts", () => {
        const hintModel = new HintModel();
        hintModel.addIncorrectAttempt();
        hintModel.addIncorrectAttempt();
        hintModel.addIncorrectAttempt();
        hintModel.addIncorrectAttempt();
        hintModel.addIncorrectAttempt();

        expect(hintModel.shouldShowSpecificHint()).toBe(true);
    });

    test("reset incorrect attempts", () => {
        const hintModel = new HintModel();
        hintModel.addIncorrectAttempt();
        hintModel.addIncorrectAttempt();
        hintModel.addIncorrectAttempt();
        hintModel.reset();

        expect(hintModel.shouldShowGeneralHint()).toBe(false);
        expect(hintModel.getIncorrectAttempts()).toBe(0);
    });
});


describe("hint requests", () => {
    test("general hint first request", () => {
        const problem = createProblem(1);
        const hintModel = new HintModel();
        const hint = hintModel.generateHint(problem);

        expect(hint).toBe(hintModel.generateGeneralHint(problem));
    });

    test("specific hint second request", () => {
        const problem = createProblem(1);
        const hintModel = new HintModel();
        hintModel.generateHint(problem);
        const secondHint = hintModel.generateHint(problem);

        expect(secondHint).toBe(hintModel.generateSpecificHint(problem));
    });

    test("specific hint first request after auto hint", () => {
        const problem = createProblem(1);
        const hintModel = new HintModel();
        hintModel.addIncorrectAttempt();
        hintModel.addIncorrectAttempt();
        hintModel.addIncorrectAttempt();
        hintModel.generateHint(problem);
        const secondHint = hintModel.generateHint(problem);

        expect(secondHint).toBe(hintModel.generateSpecificHint(problem));
    });
});


describe("check general hint level generation", () => {
    test("generates a level 1 general hint", () => {
        const problem = createProblem(1);
        const hintModel = new HintModel();
        const hint = hintModel.generateGeneralHint(problem);

        expect(hint).toBe("Remember that pizza slices of the same size don't " +
                "need to be resized before adding. Keep the sizes fixed for " +
                "your final pizza portion.");
    });

    test("generates a level 2 general hint", () => {
        const problem = createProblem(2);
        const hintModel = new HintModel();
        const hint = hintModel.generateGeneralHint(problem);

        expect(hint).toBe("Is there an simpler way to express your pizza portion? " +
                "Try increasing the size of the pizza slices by reducing the " +
                "number of overall slices.");
    });

    test("generates a level 3 general hint", () => {
        const problem = createProblem(3);
        const hintModel = new HintModel();
        const hint = hintModel.generateGeneralHint(problem);

        expect(hint).toBe("Remember pizza slices must be the same size in order " +
                "to be added together. Try finding the Least Common Denominator " +
                "(LCD) of 'F1' and 'F2'."); 
    });

    test("generates a level 4 general hint", () => {
        const problem = createProblem(4);
        const hintModel = new HintModel();
        const hint = hintModel.generateGeneralHint(problem);

        expect(hint).toBe("Can the pizza slices be combined directly? Are the " +
                "slice sizes the same or do they need to be resized first?");
    });

    test("generates a level 5 general hint", () => {
        const problem = createProblem(5);
        const hintModel = new HintModel();
        const hint = hintModel.generateGeneralHint(problem);

        expect(hint).toBe("Remember pizza slices must be the same size in order " +
                "to be added together. Are there any common factors that each " +
                "pizza slice size can be multiplied by to reach the same pizza " +
                "size?");
    });

    test("generates a level 6 general hint", () => {
        const problem = createProblem(6);
        const hintModel = new HintModel();
        const hint = hintModel.generateGeneralHint(problem);

        expect(hint).toBe("Remember pizza slices must be the same size in order " +
                "to be added together. And remember to simplify your final " +
                "pizza portion into the biggest slice possible!");
    });

    test("generates a no level general hint", () => {
        const problem = createProblem(7);
        const hintModel = new HintModel();
        const hint = hintModel.generateGeneralHint(problem);

        expect(hint).toBe("No hint available.");
    });
});



describe("check specific hint level generation", () => {
    test("generates a level 1 specific hint", () => {
        const problem = createProblem(1);
        const hintModel = new HintModel();
        const hint = hintModel.generateSpecificHint(problem);

        expect(hint).toBe("Try adding the number of pizza slices together, " + 
                "'N1' and 'N2'. Did you remember to keep the slice size " +
                "fixed?");
    });

    test("generates a level 2 specific hint", () => {
        const problem = createProblem(2);
        const hintModel = new HintModel();
        const hint = hintModel.generateSpecificHint(problem);

        expect(hint).toBe("Do 'AN' and 'AD' have a common multiple that we " +
                "can divide by?");
    });

    test("generates a level 3 specific hint", () => {
        const problem = createProblem(3);
        const hintModel = new HintModel();
        const hint = hintModel.generateSpecificHint(problem);

        expect(hint).toBe("Can 'D1' be multiplied by a number to get 'D2'? " +
                "Remember to combine your final pizza portion into the " +
                "biggest slice size possible!");
    });

    test("generates a level 4 specific hint", () => {
        const problem = createProblem(4);
        const hintModel = new HintModel();
        const hint = hintModel.generateSpecificHint(problem);

        expect(hint).toBe("Try multiplying the larger pizza size by 'D2/D1' to " +
                "make a smaller pizza slice size. Or try simplifying by dividing " +
                "out any of the common factors both pizza slice sizes have.");
    });

    test("generates a level 5 specific hint", () => {
        const problem = createProblem(5);
        const hintModel = new HintModel();
        const hint = hintModel.generateSpecificHint(problem);

        expect(hint).toBe("Try multiplying 'D1' and 'D2' to get the new pizza " +
                "slice size. But remember that there could be a simpler pizza " +
                "size that works as well.");
    });

    test("generates a level 6 specific hint", () => {
        const problem = createProblem(6);
        const hintModel = new HintModel();
        const hint = hintModel.generateSpecificHint(problem);

        expect(hint).toBe("Find the Least Common Multiple (LCM) between the " +
                "pizza slice sizes. What number is needed to get each pizza " +
                "slice size to that same shared size?");
    });

    test("generates a no level specific hint", () => {
        const problem = createProblem(7);
        const hintModel = new HintModel();
        const hint = hintModel.generateSpecificHint(problem);

        expect(hint).toBe("No hint available.");
    });
});