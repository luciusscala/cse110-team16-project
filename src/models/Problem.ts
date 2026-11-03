import { Fraction } from "./Fraction.ts";

export class Problem {
    
    constructor(
        private level: number,
        private fraction1: Fraction,
        private fraction2: Fraction,
    ){}
    
    getLevel(): number{
        return this.level;
    }
    
}