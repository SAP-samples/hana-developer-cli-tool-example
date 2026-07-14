// @ts-check
/**
 * @module vscodeVersion Tests - Unit tests for the pure version helpers in bin/vscode.js
 *
 * These validate the semver comparison and .vsix filename parsing used by
 * `hana-cli vscode status` to tell the user whether their installed extension
 * is up to date with the packaged .vsix.
 */
import { assert } from './base.js'
import { compareVersions, parseVsixVersion, parseInstalledVersion } from '../bin/vscode.js'

describe('vscode version helpers', function () {

    describe('compareVersions', function () {
        it('returns 0 for equal versions', function () {
            assert.strictEqual(compareVersions('0.1.7', '0.1.7'), 0)
        })
        it('returns -1 when first is older', function () {
            assert.strictEqual(compareVersions('0.1.6', '0.1.7'), -1)
        })
        it('returns 1 when first is newer', function () {
            assert.strictEqual(compareVersions('0.2.0', '0.1.7'), 1)
        })
        it('compares major/minor/patch numerically, not lexically', function () {
            assert.strictEqual(compareVersions('0.1.10', '0.1.9'), 1)
        })
        it('treats missing segments as zero', function () {
            assert.strictEqual(compareVersions('1', '1.0.0'), 0)
        })
    })

    describe('parseVsixVersion', function () {
        it('extracts the version from a hana-cli .vsix filename', function () {
            assert.strictEqual(parseVsixVersion('hana-cli-0.1.7.vsix'), '0.1.7')
        })
        it('extracts from a full path', function () {
            assert.strictEqual(parseVsixVersion('/some/dir/hana-cli-1.2.3.vsix'), '1.2.3')
        })
        it('returns null when no version is present', function () {
            assert.strictEqual(parseVsixVersion('hana-cli.vsix'), null)
        })
    })

    describe('parseInstalledVersion', function () {
        it('extracts the version from --list-extensions --show-versions line', function () {
            assert.strictEqual(parseInstalledVersion('SAP-samples.hana-cli@0.1.6'), '0.1.6')
        })
        it('returns null when there is no @version suffix', function () {
            assert.strictEqual(parseInstalledVersion('SAP-samples.hana-cli'), null)
        })
    })

})
