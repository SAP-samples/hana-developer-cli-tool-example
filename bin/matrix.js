// @ts-check
import * as base from '../utils/base.js'
import * as tools from 'terminaltools'
export const command = 'matrix'
export const describe = base.bundle.getText("matrix")
export const builder = base.getBuilder({}, false, false)
export async function handler() {
  try {
    await tools.fun.matrix(`0123456789日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍçﾘｸ`)
  } catch (err) {
    return console.error(err)
  }
}