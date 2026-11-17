import { Fraction } from "./Fraction.ts";
import { Problem } from "./Problem.ts";
import { ProblemType } from "./ProblemType.ts";

export class ProblemFactory {

    createProblem(type: ProblemType, level: number): Problem {
        switch(level){
            case 1:
                return this.createLevel2Problem(type);
            case 2:
                return this.createLevel2Problem(type);
            case 3:
                return this.createLevel4Problem(type);
            case 4:
                return this.createLevel4Problem(type);
            case 5:
                return this.createLevel5Problem(type);
            case 6:
                return this.createLevel6Problem(type);
            default:
                throw new Error("Invalid Level Type");
        }
    }

    /**
     * Creates problems of level 1-2 in which the fractions have
     * the same denominators.
     */
    createLevel2Problem(type: ProblemType): Problem {
        const denominator = this.getRandomInt(6, 15);
        const fraction1 = new Fraction(this.getRandomInt(1, denominator - 1), denominator);
        const fraction2 = new Fraction(this.getRandomInt(1, denominator - 1), denominator);
        return new Problem(2, fraction1, fraction2, type);
    }

    /**
     * Creates problems of level 3-4 in which the fractions have
     * denominators which are multiples.
     */
    createLevel4Problem(type: ProblemType): Problem {
        const denominator = this.getRandomInt(6, 15);
        const multiplier1 = this.getRandomInt(1, 3);
        const multiplier2 = this.getRandomInt(2, 5);
        const fraction1 = new Fraction(this.getRandomInt(1, denominator - 1)), 
                            (denominator * multiplier1);
        const fraction2 = new Fraction(this.getRandomInt(1, denominator - 1), 
                            (denominator * multiplier2));
        return new Problem(4, fraction1, fraction2, type);
    }

    /**
     * Creates problems of level 5 in which the fractions have
     * denominators where you need to find the LCD but have lower
     * denominators. 
     */
    createLevel5Problem(type: ProblemType): Problem {
        const denominator1 = this.getRandomInt(6, 15);
        const denominator2 = this.getRandomInt(6, 15);
        const fraction1 = new Fraction(this.getRandomInt(1, denominator1 - 1), denominator1);
        const fraction2 = new Fraction(this.getRandomInt(1, denominator2 - 1), denominator2);
        return new Problem(5, fraction1, fraction2, type);
    }

    /**
     * Creates problems of level 6 in which the fractions have
     * denominators where you need to find the LCD but have higher
     * denominators. 
     */
    createLevel6Problem(type: ProblemType): Problem {
        const denominator1 = this.getRandomInt(15, 30);
        const denominator2 = this.getRandomInt(15, 30);
        const fraction1 = new Fraction(this.getRandomInt(5, denominator1 - 1), denominator1);
        const fraction2 = new Fraction(this.getRandomInt(5, denominator2 - 1), denominator2);
        return new Problem(6, fraction1, fraction2, type);
    }

    /**
     * Helper to generate random integer values in a specific range
     * of values. 
     */
    getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}