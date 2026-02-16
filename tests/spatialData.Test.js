// @ts-check
import * as base from './base.js'

describe('spatialData', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/spatialData.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/spatialData.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/spatialData.js -l 10 --quiet", done)
    })

    it("returns output with specific schema", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/spatialData.js -s SYS --quiet", done)
    })

    it("supports spatial alias", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/spatial.js --help 2>/dev/null || node bin/spatialData.js --help", done)
    })

})
