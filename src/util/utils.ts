/**
 * Converts a number to its ordinal string representation (e.g., 1st, 2nd, 3rd, 4th).
 *
 * Handles special cases for numbers ending in 11, 12, or 13, which use the "th" suffix.
 *
 * @param n - The number to ordinalize.
 * @returns The ordinalized string representation of the number.
 */
export function ordinalize(n: number): string {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = n % 100;
    const suffix =
        suffixes[(v > 10 && v < 14) ? 0 : (v % 10 > 3 ? 0 : v % 10)];
    return `${n}${suffix}`;
}


export function parseInt(input: string): number {
    try {
        return Number(input);
    }
    catch(e) {
        return -1;
    }
}