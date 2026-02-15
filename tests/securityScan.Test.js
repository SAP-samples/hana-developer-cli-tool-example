// @ts-check
import * as base from './base.js'

describe('securityScan', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/securityScan.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/securityScan.js --quiet", done)
    })

    it("scans all categories", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/securityScan.js --category all --quiet", done)
    })

    it("scans user category", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/securityScan.js --category users --quiet", done)
    })

    it("scans password category", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/securityScan.js --category passwords --quiet", done)
    })

    it("scans privileges category", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/securityScan.js --category privileges --quiet", done)
    })

    it("scans encryption category", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/securityScan.js --category encryption --quiet", done)
    })

    it("scans audit category", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/securityScan.js --category audit --quiet", done)
    })

    it("performs detailed scan", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/securityScan.js --detailed --quiet", done)
    })

    it("handles alias secscan", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/secscan.js --help", done)
    })

})
