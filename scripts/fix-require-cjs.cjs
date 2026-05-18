const fs = require('fs')
const path = require('path')

const files = [
  './tests/ui/systemInfoUI.ui.test.js',
  './tests/ui/importUI.ui.test.js'
]

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n')
  const filtered = lines.filter(line => !line.includes('require('))
  fs.writeFileSync(file, filtered.join('\n'))
  console.log(`Fixed ${file}`)
})
