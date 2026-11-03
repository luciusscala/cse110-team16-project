import { describe, expect, test, vi } from "vitest";
import { HintController } from "./HintController.ts";
import { HintModel } from "../../models/HintModel.ts";
import { Problem } from "../../models/Problem.ts";
import { Fraction } from "../../models/Fraction.ts";

function createProblem(level: number): Problem {
    return new Problem(
        level, 
        new Fraction(1, 1),
        new Fraction(1, 1)
    );
}

describe("HintController", () => {

    test("auto displays a general hint", () => {
        const problem = createProblem(1);

        const mockProblemModel = {
            getCurrentProblem: vi.fn(() => problem)
        };

        const mockHintModel = {
            addIncorrectAttempt: vi.fn(),
            shouldShowGeneralHint: vi.fn(() => true),
            shouldShowSpecificHint: vi.fn(() => false),
            generateHint: vi.fn(() => "General Hint")
        };

        const mockHintView = {
            displayHint: vi.fn()
        };

        const controller = new HintController(
            mockProblemModel as any,
            mockHintModel as any,
            mockHintView as any
        );

        controller.handleIncorrectAnswer();

        expect(mockHintModel.addIncorrectAttempt).toHaveBeenCalledOnce();
        expect(mockProblemModel.getCurrentProblem).toHaveBeenCalledOnce();
        expect(mockHintModel.generateHint).toHaveBeenCalledWith(problem);
        expect(mockHintView.displayHint).toHaveBeenCalledWith("General Hint");
    });

    test("auto displays a specific hint", () => {
        const problem = createProblem(1);

        const mockProblemModel = {
            getCurrentProblem: vi.fn(() => problem)
        };

        const mockHintModel = {
            addIncorrectAttempt: vi.fn(),
            shouldShowGeneralHint: vi.fn(() => false),
            shouldShowSpecificHint: vi.fn(() => true),
            generateHint: vi.fn(() => "Specific Hint")
        };

        const mockHintView = {
            displayHint: vi.fn()
        };

        const controller = new HintController(
            mockProblemModel as any,
            mockHintModel as any,
            mockHintView as any
        );

        controller.handleIncorrectAnswer();

        expect(mockHintModel.addIncorrectAttempt).toHaveBeenCalledOnce();
        expect(mockProblemModel.getCurrentProblem).toHaveBeenCalledOnce();
        expect(mockHintModel.generateHint).toHaveBeenCalledWith(problem);
        expect(mockHintView.displayHint).toHaveBeenCalledWith("Specific Hint");
    });

    test("displays hint on request", () => {
        const problem = createProblem(1);

        const mockProblemModel = {
            getCurrentProblem: vi.fn(() => problem)
        };

        const mockHintModel = {
            generateHint: vi.fn(() => "Hint")
        };

        const mockHintView = {
            displayHint: vi.fn()
        };

        const controller = new HintController(
            mockProblemModel as any,
            mockHintModel as any,
            mockHintView as any
        );

        controller.handleHintRequest();

        expect(mockProblemModel.getCurrentProblem).toHaveBeenCalled();
        expect(mockHintModel.generateHint).toHaveBeenCalledWith(problem);
        expect(mockHintView.displayHint).toHaveBeenCalledWith("Hint");
    });

});
