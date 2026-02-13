// @ts-nocheck
/**
 * @module Locale Tests - Unit tests for locale utilities
 */

import { describe, it } from 'mocha'
import { assert } from '../base.js'
import { getLocale, normalizeLocale } from '../../utils/locale.js'

describe('Locale Utilities', function () {
    
    describe('getLocale', function () {
        it('should return LC_ALL when set', function () {
            const testEnv = { LC_ALL: 'en_US.UTF-8' }
            const result = getLocale(testEnv)
            assert.strictEqual(result, 'en_US.UTF-8')
        })

        it('should return LC_MESSAGES when LC_ALL is not set', function () {
            const testEnv = { LC_MESSAGES: 'de_DE.UTF-8' }
            const result = getLocale(testEnv)
            assert.strictEqual(result, 'de_DE.UTF-8')
        })

        it('should return LANG when LC_ALL and LC_MESSAGES are not set', function () {
            const testEnv = { LANG: 'fr_FR.UTF-8' }
            const result = getLocale(testEnv)
            assert.strictEqual(result, 'fr_FR.UTF-8')
        })

        it('should return LANGUAGE when other locale vars are not set', function () {
            const testEnv = { LANGUAGE: 'es_ES.UTF-8' }
            const result = getLocale(testEnv)
            assert.strictEqual(result, 'es_ES.UTF-8')
        })

        it('should prioritize LC_ALL over other variables', function () {
            const testEnv = { 
                LC_ALL: 'en_US.UTF-8',
                LC_MESSAGES: 'de_DE.UTF-8',
                LANG: 'fr_FR.UTF-8',
                LANGUAGE: 'es_ES.UTF-8'
            }
            const result = getLocale(testEnv)
            assert.strictEqual(result, 'en_US.UTF-8')
        })

        it('should prioritize LC_MESSAGES over LANG and LANGUAGE', function () {
            const testEnv = { 
                LC_MESSAGES: 'de_DE.UTF-8',
                LANG: 'fr_FR.UTF-8',
                LANGUAGE: 'es_ES.UTF-8'
            }
            const result = getLocale(testEnv)
            assert.strictEqual(result, 'de_DE.UTF-8')
        })

        it('should use process.env when no environment provided', function () {
            const result = getLocale()
            // Should not throw and should return a value from process.env
            assert.ok(result !== undefined)
        })

        it('should return undefined when no locale variables are set', function () {
            const testEnv = {}
            const result = getLocale(testEnv)
            assert.strictEqual(result, undefined)
        })
    })

    describe('normalizeLocale', function () {
        it('should remove UTF-8 encoding suffix', function () {
            const result = normalizeLocale('de_DE.UTF-8')
            assert.strictEqual(result, 'de_DE')
        })

        it('should remove ISO-8859-1 encoding suffix', function () {
            const result = normalizeLocale('en_US.ISO-8859-1')
            assert.strictEqual(result, 'en_US')
        })

        it('should remove iso88591 encoding suffix', function () {
            const result = normalizeLocale('fr_FR.iso88591')
            assert.strictEqual(result, 'fr_FR')
        })

        it('should handle locale without encoding suffix', function () {
            const result = normalizeLocale('de_DE')
            assert.strictEqual(result, 'de_DE')
        })

        it('should handle simple locale code', function () {
            const result = normalizeLocale('de')
            assert.strictEqual(result, 'de')
        })

        it('should handle undefined locale', function () {
            const result = normalizeLocale(undefined)
            assert.strictEqual(result, undefined)
        })

        it('should handle null locale', function () {
            const result = normalizeLocale(null)
            assert.strictEqual(result, null)
        })

        it('should handle empty string', function () {
            const result = normalizeLocale('')
            assert.strictEqual(result, '')
        })
    })
})
