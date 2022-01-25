/**
 * @param {string} [value]
 * @returns {boolean}
 */
export function isAcceptableQuotedParameter(value?: string): boolean;
/**
 * @param {any} [value]
 * @param {any} [maxToken]
 * @returns {any}
 */
export function isAcceptableParameter(value?: any, maxToken?: any): any;
/**
 * Returns the value parameter with all double quotation marks escaped (i. e. doubled).
 * @param {string} [value]
 * @returns {string} - escaped value
 */
export function escapeDoubleQuotes(value?: string): string;
/**
 * Returns the string parameter with all single quotation marks escaped (i. e. doubled).
 * @param {string} [value]
 * @returns {string} - escaped value
 */
export function escapeSingleQuotes(value?: string): string;
/**
 * @module sqlInjection - SQL Injection Protection Utilities
 */
export const whitespaceTable: {
    '\t': boolean;
    '\n': boolean;
    '\v': boolean;
    '\f': boolean;
    '\r': boolean;
    ' ': boolean;
    '\u0085': boolean;
    '\u00A0': boolean;
    '\u1680': boolean;
    '\u2000': boolean;
    '\u2001': boolean;
    '\u2002': boolean;
    '\u2003': boolean;
    '\u2004': boolean;
    '\u2005': boolean;
    '\u2006': boolean;
    '\u2007': boolean;
    '\u2008': boolean;
    '\u2009': boolean;
    '\u200A': boolean;
    '\u2028': boolean;
    '\u2029': boolean;
    '\u202F': boolean;
    '\u205F': boolean;
    '\u3000': boolean;
};
export const separatorTable: {
    ',': boolean;
    '(': boolean;
    ')': boolean;
    '[': boolean;
    ']': boolean;
    '.': boolean;
    ';': boolean;
    ':': boolean;
    '+': boolean;
    '-': boolean;
    '*': boolean;
    '/': boolean;
    '%': boolean;
    '^': boolean;
    '<': boolean;
    '>': boolean;
    '=': boolean;
};
