import { Fraction } from "./Fraction.ts";

export class Problem {
    private answer: Fraction;

    constructor(
        private level: number,
        private fraction1: Fraction,
        private fraction2: Fraction,
        private operator: string,
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

    getOperator(): string{
        return this.operator;
    }

    computeAnswer(): Fraction{
        if(this.operator === "+"){
            return this.fraction1.add(this.fraction2);
        }
        else if(this.operator === "-"){
            if(this.fraction1.isLarger(this.fraction2)){
                return this.fraction1.subtract(this.fraction2).simplify();
            }
            return this.fraction2.subtract(this.fraction1).simplify();
        }
        throw new Error("Invalid Operator");
    }
    
}