/**
 * Find similar commands based on user input
 * @param {string} input - The invalid command entered by the user
 * @param {number} [threshold=0.4] - Similarity threshold (0-1), lower = more strict
 * @param {number} [maxSuggestions=3] - Maximum number of suggestions to return
 * @returns {string[]} Array of suggested command names
 */
export function getSimilarCommands(input: string, threshold?: number, maxSuggestions?: number): string[];
/**
 * Get a formatted suggestion message for display to user
 * @param {string} invalidCommand - The invalid command entered
 * @param {object} bundle - The i18n text bundle for translations
 * @returns {string} Formatted message with suggestions, or empty string if no suggestions
 */
export function getSuggestionMessage(invalidCommand: string, bundle: object): string;
/**
 * Find similar option names based on user input
 * @param {string} input - The invalid option entered by the user
 * @param {string[]} availableOptions - List of valid option names to match against
 * @param {number} [threshold=0.4] - Similarity threshold (0-1), lower = more strict
 * @param {number} [maxSuggestions=3] - Maximum number of suggestions to return
 * @returns {string[]} Array of suggested option names
 */
export function getSimilarOptions(input: string, availableOptions: string[], threshold?: number, maxSuggestions?: number): string[];
/**
 * Get a formatted suggestion message for an invalid option
 * @param {string} invalidOption - The invalid option name
 * @param {string[]} availableOptions - List of valid option names
 * @param {object} bundle - The i18n text bundle for translations
 * @returns {string} Formatted message with suggestions, or empty string if no suggestions
 */
export function getOptionSuggestionMessage(invalidOption: string, availableOptions: string[], bundle: object): string;
