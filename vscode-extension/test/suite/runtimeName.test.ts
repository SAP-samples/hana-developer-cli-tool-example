import * as assert from 'assert'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { resolveRuntimeName } from '../../src/editors/runtimeName.js'

suite('resolveRuntimeName', () => {
  let tempDir: string

  suiteSetup(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hana-cli-rtn-'))
  })

  suiteTeardown(() => {
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true })
  })

  // Helper: write a fixture file and resolve it
  const resolve = (filename: string, content: string, kind: string): string => {
    const p = path.join(tempDir, filename)
    fs.writeFileSync(p, content)
    return resolveRuntimeName(p, kind)
  }

  // --- Parse path, one per kind ---

  test('table: COLUMN TABLE', () => {
    const name = resolve(
      'cds.outbox.Messages.hdbtable',
      'COLUMN TABLE cds_outbox_Messages (\n  ID NVARCHAR(36) NOT NULL,\n  PRIMARY KEY(ID)\n)',
      'table'
    )
    assert.strictEqual(name, 'cds_outbox_Messages')
  })

  test('table: ROW TABLE', () => {
    const name = resolve(
      'my.Row.hdbtable',
      'ROW TABLE my_Row (ID INTEGER)',
      'table'
    )
    assert.strictEqual(name, 'my_Row')
  })

  test('view: VIEW ... AS SELECT', () => {
    const name = resolve(
      'star.wars.Order.hdbview',
      'VIEW star_wars_CloneWarsChronologicalOrder AS SELECT\n  Episode_0.ID\nFROM x',
      'view'
    )
    assert.strictEqual(name, 'star_wars_CloneWarsChronologicalOrder')
  })

  test('procedure: PROCEDURE', () => {
    const name = resolve(
      'my.Proc.hdbprocedure',
      'PROCEDURE my_Proc (IN a INTEGER) AS BEGIN END',
      'procedure'
    )
    assert.strictEqual(name, 'my_Proc')
  })

  test('function: FUNCTION', () => {
    const name = resolve(
      'my.Func.hdbfunction',
      'FUNCTION my_Func (IN a INTEGER) RETURNS INTEGER AS BEGIN END',
      'function'
    )
    assert.strictEqual(name, 'my_Func')
  })

  test('sequence: DDL SEQUENCE', () => {
    const name = resolve(
      'my.Seq.hdbsequence',
      'SEQUENCE my_Seq START WITH 1 INCREMENT BY 1',
      'sequence'
    )
    assert.strictEqual(name, 'my_Seq')
  })

  test('sequence: JSON form', () => {
    const name = resolve(
      'my.Seq.hdbsequence',
      '{ "name": "my_Seq", "start_with": 1 }',
      'sequence'
    )
    assert.strictEqual(name, 'my_Seq')
  })

  test('synonym: JSON top-level key', () => {
    const name = resolve(
      'my.Syn.hdbsynonym',
      '{ "my_Syn": { "target": { "object": "FOO", "schema": "BAR" } } }',
      'synonym'
    )
    assert.strictEqual(name, 'my_Syn')
  })

  test('role: JSON top-level key', () => {
    const name = resolve(
      'my.Role.hdbrole',
      '{ "role": { "name": "my_Role" } }',
      'role'
    )
    // top-level key value carries an explicit .name -> prefer it
    assert.strictEqual(name, 'my_Role')
  })

  // --- Normalization ---

  test('quoted identifier: quotes stripped, case preserved', () => {
    const name = resolve(
      'q.hdbtable',
      'COLUMN TABLE "cds_outbox_Messages" (ID INTEGER)',
      'table'
    )
    assert.strictEqual(name, 'cds_outbox_Messages')
  })

  test('schema-qualified DDL: last dot segment', () => {
    const name = resolve(
      'q.hdbtable',
      'COLUMN TABLE "MYSCHEMA"."cds_outbox_Messages" (ID INTEGER)',
      'table'
    )
    assert.strictEqual(name, 'cds_outbox_Messages')
  })

  test('mixed case preserved', () => {
    const name = resolve(
      'q.hdbtable',
      'COLUMN TABLE MixedCase_Table (ID INTEGER)',
      'table'
    )
    assert.strictEqual(name, 'MixedCase_Table')
  })

  // --- Fallback rule ---

  test('fallback: empty file uses filename naming rule', () => {
    const name = resolve('cds.outbox.Messages.hdbtable', '', 'table')
    assert.strictEqual(name, 'cds_outbox_Messages')
  })

  test('fallback: unknown kind uses filename naming rule', () => {
    const name = resolve('a.b.C.hdbxyz', 'whatever', 'mystery')
    assert.strictEqual(name, 'a_b_C')
  })

  test('fallback: unparseable content uses filename naming rule', () => {
    const name = resolve('a.b.C.hdbtable', 'not a table definition', 'table')
    assert.strictEqual(name, 'a_b_C')
  })

  test('fallback: missing file uses filename naming rule (no throw)', () => {
    const p = path.join(tempDir, 'does.not.Exist.hdbtable')
    const name = resolveRuntimeName(p, 'table')
    assert.strictEqual(name, 'does_not_Exist')
  })

  test('fallback: .hdinamespace name is prepended', () => {
    const nsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hana-cli-ns-'))
    fs.writeFileSync(path.join(nsDir, '.hdinamespace'), '{ "name": "com.acme", "subfolder": "ignore" }')
    const p = path.join(nsDir, 'a.b.hdbtable')
    fs.writeFileSync(p, '') // empty -> fallback
    const name = resolveRuntimeName(p, 'table')
    fs.rmSync(nsDir, { recursive: true, force: true })
    assert.strictEqual(name, 'com.acme::a_b')
  })

  test('fallback: empty .hdinamespace name adds no prefix', () => {
    const nsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hana-cli-ns2-'))
    fs.writeFileSync(path.join(nsDir, '.hdinamespace'), '{ "name": "", "subfolder": "ignore" }')
    const p = path.join(nsDir, 'a.b.hdbtable')
    fs.writeFileSync(p, '')
    const name = resolveRuntimeName(p, 'table')
    fs.rmSync(nsDir, { recursive: true, force: true })
    assert.strictEqual(name, 'a_b')
  })

  // --- Security: never return a name that could break out of the webview
  //     inline script string / route (letters, digits, _, ., :: only) ---

  const SAFE_IDENTIFIER = /^[A-Za-z0-9_.:]+$/

  test('security: DDL name with a quote does not pass through verbatim', () => {
    const name = resolve(
      'evil.hdbtable',
      "COLUMN TABLE x';alert(1);// (ID INTEGER)",
      'table'
    )
    // The malicious token must not be returned as-is; result must be a safe id.
    assert.ok(SAFE_IDENTIFIER.test(name), `unsafe name returned: ${name}`)
    assert.ok(!name.includes("'"), 'single quote leaked into resolved name')
  })

  test('security: DDL name with angle brackets falls through to safe name', () => {
    const name = resolve(
      'evil2.hdbtable',
      'COLUMN TABLE <script> (ID INTEGER)',
      'table'
    )
    assert.ok(SAFE_IDENTIFIER.test(name), `unsafe name returned: ${name}`)
    // Falls back to the filename-derived name.
    assert.strictEqual(name, 'evil2')
  })

  test('security: filename containing a quote is sanitized in fallback', () => {
    // Empty content forces the fallback path; the basename carries the quote.
    const name = resolve("we'ird.hdbtable", '', 'table')
    assert.ok(SAFE_IDENTIFIER.test(name), `unsafe name returned: ${name}`)
    assert.ok(!name.includes("'"), 'single quote leaked into fallback name')
  })

  test('security: malicious .hdinamespace name is not used as prefix', () => {
    const nsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hana-cli-ns3-'))
    fs.writeFileSync(path.join(nsDir, '.hdinamespace'), '{ "name": "x\';alert(1)//", "subfolder": "ignore" }')
    const p = path.join(nsDir, 'a.b.hdbtable')
    fs.writeFileSync(p, '')
    const name = resolveRuntimeName(p, 'table')
    fs.rmSync(nsDir, { recursive: true, force: true })
    assert.ok(SAFE_IDENTIFIER.test(name), `unsafe name returned: ${name}`)
    assert.strictEqual(name, 'a_b') // malicious prefix dropped
  })
})
