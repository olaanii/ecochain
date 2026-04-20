# Tasks: Blockchain Eco Rewards Integration

## Phase 1: Core Infrastructure (Weeks 1-2)

### 1.1 Database Schema and Migrations
- [x] Create PostgreSQL schema with all required tables (User, Task, Verification, Stake, Proposal, Vote, Ledger, Redemption)
- [x] Implement Prisma schema with relationships and constraints
- [x] Create database migrations for initial schema
- [x] Add indexes for performance optimization (userId, taskId, proofHash, status, createdAt)
- [x] Set up connection pooling configuration
- [x] Create seed data for development environment

**Acceptance Criteria:**
- All tables created with proper relationships
- Indexes created on all specified columns
- Migrations are reversible
- Seed data loads successfully
- Connection pooling configured with max 20 connections

**Dependencies:** None

**Complexity:** Medium

### 1.2 Authentication Middleware
- [x] Implement Clerk authentication integration
- [x] Create JWT token validation middleware
- [x] Implement role-based access control (public, authenticated, admin, owner)
- [x] Add session management with 24-hour expiration
- [x] Implement refresh token logic with 30-day expiration
- [x] Create middleware for protected API routes
- [x] Add CORS configuration for allowed origins

**Acceptance Criteria:**
- Clerk authentication working for web access
- JWT tokens validated on protected endpoints
- Role-based access control enforced
- Session tokens expire after 24 hours
- Refresh tokens work correctly
- CORS headers properly configured

**Dependencies:** None

**Complexity:** Medium

### 1.3 Base API Endpoints with Validation
- [x] Create API route structure following Next.js conventions
- [x] Implement Zod schema validation for all endpoints
- [x] Create error handling middleware with user-friendly messages
- [x] Implement request logging and monitoring
- [x] Add input sanitization for XSS prevention
- [x] Create response formatting utilities
- [x] Implement API documentation with OpenAPI/Swagger

**Acceptance Criteria:**
- All endpoints validate input with Zod schemas
- Invalid requests return 400 with detailed errors
- Sensitive data redacted from logs
- All responses follow consistent format
- API documentation generated and accessible
- Rate limiting headers included in responses

**Dependencies:** 1.2 Authentication Middleware

**Complexity:** Medium

### 1.4 Blockchain Connection and Wallet Integration
- [x] Set up wagmi configuration for Initia appchain
- [x] Implement viem provider setup
- [x] Create wallet connection component using @initia/interwovenkit-react
- [x] Implement wallet state management
- [x] Add wallet disconnection handling
- [x] Create wallet address validation (Bech32 format)
- [x] Implement Initia Auto-sign support
- [x] Add wallet connection persistence across page navigation

**Acceptance Criteria:**
- Wallet connects successfully to Initia appchain
- Chain ID validation working
- Wallet address stored in session
- Wallet disconnection clears session
- Wallet connection persists across navigation
- Bech32 address validation working
- Auto-sign transactions supported

**Dependencies:** None

**Complexity:** High

### 1.5 Event Listeners for Contract Events
- [x] Create event listener service for EcoReward contract
- [x] Implement listener for EcoVerifier contract events
- [x] Create listener for staking contract events
- [x] Implement listener for governance contract events
- [x] Add event processing queue for high-volume periods
- [x] Implement retry logic with exponential backoff (up to 3 retries)
- [x] Create event logging and audit trail
- [x] Add event processing monitoring and alerts

**Acceptance Criteria:**
- All contract events detected within 1 second
- Events processed and database updated correctly
- Failed events retried up to 3 times
- Event processing queue handles high volume
- All events logged for audit purposes
- Processing latency monitored and alerted

**Dependencies:** 1.1 Database Schema, 1.4 Blockchain Connection

**Complexity:** High


## Phase 2: Task and Verification System (Weeks 3-4)

### 2.1 Task Management API
- [x] Implement GET /api/tasks endpoint with filtering (category, reward range)
- [x] Implement GET /api/tasks/:taskId endpoint
- [x] Create task caching with 5-minute TTL
- [x] Implement task list pagination (limit: 50)
- [x] Add bonus multiplier calculation for each task
- [x] Create admin endpoints for task management (create, update, deactivate)
- [x] Implement task validation (baseReward > 0, bonusFactor 1.0-2.0)
- [x] Add task performance metrics tracking

**Acceptance Criteria:**
- Task list returns within 100ms
- Filtering by category works correctly
- Filtering by reward range works correctly
- Bonus multiplier calculated and displayed
- Caching working with 5-minute TTL
- Pagination working with 50 items per page
- Admin endpoints secured with role check

**Dependencies:** 1.1 Database Schema, 1.3 Base API Endpoints

**Complexity:** Medium

### 2.2 Verification Workflow with Oracle Integration
- [x] Implement POST /api/verify endpoint
- [x] Create proof data validation (non-empty, proper format)
- [x] Implement timestamp validation (within 48 hours)
- [x] Create oracle routing logic (photo, transit, IoT, manual)
- [x] Implement AI vision oracle integration
- [x] Implement transit API oracle integration
- [x] Implement IoT sensor oracle integration
- [x] Add oracle timeout handling (30 seconds)
- [x] Implement retry logic with exponential backoff (up to 3 retries)
- [x] Create oracle confidence threshold validation (>= 0.7)

**Acceptance Criteria:**
- Proof validation working for all types
- Timestamp validation enforces 48-hour window
- Oracle routing works for all verification methods
- Oracle responses received within 30 seconds
- Failed oracle calls retried up to 3 times
- Confidence threshold enforced (>= 0.7)
- Low confidence proofs rejected with reason
- Oracle timeout marks verification as pending

**Dependencies:** 1.1 Database Schema, 1.3 Base API Endpoints, 1.5 Event Listeners

**Complexity:** High

### 2.3 Proof Hash Generation and Validation
- [x] Implement SHA-256 proof hash generation
- [x] Create proof hash uniqueness validation
- [x] Implement duplicate proof detection
- [x] Add proof hash storage in database
- [x] Create proof hash lookup optimization
- [x] Implement proof data sanitization before hashing
- [x] Add proof hash collision testing

**Acceptance Criteria:**
- Proof hash generated using SHA-256
- Same proof data always generates same hash
- Different proof data generates different hashes
- Duplicate proofs rejected with error
- Proof hash uniqueness enforced at database level
- Proof hash lookup performs efficiently
- No collisions detected in testing

**Dependencies:** 2.2 Verification Workflow

**Complexity:** Low

### 2.4 Fraud Detection Algorithms
- [x] Implement fraud score calculation (0.0-1.0)
- [x] Create duplicate submission detection (24-hour window)
- [x] Implement velocity check (max 10 submissions per 24 hours)
- [x] Add geolocation anomaly detection
- [x] Implement oracle metadata inconsistency check
- [x] Create fraud score accumulation logic
- [x] Add fraud score capping at 1.0
- [x] Implement fraud flagging for manual review (score > 0.5)
- [x] Create 24-hour cooldown per task per user

**Acceptance Criteria:**
- Fraud score calculated between 0.0 and 1.0
- Duplicate detection increases score by 0.3
- Velocity check increases score by 0.2
- Geolocation anomaly increases score by 0.15
- Metadata inconsistency increases score by 0.25
- Fraud score capped at 1.0
- Submissions with score > 0.5 flagged for review
- 24-hour cooldown enforced per task per user

**Dependencies:** 2.2 Verification Workflow

**Complexity:** High

### 2.5 Admin Dashboard for Manual Review
- [x] Create admin dashboard UI for verification review
- [x] Implement flagged submission queue display
- [x] Add manual approval/rejection functionality
- [x] Create fraud score visualization
- [x] Implement submission details view with proof data
- [x] Add admin notes/comments on submissions
- [x] Create bulk action capabilities (approve/reject multiple)
- [x] Implement audit trail for admin actions
- [x] Add filtering and sorting for review queue

**Acceptance Criteria:**
- Dashboard displays all flagged submissions
- Admin can approve/reject submissions
- Fraud score displayed with breakdown
- Proof data viewable in dashboard
- Admin notes saved with submission
- Bulk actions working correctly
- All admin actions logged for audit
- Review queue filterable by status, fraud score, date

**Dependencies:** 2.4 Fraud Detection Algorithms

**Complexity:** Medium

### 2.6 Smart Contract Integration for Verification
- [x] Implement EcoVerifier contract interaction
- [x] Create submitProof() function call
- [x] Implement transaction hash tracking
- [x] Add transaction status monitoring
- [x] Create transaction failure handling
- [x] Implement gas estimation before submission
- [x] Add dynamic gas pricing
- [x] Create transaction retry logic
- [x] Implement revert reason parsing

**Acceptance Criteria:**
- submitProof() called successfully
- Transaction hash returned immediately
- Transaction status monitored until confirmation
- Failed transactions handled gracefully
- Gas estimated before submission
- Dynamic gas pricing applied
- Revert reasons parsed and logged
- Retry logic working with exponential backoff

**Dependencies:** 1.4 Blockchain Connection, 2.2 Verification Workflow

**Complexity:** High


## Phase 3: Rewards and Staking (Weeks 5-6)

### 3.1 Reward Catalog and Redemption
- [x] Implement GET /api/rewards endpoint with filtering
- [x] Create reward filtering by category and cost range
- [x] Implement reward availability checking
- [x] Add reward expiration validation
- [x] Create reward caching with 5-minute TTL
- [x] Implement POST /api/redeem endpoint
- [x] Add balance validation before redemption
- [x] Create voucher code generation
- [x] Implement partner API notification
- [x] Add redemption history tracking

**Acceptance Criteria:**
- Reward list returns within 100ms
- Filtering by category works correctly
- Filtering by cost range works correctly
- Out of stock rewards marked unavailable
- Expired rewards excluded from catalog
- Caching working with 5-minute TTL
- Balance validated before redemption
- Voucher codes generated and unique
- Partner APIs notified successfully
- Redemption history accessible

**Dependencies:** 1.1 Database Schema, 1.3 Base API Endpoints

**Complexity:** Medium

### 3.2 Staking System with Smart Contracts
- [x] Implement POST /api/stake endpoint
- [x] Create stake amount validation (>= 100 ECO)
- [x] Implement duration validation (30, 90, 180, 365 days)
- [x] Create APY calculation based on duration tier
- [x] Implement token transfer to staking contract
- [x] Create stake record in database
- [x] Implement POST /api/unstake endpoint
- [x] Add early withdrawal penalty logic (10%)
- [x] Create unstake transaction handling
- [x] Implement stake status updates

**Acceptance Criteria:**
- Minimum stake amount enforced (100 ECO)
- Duration validation enforces allowed values
- APY calculated correctly for each tier
- Tokens transferred to staking contract
- Stake records created with correct status
- Unstaking allowed after lock period
- Early withdrawal penalty applied (10%)
- Stake status updated to "withdrawn" or "penalized"
- Transaction hash stored with stake record

**Dependencies:** 1.4 Blockchain Connection, 1.1 Database Schema

**Complexity:** High

### 3.3 Reward Calculation Algorithms
- [x] Implement bonus multiplier calculation
- [x] Create streak bonus logic (+0.01 per day, max +0.3)
- [x] Implement category mastery bonus (+0.05 per 10 completions, max +0.2)
- [x] Add multiplier capping at 2.0x
- [x] Create reward calculation (baseReward × bonusMultiplier)
- [x] Implement staking reward calculation (compound interest)
- [x] Add daily compounding formula
- [x] Create reward accrual tracking
- [x] Implement reward distribution logic

**Acceptance Criteria:**
- Bonus multiplier between 1.0 and 2.0
- Streak bonus calculated correctly
- Category mastery bonus calculated correctly
- Multiplier capped at 2.0
- Final reward = baseReward × multiplier
- Staking rewards calculated with compound interest
- Daily compounding applied correctly
- Accrued rewards tracked accurately
- Rewards distributed to correct wallets

**Dependencies:** 2.1 Task Management API, 3.2 Staking System

**Complexity:** Medium

### 3.4 Partner API Integrations
- [x] Create partner API client abstraction
- [x] Implement reward partner API integration
- [x] Create transit API integration for verification
- [x] Implement IoT sensor API integration
- [x] Add error handling for partner API failures
- [x] Create retry logic for failed API calls
- [x] Implement API rate limiting per partner
- [x] Add partner API monitoring and alerts
- [x] Create fallback mechanisms for API outages

**Acceptance Criteria:**
- Partner APIs called successfully
- Redemption notifications sent to partners
- Transit API verification working
- IoT sensor data retrieved successfully
- API failures handled gracefully
- Retry logic working with exponential backoff
- Rate limits respected per partner
- API monitoring and alerting working
- Fallback mechanisms in place

**Dependencies:** 2.2 Verification Workflow, 3.1 Reward Catalog

**Complexity:** Medium

### 3.5 Staking UI Components
- [x] Create staking interface component
- [x] Implement stake amount input with validation
- [x] Create duration selector (30, 90, 180, 365 days)
- [x] Add APY display and calculation preview
- [x] Implement expected rewards display
- [x] Create stake confirmation dialog
- [x] Add transaction status tracking UI
- [x] Implement active stakes display
- [x] Create unstaking interface
- [x] Add accrued rewards display

**Acceptance Criteria:**
- Staking interface displays correctly
- Amount input validates minimum (100 ECO)
- Duration selector shows all options
- APY displayed for each duration
- Expected rewards calculated and shown
- Confirmation dialog shows all details
- Transaction status tracked in UI
- Active stakes listed with details
- Unstaking interface accessible
- Accrued rewards updated in real-time

**Dependencies:** 3.2 Staking System, 1.4 Blockchain Connection

**Complexity:** Medium

### 3.6 Balance Tracking and Updates
- [x] Implement GET /api/user/balance endpoint
- [x] Create balance calculation (total, available, staked, pending)
- [x] Implement balance caching with 30-second TTL
- [x] Create cache invalidation on operations
- [x] Implement real-time balance updates via WebSocket
- [x] Add balance reconciliation with blockchain
- [x] Create balance history tracking
- [x] Implement balance alerts for low balance
- [x] Add balance display in UI components

**Acceptance Criteria:**
- Balance query returns within 50ms (cached)
- Available balance = total - staked - pending
- Cache invalidated on mint/burn/stake/unstake
- Real-time updates via WebSocket working
- Blockchain balance reconciliation daily
- Balance history accessible
- Low balance alerts working
- Balance displayed accurately in UI

**Dependencies:** 1.1 Database Schema, 1.4 Blockchain Connection

**Complexity:** Medium


## Phase 4: Governance and Analytics (Weeks 7-8)

### 4.1 DAO Governance System
- [x] Implement GET /api/proposals endpoint with filtering
- [x] Create proposal status filtering (active, approved, rejected, executed)
- [x] Implement POST /api/proposals endpoint
- [x] Add minimum token balance validation for proposal creation
- [x] Create proposal status initialization (set to "active")
- [x] Implement voting period calculation
- [x] Add quorum calculation as percentage of total supply
- [x] Create proposal rate limiting (1 per hour per user)
- [x] Implement proposal details display
- [x] Add proposal history tracking

**Acceptance Criteria:**
- Proposals listed with all details
- Status filtering working correctly
- Proposal creation requires minimum balance
- Voting period set correctly
- Quorum calculated as percentage of supply
- Rate limiting enforced (1 per hour)
- Proposal status initialized to "active"
- Proposal history accessible
- All proposals displayed with vote counts

**Dependencies:** 1.1 Database Schema, 1.3 Base API Endpoints

**Complexity:** Medium

### 4.2 Proposal Creation and Voting
- [x] Implement POST /api/proposals/:proposalId/vote endpoint
- [x] Create vote validation (proposal exists, active, within period)
- [x] Add user vote history check (prevent duplicate votes)
- [x] Implement voting power calculation (user's token balance)
- [x] Create vote recording with voting power
- [x] Implement vote count updates (votesFor, votesAgainst, votesAbstain)
- [x] Add vote type validation (FOR, AGAINST, ABSTAIN)
- [x] Create optional vote reason storage
- [x] Implement vote rate limiting (10 per minute)
- [x] Add vote history tracking

**Acceptance Criteria:**
- Vote validation working for all checks
- Duplicate votes prevented
- Voting power calculated from token balance
- Vote counts updated correctly
- Vote types validated
- Vote reasons stored when provided
- Rate limiting enforced (10 per minute)
- Vote history accessible
- All votes recorded with timestamp

**Dependencies:** 4.1 DAO Governance System

**Complexity:** Medium

### 4.3 Proposal Execution
- [x] Implement proposal voting period end detection
- [x] Create quorum validation logic
- [x] Implement vote comparison (votesFor vs votesAgainst)
- [x] Create proposal approval logic
- [x] Implement proposal rejection logic
- [x] Create on-chain proposal execution
- [x] Add execution status tracking
- [x] Implement execution error handling
- [x] Create execution logging and audit trail
- [x] Add execution monitoring and alerts

**Acceptance Criteria:**
- Voting period end detected automatically
- Quorum validation working correctly
- Approval logic: quorum reached AND votesFor > votesAgainst
- Rejection logic: quorum not reached OR votesAgainst >= votesFor
- On-chain execution called for approved proposals
- Execution status updated to "executed" or "failed"
- Execution errors logged with details
- Execution timestamp recorded
- Monitoring and alerts working

**Dependencies:** 4.2 Proposal Creation and Voting

**Complexity:** High

### 4.4 Analytics Dashboard
- [x] Create analytics overview endpoint
- [x] Implement total participation metrics
- [x] Add total verifications tracking
- [x] Create total tokens minted/burned tracking
- [x] Implement carbon offset calculation
- [x] Add date range filtering for analytics
- [x] Create personal carbon impact calculation
- [x] Implement analytics caching (5-minute TTL)
- [x] Add analytics visualization components
- [x] Create analytics export functionality

**Acceptance Criteria:**
- Analytics overview returns within 200ms
- Total participation metrics calculated
- Total verifications tracked accurately
- Token economics tracked correctly
- Carbon offset calculated from tasks
- Date range filtering working
- Personal carbon impact calculated
- Caching working with 5-minute TTL
- Visualizations displaying correctly
- Export functionality working

**Dependencies:** 1.1 Database Schema, 1.3 Base API Endpoints

**Complexity:** Medium

### 4.5 Carbon Impact Tracking
- [x] Create carbon impact calculation per task
- [x] Implement cumulative carbon offset tracking
- [x] Add user carbon footprint reduction calculation
- [x] Create carbon impact visualization
- [x] Implement carbon impact leaderboard
- [x] Add carbon impact badges/achievements
- [x] Create carbon impact reporting
- [x] Implement carbon impact analytics
- [x] Add carbon impact goals and tracking
- [x] Create carbon impact notifications

**Acceptance Criteria:**
- Carbon impact calculated per task
- Cumulative carbon offset tracked
- User carbon reduction calculated
- Carbon impact visualized in dashboard
- Carbon leaderboard working
- Badges awarded for milestones
- Carbon reports generated
- Analytics showing carbon trends
- Goals trackable and displayed
- Notifications sent for milestones

**Dependencies:** 2.1 Task Management API, 4.4 Analytics Dashboard

**Complexity:** Medium

### 4.6 Leaderboard System
- [x] Implement GET /api/leaderboard endpoint
- [x] Create user ranking by total rewards
- [x] Add region filtering for leaderboard
- [x] Implement pagination (50 items per page)
- [x] Create leaderboard caching (1-minute TTL)
- [x] Add cache invalidation on new verifications
- [x] Implement user rank calculation
- [x] Create leaderboard display with user stats
- [x] Add current user position highlighting
- [x] Implement leaderboard refresh mechanism

**Acceptance Criteria:**
- Leaderboard returns within 200ms
- Users ranked by total rewards
- Region filtering working correctly
- Pagination working with 50 items per page
- Caching working with 1-minute TTL
- Cache invalidated on new verifications
- User rank calculated correctly
- Leaderboard displays rank, name, rewards, streak
- Current user position highlighted
- Leaderboard refreshes automatically

**Dependencies:** 1.1 Database Schema, 1.3 Base API Endpoints

**Complexity:** Medium

### 4.7 Notification System
- [x] Create notification service
- [x] Implement verification completion notifications
- [x] Add stake reward accrual notifications
- [x] Create proposal voting notifications
- [x] Implement redemption confirmation notifications
- [x] Add low balance alerts
- [x] Create milestone achievement notifications
- [x] Implement notification preferences
- [x] Add email notification support
- [x] Create in-app notification display

**Acceptance Criteria:**
- Notifications sent for all events
- Verification completion notified
- Stake rewards notified
- Proposal voting notified
- Redemptions confirmed
- Low balance alerts working
- Milestone notifications sent
- User preferences respected
- Email notifications working
- In-app notifications displayed

**Dependencies:** 1.1 Database Schema, 1.3 Base API Endpoints

**Complexity:** Medium


## Phase 5: UI Enhancement (Weeks 9-10)

### 5.1 Transform Static Screens to Dynamic - Dashboard
- [x] Convert dashboard screen from static to dynamic
- [x] Implement real-time balance display
- [x] Add user statistics display (total rewards, streak, level)
- [x] Create recent activity feed
- [x] Implement quick action buttons
- [x] Add wallet connection status display
- [x] Create dashboard data refresh mechanism
- [x] Implement responsive layout for mobile
- [x] Add loading states and skeletons
- [x] Create error state handling

**Acceptance Criteria:**
- Dashboard displays real-time data
- Balance updates automatically
- Statistics calculated and displayed
- Recent activity shown in feed
- Quick actions functional
- Wallet status displayed
- Data refreshes on interval
- Mobile responsive
- Loading states visible
- Error states handled gracefully

**Dependencies:** 3.6 Balance Tracking, 1.4 Blockchain Connection

**Complexity:** Medium

### 5.2 Transform Static Screens to Dynamic - Task Browser
- [x] Convert task browser screen from static to dynamic
- [x] Implement task list with real data
- [x] Add category filtering UI
- [x] Create reward range filtering
- [x] Implement bonus multiplier display
- [x] Add task detail modal/page
- [x] Create task submission flow
- [x] Implement responsive layout
- [x] Add loading states and pagination
- [x] Create error handling

**Acceptance Criteria:**
- Task list displays real tasks
- Filtering working correctly
- Bonus multipliers displayed
- Task details accessible
- Submission flow functional
- Mobile responsive
- Loading states visible
- Pagination working
- Error states handled

**Dependencies:** 2.1 Task Management API

**Complexity:** Medium

### 5.3 Transform Static Screens to Dynamic - Verification Status
- [x] Convert verification status screen from static to dynamic
- [x] Implement real-time verification status updates
- [x] Add proof data display
- [x] Create oracle confidence score display
- [x] Implement transaction hash linking
- [x] Add verification history display
- [x] Create status filtering and sorting
- [x] Implement responsive layout
- [x] Add loading states
- [x] Create error handling

**Acceptance Criteria:**
- Verification status updates in real-time
- Proof data displayed correctly
- Oracle confidence shown
- Transaction hash linked to explorer
- History accessible and filterable
- Mobile responsive
- Loading states visible
- Error states handled

**Dependencies:** 2.2 Verification Workflow

**Complexity:** Medium

### 5.4 Transform Static Screens to Dynamic - Rewards Catalog
- [x] Convert rewards catalog screen from static to dynamic
- [x] Implement reward list with real data
- [x] Add category filtering UI
- [x] Create cost range filtering
- [x] Implement availability checking
- [x] Add reward detail modal
- [x] Create redemption flow
- [x] Implement responsive layout
- [x] Add loading states and pagination
- [x] Create error handling

**Acceptance Criteria:**
- Reward list displays real rewards
- Filtering working correctly
- Availability status shown
- Reward details accessible
- Redemption flow functional
- Mobile responsive
- Loading states visible
- Pagination working
- Error states handled

**Dependencies:** 3.1 Reward Catalog

**Complexity:** Medium

### 5.5 Transform Static Screens to Dynamic - Staking Interface
- [x] Convert staking screen from static to dynamic
- [x] Implement stake amount input with validation
- [x] Create duration selector with APY display
- [x] Add expected rewards calculation
- [x] Implement active stakes display
- [x] Create unstaking interface
- [x] Add accrued rewards display
- [x] Implement responsive layout
- [x] Add transaction status tracking
- [x] Create error handling

**Acceptance Criteria:**
- Staking interface functional
- Amount validation working
- Duration selector working
- APY displayed correctly
- Expected rewards calculated
- Active stakes listed
- Unstaking functional
- Mobile responsive
- Transaction status tracked
- Error states handled

**Dependencies:** 3.5 Staking UI Components

**Complexity:** Medium

### 5.6 Transform Static Screens to Dynamic - Governance
- [x] Convert governance screen from static to dynamic
- [x] Implement proposal list with real data
- [x] Add status filtering UI
- [x] Create proposal detail view
- [x] Implement voting interface
- [x] Add vote count display
- [x] Create proposal creation flow
- [x] Implement responsive layout
- [x] Add loading states
- [x] Create error handling

**Acceptance Criteria:**
- Proposal list displays real proposals
- Status filtering working
- Proposal details accessible
- Voting interface functional
- Vote counts displayed
- Proposal creation working
- Mobile responsive
- Loading states visible
- Error states handled

**Dependencies:** 4.1 DAO Governance System

**Complexity:** Medium

### 5.7 Transform Static Screens to Dynamic - Leaderboard
- [x] Convert leaderboard screen from static to dynamic
- [x] Implement user ranking display
- [x] Add region filtering UI
- [x] Create pagination for leaderboard
- [x] Implement current user highlighting
- [x] Add user profile links
- [x] Create leaderboard refresh mechanism
- [x] Implement responsive layout
- [x] Add loading states
- [x] Create error handling

**Acceptance Criteria:**
- Leaderboard displays real rankings
- Region filtering working
- Pagination functional
- Current user highlighted
- User profiles accessible
- Auto-refresh working
- Mobile responsive
- Loading states visible
- Error states handled

**Dependencies:** 4.6 Leaderboard System

**Complexity:** Medium

### 5.8 Transform Static Screens to Dynamic - User Profile
- [x] Convert profile screen from static to dynamic
- [x] Implement user details display
- [x] Add statistics display (rewards, streak, level, badges)
- [x] Create task completion history
- [x] Implement redemption history
- [x] Add active stakes display
- [x] Create profile edit functionality
- [x] Implement responsive layout
- [x] Add loading states
- [x] Create error handling

**Acceptance Criteria:**
- Profile displays real user data
- Statistics calculated and shown
- Task history accessible
- Redemption history shown
- Active stakes listed
- Profile editing functional
- Mobile responsive
- Loading states visible
- Error states handled

**Dependencies:** 1.1 Database Schema, 1.4 Blockchain Connection

**Complexity:** Medium

### 5.9 Blockchain Wallet Connection UI
- [x] Create wallet connection button component
- [x] Implement wallet selection modal
- [x] Add Initia wallet integration UI
- [x] Create wallet address display
- [x] Implement wallet disconnection UI
- [x] Add wallet status indicator
- [x] Create wallet switching functionality
- [x] Implement error handling for connection failures
- [x] Add loading states during connection
- [x] Create responsive design

**Acceptance Criteria:**
- Wallet connection button visible
- Wallet selection modal working
- Initia wallet integration functional
- Wallet address displayed correctly
- Disconnection working
- Status indicator accurate
- Wallet switching functional
- Connection errors handled
- Loading states visible
- Mobile responsive

**Dependencies:** 1.4 Blockchain Connection

**Complexity:** Medium

### 5.10 Real-Time Updates and Transaction Tracking
- [ ] Implement WebSocket connection for real-time updates
- [ ] Create balance update subscription
- [ ] Add verification status updates
- [ ] Implement stake reward updates
- [ ] Create transaction status tracking UI
- [ ] Add pending transaction display
- [ ] Implement transaction confirmation display
- [ ] Create transaction failure handling
- [ ] Add transaction retry UI
- [ ] Implement responsive design

**Acceptance Criteria:**
- WebSocket connection established
- Balance updates in real-time
- Verification status updates live
- Stake rewards update in real-time
- Transaction status tracked
- Pending transactions displayed
- Confirmations shown
- Failures handled gracefully
- Retry functionality working
- Mobile responsive

**Dependencies:** 3.6 Balance Tracking, 1.4 Blockchain Connection

**Complexity:** High


## Phase 6: Testing and Optimization (Weeks 11-12)

### 6.1 Unit Tests - Core Business Logic
- [x] Write unit tests for bonus multiplier calculation
- [x] Create tests for staking reward calculation
- [x] Implement tests for fraud detection algorithm
- [x] Write tests for proof hash generation
- [x] Create tests for token balance calculations
- [x] Implement tests for API validation
- [x] Write tests for error handling
- [x] Create tests for data transformations
- [x] Implement tests for utility functions
- [x] Achieve 90% code coverage for business logic

**Acceptance Criteria:**
- All business logic functions have unit tests
- Tests cover normal cases and edge cases
- Tests verify correct calculations
- Error cases tested
- Code coverage >= 90%
- All tests passing
- Tests run in < 30 seconds
- Tests are maintainable and clear

**Dependencies:** All previous phases

**Complexity:** Medium

### 6.2 Property-Based Tests - Token Conservation
- [x] Write property test for token conservation
- [x] Generate random mint/burn/transfer sequences
- [x] Verify total supply = minted - burned
- [x] Test with various token amounts
- [x] Test with different operation orders
- [x] Verify property holds for all generated sequences

**Acceptance Criteria:**
- **Validates: Requirements 5.8, 5.9, 7.7, 8.7, 10.6, 12.7, 23.1, 23.2, 23.4**
- Property test passes for 1000+ generated sequences
- All edge cases covered
- Test runs in < 5 seconds
- Counterexamples documented if found

**Dependencies:** 6.1 Unit Tests

**Complexity:** Medium

### 6.3 Property-Based Tests - Proof Uniqueness
- [x] Write property test for proof hash uniqueness
- [x] Generate random proof data
- [x] Verify same data produces same hash
- [x] Verify different data produces different hashes
- [x] Test collision resistance
- [x] Verify uniqueness constraint enforced

**Acceptance Criteria:**
- **Validates: Requirements 2.4, 2.5**
- Property test passes for 1000+ generated proofs
- No collisions detected
- Uniqueness constraint verified
- Test runs in < 5 seconds

**Dependencies:** 2.3 Proof Hash Generation

**Complexity:** Medium

### 6.4 Property-Based Tests - Reward Calculation
- [x] Write property test for reward calculation correctness
- [x] Generate random base rewards and multipliers
- [x] Verify reward = baseReward × multiplier
- [x] Verify multiplier between 1.0 and 2.0
- [x] Test with various streak and completion counts
- [x] Verify calculation accuracy

**Acceptance Criteria:**
- **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
- Property test passes for 1000+ generated scenarios
- Multiplier bounds verified
- Calculation accuracy verified
- Test runs in < 5 seconds

**Dependencies:** 3.3 Reward Calculation Algorithms

**Complexity:** Medium

### 6.5 Property-Based Tests - Staking Rewards
- [x] Write property test for staking reward accuracy
- [x] Generate random stake amounts and durations
- [x] Verify compound interest formula
- [x] Test with various APY rates
- [x] Verify rewards increase monotonically with time
- [x] Test edge cases (0 time, max time)

**Acceptance Criteria:**
- **Validates: Requirements 8.8, 9.1, 9.3, 9.4**
- Property test passes for 1000+ generated scenarios
- Compound interest formula verified
- Monotonicity verified
- Edge cases handled
- Test runs in < 5 seconds

**Dependencies:** 3.3 Reward Calculation Algorithms

**Complexity:** Medium

### 6.6 Property-Based Tests - Fraud Detection Bounds
- [x] Write property test for fraud score bounds
- [x] Generate random fraud indicators
- [x] Verify fraud score between 0.0 and 1.0
- [x] Test accumulation logic
- [x] Verify capping at 1.0
- [x] Test all fraud detection rules

**Acceptance Criteria:**
- **Validates: Requirements 4.1, 4.7**
- Property test passes for 1000+ generated scenarios
- Fraud score bounds verified
- Accumulation logic verified
- Capping verified
- Test runs in < 5 seconds

**Dependencies:** 2.4 Fraud Detection Algorithms

**Complexity:** Medium

### 6.7 Property-Based Tests - Bonus Multiplier Bounds
- [x] Write property test for bonus multiplier bounds
- [x] Generate random streak and completion counts
- [x] Verify multiplier between 1.0 and 2.0
- [x] Test streak bonus calculation
- [x] Test category mastery bonus
- [x] Verify capping at 2.0

**Acceptance Criteria:**
- **Validates: Requirements 5.2**
- Property test passes for 1000+ generated scenarios
- Multiplier bounds verified
- Bonus calculations verified
- Capping verified
- Test runs in < 5 seconds

**Dependencies:** 3.3 Reward Calculation Algorithms

**Complexity:** Medium

### 6.8 Integration Tests - End-to-End Flows
- [x] Write E2E test for task submission flow
- [x] Create E2E test for staking workflow
- [x] Implement E2E test for reward redemption
- [x] Write E2E test for DAO voting
- [x] Create E2E test for wallet connection
- [x] Implement E2E test for balance updates
- [x] Write E2E test for verification status tracking
- [x] Create E2E test for transaction signing

**Acceptance Criteria:**
- All E2E tests passing
- Task submission flow works end-to-end
- Staking workflow works end-to-end
- Reward redemption works end-to-end
- DAO voting works end-to-end
- Wallet connection works end-to-end
- Balance updates work end-to-end
- Transaction signing works end-to-end

**Dependencies:** All previous phases

**Complexity:** High

### 6.9 Security Audit and Hardening
- [x] Conduct security code review
- [x] Run automated security scanning (Snyk, SonarQube)
- [x] Perform smart contract security audit
- [x] Test input validation and sanitization
- [x] Verify authentication and authorization
- [x] Test rate limiting enforcement
- [x] Verify data encryption at rest
- [x] Test HTTPS and TLS configuration
- [x] Verify CORS configuration
- [x] Document security findings and fixes

**Acceptance Criteria:**
- No critical security vulnerabilities found
- All automated scans passing
- Smart contract audit completed
- Input validation verified
- Authentication/authorization working
- Rate limiting enforced
- Data encryption verified
- HTTPS/TLS configured
- CORS properly configured
- Security documentation complete

**Dependencies:** All previous phases

**Complexity:** High

### 6.10 Database Optimization and Performance Tuning
- [x] Analyze query performance with EXPLAIN
- [x] Create missing indexes
- [x] Optimize N+1 queries with eager loading
- [x] Implement query result caching
- [x] Optimize database connection pooling
- [x] Test pagination performance
- [x] Verify index usage in queries
- [x] Optimize slow queries
- [x] Test concurrent query performance
- [x] Document optimization results

**Acceptance Criteria:**
- Task list query < 100ms
- Balance query < 50ms (cached)
- Verification query < 500ms
- Leaderboard query < 200ms
- All indexes created and used
- N+1 queries eliminated
- Caching working correctly
- Connection pooling optimized
- Concurrent queries handled
- Performance metrics documented

**Dependencies:** 1.1 Database Schema

**Complexity:** Medium

### 6.11 Load Testing and Scalability
- [x] Set up load testing environment
- [x] Create load test for task submission
- [x] Implement load test for verification
- [x] Create load test for balance queries
- [x] Implement load test for blockchain transactions
- [x] Test with 1000 concurrent users
- [x] Verify system stability under load
- [x] Identify bottlenecks
- [x] Document scalability limits
- [x] Create scaling recommendations

**Acceptance Criteria:**
- System handles 1000 concurrent users
- Task submission: 1000 verifications/minute
- Blockchain transactions: 500/minute
- API response times stable under load
- No memory leaks detected
- Database handles concurrent load
- Bottlenecks identified
- Scaling recommendations documented

**Dependencies:** All previous phases

**Complexity:** High

### 6.12 Bug Fixes and Final Polish
- [x] Review and fix all identified issues
- [x] Address performance bottlenecks
- [x] Fix UI/UX issues
- [x] Resolve edge case bugs
- [x] Update documentation
- [x] Perform final testing
- [x] Create release notes
- [x] Prepare deployment checklist
- [x] Conduct final code review
- [x] Deploy to production

**Acceptance Criteria:**
- All critical bugs fixed
- Performance issues resolved
- UI/UX polished
- Edge cases handled
- Documentation updated
- All tests passing
- Release notes complete
- Deployment checklist ready
- Code review approved
- Ready for production deployment

**Dependencies:** All previous phases

**Complexity:** Medium


## Additional Property-Based Testing Tasks

### 6.13 Property-Based Tests - Temporal Validity
- [ ] Write property test for temporal validity
- [ ] Generate random timestamps
- [ ] Verify timestamp <= current time
- [ ] Verify difference < 48 hours
- [ ] Test boundary conditions (0 hours, 48 hours)
- [ ] Test invalid timestamps (future, > 48 hours)

**Acceptance Criteria:**
- **Validates: Requirements 2.3**
- Property test passes for 1000+ generated timestamps
- Temporal bounds verified
- Boundary conditions tested
- Invalid timestamps rejected
- Test runs in < 5 seconds

**Dependencies:** 2.2 Verification Workflow

**Complexity:** Low

### 6.14 Property-Based Tests - Balance Consistency
- [ ] Write property test for balance consistency
- [ ] Generate random ledger entries
- [ ] Verify blockchain balance = sum of ledger entries
- [ ] Test with various operation sequences
- [ ] Verify consistency after each operation
- [ ] Test reconciliation logic

**Acceptance Criteria:**
- **Validates: Requirements 7.7**
- Property test passes for 1000+ generated sequences
- Balance consistency verified
- Reconciliation logic verified
- Test runs in < 5 seconds

**Dependencies:** 3.6 Balance Tracking

**Complexity:** Medium

### 6.15 Property-Based Tests - Voting Power Integrity
- [ ] Write property test for voting power integrity
- [ ] Generate random token balances
- [ ] Verify voting power = token balance at vote time
- [ ] Test with various balance changes
- [ ] Verify voting power snapshot
- [ ] Test vote recording accuracy

**Acceptance Criteria:**
- **Validates: Requirements 14.5**
- Property test passes for 1000+ generated scenarios
- Voting power calculation verified
- Snapshot accuracy verified
- Test runs in < 5 seconds

**Dependencies:** 4.2 Proposal Creation and Voting

**Complexity:** Medium

### 6.16 Property-Based Tests - Stake Duration Validity
- [ ] Write property test for stake duration validity
- [ ] Generate random stake durations
- [ ] Verify duration in [30, 90, 180, 365]
- [ ] Test invalid durations rejected
- [ ] Verify APY calculation per duration
- [ ] Test boundary conditions

**Acceptance Criteria:**
- **Validates: Requirements 8.2**
- Property test passes for 1000+ generated durations
- Valid durations accepted
- Invalid durations rejected
- APY calculation verified
- Test runs in < 5 seconds

**Dependencies:** 3.2 Staking System

**Complexity:** Low

### 6.17 Property-Based Tests - Oracle Confidence Threshold
- [ ] Write property test for oracle confidence threshold
- [ ] Generate random confidence scores
- [ ] Verify verified proofs have confidence >= 0.7
- [ ] Test rejected proofs have confidence < 0.7
- [ ] Verify threshold enforcement
- [ ] Test boundary conditions (0.69, 0.70, 0.71)

**Acceptance Criteria:**
- **Validates: Requirements 3.4, 3.5**
- Property test passes for 1000+ generated scores
- Threshold enforcement verified
- Boundary conditions tested
- Test runs in < 5 seconds

**Dependencies:** 2.2 Verification Workflow

**Complexity:** Low

### 6.18 Property-Based Tests - Available Balance Calculation
- [ ] Write property test for available balance calculation
- [ ] Generate random total, staked, pending balances
- [ ] Verify available = total - staked - pending
- [ ] Test with various balance combinations
- [ ] Verify non-negative available balance
- [ ] Test edge cases (0 balances, max balances)

**Acceptance Criteria:**
- **Validates: Requirements 7.3**
- Property test passes for 1000+ generated scenarios
- Balance calculation verified
- Non-negative constraint verified
- Edge cases handled
- Test runs in < 5 seconds

**Dependencies:** 3.6 Balance Tracking

**Complexity:** Low

### 6.19 Property-Based Tests - Streak Increment Correctness
- [ ] Write property test for streak increment logic
- [ ] Generate random task completion sequences
- [ ] Verify streak increments within 24 hours
- [ ] Verify streak resets after 24 hours
- [ ] Test boundary conditions (23:59, 24:00, 24:01)
- [ ] Verify streak counter accuracy

**Acceptance Criteria:**
- **Validates: Requirements 6.1, 6.2, 6.3**
- Property test passes for 1000+ generated sequences
- Increment logic verified
- Reset logic verified
- Boundary conditions tested
- Test runs in < 5 seconds

**Dependencies:** 2.1 Task Management API

**Complexity:** Medium

### 6.20 Property-Based Tests - Early Unstake Penalty
- [ ] Write property test for early unstake penalty
- [ ] Generate random stake end times
- [ ] Verify 10% penalty applied before end time
- [ ] Verify no penalty applied after end time
- [ ] Test boundary conditions (1 second before, at, after)
- [ ] Verify penalty calculation accuracy

**Acceptance Criteria:**
- **Validates: Requirements 10.3**
- Property test passes for 1000+ generated scenarios
- Penalty application verified
- Boundary conditions tested
- Penalty calculation verified
- Test runs in < 5 seconds

**Dependencies:** 3.2 Staking System

**Complexity:** Medium

### 6.21 Property-Based Tests - Proposal Approval Logic
- [ ] Write property test for proposal approval logic
- [ ] Generate random vote counts and quorum
- [ ] Verify approval: quorum reached AND votesFor > votesAgainst
- [ ] Verify rejection: quorum not reached OR votesAgainst >= votesFor
- [ ] Test boundary conditions (equal votes, quorum edge)
- [ ] Verify status updates correctly

**Acceptance Criteria:**
- **Validates: Requirements 15.1, 15.2, 15.3**
- Property test passes for 1000+ generated scenarios
- Approval logic verified
- Rejection logic verified
- Boundary conditions tested
- Test runs in < 5 seconds

**Dependencies:** 4.3 Proposal Execution

**Complexity:** Medium

### 6.22 Property-Based Tests - Task Filtering Correctness
- [ ] Write property test for task filtering
- [ ] Generate random task lists with categories
- [ ] Verify filtered results match category
- [ ] Test with multiple categories
- [ ] Verify no unmatched tasks in results
- [ ] Test empty result sets

**Acceptance Criteria:**
- **Validates: Requirements 1.2**
- Property test passes for 1000+ generated scenarios
- Filtering accuracy verified
- No false positives
- Empty results handled
- Test runs in < 5 seconds

**Dependencies:** 2.1 Task Management API

**Complexity:** Low

### 6.23 Property-Based Tests - Reward Filtering Correctness
- [ ] Write property test for reward filtering
- [ ] Generate random reward lists with categories and costs
- [ ] Verify filtered results match criteria
- [ ] Test category filtering
- [ ] Test cost range filtering
- [ ] Test combined filtering

**Acceptance Criteria:**
- **Validates: Requirements 11.2, 11.3**
- Property test passes for 1000+ generated scenarios
- Filtering accuracy verified
- Combined filters work correctly
- No false positives
- Test runs in < 5 seconds

**Dependencies:** 3.1 Reward Catalog

**Complexity:** Low

### 6.24 Property-Based Tests - Ledger Entry Creation
- [ ] Write property test for ledger entry creation
- [ ] Generate random token operations
- [ ] Verify ledger entry created for each operation
- [ ] Verify correct entry type
- [ ] Verify amount recorded correctly
- [ ] Test all operation types (mint, burn, stake, unstake, redemption)

**Acceptance Criteria:**
- **Validates: Requirements 5.9, 8.7, 10.6, 12.7**
- Property test passes for 1000+ generated operations
- Entry creation verified
- Entry type accuracy verified
- Amount accuracy verified
- All operation types tested
- Test runs in < 5 seconds

**Dependencies:** 1.1 Database Schema

**Complexity:** Medium

### 6.25 Property-Based Tests - Transaction Atomicity
- [ ] Write property test for transaction atomicity
- [ ] Generate random transaction scenarios
- [ ] Verify failed transactions don't create records
- [ ] Verify successful transactions create records
- [ ] Test partial failure scenarios
- [ ] Verify database consistency after failures

**Acceptance Criteria:**
- **Validates: Requirements 5.7, 10.8**
- Property test passes for 1000+ generated scenarios
- Atomicity verified
- Failed transactions don't corrupt state
- Successful transactions create records
- Database consistency maintained
- Test runs in < 5 seconds

**Dependencies:** 1.1 Database Schema

**Complexity:** High

### 6.26 Property-Based Tests - Duplicate Vote Prevention
- [ ] Write property test for duplicate vote prevention
- [ ] Generate random voting sequences
- [ ] Verify at most one vote per user per proposal
- [ ] Test multiple vote attempts
- [ ] Verify second vote rejected
- [ ] Test vote count accuracy

**Acceptance Criteria:**
- **Validates: Requirements 14.3, 14.7**
- Property test passes for 1000+ generated sequences
- Duplicate prevention verified
- Vote count accuracy verified
- Second votes rejected
- Test runs in < 5 seconds

**Dependencies:** 4.2 Proposal Creation and Voting

**Complexity:** Medium

## Summary

This comprehensive tasks.md file covers all implementation requirements for the Blockchain Eco Rewards Integration feature across 6 phases:

- **Phase 1 (Weeks 1-2)**: Core infrastructure including database, authentication, API endpoints, blockchain connection, and event listeners
- **Phase 2 (Weeks 3-4)**: Task and verification system with oracle integration, fraud detection, and smart contract integration
- **Phase 3 (Weeks 5-6)**: Rewards and staking system with reward calculations and partner integrations
- **Phase 4 (Weeks 7-8)**: Governance and analytics including DAO voting, leaderboards, and carbon tracking
- **Phase 5 (Weeks 9-10)**: UI enhancement transforming 10 static screens to dynamic with real-time updates
- **Phase 6 (Weeks 11-12)**: Comprehensive testing including unit tests, 20 property-based tests, integration tests, security audit, and performance optimization

### Key Features:
- **26 Property-Based Tests** validating all correctness properties from the design document
- **Clear Dependencies** between tasks enabling proper sequencing
- **Acceptance Criteria** for each task ensuring quality and completeness
- **Complexity Ratings** (Low, Medium, High) for effort estimation
- **Comprehensive Coverage** of all requirements from the requirements document

All tasks follow the design-first workflow and are organized for efficient implementation across the 12-week timeline.
