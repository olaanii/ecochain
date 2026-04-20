# Design Document: Routing and Navigation System

## Overview

The EcoChain routing and navigation system provides a comprehensive solution for client-side navigation, backend API architecture, and route protection. This design implements a production-ready navigation infrastructure using Next.js 16.2.1 App Router patterns with TypeScript 5, integrating Clerk authentication for session management and implementing RESTful API endpoints with proper error handling, validation, and logging.

The system addresses three core architectural concerns:

1. **Client-Side Navigation**: Unified navigation components, breadcrumb trails, mobile-responsive menus, and navigation state management through React Context
2. **Backend API Architecture**: RESTful API design with middleware, schema validation, error handling, rate limiting, and structured logging
3. **Route Protection**: Authentication middleware, session management, and authorization guards for protected routes

The design follows Next.js App Router conventions with file-based routing, server components by default, and client components where interactivity is required. All navigation uses the Next.js Link component for optimized client-side transitions with automatic prefetching.

### Key Design Decisions

- **File-Based Routing**: Leverage Next.js App Router's file system routing for intuitive route organization
- **Server Components First**: Use React Server Components by default, client components only when needed for interactivity
- **Middleware for Auth**: Implement route protection at the middleware layer for performance and security
- **Context for Navigation State**: Use React Context to share navigation state across client components
- **API Route Handlers**: Implement backend logic using Next.js Route Handlers with proper HTTP semantics
- **Zod for Validation**: Use Zod schemas for runtime type validation of API requests and responses
- **Structured Logging**: Implement Winston or Pino for production-grade logging with log levels and structured output

## Architecture

### Navigation System Architecture

The navigation system follows a hierarchical component structure:

```
NavigationProvider (Context)
├── TopNavBar (Client Component)
│   ├── Logo/Brand
│   ├── MainNavigation (Desktop)
│   ├── MobileMenuToggle
│   ├── UserMenu (Clerk UserButton)
│   └── WalletConnection (InterwovenKit)
├── SideNavBar (Client Component - Optional)
│   ├── NavigationLinks
│   └── ActiveRouteIndicator
├── MobileDrawer (Client Component)
│   ├── NavigationLinks
│   └── CloseButton
├── Breadcrumbs (Client Component)
│   └── RouteSegments
└── Page Content
```

**Navigation Flow**:
1. User clicks navigation link
2. Next.js Link component intercepts click
3. Client-side navigation occurs (no full page reload)
4. NavigationContext updates current route state
5. Active route indicators update
6. Page content renders with new data

**Route Structure**:
```
/                          (Landing page - public)
/dashboard                 (Dashboard - protected)
/discover                  (Discover page - public)
/verification              (Verification hub - protected)
/verification/camera       (Camera verification - protected)
/verification/status       (Status page - protected)
/merchants                 (Merchants hub - protected)
/merchants/hub-main        (Main merchant hub - protected)
/merchants/redemption      (Redemption flow - protected)
/bridge                    (Bridge interface - public)
/figma-screens/*           (Design screens - public)
```

### Backend API Architecture

The backend API follows RESTful conventions with the following structure:

```
/api
├── /tasks
│   └── GET - List all tasks (with optional filtering)
├── /verify
│   └── POST - Submit proof for verification
├── /rewards
│   └── GET - List available rewards
├── /redeem
│   └── POST - Redeem a reward
└── /bridge
    ├── /history
    │   └── GET - Get bridge transaction history
    └── /initiate
        └── POST - Initiate bridge transaction
```

**API Request Flow**:
1. Client sends HTTP request to API route
2. Middleware validates authentication token (if protected)
3. Route handler validates request schema using Zod
4. Business logic executes (database queries, external API calls)
5. Response formatted with consistent structure
6. Error handling middleware catches exceptions
7. Structured logs written for monitoring
8. Response sent to client

**Middleware Stack**:
```
Request
  ↓
Rate Limiting Middleware
  ↓
Authentication Middleware (Clerk)
  ↓
Request Logging Middleware
  ↓
Route Handler
  ↓
Response Formatting
  ↓
Error Handling Middleware
  ↓
Response Logging
  ↓
Response
```

### Route Protection Architecture

Route protection is implemented at two levels:

1. **Middleware Level** (Primary): Next.js middleware intercepts requests before they reach route handlers
2. **Component Level** (Secondary): Client-side guards redirect unauthenticated users

**Middleware Flow**:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { userId } = auth();
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  if (isProtectedRoute && !userId) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}
```

**Protected Routes**:
- `/dashboard`
- `/verification/*`
- `/merchants/*`
- `/api/verify`
- `/api/redeem`
- `/api/bridge/*`

**Public Routes**:
- `/` (landing page)
- `/discover`
- `/bridge` (UI only, API protected)
- `/figma-screens/*`
- `/api/tasks`
- `/api/rewards`

## Components and Interfaces

### Navigation Components

#### NavigationProvider

**Purpose**: Provides navigation state and helper functions to all child components

**Interface**:
```typescript
interface NavigationContextValue {
  currentRoute: string;
  navigationHistory: string[];
  isAuthenticated: boolean;
  goToDashboard: () => void;
  goToDiscover: () => void;
  goToVerification: (taskId?: string) => void;
  goToMerchants: () => void;
  goToBridge: () => void;
  goBack: () => void;
}

interface NavigationProviderProps {
  children: ReactNode;
}
```

**Implementation Notes**:
- Uses React Context API
- Integrates with Next.js useRouter and usePathname hooks
- Tracks navigation history for back navigation
- Syncs with Clerk authentication state
- Persists minimal state to sessionStorage (current route only)

#### TopNavBar

**Purpose**: Primary navigation component displayed on all pages

**Interface**:
```typescript
interface TopNavBarProps {
  variant?: 'landing' | 'app';
}

interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  requiresAuth?: boolean;
}
```

**Features**:
- Responsive design (desktop and mobile)
- Active route highlighting
- User authentication status display
- Wallet connection integration
- Mobile menu toggle

**Variants**:
- `landing`: Simplified navigation for public landing page
- `app`: Full navigation for authenticated application pages

#### SideNavBar

**Purpose**: Secondary navigation for application pages (optional, used in operator hub)

**Interface**:
```typescript
interface SideNavBarProps {
  navItems: NavItem[];
  collapsed?: boolean;
}
```

**Features**:
- Collapsible sidebar
- Icon-based navigation
- Active route indicator
- Persistent across page navigation

#### MobileDrawer

**Purpose**: Slide-out navigation menu for mobile devices

**Interface**:
```typescript
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}
```

**Features**:
- Touch gesture support (swipe to open/close)
- Backdrop overlay
- Body scroll lock when open
- Smooth animations
- Accessibility (focus trap, keyboard navigation)

#### Breadcrumbs

**Purpose**: Display hierarchical navigation path for nested routes

**Interface**:
```typescript
interface BreadcrumbsProps {
  maxItems?: number;
  separator?: ReactNode;
}

interface BreadcrumbSegment {
  label: string;
  href: string;
  isCurrentPage: boolean;
}
```

**Features**:
- Automatic generation from route path
- Custom labels for route segments
- Clickable segments for navigation
- Responsive (collapse on mobile)
- Skip on top-level routes

**Route Label Mapping**:
```typescript
const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/discover': 'Discover',
  '/verification': 'Verification',
  '/verification/camera': 'Camera',
  '/verification/status': 'Status',
  '/merchants': 'Merchants',
  '/merchants/hub-main': 'Hub',
  '/merchants/redemption': 'Redemption',
  '/bridge': 'Bridge',
};
```

### API Components

#### API Route Handlers

**Base Response Interface**:
```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

#### Middleware Interfaces

**Authentication Middleware**:
```typescript
interface AuthContext {
  userId: string;
  sessionId: string;
  role: 'user' | 'admin';
}

type AuthenticatedHandler = (
  request: Request,
  context: { params: unknown; auth: AuthContext }
) => Promise<Response>;
```

**Rate Limiting Middleware**:
```typescript
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (request: Request) => string;
}
```

**Logging Middleware**:
```typescript
interface LogContext {
  requestId: string;
  method: string;
  path: string;
  userId?: string;
  timestamp: string;
  duration?: number;
  statusCode?: number;
}
```

## Data Models

### Navigation State Models

```typescript
// Navigation context state
interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
  navigationHistory: string[];
  isAuthenticated: boolean;
  userRole: 'guest' | 'user' | 'admin';
}

// Route configuration
interface RouteConfig {
  path: string;
  requiresAuth: boolean;
  allowedRoles: string[];
  redirectTo?: string;
}
```

### API Request/Response Schemas

#### Tasks API

**GET /api/tasks**

Request Query Parameters:
```typescript
interface TasksQueryParams {
  category?: 'transit' | 'recycling' | 'energy' | 'community';
  taskId?: string;
  limit?: number;
  offset?: number;
}
```

Response:
```typescript
interface TasksResponse {
  tasks: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    baseReward: number;
    bonusMultiplier: number;
    verificationHint: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}
```

#### Verification API

**POST /api/verify**

Request Body:
```typescript
interface VerifyRequest {
  taskId: string;
  proofHash: string;
  submittedAt: number;
  geoHash?: string;
  proofType: 'photo' | 'transit' | 'weight' | 'sensor';
  oracleSource?: string;
  oracleConfidence?: number;
  proofDetails?: Record<string, unknown>;
}
```

Response:
```typescript
interface VerifyResponse {
  result: {
    verified: boolean;
    taskName?: string;
    rewardDelta?: number;
    reason?: string;
  };
  ledger: Array<{
    id: string;
    taskId: string;
    reward: number;
    mintedAt: string;
  }>;
}
```

#### Rewards API

**GET /api/rewards**

Response:
```typescript
interface RewardsResponse {
  rewards: Array<{
    id: string;
    title: string;
    subtitle: string;
    cost: number;
    partner: string;
    available: boolean;
    category: string;
  }>;
}
```

#### Redemption API

**POST /api/redeem**

Request Body:
```typescript
interface RedeemRequest {
  rewardId: string;
  initiaAddress: string;
  initiaUsername?: string;
  displayName?: string;
  region?: string;
}
```

Response:
```typescript
interface RedeemResponse {
  success: boolean;
  reward?: {
    id: string;
    title: string;
    cost: number;
  };
  balanceBefore: number;
  balanceAfter: number;
  reason?: string;
}
```

#### Bridge API

**GET /api/bridge/history**

Response:
```typescript
interface BridgeHistoryResponse {
  transactions: Array<{
    id: string;
    amount: number;
    denom: string;
    status: 'pending' | 'completed' | 'failed';
    sourceChain: string;
    targetChain: string;
    timestamp: string;
    transactionLink: string;
  }>;
}
```

**POST /api/bridge/initiate**

Request Body:
```typescript
interface BridgeInitiateRequest {
  amount: number;
  denom: string;
  sourceChain: string;
  targetChain: string;
  recipientAddress: string;
}
```

Response:
```typescript
interface BridgeInitiateResponse {
  transactionId: string;
  status: 'pending';
  estimatedCompletionTime: string;
  trackingUrl: string;
}
```

### Database Models

```typescript
// User session tracking
interface UserSession {
  id: string;
  userId: string;
  clerkSessionId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
}

// API request logs
interface ApiRequestLog {
  id: string;
  requestId: string;
  method: string;
  path: string;
  userId?: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  errorMessage?: string;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
}

// Rate limit tracking
interface RateLimitEntry {
  key: string;
  count: number;
  windowStart: Date;
  windowEnd: Date;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Navigation component consistency

*For any* authenticated page in the application, the navigation component should be rendered with all required navigation links (Dashboard, Discover, Merchants, Verification, Bridge).

**Validates: Requirements 1.1, 1.2**

### Property 2: Client-side navigation preservation

*For any* navigation link click, the navigation should update the URL and render the target page without triggering a full page reload (window.location should not change, only history state).

**Validates: Requirements 1.3**

### Property 3: Active route indication

*For any* current route, the navigation component should apply an active indicator (class, style, or attribute) to the corresponding navigation link.

**Validates: Requirements 1.4**

### Property 4: Authentication-aware navigation

*For any* authentication state (authenticated or unauthenticated), the navigation component should display the appropriate authentication controls (sign-out button when authenticated, sign-in button when not).

**Validates: Requirements 1.6, 1.7**

### Property 5: Protected route redirection

*For any* protected route (/dashboard, /verification/*, /merchants/*), when accessed by an unauthenticated user, the system should redirect to the landing page (/).

**Validates: Requirements 2.3, 4.1, 4.2, 4.3**

### Property 6: Public route accessibility

*For any* public route (/, /discover, /bridge), the system should allow access without authentication and should not redirect to a login page.

**Validates: Requirements 4.5**

### Property 7: Authentication state reactivity

*For any* authentication state change (login or logout), the navigation system should update the displayed navigation options and available routes within one render cycle.

**Validates: Requirements 2.4, 4.6**

### Property 8: Task data completeness

*For any* task returned by the /api/tasks endpoint, the response should include all required fields: id, name, description, category, baseReward, bonusMultiplier, and verificationHint.

**Validates: Requirements 3.3, 6.2**

### Property 9: Navigation context passing

*For any* task selection on the discover page, navigating to /verification should preserve the selected task context (taskId) in the navigation state or URL parameters.

**Validates: Requirements 3.4**

### Property 10: API validation rejection

*For any* API endpoint, when receiving a request with invalid payload (missing required fields, wrong types, or out-of-range values), the endpoint should return a 400 status code with error details.

**Validates: Requirements 5.3, 5.4**

### Property 11: Error response consistency

*For any* error occurring in any API endpoint, the response should follow a consistent format with success: false, error.code, error.message, and meta.timestamp fields.

**Validates: Requirements 5.5, 13.2**

### Property 12: API request logging

*For any* API request to any endpoint, the system should create a log entry containing at minimum: timestamp, HTTP method, endpoint path, status code, and request duration.

**Validates: Requirements 5.6, 13.1**

### Property 13: Rate limiting enforcement

*For any* API endpoint with rate limiting enabled, when a client exceeds the configured request limit within the time window, subsequent requests should return a 429 status code with a Retry-After header.

**Validates: Requirements 5.7, 13.7**

### Property 14: Task filtering correctness

*For any* category filter applied to /api/tasks (transit, recycling, energy, community), all returned tasks should have a category field matching the filter value.

**Validates: Requirements 6.3**

### Property 15: Single task retrieval

*For any* valid taskId parameter sent to /api/tasks, the response should contain exactly one task with an id matching the requested taskId.

**Validates: Requirements 6.4**

### Property 16: Cache header presence

*For any* successful response from /api/tasks, the response headers should include cache control directives (Cache-Control header).

**Validates: Requirements 6.5**

### Property 17: Verification field requirements

*For any* POST request to /api/verify, if the request body is missing taskId, proofHash, or submittedAt fields, the endpoint should return a 400 status code with validation error details.

**Validates: Requirements 7.1, 7.2**

### Property 18: Verification persistence

*For any* successful proof verification, the system should create a verification record in the database and the record should be retrievable in subsequent queries.

**Validates: Requirements 7.3**

### Property 19: Reward minting

*For any* successful proof verification with a positive rewardDelta, the user's balance should increase by exactly the rewardDelta amount.

**Validates: Requirements 7.4**

### Property 20: Verification response completeness

*For any* verification request (successful or failed), the response should include result.verified (boolean), and if verified is true, should include result.taskName and result.rewardDelta.

**Validates: Requirements 7.5, 7.7**

### Property 21: Oracle integration

*For any* verification request with an oracleSource field, the system should invoke the specified oracle service and incorporate the oracle response into the verification decision.

**Validates: Requirements 7.6**

### Property 22: Redemption validation

*For any* POST request to /api/redeem, if the request body is missing rewardId or the user is not authenticated, the endpoint should return a 400 or 401 status code with error details.

**Validates: Requirements 8.2, 8.3**

### Property 23: Balance deduction

*For any* successful redemption, the user's balance should decrease by exactly the reward cost amount.

**Validates: Requirements 8.5**

### Property 24: Redemption persistence

*For any* successful redemption, the system should create a redemption record in the database and the record should be retrievable in subsequent queries.

**Validates: Requirements 8.6**

### Property 25: Redemption response completeness

*For any* redemption request (successful or failed), the response should include success (boolean), and if successful, should include reward details, balanceBefore, and balanceAfter.

**Validates: Requirements 8.7**

### Property 26: Bridge request creation

*For any* valid POST request to /api/bridge/initiate, the system should create a bridge request record in the database with status 'pending' and return a unique transactionId.

**Validates: Requirements 9.2, 9.4**

### Property 27: Bridge request validation

*For any* POST request to /api/bridge/initiate, if the request is missing amount, sourceChain, or targetChain fields, the endpoint should return a 400 status code with validation error details.

**Validates: Requirements 9.3**

### Property 28: Bridge status updates

*For any* bridge transaction, the status field should only transition through valid states: pending → completed, or pending → failed (no other transitions allowed).

**Validates: Requirements 9.6**

### Property 29: Bridge completion events

*For any* bridge transaction that transitions to 'completed' status, the system should emit an event containing the transactionId and completion timestamp.

**Validates: Requirements 9.7**

### Property 30: Navigation context state tracking

*For any* navigation action, the NavigationContext should update its currentRoute, previousRoute, and navigationHistory properties to reflect the new navigation state.

**Validates: Requirements 10.2, 10.3**

### Property 31: Navigation helper functions

*For any* navigation helper function (goToDashboard, goToDiscover, goToVerification, goToMerchants, goToBridge), calling the function should navigate to the corresponding route and update the NavigationContext.

**Validates: Requirements 10.4**

### Property 32: Navigation state persistence

*For any* page reload, if the user was on a valid route before reload, the NavigationContext should restore the currentRoute state after reload.

**Validates: Requirements 10.5**

### Property 33: Authentication-triggered navigation updates

*For any* authentication state change (login or logout), the NavigationContext should update its isAuthenticated property and trigger re-evaluation of available navigation options.

**Validates: Requirements 10.6**

### Property 34: Breadcrumb display on nested routes

*For any* route with more than one path segment (e.g., /merchants/hub-main), the navigation system should display breadcrumb navigation with segments for each path level.

**Validates: Requirements 11.1, 11.4**

### Property 35: Breadcrumb navigation

*For any* breadcrumb segment click, the system should navigate to the route corresponding to that breadcrumb level.

**Validates: Requirements 11.3**

### Property 36: Breadcrumb hiding on top-level routes

*For any* top-level route (/, /dashboard, /discover, /bridge), the navigation system should not display breadcrumb navigation.

**Validates: Requirements 11.5**

### Property 37: Mobile menu toggle visibility

*For any* viewport width less than 768px, the navigation component should display a mobile menu toggle button and hide the desktop navigation links.

**Validates: Requirements 12.1**

### Property 38: Mobile drawer interaction

*For any* mobile menu toggle click, the mobile navigation drawer should open if closed, or close if open.

**Validates: Requirements 12.2**

### Property 39: Mobile navigation completeness

*For any* navigation link in the desktop navigation, the same link should be present in the mobile navigation drawer.

**Validates: Requirements 12.3**

### Property 40: Mobile navigation and drawer closure

*For any* navigation link click within the mobile drawer, the system should navigate to the target route and close the mobile drawer.

**Validates: Requirements 12.4**

### Property 41: Mobile drawer gesture support

*For any* swipe gesture (left or right) on the mobile drawer, the drawer should respond by opening or closing based on the gesture direction.

**Validates: Requirements 12.5**

### Property 42: Body scroll lock

*For any* state where the mobile drawer is open, the body element should have scroll disabled (overflow: hidden or equivalent).

**Validates: Requirements 12.6**

### Property 43: Error logging completeness

*For any* error occurring in any API endpoint, the system should create a log entry containing: timestamp, endpoint, error message, stack trace, and request details.

**Validates: Requirements 13.1**

### Property 44: Sensitive data exclusion from errors

*For any* error response from any API endpoint, the response should not contain sensitive information such as database connection strings, internal file paths, or authentication tokens.

**Validates: Requirements 13.4**

### Property 45: Structured logging with levels

*For any* log entry created by the system, the log should include a level field with one of the following values: 'info', 'warn', or 'error'.

**Validates: Requirements 13.5**

### Property 46: Authentication token validation

*For any* protected API endpoint, when receiving a request without a valid authentication token, the endpoint should return a 401 status code.

**Validates: Requirements 14.1, 14.2**

### Property 47: Authorization enforcement

*For any* API request attempting to access another user's data, if the authenticated user's ID does not match the resource owner's ID, the endpoint should return a 403 status code.

**Validates: Requirements 14.4**

### Property 48: User identity extraction

*For any* authenticated API request, the system should extract the user ID from the authentication token and use it to scope all database queries and operations.

**Validates: Requirements 14.5**

### Property 49: Role-based access control

*For any* admin-only API endpoint, when receiving a request from a user without admin role, the endpoint should return a 403 status code.

**Validates: Requirements 14.6**

### Property 50: Token refresh

*For any* API request with an expired but refreshable authentication token, the system should attempt to refresh the token and process the request if refresh succeeds.

**Validates: Requirements 14.7**

### Property 51: Link prefetching

*For any* navigation link rendered on a page, the Next.js Link component should prefetch the target page's data when the link enters the viewport.

**Validates: Requirements 15.1**

### Property 52: Scroll position restoration

*For any* back navigation action, the system should restore the scroll position to the same position the user was at before navigating away from the page.

**Validates: Requirements 15.3**

### Property 53: Critical asset preloading

*For any* application load, the system should preload critical navigation assets (navigation component code, authentication state) before rendering the first page.

**Validates: Requirements 15.5**

### Property 54: Loading indicator display

*For any* navigation action that takes longer than 200ms, the system should display a loading indicator until the target page is ready to render.

**Validates: Requirements 15.6**

### Property 55: Page caching for back navigation

*For any* previously visited page, navigating back to that page should render instantly using cached data without making new API requests.

**Validates: Requirements 15.7**

## Error Handling

### Client-Side Error Handling

**Navigation Errors**:
- **Route Not Found**: Display 404 page with navigation back to home
- **Authentication Required**: Redirect to landing page with message
- **Network Errors**: Display retry button and error message
- **Context Errors**: Fallback to default navigation state

**Error Boundaries**:
```typescript
// Navigation error boundary
class NavigationErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    logError('NavigationError', error, errorInfo);
    
    // Reset navigation state
    this.setState({ hasError: true });
  }
  
  render() {
    if (this.state.hasError) {
      return <NavigationFallback />;
    }
    return this.props.children;
  }
}
```

**Retry Logic**:
- Failed navigation: Retry once automatically
- Failed API calls: Exponential backoff (1s, 2s, 4s)
- Network timeout: 30 seconds default

### Server-Side Error Handling

**API Error Categories**:

1. **Validation Errors (400)**:
   - Missing required fields
   - Invalid field types
   - Out-of-range values
   - Malformed request body

2. **Authentication Errors (401)**:
   - Missing authentication token
   - Invalid token
   - Expired token (non-refreshable)

3. **Authorization Errors (403)**:
   - Insufficient permissions
   - Resource access denied
   - Role requirement not met

4. **Not Found Errors (404)**:
   - Resource does not exist
   - Invalid endpoint

5. **Rate Limit Errors (429)**:
   - Too many requests
   - Rate limit exceeded

6. **Server Errors (500)**:
   - Database connection failures
   - Unhandled exceptions
   - External service failures

**Error Response Format**:
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    details?: unknown;      // Additional error context (dev only)
  };
  meta: {
    timestamp: string;      // ISO 8601 timestamp
    requestId: string;      // Unique request identifier
  };
}
```

**Error Handling Middleware**:
```typescript
export function errorHandler(error: Error, request: Request): Response {
  const requestId = generateRequestId();
  
  // Log error with full context
  logger.error('API Error', {
    requestId,
    error: error.message,
    stack: error.stack,
    method: request.method,
    path: request.url,
    timestamp: new Date().toISOString(),
  });
  
  // Determine error type and status code
  const { statusCode, errorCode, message } = categorizeError(error);
  
  // Return formatted error response
  return NextResponse.json(
    {
      success: false,
      error: {
        code: errorCode,
        message: sanitizeErrorMessage(message),
        ...(process.env.NODE_ENV === 'development' && {
          details: error.stack,
        }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status: statusCode }
  );
}
```

**Error Recovery Strategies**:
- **Database Errors**: Retry with exponential backoff (3 attempts)
- **External API Errors**: Fallback to cached data or default values
- **Validation Errors**: Return detailed field-level errors
- **Authentication Errors**: Clear invalid tokens, prompt re-authentication

### Logging Strategy

**Log Levels**:
- **INFO**: Successful operations, normal flow
- **WARN**: Recoverable errors, deprecated API usage
- **ERROR**: Unrecoverable errors, exceptions

**Log Structure**:
```typescript
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  timestamp: string;
  requestId: string;
  userId?: string;
  message: string;
  context: {
    method?: string;
    path?: string;
    statusCode?: number;
    duration?: number;
    error?: string;
    stack?: string;
  };
}
```

**Logging Implementation**:
- Use Winston or Pino for structured logging
- Log to stdout in production (captured by container orchestration)
- Include request ID in all logs for tracing
- Sanitize sensitive data (tokens, passwords, PII)
- Aggregate logs in centralized monitoring (e.g., Datadog, New Relic)

## Testing Strategy

### Dual Testing Approach

The routing and navigation system requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Specific navigation flows (landing → dashboard)
- Error conditions (404, authentication failures)
- Component rendering with specific props
- API endpoint responses with known data
- Edge cases (empty task list, insufficient balance)

**Property-Based Tests**: Verify universal properties across all inputs
- Navigation behavior for any route
- API validation for any invalid payload
- Authentication enforcement for any protected route
- Error response format for any error type
- Rate limiting for any request volume

### Property-Based Testing Configuration

**Library Selection**: Use `fast-check` for TypeScript/JavaScript property-based testing

**Test Configuration**:
```typescript
import fc from 'fast-check';

// Configure all property tests to run minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});
```

**Property Test Structure**:
```typescript
describe('Feature: routing-and-navigation-system', () => {
  it('Property 5: Protected route redirection', () => {
    // Feature: routing-and-navigation-system, Property 5: For any protected route, when accessed by an unauthenticated user, the system should redirect to the landing page
    
    fc.assert(
      fc.property(
        fc.constantFrom('/dashboard', '/verification', '/verification/camera', '/merchants', '/merchants/hub-main'),
        async (protectedRoute) => {
          // Arrange: Set unauthenticated state
          mockAuthState({ authenticated: false });
          
          // Act: Navigate to protected route
          const response = await navigateTo(protectedRoute);
          
          // Assert: Should redirect to landing page
          expect(response.redirected).toBe(true);
          expect(response.url).toBe('/');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property Test Tags**: Each property test must include a comment tag referencing the design document property:
```typescript
// Feature: routing-and-navigation-system, Property {number}: {property_text}
```

### Unit Testing Strategy

**Navigation Component Tests**:
- Render navigation with authenticated/unauthenticated states
- Verify active route highlighting
- Test mobile menu toggle and drawer
- Verify breadcrumb generation for specific routes
- Test navigation helper functions

**API Endpoint Tests**:
- Test successful responses with valid data
- Test validation errors with specific invalid payloads
- Test authentication errors with missing/invalid tokens
- Test authorization errors with wrong user IDs
- Test rate limiting with burst requests
- Test error response format consistency

**Integration Tests**:
- Test full navigation flows (landing → dashboard → verification)
- Test authentication flow (login → redirect → access protected route)
- Test API request/response cycles with database
- Test middleware stack execution order

**Test Coverage Goals**:
- Line coverage: > 80%
- Branch coverage: > 75%
- Function coverage: > 85%
- Property test iterations: 100 per property

### Testing Tools

- **Unit Testing**: Jest + React Testing Library
- **Property Testing**: fast-check
- **E2E Testing**: Playwright
- **API Testing**: Supertest
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: Istanbul/nyc

### Test Organization

```
tests/
├── unit/
│   ├── components/
│   │   ├── navigation/
│   │   │   ├── TopNavBar.test.tsx
│   │   │   ├── SideNavBar.test.tsx
│   │   │   ├── MobileDrawer.test.tsx
│   │   │   └── Breadcrumbs.test.tsx
│   │   └── NavigationProvider.test.tsx
│   └── api/
│       ├── tasks.test.ts
│       ├── verify.test.ts
│       ├── rewards.test.ts
│       ├── redeem.test.ts
│       └── bridge.test.ts
├── property/
│   ├── navigation.property.test.ts
│   ├── api-validation.property.test.ts
│   ├── authentication.property.test.ts
│   └── error-handling.property.test.ts
├── integration/
│   ├── navigation-flow.test.ts
│   ├── authentication-flow.test.ts
│   └── api-integration.test.ts
└── e2e/
    ├── landing-to-dashboard.spec.ts
    ├── task-verification.spec.ts
    └── reward-redemption.spec.ts
```

### Continuous Integration

- Run unit tests on every commit
- Run property tests on every pull request
- Run integration tests before merge
- Run E2E tests on staging deployment
- Generate coverage reports and enforce thresholds
- Fail builds on test failures or coverage drops

