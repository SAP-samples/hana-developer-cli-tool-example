// @ts-check
import * as base from './base.js'

describe('graphWorkspaces', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/graphWorkspaces.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/graphWorkspaces.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/graphWorkspaces.js -l 10 --quiet", done)
    })

    it("returns output with specific schema", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/graphWorkspaces.js -s SYS --quiet", done)
    })

    it("supports graphWorkspaces alias", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/gws.js --help 2>/dev/null || node bin/graphWorkspaces.js --help", done)
    })

})
