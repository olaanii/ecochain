# Integration Tests Execution Guide

This guide provides detailed instructions for running the comprehensive integration tests for the EcoChain UI Implementation feature.

## Overview

The integration test suite validates:
- **Navigation**: End-to-end navigation flows across all 10 Figma screens
- **Forms**: Form submissions, validation, and user feedback
- **User Flows**: Complete user journeys across multiple screens
- **Data Persistence**: State management and data persistence across sessions

**Requirements Validated**: 5.1, 6.4, 6.5

## Prerequisites

### 1. Development Server
The integration tests require a running development server:

```bash
pnpm run dev
```

The server should be accessible at `http://localhost:3000`

### 2. Test Dependencies
Ensure Jest is installed (should be in devDependencies):

```bash
pnpm add -D jest @jest/globals
```

### 3. Environment Setup
- Node.js version 18 or higher
- All project dependencies installed (`pnpm install`)
- Database seeded with test data (if applicable)

## Running Tests

### Run All Integration Tests

```bash
pnpm run test:integration
```

This will execute all four test suites:
1. Navigation Tests
2. Form Interaction Tests
3. User Flow Tests
4. Data Persistence Tests

### Run Specific Test Suite

```bash
# Navigation tests only
pnpm run test:integration -- navigation

# Form tests only
pnpm run test:integration -- forms

# User flow tests only
pnpm run test:integration -- user-flows

# Data persistence tests only
pnpm run test:integration -- data-persistence
```

### Run Tests in Watch Mode

```bash
pnpm run test:integration:watch
```

This will re-run tests automatically when files change.

### Run Tests with Coverage

```bash
pnpm run test:integration -- --coverage
```

Coverage reports will be generated in `coverage/integration/`

### Run Using Custom Script

```bash
node scripts/run-integration-tests.js
```

This provides enhanced reporting and test execution details.

## Test Suites

### 1. Navigation Tests (`figma-screens-navigation.test.tsx`)

**What it tests:**
- Sequential navigation through all 10 screens
- Direct URL access to any screen
- Browser back/forward navigation
- Navigation performance (< 500ms transitions)
- Breadcrumb navigation
- Cross-screen navigation paths

**Expected Results:**
- All 10 screens accessible via routing
- Navigation completes within performance thresholds
- Browser history works correctly
- Breadcrumbs update on navigation

**Common Issues:**
- 404 errors: Check that all screen routes exist
- Timeout errors: Ensure development server is running
- Performance failures: Check server load and network

### 2. Form Interaction Tests (`figma-screens-forms.test.tsx`)

**What it tests:**
- Form validation and user feedback
- Form submission with loading states
- Input validation (email, required fields, length)
- Select, checkbox, and radio interactions
- Error handling (field-level, form-level, network)
- Accessibility (ARIA labels, keyboard navigation)

**Expected Results:**
- Forms validate inputs correctly
- Error messages display appropriately
- Loading states show during submission
- Keyboard navigation works
- Screen readers can access forms

**Common Issues:**
- Validation failures: Check validation logic
- Missing ARIA labels: Review accessibility implementation
- Keyboard navigation issues: Check focus management

### 3. User Flow Tests (`figma-screens-user-flows.test.tsx`)

**What it tests:**
- New user onboarding flow
- Dashboard navigation and state management
- Settings and configuration flows
- Data visualization (environmental metrics)
- Blockchain integration
- Error recovery
- Multi-screen data persistence
- Performance under load

**Expected Results:**
- Complete user journeys work end-to-end
- State persists across screens
- Error recovery works gracefully
- Performance remains acceptable under load

**Common Issues:**
- State loss: Check state management implementation
- Navigation breaks: Verify routing configuration
- Performance degradation: Check for memory leaks

### 4. Data Persistence Tests (`figma-screens-data-persistence.test.tsx`)

**What it tests:**
- Local storage persistence
- Session storage persistence
- Form data auto-save and restoration
- User state persistence (auth, profile)
- Application state (filters, scroll position)
- Cache management
- Offline data persistence
- Data migration and versioning
- Cross-screen data sharing

**Expected Results:**
- Data persists across page refreshes
- Form drafts are saved and restored
- Cache invalidation works correctly
- Offline actions queue and sync
- Data migrations handle schema changes

**Common Issues:**
- Storage quota exceeded: Check data size
- Cache invalidation failures: Review cache logic
- Sync conflicts: Check conflict resolution

## Interpreting Results

### Success Output

```
✅ All integration tests passed successfully!

Test Coverage Summary:
  ✓ Navigation across all 10 screens
  ✓ Form submissions and validation
  ✓ End-to-end user flows
  ✓ Data persistence and state management

Requirements Validated: 5.1, 6.4, 6.5
```

### Failure Output

When tests fail, you'll see:
- Test suite name
- Specific test that failed
- Expected vs actual results
- Stack trace for debugging

Example:
```
❌ Figma Screens Navigation Integration
  ✗ should navigate through all 10 screens in sequence
    Expected: 200
    Received: 404
    
    at tests/integration/figma-screens-navigation.test.tsx:25:7
```

## Troubleshooting

### Development Server Not Running

**Error**: `ECONNREFUSED` or timeout errors

**Solution**:
```bash
# Start the development server
pnpm run dev

# Wait for server to be ready
# Then run tests in another terminal
pnpm run test:integration
```

### Missing Test Dependencies

**Error**: `Cannot find module 'jest'` or `@jest/globals`

**Solution**:
```bash
pnpm add -D jest @jest/globals
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Unix/Mac:
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Test Timeout Errors

**Error**: `Timeout - Async callback was not invoked within the 5000 ms timeout`

**Solution**:
- Increase timeout in jest.config.integration.js
- Check for slow API calls or network issues
- Verify development server is responsive

### Memory Issues

**Error**: `JavaScript heap out of memory`

**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run test:integration
```

## Performance Benchmarks

The tests validate these performance requirements:

| Metric | Requirement | Test Validation |
|--------|-------------|-----------------|
| Navigation Transition | < 500ms | ✓ Tested |
| Screen Rendering | < 2 seconds | ✓ Tested |
| Interactive Response | < 200ms | ✓ Tested |
| Form Submission | < 1 second | ✓ Tested |

## Continuous Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm run dev &
      - run: sleep 10 # Wait for server
      - run: pnpm run test:integration
```

## Best Practices

1. **Run tests before committing**: Ensure all tests pass locally
2. **Keep server running**: Don't restart server between test runs
3. **Clear cache**: Clear browser/storage cache if tests behave unexpectedly
4. **Check logs**: Review server logs for errors during test execution
5. **Isolate failures**: Run specific test suites to isolate issues
6. **Update tests**: Keep tests in sync with implementation changes

## Next Steps

After all integration tests pass:

1. ✅ Mark task 22.4 as complete
2. ✅ Review test coverage reports
3. ✅ Document any test failures or issues
4. ✅ Proceed to task 24 (Final checkpoint)

## Support

If you encounter issues not covered in this guide:

1. Check the test output for specific error messages
2. Review the test implementation in `tests/integration/`
3. Verify all prerequisites are met
4. Check the development server logs
5. Consult the main README.md for project-specific setup

## Summary

The integration test suite provides comprehensive validation of:
- ✅ All 10 Figma screens are accessible and functional
- ✅ Navigation works correctly across all screens
- ✅ Forms validate and submit properly
- ✅ User flows complete successfully
- ✅ Data persists across sessions and screens

**Total Test Coverage**: 100+ test cases across 4 test suites
**Requirements Validated**: 5.1, 6.4, 6.5
**Execution Time**: ~30-60 seconds (depending on system)
