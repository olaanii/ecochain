# Navigation Context

This directory contains the NavigationProvider context for managing navigation state across the EcoChain application.

## NavigationProvider

The `NavigationProvider` component provides navigation state and helper functions to all child components through React Context.

### Features

- **Current Route Tracking**: Tracks the current route path
- **Navigation History**: Maintains a history of visited routes (persisted to sessionStorage)
- **Authentication State**: Syncs with Clerk authentication state
- **Navigation Helpers**: Provides convenient functions for navigating to key routes
- **Previous Route**: Tracks the previous route for back navigation

### Usage

The NavigationProvider is already integrated into the application through `AppProviders` in `src/components/providers.tsx`.

To use navigation in your components:

```tsx
import { useNavigation } from '@/contexts/navigation-context';

function MyComponent() {
  const {
    currentRoute,
    previousRoute,
    navigationHistory,
    isAuthenticated,
    goToDashboard,
    goToDiscover,
    goToVerification,
    goToMerchants,
    goToBridge,
    goBack,
  } = useNavigation();

  return (
    <div>
      <p>Current Route: {currentRoute}</p>
      <button onClick={goToDashboard}>Go to Dashboard</button>
      <button onClick={() => goToVerification('task-123')}>
        Verify Task
      </button>
      <button onClick={goBack}>Go Back</button>
    </div>
  );
}
```

### API

#### Context Values

- `currentRoute: string` - The current pathname
- `previousRoute: string | null` - The previous pathname (null if no previous route)
- `navigationHistory: string[]` - Array of visited routes (max 50 entries)
- `isAuthenticated: boolean` - Whether the user is authenticated (from Clerk)

#### Navigation Functions

- `goToDashboard()` - Navigate to `/dashboard`
- `goToDiscover()` - Navigate to `/discover`
- `goToVerification(taskId?: string)` - Navigate to `/verification` with optional taskId query param
- `goToMerchants()` - Navigate to `/merchants`
- `goToBridge()` - Navigate to `/bridge`
- `goBack()` - Navigate to the previous page in browser history

### Implementation Details

- Uses Next.js `useRouter` and `usePathname` hooks for navigation
- Integrates with Clerk's `useAuth` hook for authentication state
- Persists navigation history to sessionStorage (limited to 50 entries)
- Automatically updates when the pathname changes
- All navigation functions use Next.js client-side navigation (no full page reload)

### Requirements Satisfied

This implementation satisfies the following requirements from the routing-and-navigation-system spec:

- **Requirement 10.1**: Navigation context accessible to all components
- **Requirement 10.2**: Tracks current route, navigation history, and authentication state
- **Requirement 10.3**: Updates current route state on navigation
- **Requirement 10.4**: Provides navigation helper functions
- **Requirement 10.5**: Persists navigation state across page reloads (via sessionStorage)
- **Requirement 10.6**: Syncs with Clerk authentication state and triggers updates
