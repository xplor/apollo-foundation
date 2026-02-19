/**
 * Parses a token value as a float and applies a formatter.
 * Returns the original value unchanged if it isn't numeric.
 */
export function formatNumericValue<T>(
    value: T,
    formatter: (n: number) => string,
): string | T {
    const numValue = parseFloat(value as string);

    return isNaN(numValue) ? value : formatter(numValue);
}
