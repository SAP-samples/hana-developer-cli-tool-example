# Test Coverage Analysis

## Executive Summary

The recent issue with `--debug` not being tested revealed systematic gaps in test coverage. This document identifies **major test coverage holes** and provides recommendations for filling them.

## Critical Gaps Identified

### 1. ❌ Error Handling Tests

**Severity: HIGH** - No systematic error testing

Current state:

- Very few tests validate error conditions
- No tests for invalid parameter values
- No tests for connection failures
- No tests for malformed inputs

Impact:

- Errors might not be handled gracefully
- Poor user experience when things go wrong
- Security vulnerabilities (SQL injection, etc.) not tested

### 2. ❌ Flag Validation Tests

**Severity: HIGH** - Invalid flag values not tested

Missing tests for:

- Invalid limit values (negative, zero, non-numeric, excessively large)
- Invalid output format choices
- Malformed flag combinations
- Required parameters missing
- Type mismatches (string where number expected)

### 3. ❌ Output Format Tests

**Severity: MEDIUM** - Different output formats not comprehensively tested

Commands like `inspectTable` support multiple output formats:

- `tbl`, `sql`, `sqlite`, `cds`, `json`, `yaml`, `cdl`, `annos`, `edm`, `edmx`
- `swgr`, `openapi`, `hdbtable`, `hdbmigrationtable`, `hdbcds`, `jsdoc`
- `graphql`, `postgres`

Current testing: Minimal or none for most formats

### 4. ❌ Profile Flag Tests

**Severity: MEDIUM** - Profile-based routing not tested

Some commands support `--profile` flag:

- `--profile pg` (PostgreSQL)
- `--profile sqlite` (SQLite)

No tests verify these alternate profiles work correctly.

### 5. ❌ Command Alias Tests

**Severity: MEDIUM** - Command aliases not systematically tested

Most commands have aliases, but only a few are tested:

- `tables` has aliases: `t`, `listTables`, `listtables`
- `inspectTable` has: `it`, `table`, `insTbl`, `inspecttable`, `inspectable`
- etc.

### 6. ❌ UI Commands Tests

**Severity: LOW** - Browser-based UI commands not tested

Commands ending in `UI` have no automated tests:

- `tablesUI`, `functionsUI`, `viewsUI`, `proceduresUI`
- `schemasUI`, `systemInfoUI`, `massConvertUI`
- `containersUI`, `indexesUI`, etc.

These launch browser-based interfaces and are harder to test but still need coverage.

### 7. ❌ Flag Alias Tests

**Severity: LOW** - Command-specific flag aliases not comprehensively tested

Most flags have aliases that aren't tested:

- `--limit` has alias `-l`
- `--schema` has aliases `-s`, `--Schema`
- `--table` has aliases `-t`, `--Table`
- `--output` has aliases `-o`, `--Output`

### 8. ❌ Edge Case Tests

**Severity: MEDIUM** - Boundary conditions not tested

Missing tests for:

- Empty result sets
- Very large result sets
- Special characters in table/schema names
- Unicode handling
- Case sensitivity variations
- Wildcard patterns (`*`, `%`, etc.)

### 9. ❌ Connection Scenarios

**Severity: HIGH** - Various connection scenarios not tested

Missing tests for:

- Connection timeout
- Invalid credentials
- Connection file not found
- Malformed connection configuration
- Admin vs non-admin connections
- Different connection file formats

### 10. ❌ Cross-Command Consistency Tests

**Severity: MEDIUM** - Behavior consistency not validated

Missing validation that:

- All commands handle `--debug` the same way
- All commands handle `--quiet` the same way
- Schema/table filtering works consistently
- Limit parameter works consistently
- Error messages are consistent

## Recommendations by Priority

### Priority 1: Critical (Implement Immediately)

1. **Error Handling Test Suite**
   - Invalid parameter values
   - Connection failures
   - Missing required parameters
   - Type validation errors

2. **Flag Validation Test Suite**
   - Limit validation (negative, zero, too large)
   - Output format validation
   - Required parameter validation

3. **Connection Scenario Tests**
   - Missing connection config
   - Invalid connection config
   - Admin vs non-admin behavior

### Priority 2: High (Implement Soon)

1. **Output Format Tests**
   - Test each output format for inspectTable
   - Test each output format for massConvert
   - Verify output is valid for each format

2. **Profile Flag Tests**
   - Test PostgreSQL profile
   - Test SQLite profile
   - Verify routing works correctly

3. **Command Alias Tests**
   - Systematically test all command aliases
   - Verify aliases work identically to main command

### Priority 3: Medium (Implement When Possible)

1. **Flag Alias Tests**
   - Test short aliases (`-l`, `-s`, `-t`, `-o`)
   - Test capitalized aliases (`--Schema`, `--Table`)
   - Verify all aliases work identically

2. **Edge Case Tests**
   - Empty results
   - Large result sets
   - Special characters
   - Unicode
   - Wildcard patterns

3. **Cross-Command Consistency**
   - Expand generic flags tests to cover ALL commands
   - Verify schema/table filtering consistency
   - Validate error message consistency

### Priority 4: Low (Nice to Have)

1. **UI Command Tests**
    - Basic smoke tests for UI commands
    - Verify they launch without errors
    - Consider using Playwright for browser testing

## Proposed Test Files to Create

```shell
tests/
├── errorHandling.Test.js          (NEW - Priority 1)
├── flagValidation.Test.js         (NEW - Priority 1)
├── connectionScenarios.Test.js    (NEW - Priority 1)
├── outputFormats.Test.js          (NEW - Priority 2)
├── profileFlags.Test.js           (NEW - Priority 2)
├── commandAliases.Test.js         (NEW - Priority 2)
├── flagAliases.Test.js            (NEW - Priority 3)
├── edgeCases.Test.js              (NEW - Priority 3)
├── crossCommandConsistency.Test.js (NEW - Priority 3)
└── uiCommands.Test.js             (NEW - Priority 4)
```

## Test Metrics

### Current State

- Total test files: ~70
- Generic flag tests: 26
- Base utility tests: 33
- Command-specific tests: ~40+ commands with basic tests
- **Estimated coverage of critical paths: ~40%**

### Target State

- Add 10 new test files
- Add ~200-300 new test cases
- **Target coverage of critical paths: ~85%**

## Example Tests Needed

### Error Handling Examples

```javascript
it('should reject negative limit values', function (done) {
    child_process.exec('hana-cli tables --limit -5', (error, stdout, stderr) => {
        assert.ok(stderr.includes('Error') || error, 'Should error on negative limit')
        done()
    })
})

it('should handle missing connection gracefully', function (done) {
    // Test without default-env.json
    child_process.exec('hana-cli tables --conn nonexistent.env', (error, stdout, stderr) => {
        assert.ok(error, 'Should error on missing connection file')
        assert.ok(stderr.includes('connection') || stderr.includes('not found'))
        done()
    })
})
```

### Output Format Examples

```javascript
it('should output JSON format correctly', function (done) {
    child_process.exec('hana-cli inspectTable --schema SYSTEM --table DUMMY --output json', 
        (error, stdout, stderr) => {
            const parsed = JSON.parse(stdout)
            assert.ok(parsed, 'Output should be valid JSON')
            done()
        })
})
```

### Profile Flag Examples

```javascript
it('should use PostgreSQL profile when specified', function (done) {
    child_process.exec('hana-cli tables --profile pg --limit 5', (error, stdout, stderr) => {
        // Verify PostgreSQL-specific behavior
        assert.ok(!error, 'Should not error with valid profile')
        done()
    })
})
```

## Implementation Plan

### Phase 1: Critical Tests (Week 1)

- [x] Create TEST_COVERAGE_ANALYSIS.md (this document)
- [ ] Implement errorHandling.Test.js
- [ ] Implement flagValidation.Test.js
- [ ] Implement connectionScenarios.Test.js

### Phase 2: High Priority Tests (Week 2)

- [ ] Implement outputFormats.Test.js
- [ ] Implement profileFlags.Test.js
- [ ] Implement commandAliases.Test.js

### Phase 3: Medium Priority Tests (Week 3)

- [ ] Implement flagAliases.Test.js
- [ ] Implement edgeCases.Test.js
- [ ] Extend genericFlags tests to cover all commands

### Phase 4: Documentation & CI (Week 4)

- [ ] Update README_UNIT_TESTS.md
- [ ] Configure CI to run all tests
- [ ] Set up code coverage reporting
- [ ] Document testing best practices

## Success Criteria

1. ✅ All critical error scenarios have tests
2. ✅ All common flags validated across all commands
3. ✅ All output formats tested
4. ✅ All command aliases tested
5. ✅ Edge cases covered
6. ✅ Test coverage >80% for critical paths
7. ✅ CI pipeline runs all tests automatically
8. ✅ Documentation complete and up-to-date

## Conclusion

The `--debug` flag issue was a symptom of insufficient integration testing for framework-level features. By systematically addressing these gaps, we can:

1. **Prevent similar issues** from occurring
2. **Improve code quality** through comprehensive testing
3. **Increase confidence** in deployments
4. **Reduce regression risk** when making changes
5. **Provide better documentation** through tests

**Next Steps:** Begin implementation of Priority 1 tests immediately.
