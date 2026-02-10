// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'matrix'
export const describe = baseLite.bundle.getText("matrix")
export const builder = baseLite.getBuilder({}, false, false)
export async function handler() {
  const base = await import('../utils/base.js')
  const tools = await import('terminaltools')
  try {
    await tools.default.fun.Matrix.start([0,1,2,3,4,5,6,7,8,9,'日','ﾊ','ﾐ','ﾋ','ｰ','ｳ','ｼ','ﾅ','ﾓ','ﾆ','ｻ',
    'ﾜ','ﾂ','ｵ','ﾘ','ｱ','ﾎ','ﾃ','ﾏ','ｹ','ﾒ','ｴ','ｶ','ｷ','ﾑ','ﾕ','ﾗ','ｾ','ﾈ','ｽ','ﾀ','ﾇ','ﾍ','ç','ﾘ','ｸ'])
  } catch (err) {
    return console.error(err)
  }
}