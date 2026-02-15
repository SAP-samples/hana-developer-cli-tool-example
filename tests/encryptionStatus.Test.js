// @ts-check
import * as base from './base.js'

describe('encryptionStatus', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/encryptionStatus.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/encryptionStatus.js --quiet", done)
    })

    it("checks all encryption scopes", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/encryptionStatus.js --scope all --quiet", done)
    })

    it("checks data encryption", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/encryptionStatus.js --scope data --quiet", done)
    })

    it("checks log encryption", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/encryptionStatus.js --scope log --quiet", done)
    })

    it("checks backup encryption", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/encryptionStatus.js --scope backup --quiet", done)
    })

    it("checks network encryption", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/encryptionStatus.js --scope network --quiet", done)
    })

    it("shows detailed information", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/encryptionStatus.js --details --quiet", done)
    })

    it("handles alias encryption", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/encryption.js --help", done)
    })

    it("handles alias encrypt", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/encrypt.js --help", done)
    })

})
