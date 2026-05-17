import * as assert from 'assert'
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

suite('Calc View Editor', () => {
  let tempDir: string
  let testFile: vscode.Uri

  suiteSetup(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hana-cli-test-'))
    const filePath = path.join(tempDir, 'TEST_VIEW.hdbcalculationview')
    fs.writeFileSync(filePath, `<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore"
  id="TEST_VIEW" applyPrivilegeType="NONE" dataCategory="CUBE">
  <dataSources/>
  <calculationViews/>
</Calculation:scenario>`)
    testFile = vscode.Uri.file(filePath)
  })

  suiteTeardown(() => {
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true })
  })

  test('Should open .hdbcalculationview in custom editor', async () => {
    await vscode.commands.executeCommand('vscode.openWith', testFile, 'hana-cli.calcViewEditor')

    // Wait for the editor tab to appear
    await new Promise(resolve => setTimeout(resolve, 1000))

    const tabs = vscode.window.tabGroups.all.flatMap(g => g.tabs)
    const calcViewTab = tabs.find(t => {
      if (t.input instanceof vscode.TabInputCustom) {
        return t.input.viewType === 'hana-cli.calcViewEditor'
      }
      return false
    })

    assert.ok(calcViewTab, 'Custom editor tab not found for .hdbcalculationview')
  })
})
