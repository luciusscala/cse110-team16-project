import { Fraction } from "./Fraction.ts";
import { ProblemType } from "./ProblemType.ts";

export class Problem {
    private answer: Fraction;

    constructor(
        private level: number,
        private fraction1: Fraction,
        private fraction2: Fraction,
        private operator: ProblemType
    ){
        this.answer = this.computeAnswer();
    }
    
    getLevel(): number{
        return this.level;
    }

    getFrac1(): Fraction{
        return this.fraction1;
    }

    getFrac2(): Fraction{
        return this.fraction2;
    }

    getAnswer(): Fraction{
        return this.answer;
    }

    getOperator(): ProblemType{
        return this.operator;
    }

    /**
     * Generates the correct answer to the given problem.
     */
    computeAnswer(): Fraction{
        if(this.operator === ProblemType.ADDITION){
            return this.fraction1.add(this.fraction2);
        }
        else if(this.operator === ProblemType.SUBTRACTION){
            if(this.fraction1.isLarger(this.fraction2)){
                return this.fraction1.subtract(this.fraction2).simplify();
            }
            return this.fraction2.subtract(this.fraction1).simplify();
        }
        throw new Error("Invalid Operator Type");
    }

    /**
     * Checks if the user answer is equal to the correct answer. 
     */
    checkAnswer(user: Fraction): boolean{
        return this.answer.isEqual(user);
    }
    
}