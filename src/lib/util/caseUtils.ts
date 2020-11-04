/**
 * Converts a string in snake-case to the equivalent string in camelCase.
 * Inverse of {@link convertCamelCaseToSnakeCase}.
 *
 * @param snakeCase String in snake-case to convert
 * @returns String in camelCase
 */
export function convertSnakeCaseToCamelCase(snakeCase: string): string {
    // convert all substrings of the form "-n" to "N".
    // in other words, remove dashes and capitalize the next letter
    return snakeCase.replace(/-([a-zA-Z0-9])/g, (matchToReplace, letterToCapitalize: string) => letterToCapitalize.toUpperCase());
}

/**
 * Converts a string in camelCase to the equivalent string in snake-case.
 * The output string is guaranteed to contain no upper-case letters.
 * Inverse of {@link convertSnakeCaseToCamelCase}.
 *
 * @param camelCase String in camelCase to convert
 * @returns String in snake-case.
 */
export function convertCamelCaseToSnakeCase(camelCase: string): string {
    return camelCase
        // convert all substrings of the form "aB" to "a-B"
        .replace(/([a-z0-9])([A-Z])/g, (matchToReplace, firstLetter, secondLetter) => `${ firstLetter }-${ secondLetter }`)
        // convert the entire string to lower case
        .toLowerCase();
}