// @ts-check
/**
 * @module sqlInjection - SQL Injection Protection Utilities
 */


export const whitespaceTable = {
    '\t': true, // HORIZONTAL TABULATION
    '\n': true, // NEW LINE
    '\v': true, // VERTICAL TABULATION
    '\f': true, // FORM FEED
    '\r': true, // CARRIAGE RETURN
    ' ': true, // SPACE
    '\u0085': true, // NEL
    '\u00A0': true, // NO-BREAK SPACE
    '\u1680': true, // OGHAM SPACE MARK
    '\u2000': true, // EN QUAD
    '\u2001': true, // EM QUAD
    '\u2002': true, // EN SPACE
    '\u2003': true, // EM SPACE
    '\u2004': true, // THREE-PER-EM SPACE
    '\u2005': true, // FOUR-PER-EM SPACE
    '\u2006': true, // SIX-PER-EM SPACE
    '\u2007': true, // FIGURE SPACE
    '\u2008': true, // PUNCTUATION SPACE
    '\u2009': true, // THIN SPACE
    '\u200A': true, // HAIR SPACE
    '\u2028': true, // LINE SEPARATOR
    '\u2029': true, // PARAGRAPH SEPARATOR
    '\u202F': true, // NARROW NO-BREAK SPACE
    '\u205F': true, // MEDIUM METHEMATICAL SPACE
    '\u3000': true // IDEOGRAPHIC SPACE
}

export const separatorTable = {
    ',': true,
    '(': true,
    ')': true,
    '[': true,
    ']': true,
    '.': true,
    ';': true,
    ':': true,
    '+': true,
    '-': true,
    '*': true,
    '/': true,
    '%': true,
    '^': true,
    '<': true,
    '>': true,
    '=': true
}

function isValidNonEmptyString(str) {
    return !!(str && typeof str === 'string')
}

function isSeparator(character) {
    return !!separatorTable[character]
}

function isWhitespaceCharacter(character) {
    return !!whitespaceTable[character]
}

/**
 * Check if a quoted parameter is acceptable (contains no unescaped quotes)
 * @param {string} [value] - The string value to check
 * @returns {boolean} - True if the parameter is acceptable, false otherwise
 */
export function isAcceptableQuotedParameter(value) {
    return isValidNonEmptyString(value) && (value.search(/([^"]|^)"([^"]|$)/) === -1)
}

/**
 * Check if a parameter is acceptable for SQL (no injection attempts, within token limit)
 * @param {string} [value] - The string value to check
 * @param {number} [maxToken] - Maximum number of tokens allowed (defaults to 1)
 * @returns {boolean} - True if the parameter is acceptable, false otherwise
 */
export function isAcceptableParameter(value, maxToken) {
    if (!isValidNonEmptyString(value)) {
        return false
    }
    if (!maxToken || typeof maxToken !== 'number') {
        maxToken = 1
    }
    var outside = true // outside of quotes
    var lastCharWasWhitespace = true
    var lastCharWasSeparator = false
    var currentChar
    var charAfterCurrent
    var token = 0
    for (var i = 0; i < value.length; ++i) {
        currentChar = value.charAt(i)
        charAfterCurrent = value.charAt(i + 1)
        if (currentChar === '"') {
            if (!outside && charAfterCurrent === '"') {
                ++i
                continue
            }
            if (outside && !lastCharWasSeparator) { // opening "
                ++token
            }
            outside = !outside
        } else {
            if (!outside) {
                continue
            }
            // outside "
            if (currentChar === '-' && charAfterCurrent === '-') {
                return false // found comment
            }
            if (currentChar === '/' && charAfterCurrent === '*') {
                return false // found comment
            }
            if (isSeparator(currentChar)) {
                if (token === 0) {
                    token += 2
                } else {
                    ++token
                }
                lastCharWasSeparator = true
                lastCharWasWhitespace = false
            } else if (isWhitespaceCharacter(currentChar)) {
                lastCharWasWhitespace = true
            } else {
                if (lastCharWasWhitespace && !lastCharWasSeparator) {
                    ++token
                }
                lastCharWasSeparator = false
                lastCharWasWhitespace = false
            }
        }
    }
    return (outside && token <= maxToken)
}


/**
 * Returns the value parameter with all double quotation marks escaped (i. e. doubled).
 * @param {string} [value] 
 * @returns {string} - escaped value
 */
export function escapeDoubleQuotes(value) {
    return value.replace(/"/g, '""')
}


/**
 * Returns the string parameter with all single quotation marks escaped (i. e. doubled).
 * @param {string} [value]
 * @returns {string} - escaped value
 */
export function escapeSingleQuotes(value) {
    return value.replace(/'/g, '\'\'')
}

