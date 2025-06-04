# Test Framework Examples

This directory contains examples demonstrating how to use the test framework.

## Basic Usage

`basic-test.js` shows the fundamental usage of the test framework:
- Simple assertions
- Async test cases
- Error testing

## Nested Tests

`nested-tests.js` demonstrates:
- Nested test blocks
- Before/after hooks
- Shared state between tests
- Nested block setup and teardown

## Async Testing

`async-tests.js` covers:
- Promise-based testing
- Callback-based testing
- Custom timeouts
- Multiple async operations
- Async error handling

## Disabled Tests

`disabled-tests.js` shows how to:
- Skip individual tests with `xit`
- Disable entire blocks with `xdescribe`
- Mix enabled and disabled tests
- Use the `disabled` option

## Key Features

1. **Test Structure**
   - Use `describe` to group related tests
   - Use `it` to define individual test cases
   - Use `before` and `after` for setup and teardown

2. **Async Support**
   - Tests can be async functions
   - Support for promises and callbacks
   - Custom timeouts for long-running tests

3. **Test Organization**
   - Nested test blocks
   - Shared setup and teardown
   - Disabled tests and blocks

4. **Assertions**
   - `assertEqual` for value comparison
   - `assertThrows` for error testing
   - More assertions available in `kixx-assert`

## Best Practices

1. **Test Organization**
   - Group related tests in describe blocks
   - Use descriptive test names
   - Keep tests focused and atomic

2. **Async Testing**
   - Always await async operations
   - Use appropriate timeouts
   - Handle errors properly

3. **Setup and Teardown**
   - Use before/after hooks for shared setup
   - Clean up resources in after hooks
   - Keep setup minimal and focused

4. **Disabled Tests**
   - Use `xit` for temporarily disabled tests
   - Use `xdescribe` for disabled feature sets
   - Document why tests are disabled
