// @ts-check
import * as base from '../utils/base.js'
import * as conn from '../utils/connections.js'

export const command = 'test'
export const describe = base.bundle.getText("test")

export const builder = base.getBuilder({  
})

export function handler (argv) {
  base.promptHandler(argv, test, {})
}

export async function test(result) {
  base.debug('test')
  try {
    console.log( await conn.createConnection(result))
    return base.end()
  } catch (error) {
    base.error(error)
  }
}