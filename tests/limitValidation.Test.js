// @ts-check
/**
 * Test cases for limit parameter validation across all commands
 */
import { expect } from 'chai'
import * as base from '../utils/base.js'

describe('Limit Parameter Validation', function () {
    describe('validateLimit function', function () {
        it('should accept valid positive integers', function () {
            expect(base.validateLimit(1)).to.equal(1)
            expect(base.validateLimit(10)).to.equal(10)
            expect(base.validateLimit(100)).to.equal(100)
            expect(base.validateLimit(200)).to.equal(200)
            expect(base.validateLimit(1000)).to.equal(1000)
        })

        it('should accept numeric strings and convert them to numbers', function () {
            expect(base.validateLimit('10')).to.equal(10)
            expect(base.validateLimit('100')).to.equal(100)
            expect(base.validateLimit('200')).to.equal(200)
        })

        it('should throw error for non-numeric strings', function () {
            expect(() => base.validateLimit('abc')).to.throw('limit parameter must be a valid number, received: abc')
            expect(() => base.validateLimit('test')).to.throw('limit parameter must be a valid number')
            expect(() => base.validateLimit('12abc')).to.throw('limit parameter must be a valid number')
            expect(() => base.validateLimit('abc123')).to.throw('limit parameter must be a valid number')
        })

        it('should throw error for negative numbers', function () {
            expect(() => base.validateLimit(-1)).to.throw('limit parameter must be a positive integer, received: -1')
            expect(() => base.validateLimit(-100)).to.throw('limit parameter must be a positive integer')
            expect(() => base.validateLimit('-5')).to.throw('limit parameter must be a positive integer')
        })

        it('should throw error for zero', function () {
            expect(() => base.validateLimit(0)).to.throw('limit parameter must be a positive integer, received: 0')
            expect(() => base.validateLimit('0')).to.throw('limit parameter must be a positive integer')
        })

        it('should throw error for decimal numbers', function () {
            expect(() => base.validateLimit(1.5)).to.throw('limit parameter must be a positive integer, received: 1.5')
            expect(() => base.validateLimit(10.7)).to.throw('limit parameter must be a positive integer')
            expect(() => base.validateLimit('5.5')).to.throw('limit parameter must be a positive integer')
        })

        it('should throw error for NaN', function () {
            expect(() => base.validateLimit(NaN)).to.throw('limit parameter must be a valid number')
        })

        it('should throw error for undefined', function () {
            expect(() => base.validateLimit(undefined)).to.throw('limit parameter is required')
        })

        it('should throw error for null', function () {
            expect(() => base.validateLimit(null)).to.throw('limit parameter is required')
        })

        it('should use custom parameter name in error messages', function () {
            expect(() => base.validateLimit('abc', 'maxResults')).to.throw('maxResults parameter must be a valid number')
            expect(() => base.validateLimit(-1, 'maxResults')).to.throw('maxResults parameter must be a positive integer')
        })

        it('should throw error for objects and arrays', function () {
            expect(() => base.validateLimit({})).to.throw('limit parameter must be a valid number')
            expect(() => base.validateLimit([])).to.throw('limit parameter must be a valid number')
            expect(() => base.validateLimit([10])).to.throw('limit parameter must be a valid number')
        })

        it('should throw error for boolean values', function () {
            expect(() => base.validateLimit(true)).to.throw('limit parameter must be a valid number')
            expect(() => base.validateLimit(false)).to.throw('limit parameter must be a valid number')
        })

        it('should throw error for special strings like Infinity', function () {
            expect(() => base.validateLimit(Infinity)).to.throw('limit parameter must be a positive integer')
            expect(() => base.validateLimit('Infinity')).to.throw('limit parameter must be a positive integer')
        })
    })
})
