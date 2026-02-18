// @ts-check
/**
 * @module commandSuggestions
 * Utility for suggesting similar commands when user enters an invalid command
 */

import didYouMean, { ReturnTypeEnums, ThresholdTypeEnums } from 'didyoumean2'
import { commandMap } from '../bin/commandMap.js'

/**
 * Get unique command names (excluding duplicates/aliases)
 * @returns {string[]} Array of unique command names
 */
function getUniqueCommands() {
    const seen = new Set()
    const uniqueCommands = []
    
    for (const [command, file] of Object.entries(commandMap)) {
        // Take the first occurrence of each file (usually the main command name)
        if (!seen.has(file)) {
            seen.add(file)
            uniqueCommands.push(command)
        }
    }
    
    return uniqueCommands.sort()
}

/**
 * Find similar commands based on user input
 * @param {string} input - The invalid command entered by the user
 * @param {number} [threshold=0.4] - Similarity threshold (0-1), lower = more strict
 * @param {number} [maxSuggestions=3] - Maximum number of suggestions to return
 * @returns {string[]} Array of suggested command names
 */
export function getSimilarCommands(input, threshold = 0.4, maxSuggestions = 3) {
    if (!input || typeof input !== 'string') {
        return []
    }

    // Get all available commands (both main commands and aliases)
    const allCommands = Object.keys(commandMap)
    
    // Get suggestions using didyoumean2
    // @ts-ignore - TypeScript has trouble with the options object type
    const suggestions = didYouMean(input, allCommands, {
        threshold: threshold,
        thresholdType: ThresholdTypeEnums.SIMILARITY,
        returnType: ReturnTypeEnums.ALL_CLOSEST_MATCHES,
        caseSensitive: false,
        trimSpaces: true
    })
    
    // Return up to maxSuggestions (didyoumean2 returns string[] with ALL_CLOSEST_MATCHES)
    return suggestions.slice(0, maxSuggestions)
}

/**
 * Get a formatted suggestion message for display to user
 * @param {string} invalidCommand - The invalid command entered
 * @param {object} bundle - The i18n text bundle for translations
 * @returns {string} Formatted message with suggestions, or empty string if no suggestions
 */
export function getSuggestionMessage(invalidCommand, bundle) {
    const suggestions = getSimilarCommands(invalidCommand)
    
    if (suggestions.length === 0) {
        return ''
    }
    
    if (suggestions.length === 1) {
        return bundle.getText("didYouMeanSingle", [suggestions[0]])
    }
    
    return bundle.getText("didYouMeanMultiple", [suggestions.join('\n    ')])
}
