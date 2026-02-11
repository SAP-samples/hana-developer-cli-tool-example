// @ts-check
import * as base from './base.js'

describe('version', function () {

     it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/cli.js version --help", done)
    }) 
    it("returns normal output", function (done) {
        base.exec("node bin/cli.js version", (error, stdout) => {
            base.addContext(this, { title: 'Stdout', value: stdout })
            base.assert.match(stdout, /hana-cli: /)
            done()
        })
    })

})