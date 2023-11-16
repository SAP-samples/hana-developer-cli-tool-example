// @ts-check
import * as base from '../utils/base.js'

export const command = 'matrix'
export const describe = base.bundle.getText("matrix")
export const builder = base.getBuilder({}, false, false)
export async function handler() {
  const tools = await import('terminaltools')
  try {
    await tools.default.fun.Matrix.start([0,1,2,3,4,5,6,7,8,9,'日','ﾊ','ﾐ','ﾋ','ｰ','ｳ','ｼ','ﾅ','ﾓ','ﾆ','ｻ',
    'ﾜ','ﾂ','ｵ','ﾘ','ｱ','ﾎ','ﾃ','ﾏ','ｹ','ﾒ','ｴ','ｶ','ｷ','ﾑ','ﾕ','ﾗ','ｾ','ﾈ','ｽ','ﾀ','ﾇ','ﾍ','ç','ﾘ','ｸ'])
  } catch (err) {
    return console.error(err)
  }
}