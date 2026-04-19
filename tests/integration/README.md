# Integration Tests for Figma Screens

This directory contains comprehensive integration tests for the EcoChain UI Implementation feature, specifically testing the 10 Figma screens.

## Test Coverage

### 1. Navigation Tests (`figma-screens-navigation.test.tsx`)
- Sequential navigation through all 10 screens
- Direct URL access to any screen
- Browser back/forward navigation
- Navigation performance (transitions < 500ms, rendering < 2s)
- Breadcrumb navigation and current location indication
- Cross-screen navigation paths

**Validates Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5

### 2. Form Interaction Tests (`figma-screens-forms.test.tsx`)
- Form validation and user feedback
- Form submission with loading states
- Data preservation on validation errors
- Input validation (email, required fields, length constraints)
- Select, checkbox, and radio group interactions
- Form error handling (field-level, form-level, network errors)
- Form accessibility (ARIA labels, keyboard navigation, screen reader support)

**Validates Requirements:** 6.4, 6.5, 7.1, 7.2, 7.3

### 3. User Flow Tests (`figma-screens-user-flows.test.tsx`)
- New user onboarding flow across multiple screens
- Dashboard navigation and state management
- Settings and configuration flows
- Data visualization and environmental metrics
- Blockchain integration and connection states
- Error recovery and fallback UI
- Multi-screen data persistence
- Performance under load (rapid navigation, concurrent submissions)

**Validates Requirements:** 5.1, 6.4, 6.5

### 4. Data Persistence Tests (`figma-screens-data-persistence.test.tsx`)
- Local storage persistence (preferences, last visited screen)
- Session storage persistence (navigation state, form data)
- Form data auto-save and restoration
- User state persistence (authentication, profile)
- Application state persistence (filters, scroll position, UI states)
- Cache management (API responses, invalidation, expiration)
- Offline data persistence (action queuing, sync, conflict resolution)
- Data migration and versioning
- Cross-screen data sharing (metrics, blockchain status, user profile)

**Validates Requirements:** 6.5

## Running the Tests

### Prerequisites
1. Ensure the development server is running:
   ```bash
   pnpm run dev
   ```

2. Install test dependencies (if not already installed):
   ```bash
   pnpm add -D jest @jest/globals
   ```

### Run All Integration Tests
```bash
pnpm run test:integration
```

### Run Specific Test Suites
```bash
# Navigation tests only
pnpm run test:integration -- figma-screens-navigation

# Form tests only
pnpm run test:integration -- figma-screens-forms

# User flow tests only
pnpm run test:integration -- figma-screens-user-flows

# Data persistence tests only
pnpm run test:integration -- figma-screens-data-persistence
```

### Run Tests in Watch Mode
```bash
pnpm run test:integration:watch
```

## Test Structure

Each test file follows this structure:
```typescript
describe('Test Suite Name', () => {
  describe('Feature Category', () => {
    it('should test specific behavior', async () => {
      // Test implementation
    });
  });
});
```

## Test Requirements Mapping

| Test File | Requirements Validated |
|-----------|----------------------|
| `figma-screens-navigation.test.tsx` | 5.1, 5.2, 5.3, 5.4, 5.5 |
| `figma-screens-forms.test.tsx` | 6.4, 6.5, 7.1, 7.2, 7.3 |
| `figma-screens-user-flows.test.tsx` | 5.1, 6.4, 6.5 |
| `figma-screens-data-persistence.test.tsx` | 6.5 |

## Notes

- These tests are designed to run against a live development server
- Some tests use simulated data and interactions for testing purposes
- Performance thresholds are based on requirements (navigation < 500ms, rendering < 2s)
- Tests validate both happy paths and error scenarios
- Accessibility testing is integrated throughout the test suites

## Future Enhancements

- Add visual regression testing with Playwright
- Implement real browser automation for more realistic testing
- Add performance profiling and metrics collection
- Integrate with CI/CD pipeline for automated testing
- Add code coverage reporting
