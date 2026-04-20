# Implementation Plan: Routing and Navigation System

## Overview

This implementation plan creates a comprehensive routing and navigation system for the EcoChain application, including client-side navigation components, backend API architecture, route protection middleware, and property-based tests. The system leverages Next.js 16.2.1 App Router with TypeScript, Clerk authentication, and follows RESTful API design patterns.

## Tasks

- [x] 1. Set up navigation infrastructure and context
  - Create NavigationProvider with React Context for navigation state management
  - Implement navigation helper functions (goToDashboard, goToDiscover, goToVerification, goToMerchants, goToBridge, goBack)
  - Track currentRoute, previousRoute, navigationHistory, and isAuthenticated state
  - Integrate with Next.js useRouter and usePathname hooks
  - Sync with Clerk authentication state
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ]* 1.1 Write property test for NavigationProvider
  - **Property 30: Navigation context state tracking**
  - **Validates: Requirements 10.2, 10.3**

- [ ]* 1.2 Write property test for authentication-triggered navigation updates
  - **Property 33: Authentication-triggered navigation updates**
  - **Validates: Requirements 10.6**

- [ ] 2. Enhance TopNavBar component with authentication and wallet integration
  - [x] 2.1 Update TopNavBar to support 'landing' and 'app' variants
    - Add variant prop to switch between simplified public nav and full app nav
    - Display Dashboard, Discover, Merchants, Verification, Bridge links for 'app' variant
    - Integrate Clerk UserButton for authentication controls
    - Add InterwovenKit wallet connection component
    - Implement active route highlighting using pathname
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 2.2 Write property test for navigation component consistency
    - **Property 1: Navigation component consistency**
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 2.3 Write property test for active route indication
    - **Property 3: Active route indication**
    - **Validates: Requirements 1.4**

  - [ ]* 2.4 Write property test for authentication-aware navigation
    - **Property 4: Authentication-aware navigation**
    - **Validates: Requirements 1.6, 1.7**

- [ ] 3. Implement mobile navigation components
  - [x] 3.1 Create MobileDrawer component
    - Implement slide-out drawer with backdrop overlay
    - Add touch gesture support for swipe to open/close
    - Implement body scroll lock when drawer is open
    - Add smooth animations and focus trap for accessibility
    - Display all navigation links from desktop nav
    - Auto-close drawer on navigation link click
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 3.2 Add mobile menu toggle to TopNavBar
    - Display mobile menu toggle button for viewport width < 768px
    - Hide desktop navigation links on mobile
    - Connect toggle to MobileDrawer open/close state
    - _Requirements: 12.1, 12.2_

  - [ ]* 3.3 Write property test for mobile menu toggle visibility
    - **Property 37: Mobile menu toggle visibility**
    - **Validates: Requirements 12.1**

  - [ ]* 3.4 Write property test for mobile drawer interaction
    - **Property 38: Mobile drawer interaction**
    - **Validates: Requirements 12.2**

  - [ ]* 3.5 Write property test for mobile navigation completeness
    - **Property 39: Mobile navigation completeness**
    - **Validates: Requirements 12.3**

  - [ ]* 3.6 Write property test for body scroll lock
    - **Property 42: Body scroll lock**
    - **Validates: Requirements 12.6**

- [x] 4. Implement Breadcrumbs component
  - Create Breadcrumbs component with automatic route segment generation
  - Define route label mapping for all application routes
  - Generate breadcrumb segments from pathname
  - Make breadcrumb segments clickable for navigation
  - Hide breadcrumbs on top-level routes (/, /dashboard, /discover, /bridge)
  - Implement responsive design (collapse on mobile)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 4.1 Write property test for breadcrumb display on nested routes
  - **Property 34: Breadcrumb display on nested routes**
  - **Validates: Requirements 11.1, 11.4**

- [ ]* 4.2 Write property test for breadcrumb navigation
  - **Property 35: Breadcrumb navigation**
  - **Validates: Requirements 11.3**

- [ ]* 4.3 Write property test for breadcrumb hiding on top-level routes
  - **Property 36: Breadcrumb hiding on top-level routes**
  - **Validates: Requirements 11.5**

- [x] 5. Checkpoint - Ensure navigation components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement route protection middleware
  - [x] 6.1 Create middleware.ts with Clerk authentication integration
    - Define protected routes array (/dashboard, /verification/*, /merchants/*, /api/verify, /api/redeem, /api/bridge/*)
    - Define public routes array (/, /discover, /bridge UI, /figma-screens/*, /api/tasks, /api/rewards)
    - Use Clerk auth() to check authentication status
    - Redirect unauthenticated users from protected routes to landing page
    - Allow authenticated users to access all routes
    - _Requirements: 2.3, 4.1, 4.2, 4.3, 4.5_

  - [ ]* 6.2 Write property test for protected route redirection
    - **Property 5: Protected route redirection**
    - **Validates: Requirements 2.3, 4.1, 4.2, 4.3**

  - [ ]* 6.3 Write property test for public route accessibility
    - **Property 6: Public route accessibility**
    - **Validates: Requirements 4.5**

  - [ ]* 6.4 Write property test for authentication state reactivity
    - **Property 7: Authentication state reactivity**
    - **Validates: Requirements 2.4, 4.6**

- [ ] 7. Implement /discover page
  - [x] 7.1 Create src/app/discover/page.tsx
    - Fetch tasks from /api/tasks endpoint
    - Display task cards with name, description, category, baseReward, bonusMultiplier
    - Implement category filtering (transit, recycling, energy, community)
    - Add task selection that navigates to /verification with taskId context
    - Use NavigationProvider helper functions for navigation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 7.2 Write property test for navigation context passing
    - **Property 9: Navigation context passing**
    - **Validates: Requirements 3.4**

- [ ] 8. Implement API infrastructure and middleware
  - [x] 8.1 Create API middleware utilities
    - Create src/lib/api/middleware.ts with authentication middleware using Clerk
    - Implement rate limiting middleware with configurable limits
    - Create request logging middleware with structured logging
    - Implement error handling middleware with consistent error response format
    - Create response formatting utilities
    - _Requirements: 5.1, 5.5, 5.6, 5.7, 13.1, 13.2, 13.5, 14.1, 14.2_

  - [x] 8.2 Create API validation schemas
    - Create src/lib/api/schemas.ts with Zod schemas for all API endpoints
    - Define TasksQueryParams, VerifyRequest, RedeemRequest, BridgeInitiateRequest schemas
    - Define response schemas for type safety
    - _Requirements: 5.3, 5.4_

  - [x] 8.3 Create API error handling utilities
    - Create src/lib/api/errors.ts with error categorization function
    - Implement error sanitization to remove sensitive data
    - Define error codes and messages for all error types
    - _Requirements: 13.2, 13.4_

  - [ ]* 8.4 Write property test for API validation rejection
    - **Property 10: API validation rejection**
    - **Validates: Requirements 5.3, 5.4**

  - [ ]* 8.5 Write property test for error response consistency
    - **Property 11: Error response consistency**
    - **Validates: Requirements 5.5, 13.2**

  - [ ]* 8.6 Write property test for API request logging
    - **Property 12: API request logging**
    - **Validates: Requirements 5.6, 13.1**

  - [ ]* 8.7 Write property test for rate limiting enforcement
    - **Property 13: Rate limiting enforcement**
    - **Validates: Requirements 5.7, 13.7**

  - [ ]* 8.8 Write property test for sensitive data exclusion from errors
    - **Property 44: Sensitive data exclusion from errors**
    - **Validates: Requirements 13.4**

- [ ] 9. Implement /api/tasks endpoint
  - [x] 9.1 Create or enhance src/app/api/tasks/route.ts
    - Implement GET handler with query parameter support (category, taskId, limit, offset)
    - Fetch tasks from database using Prisma
    - Implement category filtering logic
    - Implement single task retrieval by taskId
    - Return consistent ApiResponse format with tasks array
    - Add cache control headers for performance
    - Apply request logging middleware
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 9.2 Write property test for task data completeness
    - **Property 8: Task data completeness**
    - **Validates: Requirements 3.3, 6.2**

  - [ ]* 9.3 Write property test for task filtering correctness
    - **Property 14: Task filtering correctness**
    - **Validates: Requirements 6.3**

  - [ ]* 9.4 Write property test for single task retrieval
    - **Property 15: Single task retrieval**
    - **Validates: Requirements 6.4**

  - [ ]* 9.5 Write property test for cache header presence
    - **Property 16: Cache header presence**
    - **Validates: Requirements 6.5**

- [x] 10. Checkpoint - Ensure tasks API works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement /api/verify endpoint
  - [x] 11.1 Create or enhance src/app/api/verify/route.ts
    - Apply authentication middleware to protect endpoint
    - Implement POST handler with Zod schema validation
    - Validate required fields (taskId, proofHash, submittedAt)
    - Integrate with oracle services when oracleSource is provided
    - Create verification record in database on success
    - Mint rewards to user account using rewardDelta
    - Return verification result with verified status, taskName, rewardDelta
    - Return ledger entries for user's verification history
    - Apply error handling and logging middleware
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 11.2 Write property test for verification field requirements
    - **Property 17: Verification field requirements**
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 11.3 Write property test for verification persistence
    - **Property 18: Verification persistence**
    - **Validates: Requirements 7.3**

  - [ ]* 11.4 Write property test for reward minting
    - **Property 19: Reward minting**
    - **Validates: Requirements 7.4**

  - [ ]* 11.5 Write property test for verification response completeness
    - **Property 20: Verification response completeness**
    - **Validates: Requirements 7.5, 7.7**

  - [ ]* 11.6 Write property test for oracle integration
    - **Property 21: Oracle integration**
    - **Validates: Requirements 7.6**

- [x] 12. Implement /api/rewards endpoint
  - Create or enhance src/app/api/rewards/route.ts
  - Implement GET handler to fetch rewards catalog from database
  - Return rewards with id, title, subtitle, cost, partner, available, category
  - Apply request logging middleware
  - Add cache control headers
  - _Requirements: 8.1_

- [ ] 13. Implement /api/redeem endpoint
  - [x] 13.1 Create or enhance src/app/api/redeem/route.ts
    - Apply authentication middleware to protect endpoint
    - Implement POST handler with Zod schema validation
    - Validate required fields (rewardId, initiaAddress)
    - Check user balance against reward cost
    - Deduct reward cost from user balance on success
    - Create redemption record in database
    - Return success status, reward details, balanceBefore, balanceAfter
    - Return error with reason if insufficient balance
    - Apply error handling and logging middleware
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 13.2 Write property test for redemption validation
    - **Property 22: Redemption validation**
    - **Validates: Requirements 8.2, 8.3**

  - [ ]* 13.3 Write property test for balance deduction
    - **Property 23: Balance deduction**
    - **Validates: Requirements 8.5**

  - [ ]* 13.4 Write property test for redemption persistence
    - **Property 24: Redemption persistence**
    - **Validates: Requirements 8.6**

  - [ ]* 13.5 Write property test for redemption response completeness
    - **Property 25: Redemption response completeness**
    - **Validates: Requirements 8.7**

- [ ] 14. Implement /api/bridge endpoints
  - [x] 14.1 Create or enhance src/app/api/bridge/history/route.ts
    - Apply authentication middleware to protect endpoint
    - Implement GET handler to fetch user's bridge transaction history
    - Return transactions with id, amount, denom, status, sourceChain, targetChain, timestamp, transactionLink
    - Apply request logging middleware
    - _Requirements: 9.1_

  - [x] 14.2 Create or enhance src/app/api/bridge/initiate/route.ts
    - Apply authentication middleware to protect endpoint
    - Implement POST handler with Zod schema validation
    - Validate required fields (amount, sourceChain, targetChain, recipientAddress)
    - Create bridge request record in database with status 'pending'
    - Integrate with Initia bridge infrastructure
    - Return transactionId, status, estimatedCompletionTime, trackingUrl
    - Implement status update mechanism (pending → completed/failed)
    - Emit event on transaction completion
    - Apply error handling and logging middleware
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]* 14.3 Write property test for bridge request creation
    - **Property 26: Bridge request creation**
    - **Validates: Requirements 9.2, 9.4**

  - [ ]* 14.4 Write property test for bridge request validation
    - **Property 27: Bridge request validation**
    - **Validates: Requirements 9.3**

  - [ ]* 14.5 Write property test for bridge status updates
    - **Property 28: Bridge status updates**
    - **Validates: Requirements 9.6**

  - [ ]* 14.6 Write property test for bridge completion events
    - **Property 29: Bridge completion events**
    - **Validates: Requirements 9.7**

- [x] 15. Checkpoint - Ensure all API endpoints work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Implement API authentication and authorization
  - [x] 16.1 Enhance authentication middleware with token validation
    - Extract user ID from Clerk authentication token
    - Validate token expiration and signature
    - Return 401 for missing or invalid tokens
    - Implement token refresh logic for expired but refreshable tokens
    - _Requirements: 14.1, 14.2, 14.7_

  - [x] 16.2 Implement authorization checks
    - Extract user identity from authentication token
    - Scope all database queries by authenticated user ID
    - Return 403 when user attempts to access another user's data
    - Implement role-based access control for admin endpoints
    - _Requirements: 14.4, 14.5, 14.6_

  - [ ]* 16.3 Write property test for authentication token validation
    - **Property 46: Authentication token validation**
    - **Validates: Requirements 14.1, 14.2**

  - [ ]* 16.4 Write property test for authorization enforcement
    - **Property 47: Authorization enforcement**
    - **Validates: Requirements 14.4**

  - [ ]* 16.5 Write property test for user identity extraction
    - **Property 48: User identity extraction**
    - **Validates: Requirements 14.5**

  - [ ]* 16.6 Write property test for role-based access control
    - **Property 49: Role-based access control**
    - **Validates: Requirements 14.6**

  - [ ]* 16.7 Write property test for token refresh
    - **Property 50: Token refresh**
    - **Validates: Requirements 14.7**

- [x] 17. Implement structured logging system
  - Create src/lib/api/logger.ts with Winston or Pino
  - Configure log levels (info, warn, error)
  - Implement structured log format with timestamp, requestId, userId, context
  - Add log sanitization to remove sensitive data
  - Configure log output to stdout for production
  - _Requirements: 13.1, 13.5_

- [ ]* 17.1 Write property test for error logging completeness
  - **Property 43: Error logging completeness**
  - **Validates: Requirements 13.1**

- [ ]* 17.2 Write property test for structured logging with levels
  - **Property 45: Structured logging with levels**
  - **Validates: Requirements 13.5**

- [ ] 18. Implement navigation performance optimizations
  - [x] 18.1 Configure Next.js Link prefetching
    - Ensure all navigation links use Next.js Link component
    - Configure prefetch behavior for optimal performance
    - _Requirements: 15.1, 15.2_

  - [ ] 18.2 Implement scroll position restoration
    - Configure Next.js scroll restoration for back navigation
    - Test scroll position preservation across navigation
    - _Requirements: 15.3_

  - [ ] 18.3 Add loading indicators for slow navigation
    - Create loading indicator component
    - Display loading state for navigation taking > 200ms
    - _Requirements: 15.6_

  - [ ]* 18.4 Write property test for link prefetching
    - **Property 51: Link prefetching**
    - **Validates: Requirements 15.1**

  - [ ]* 18.5 Write property test for scroll position restoration
    - **Property 52: Scroll position restoration**
    - **Validates: Requirements 15.3**

  - [ ]* 18.6 Write property test for loading indicator display
    - **Property 54: Loading indicator display**
    - **Validates: Requirements 15.6**

- [ ] 19. Integrate navigation components into application layout
  - [ ] 19.1 Update src/app/layout.tsx to include NavigationProvider
    - Wrap application with NavigationProvider
    - Ensure context is available to all pages
    - _Requirements: 10.1_

  - [ ] 19.2 Update page layouts to use enhanced navigation components
    - Update dashboard, verification, merchants pages to use TopNavBar with 'app' variant
    - Add Breadcrumbs component to nested route pages
    - Ensure MobileDrawer is accessible on all pages
    - _Requirements: 1.1, 1.2, 11.1_

  - [ ] 19.3 Update landing page to use TopNavBar with 'landing' variant
    - Display simplified navigation for public landing page
    - Add "Go to Dashboard" link for authenticated users
    - Add footer navigation links to discover, merchants, verification, bridge
    - _Requirements: 1.5, 2.4, 2.5_

- [ ]* 19.4 Write property test for client-side navigation preservation
  - **Property 2: Client-side navigation preservation**
  - **Validates: Requirements 1.3**

- [ ] 20. Final checkpoint - Ensure all tests pass and system works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests should be added for specific examples and edge cases
- All API endpoints use consistent error handling and logging
- Authentication is enforced at middleware level for protected routes
- Navigation uses Next.js Link component for optimal performance
