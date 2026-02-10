// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as conn from '../utils/connections.js'

export const command = 'test'
export const describe = baseLite.bundle.getText("test")

export const builder = baseLite.getBuilder({  
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, test, {})
}

export async function test(result) {
  const base = await import('../utils/base.js')
  base.debug('test')
  try {
    console.log( await conn.createConnection(result))
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}