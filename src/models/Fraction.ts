/**
 * Immutable fraction value.
 *
 * The constructor does NOT simplify, so 3/6 stays 3/6. Guided levels need
 * the unsimplified form to check each step (e.g. "2/6 + 1/6 = 3/6" before
 * "3/6 = 1/2"). Call simplify() to reduce.
 */
export class Fraction {
	readonly numerator: number;
	readonly denominator: number;

	constructor(numerator: number, denominator: number) {
		if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
			throw new Error(`Fraction parts must be integers, got ${numerator}/${denominator}`);
		}
		if (denominator === 0) {
			throw new Error("Fraction denominator cannot be 0");
		}
		// Keep the sign on the numerator so -1/2 and 1/-2 look the same.
		const sign = denominator < 0 ? -1 : 1;
		this.numerator = numerator * sign + 0; // + 0 turns -0 into 0
		this.denominator = denominator * sign;
	}

	/** Returns this fraction in lowest terms. */
	simplify(): Fraction {
		const divisor = gcd(this.numerator, this.denominator);
		return new Fraction(this.numerator / divisor, this.denominator / divisor);
	}

	/** True if this fraction is already in lowest terms. */
	isSimplified(): boolean {
		return gcd(this.numerator, this.denominator) === 1;
	}

	/** Least common multiple of the two denominators (the lowest common denominator). */
	lcm(other: Fraction): number {
		return lcm(this.denominator, other.denominator);
	}

	/**
	 * Adds over the lowest common denominator, WITHOUT simplifying.
	 * 1/3 + 1/6 returns 3/6, not 1/2.
	 */
	add(other: Fraction): Fraction {
		const lcd = this.lcm(other);
		return new Fraction(this.scaledNumerator(lcd) + other.scaledNumerator(lcd), lcd);
	}

	/**
	 * Subtracts over the lowest common denominator, WITHOUT simplifying.
	 * 5/6 - 1/3 returns 3/6, not 1/2.
	 */
	subtract(other: Fraction): Fraction {
		const lcd = this.lcm(other);
		return new Fraction(this.scaledNumerator(lcd) - other.scaledNumerator(lcd), lcd);
	}

	/** True if both fractions have the same value, so 3/6 equals 1/2. */
	isEqual(other: Fraction): boolean {
		return this.numerator * other.denominator === other.numerator * this.denominator;
	}

	toString(): string {
		return `${this.numerator}/${this.denominator}`;
	}

	/** Numerator after rewriting this fraction over the given denominator. */
	private scaledNumerator(newDenominator: number): number {
		return this.numerator * (newDenominator / this.denominator);
	}
}

export function gcd(a: number, b: number): number {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b !== 0) {
		[a, b] = [b, a % b];
	}
	return a;
}

export function lcm(a: number, b: number): number {
	return Math.abs(a * b) / gcd(a, b);
}
