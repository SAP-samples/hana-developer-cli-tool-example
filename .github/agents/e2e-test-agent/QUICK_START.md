# E2E Test Agent - Quick Start Guide

## How to Use the E2E Test Agent

You now have a specialized Copilot agent that helps you create, run, and debug interactive end-to-end tests for your CLI. Here's how to get started:

## 1. Starting the Agent

In VS Code Chat, use the **E2E Test Agent** by mentioning it in your chat:

```
@E2E Test Agent Create E2E test for the export workflow
```

Or simply ask questions that reference E2E testing:

```
I need an E2E test that validates the complete data pipeline
```

The agent will recognize your intent and activate automatically.

## 2. Common Use Cases

### Write a New E2E Test

Ask the agent to create a complete test file:

```
@E2E Test Agent Create E2E tests for the connect command, including:
- Testing with username/password
- Testing with userstore key
- Testing invalid credentials
- Testing with hidden password prompt
```

The agent will generate:
- ✅ Complete test file with proper structure
- ✅ Fixture data if needed
- ✅ Examples for both CLI args and interactive prompts
- ✅ Error scenario tests
- ✅ Comments explaining patterns

### Test an Interactive Workflow

```
@E2E Test Agent Write E2E tests for this workflow:
1. Connect to HANA database
2. Run data validation
3. Export data to CSV
4. Verify export file

Include tests for both CLI args and interactive mode.
```

### Debug a Failing E2E Test

```
@E2E Test Agent Why is my E2E test failing?

Test: tests/export.e2e.Test.js
Error: "Cannot find module 'chai'"

My test code:
[paste your test code]
```

The agent will:
- 🔍 Analyze the error
- 💡 Suggest fixes
- 📝 Show corrected code
- 💬 Explain the pattern

### Test Error Scenarios

```
@E2E Test Agent Create E2E tests for error handling in the export command:
- Invalid table name
- Connection timeout
- Permission denied
- Invalid format option
- File write errors
```

### Validate Test Coverage

```
@E2E Test Agent Review E2E test coverage for the data tools.
Which workflows are untested? What should I test next?
```

## 3. Agent Capabilities

The agent understands:

| Feature | What It Can Do |
|---------|--|
| **CLI Commands** | All 200+ commands, their options, flags, and patterns |
| **Prompts** | Interactive prompting, hidden input, validation, conditional prompts |
| **Test Framework** | Mocha, Chai, assistants, test utilities (myTest, exec, fork) |
| **Workflows** | Multi-step command chains, state persistence, output validation |
| **Fixtures** | Test data generation, temporary databases, mock connections |
| **Error Handling** | Connection failures, validation errors, timeouts, edge cases |
| **Output Formats** | JSON, CSV, table format parsing and validation |
| **Performance** | Timeout testing, large dataset handling, stress scenarios |

## 4. Key Commands from the Agent

When interacting with the E2E Test Agent, try these direct asks:

```
// Creating tests
"Create E2E test for [command/workflow]"
"Write tests for [feature] including error scenarios"
"Generate test fixture for [scenario]"

// Running tests
"Run E2E tests for [command]"
"Debug my E2E test failure"
"Execute tests and show results"

// Analyzing coverage
"What E2E tests are missing for [command]?"
"Review E2E test coverage"
"Show test examples for [pattern]"

// Getting help
"What's the best way to test interactive prompts?"
"How do I test multi-step workflows?"
"Show me a complete E2E test example"
```

## 5. Working with the Agent

### Workflow: Write → Test → Refine

1. **Ask the agent to create** an E2E test for your scenario
2. **Run the test** to verify it works (agent can help execute)
3. **Refine** based on results or additional requirements
4. **Expand coverage** with more test scenarios

### Example Session:

```
You:   "Create E2E tests for the complete export workflow"
Agent: [Generates test file with fixtures]

You:   "Run these E2E tests and show me the results"
Agent: [Executes tests, shows pass/fail status]

You:   "Add tests for error cases: invalid table, bad permissions"
Agent: [Adds new test cases to the file]

You:   "What other workflows should I test for the export command?"
Agent: [Recommends additional test scenarios based on command options]
```

## 6. Best Practices

✅ **Be specific** about the workflow or scenario you want to test
✅ **Include context** about data, connections, or prerequisites
✅ **Test error paths** in addition to happy paths
✅ **Use descriptive test names** that explain the scenario
✅ **Isolate tests** - each test should be independent
✅ **Clean up** - remove temp files and reset state in afterEach hooks
✅ **Add comments** - explain complex test logic
✅ **Share fixtures** - reuse test data across related tests

❌ **Don't** test internal implementation details
❌ **Don't** create flaky tests with hard-coded waits
❌ **Don't** test one command at a time - think workflows
❌ **Don't** skip error scenario testing

## 7. File Structure

Tests created by the agent will be organized like this:

```
tests/
├── [command].e2e.Test.js          # E2E tests for a command
├── workflows/
│   └── [workflow].Test.js         # Multi-command workflow tests
├── fixtures/
│   ├── sample-data.json           # Test data
│   └── connections.json           # Test connections
└── prompts/
    └── [command]-prompts.json     # Prompt test scenarios
```

## 8. Running Tests Created by the Agent

Tests can be run using your existing npm scripts:

```bash
# Run all E2E tests
npm test -- --grep "E2E|e2e"

# Run specific test file
npm test tests/export.e2e.Test.js

# Run with coverage
npm run coverage

# Generate HTML report
npm run test:report

# Run in sequence (useful for debugging)
npm run test:sequential
```

## 9. Getting Help from the Agent

You can always ask the agent for help:

```
"I'm not sure how to test [feature]. What's the right approach?"
"Show me an example of testing [pattern]"
"What test utilities are available in this project?"
"How do I simulate user prompts in E2E tests?"
"What's the difference between CLI args and interactive prompts?"
```

## 10. Integration with Your Workflow

### For Development:
- Write new command? **Ask the agent to create E2E tests**
- Modify command behavior? **Ask agent to update related E2E tests**
- Fix a bug? **Ask agent to create a test that reproduces the issue**

### For Code Review:
- Review E2E test quality
- Identify untested workflows
- Suggest test improvements

### For Maintenance:
- Keep E2E tests updated as commands evolve
- Maintain test fixtures and data
- Monitor test coverage

---

## Next Steps

Ready to get started? Try one of these:

1. **"@E2E Test Agent What E2E tests would you recommend for my top 5 commands?"**
2. **"@E2E Test Agent Create E2E tests for the interactive mode"**
3. **"@E2E Test Agent Show me the best way to test a multi-step workflow"**
4. **"@E2E Test Agent Create comprehensive E2E tests for the data pipeline"**

The agent is ready to help! Just ask. 🚀
