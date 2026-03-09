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
        // Filter out debug messages from stderr (lines starting with timestamp and 'hana-cli')
        const filteredStderr = stderr ? stderr.split('\n')
            .filter(line => !line.match(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z hana-cli/))
            .join('\n').trim() : ''
        
        if(filteredStderr && filteredStderr != '- \n\n' && filteredStderr != '-'){
            throw new Error(filteredStderr)
        }
        addContextInt(this, { title: 'Stdout', value: stdout })
        done()
    })
}

