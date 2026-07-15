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
  // HANA folds UNQUOTED DDL identifiers to UPPERCASE at deploy time; only
  // double-quoted identifiers keep their authored case. CAP emits unquoted
  // names, so the common case uppercases. Verified against a live HDI
  // container: `COLUMN TABLE cds_outbox_Messages` deploys as
  // CDS_OUTBOX_MESSAGES; `star_wars_eyeColors` deploys as STAR_WARS_EYECOLORS.

  test('table: COLUMN TABLE (unquoted -> uppercase)', () => {
    const name = resolve(
      'cds.outbox.Messages.hdbtable',
      'COLUMN TABLE cds_outbox_Messages (\n  ID NVARCHAR(36) NOT NULL,\n  PRIMARY KEY(ID)\n)',
      'table'
    )
    assert.strictEqual(name, 'CDS_OUTBOX_MESSAGES')
  })

  test('table: ROW TABLE (unquoted -> uppercase)', () => {
    const name = resolve(
      'my.Row.hdbtable',
      'ROW TABLE my_Row (ID INTEGER)',
      'table'
    )
    assert.strictEqual(name, 'MY_ROW')
  })

  test('view: VIEW ... AS SELECT (unquoted -> uppercase)', () => {
    const name = resolve(
      'star.wars.Order.hdbview',
      'VIEW star_wars_CloneWarsChronologicalOrder AS SELECT\n  Episode_0.ID\nFROM x',
      'view'
    )
    assert.strictEqual(name, 'STAR_WARS_CLONEWARSCHRONOLOGICALORDER')
  })

  test('view: real-world mixed-case eyeColors -> uppercase', () => {
    // Regression for the reported bug: file DDL is `star_wars_eyeColors`,
    // deployed runtime name is STAR_WARS_EYECOLORS.
    const name = resolve(
      'star.wars.eyeColors.hdbview',
      'VIEW star_wars_eyeColors AS SELECT eye_color FROM x',
      'view'
    )
    assert.strictEqual(name, 'STAR_WARS_EYECOLORS')
  })

  test('procedure: PROCEDURE (unquoted -> uppercase)', () => {
    const name = resolve(
      'my.Proc.hdbprocedure',
      'PROCEDURE my_Proc (IN a INTEGER) AS BEGIN END',
      'procedure'
    )
    assert.strictEqual(name, 'MY_PROC')
  })

  test('function: FUNCTION (unquoted -> uppercase)', () => {
    const name = resolve(
      'my.Func.hdbfunction',
      'FUNCTION my_Func (IN a INTEGER) RETURNS INTEGER AS BEGIN END',
      'function'
    )
    assert.strictEqual(name, 'MY_FUNC')
  })

  test('sequence: DDL SEQUENCE (unquoted -> uppercase)', () => {
    const name = resolve(
      'my.Seq.hdbsequence',
      'SEQUENCE my_Seq START WITH 1 INCREMENT BY 1',
      'sequence'
    )
    assert.strictEqual(name, 'MY_SEQ')
  })

  test('sequence: JSON form (explicit name, case preserved)', () => {
    const name = resolve(
      'my.Seq.hdbsequence',
      '{ "name": "my_Seq", "start_with": 1 }',
      'sequence'
    )
    assert.strictEqual(name, 'my_Seq')
  })

  test('synonym: JSON top-level key (case preserved)', () => {
    const name = resolve(
      'my.Syn.hdbsynonym',
      '{ "my_Syn": { "target": { "object": "FOO", "schema": "BAR" } } }',
      'synonym'
    )
    assert.strictEqual(name, 'my_Syn')
  })

  test('role: JSON top-level key (case preserved)', () => {
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

  test('schema-qualified quoted DDL: last segment, quoted -> case preserved', () => {
    const name = resolve(
      'q.hdbtable',
      'COLUMN TABLE "MYSCHEMA"."cds_outbox_Messages" (ID INTEGER)',
      'table'
    )
    assert.strictEqual(name, 'cds_outbox_Messages')
  })

  test('unquoted mixed case folds to uppercase', () => {
    const name = resolve(
      'q.hdbtable',
      'COLUMN TABLE MixedCase_Table (ID INTEGER)',
      'table'
    )
    assert.strictEqual(name, 'MIXEDCASE_TABLE')
  })

  // --- Fallback rule ---
  // The design-time filename maps to an UNQUOTED SQL identifier, so the
  // fallback also folds the object portion to uppercase.

  test('fallback: empty file uses filename naming rule (uppercased)', () => {
    const name = resolve('cds.outbox.Messages.hdbtable', '', 'table')
    assert.strictEqual(name, 'CDS_OUTBOX_MESSAGES')
  })

  test('fallback: unknown kind uses filename naming rule', () => {
    const name = resolve('a.b.C.hdbxyz', 'whatever', 'mystery')
    assert.strictEqual(name, 'A_B_C')
  })

  test('fallback: unparseable content uses filename naming rule', () => {
    const name = resolve('a.b.C.hdbtable', 'not a table definition', 'table')
    assert.strictEqual(name, 'A_B_C')
  })

  test('fallback: missing file uses filename naming rule (no throw)', () => {
    const p = path.join(tempDir, 'does.not.Exist.hdbtable')
    const name = resolveRuntimeName(p, 'table')
    assert.strictEqual(name, 'DOES_NOT_EXIST')
  })

  test('fallback: .hdinamespace name prepended as-authored, local part uppercased', () => {
    const nsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hana-cli-ns-'))
    fs.writeFileSync(path.join(nsDir, '.hdinamespace'), '{ "name": "com.acme", "subfolder": "ignore" }')
    const p = path.join(nsDir, 'a.b.hdbtable')
    fs.writeFileSync(p, '') // empty -> fallback
    const name = resolveRuntimeName(p, 'table')
    fs.rmSync(nsDir, { recursive: true, force: true })
    // Namespace prefix is case-sensitive as authored; only the local object
    // name folds to uppercase (unquoted SQL identifier rule).
    assert.strictEqual(name, 'com.acme::A_B')
  })

  test('fallback: empty .hdinamespace name adds no prefix (uppercased)', () => {
    const nsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hana-cli-ns2-'))
    fs.writeFileSync(path.join(nsDir, '.hdinamespace'), '{ "name": "", "subfolder": "ignore" }')
    const p = path.join(nsDir, 'a.b.hdbtable')
    fs.writeFileSync(p, '')
    const name = resolveRuntimeName(p, 'table')
    fs.rmSync(nsDir, { recursive: true, force: true })
    assert.strictEqual(name, 'A_B')
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
    // Falls back to the filename-derived name (uppercased, unquoted rule).
    assert.strictEqual(name, 'EVIL2')
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
    assert.strictEqual(name, 'A_B') // malicious prefix dropped
  })
})
