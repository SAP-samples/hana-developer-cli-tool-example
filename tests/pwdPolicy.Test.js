// @ts-check
import * as base from './base.js'

describe('pwdPolicy', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/pwdPolicy.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/pwdPolicy.js --quiet", done)
    })

    it("lists all policies", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/pwdPolicy.js --list --quiet", done)
    })

    it("shows detailed policy information", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/pwdPolicy.js --details --quiet", done)
    })

    it("shows users with policies", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/pwdPolicy.js --users --quiet", done)
    })

    it("handles alias pwdpolicy", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/pwdpolicy.js --help", done)
    })

    it("handles alias passpolicies", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/passpolicies.js --help", done)
    })

})
