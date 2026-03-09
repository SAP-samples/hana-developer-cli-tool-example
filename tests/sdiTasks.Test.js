// @ts-check
import * as base from './base.js'

describe('@all @sdiTasks', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/sdiTasks.js --help", done)
    })
})
