import fs from 'fs'

const files = [
  './tests/ui/tablesUI.ui.test.js',
  './tests/ui/systemInfoUI.ui.test.js',
  './tests/ui/importUI.ui.test.js'
]

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  // Remove all require() statements
  const fixed = content
    .replace(/const.*=.*require\(.*\)\n/g, '')
    .replace(/\n\n\n/g, '\n\n')  // Clean up extra blank lines
  fs.writeFileSync(file, fixed)
  console.log(`Fixed ${file}`)
}
