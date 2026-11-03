import { Problem } from "./Problem.ts";

export class ProblemModel {
    constructor(
        private currentProblem: Problem
    ){}

    getCurrentProblem(): Problem {
        return this.currentProblem;
    }
}