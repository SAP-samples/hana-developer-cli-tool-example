import * as assert from 'assert'
import * as vscode from 'vscode'

suite('Extension Activation', () => {
  test('Extension should be present', () => {
    const ext = vscode.extensions.getExtension('SAP-samples.hana-cli')
    assert.ok(ext, 'Extension not found')
  })

  test('All commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true)
    const expected = [
      'hana-cli.openTools',
      'hana-cli.openQuery',
      'hana-cli.showTables',
      'hana-cli.showViews',
      'hana-cli.systemInfo',
      'hana-cli.addConnection',
      'hana-cli.importData',
    ]
    for (const cmd of expected) {
      assert.ok(commands.includes(cmd), `Command ${cmd} not registered`)
    }
  })
})
