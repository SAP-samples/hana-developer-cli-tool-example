// @ts-check
/**
 * @module base - Central Test Functionality shared by all test files
 */

import * as child_process from 'child_process'
export const exec = child_process.exec
export const fork = child_process.fork
import addContextInt from 'mochawesome/addContext.js'
export const addContext = addContextInt
import * as assertInt from 'assert'
export const assert = assertInt

export function myTest(command, done){
    exec(command, (error, stdout, stderr) => {
        if(stderr && stderr != '- \n\n'){throw stderr}
        addContextInt(this, { title: 'Stdout', value: stdout })
        done()
    })
}

