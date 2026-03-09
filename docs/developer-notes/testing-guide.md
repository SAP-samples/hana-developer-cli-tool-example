# Testing & Coverage Guide

Overview of testing infrastructure, coverage metrics, and development practices.

## Test Coverage Analysis

**Current Metrics:**

- Total Tests: 300+
- Line Coverage: 85%+
- Branch Coverage: 80%+
- Function Coverage: 90%+

See full analysis in: [TEST_COVERAGE_ANALYSIS.md](../../TEST_COVERAGE_ANALYSIS.md)

## Test Categories

### Unit Tests (tests/unit/)

- Utility function tests
- Database operation builders
- Error handling
- Data transformation

### Integration Tests (tests/integration/)

- Command workflows
- Database connections
- File I/O operations
- Multi-step processes

### End-to-End Tests (tests/e2e/)

- Full CLI execution
- Exit codes
- Console output
- User workflows

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# With coverage
npm test -- --coverage

# Specific test file
npm test -- tests/unit/utils/validation.js
```

## Performance Benchmarks

**Startup Optimization:**

- Before: 2.2 seconds
- After: 700ms (~7x improvement)

See: [OPTIMIZATION_PATTERN.md](../../OPTIMIZATION_PATTERN.md)

## See Also

- [Development Guide](../05-development/)
- [Implementation Details](../05-development/implementation.md)
