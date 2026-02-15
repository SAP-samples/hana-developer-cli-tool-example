// @ts-check
import * as base from './base.js'

describe('grantChains', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/grantChains.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/grantChains.js --quiet", done)
    })

    it("displays tree format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/grantChains.js --format tree --quiet", done)
    })

    it("displays table format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/grantChains.js --format table --quiet", done)
    })

    it("displays JSON format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/grantChains.js --format json --quiet", done)
    })

    it("sets chain depth", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/grantChains.js --depth 3 --quiet", done)
    })

    it("handles alias grants", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/grants.js --help", done)
    })

    it("handles alias grantchain", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/grantchain.js --help", done)
    })

})
