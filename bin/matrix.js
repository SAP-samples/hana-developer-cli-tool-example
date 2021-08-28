// @ts-check
import * as base from '../utils/base.js'
import * as tools from 'terminaltools'

export const command = 'matrix'
export const describe = base.bundle.getText("matrix")
export const builder = base.getBuilder({}, false, false)
export async function handler () { 
  try {

    tools.fun.matrix()
  } catch (err) {
    return console.error(err)
  }
}