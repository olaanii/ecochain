# Fraud Detection System Implementation

## Overview

The Fraud Detection System is a comprehensive solution for identifying and managing suspicious proof submissions in the Eco Rewards Platform. It uses multiple fraud indicators to calculate a fraud score, flags high-risk submissions for manual review, and provides admin tools for managing the review queue.

**Status**: ✅ Complete
**Requirements**: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 33.2, 33.3, 33.4, 33.5

## Architecture

### Core Components

1. **Fraud Detection Engine** (`src/lib/verification/fraud-detection.ts`)
   - Calculates fraud scores based on multiple indicators
   - Detects duplicate submissions
   - Tracks submission velocity
   - Validates geolocation patterns
   - Checks metadata consistency

2. **API Endpoints**
   - `POST /api/verification/fraud-check` - Check proof for fraud indicators
   - `GET /api/admin/review-queue` - Get pending fraud reviews
   - `POST /api/admin/review-queue/:reviewId/approve` - Approve review
   - `POST /api/admin/review-queue/:reviewId/reject` - Reject review

3. **React Components**
   - `ReviewQueue` - Admin interface for managing flagged submissions
   - `FraudIndicatorsDisplay` - Display fraud detection results to users

4. **React Hook**
   - `useFraudDetection` - Client-side fraud detection operations

## Fraud Score Calculation

### Indicators and Weights

The fraud score is calculated by summing weighted indicators, capped at 1.0:

| Indicator | Condition | Weight | Requirement |
|-----------|-----------|--------|-------------|
| Duplicate Similarity | similarity > 0.9 | +0.3 | 4.2, 4.3 |
| Submission Velocity | count > 10 in 24h | +0.2 | 4.4, 4.5 |
| Geolocation Anomaly | anomaly detected | +0.15 | 4.6 |
| Metadata Inconsistency | inconsistency found | +0.25 | 4.6 |
| **Maximum Score** | - | **1.0** | 4.7 |

### Flagging Threshold

Submissions with fraud score > 0.5 are flagged for manual review (Requirements 4.8, 4.9).

### Fraud Score Bounds

- **Minimum**: 0.0 (no fraud indicators)
- **Maximum**: 1.0 (capped, even if all indicators present)
- **Flagging Threshold**: > 0.5

## Fraud Detection Checks

### 1. Duplicate Submission Detection

**Requirement**: 4.2, 4.3

Detects similar submissions from the same user in the last 24 hours:

```typescript
async function checkDuplicateSubmissions(
  userId: string,
  proofHash: string,
  metadata?: Record<string, any>
): Promise<number>
```

- Fetches recent submissions from Redis cache
- Calculates string similarity using Levenshtein distance
- Returns similarity score (0.0 - 1.0)
- Adds 0.3 to fraud score if similarity > 0.9

### 2. Submission Velocity Tracking

**Requirement**: 4.4, 4.5

Tracks submission frequency to detect rapid-fire submissions:

```typescript
async function checkSubmissionVelocity(userId: string): Promise<number>
```

- Counts submissions in last 24 hours from Redis
- Returns velocity score (0.0 - 1.0)
- Adds 0.2 to fraud score if count > 10

### 3. Geolocation Anomaly Detection

**Requirement**: 4.6

Validates geolocation against user's submission history:

```typescript
async function checkGeolocationAnomaly(
  userId: string,
  geolocation?: { latitude: number; longitude: number }
): Promise<boolean>
```

- Fetches user's recent submission locations
- Calculates distance from previous locations
- Detects impossible travel speeds (>900 km/h)
- Adds 0.15 to fraud score if anomaly detected

### 4. Metadata Inconsistency Check

**Requirement**: 4.6

Validates device and system metadata:

```typescript
async function checkMetadataInconsistency(
  userId: string,
  metadata?: Record<string, any>
): Promise<boolean>
```

- Compares device ID with user's history
- Validates OS version consistency
- Detects suspicious device changes
- Adds 0.25 to fraud score if inconsistency found

## API Endpoints

### POST /api/verification/fraud-check

Check a proof submission for fraud indicators.

**Request**:
```json
{
  "taskId": "task-123",
  "proofHash": "0x1234567890abcdef...",
  "metadata": {
    "geolocation": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "deviceId": "device-123",
    "osVersion": "iOS 17.0"
  }
}
```

**Response (Passed)**:
```json
{
  "fraudScore": 0.3,
  "isFlagged": false,
  "indicators": {
    "duplicateSimilarity": 0.2,
    "submissionVelocity": 0.1,
    "geolocationAnomaly": false,
    "metadataInconsistency": false
  },
  "message": "Submission passed fraud checks"
}
```

**Response (Flagged)** - Status 202:
```json
{
  "fraudScore": 0.75,
  "isFlagged": true,
  "indicators": {
    "duplicateSimilarity": 0.95,
    "submissionVelocity": 0.8,
    "geolocationAnomaly": true,
    "metadataInconsistency": false
  },
  "reason": "High duplicate similarity and submission velocity",
  "reviewId": "review-123",
  "message": "Submission flagged for manual review"
}
```

**Status Codes**:
- `200 OK` - Submission passed fraud checks
- `202 Accepted` - Submission flagged for manual review
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `429 Too Many Requests` - Rate limit exceeded

### GET /api/admin/review-queue

Get pending fraud reviews (admin only).

**Query Parameters**:
- `status` (optional): Filter by status (default: "pending")
- `limit` (optional): Items per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "verification-123",
      "userId": "user-456",
      "userName": "John Doe",
      "userAddress": "initia1abc123...",
      "taskId": "task-789",
      "taskName": "Plant a Tree",
      "taskCategory": "environment",
      "fraudScore": 0.75,
      "proofHash": "0x1234567890abcdef...",
      "metadata": { ... },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 125,
    "pages": 3
  }
}
```

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin

### POST /api/admin/review-queue/:reviewId/approve

Approve a fraud review and create reward ledger entry.

**Response**:
```json
{
  "success": true,
  "message": "Verification approved",
  "data": {
    "verificationId": "verification-123",
    "userId": "user-456",
    "reward": 100
  }
}
```

**Side Effects**:
- Updates verification status to "verified"
- Creates ledger entry with type "mint"
- Updates user total rewards
- Invalidates user cache
- Creates notification for user

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin

### POST /api/admin/review-queue/:reviewId/reject

Reject a fraud review with reason.

**Request**:
```json
{
  "reason": "Duplicate submission detected"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Verification rejected",
  "data": {
    "verificationId": "verification-123",
    "userId": "user-456",
    "reason": "Duplicate submission detected"
  }
}
```

**Side Effects**:
- Updates verification status to "rejected"
- Stores rejection reason
- Creates notification for user
- Does NOT create ledger entry

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin

## React Components

### ReviewQueue Component

Admin interface for managing flagged submissions.

**Props**:
```typescript
interface ReviewQueueProps {
  limit?: number; // Items per page (default: 50)
}
```

**Features**:
- Display pending fraud reviews sorted by fraud score
- Click to view detailed review information
- Approve or reject reviews with reasons
- Pagination support
- Real-time status updates
- Color-coded fraud scores

**Usage**:
```tsx
import { ReviewQueue } from '@/components/admin/review-queue';

export function AdminDashboard() {
  return <ReviewQueue limit={50} />;
}
```

### FraudIndicatorsDisplay Component

Display fraud detection results to users.

**Props**:
```typescript
interface FraudIndicatorsProps {
  fraudScore: number;
  indicators: FraudIndicators;
  isFlagged: boolean;
  reason?: string;
}
```

**Features**:
- Display fraud score with color coding
- Show individual fraud indicators
- Explain what each indicator means
- Provide user-friendly messaging
- Alert if submission is flagged

**Usage**:
```tsx
import { FraudIndicatorsDisplay } from '@/components/verification/fraud-indicators';

export function SubmissionResult({ fraudResult }) {
  return (
    <FraudIndicatorsDisplay
      fraudScore={fraudResult.fraudScore}
      indicators={fraudResult.indicators}
      isFlagged={fraudResult.isFlagged}
      reason={fraudResult.reason}
    />
  );
}
```

## React Hook

### useFraudDetection Hook

Client-side fraud detection operations.

**Methods**:

```typescript
const {
  isLoading,
  error,
  checkFraud,
  fetchReviewQueue,
  approveReview,
  rejectReview,
} = useFraudDetection();
```

**checkFraud(taskId, proofHash, metadata?)**
- Check proof submission for fraud indicators
- Returns `FraudDetectionResult | null`

**fetchReviewQueue(limit?, offset?)**
- Fetch pending fraud reviews (admin only)
- Returns `ReviewQueueResponse | null`

**approveReview(reviewId)**
- Approve a fraud review
- Returns `boolean`

**rejectReview(reviewId, reason)**
- Reject a fraud review with reason
- Returns `boolean`

**Usage**:
```tsx
import { useFraudDetection } from '@/hooks/useFraudDetection';

export function ProofSubmission() {
  const { checkFraud, isLoading, error } = useFraudDetection();

  const handleSubmit = async (taskId, proofHash, metadata) => {
    const result = await checkFraud(taskId, proofHash, metadata);
    if (result?.isFlagged) {
      // Show flagged message
    }
  };

  return (
    <button onClick={() => handleSubmit(...)}>
      {isLoading ? 'Checking...' : 'Submit'}
    </button>
  );
}
```

## Cooldown System

**Requirement**: 4.9

Implements 24-hour cooldown per task per user to prevent rapid resubmissions:

```typescript
async function checkCooldown(userId: string, taskId: string): Promise<boolean>
async function setCooldown(userId: string, taskId: string): Promise<void>
```

- Stores cooldown in Redis with 24-hour TTL
- Prevents user from resubmitting same task within 24 hours
- Cooldown is set after flagged submission

## Caching Strategy

**Requirement**: 28.1, 28.2

- **Recent Submissions**: 1-hour TTL in Redis
- **User Geolocation History**: 24-hour TTL
- **Submission Velocity**: 24-hour TTL
- **Cooldown**: 24-hour TTL

## Testing

Comprehensive test suite in `tests/verification/fraud-detection-api.test.ts`:

- Fraud score bounds validation (Property 8)
- Duplicate detection accuracy
- Submission velocity tracking
- Geolocation anomaly detection
- Metadata inconsistency detection
- API endpoint validation
- Admin authorization checks
- Pagination correctness
- Ledger entry creation
- Cache invalidation

**Run Tests**:
```bash
npm run test -- fraud-detection-api.test.ts
```

## Integration Points

### Proof Submission Workflow

1. User submits proof via `POST /api/tasks/:taskId/submit`
2. Fraud check is performed via `POST /api/verification/fraud-check`
3. If flagged (score > 0.5):
   - Submission added to review queue
   - User notified of pending review
   - Cooldown set for 24 hours
4. If passed (score ≤ 0.5):
   - Proceed with oracle verification
   - Create verification record
5. Admin reviews flagged submissions in review queue
6. Admin approves or rejects with reason
7. User receives notification of decision

### Admin Dashboard

The `ReviewQueue` component should be integrated into the admin dashboard:

```tsx
import { ReviewQueue } from '@/components/admin/review-queue';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1>Admin Dashboard</h1>
      <ReviewQueue limit={50} />
    </div>
  );
}
```

## Security Considerations

1. **Admin Authorization**: All admin endpoints require admin role
2. **User Privacy**: Geolocation data is hashed before storage
3. **Rate Limiting**: Fraud checks are rate-limited per user
4. **Data Validation**: All inputs validated with Zod schemas
5. **Audit Logging**: All review actions logged for compliance

## Performance Metrics

- **Fraud Check Latency**: < 500ms (includes Redis lookups)
- **Review Queue Query**: < 100ms (with pagination)
- **Approval/Rejection**: < 200ms (includes ledger creation)

## Future Enhancements

1. Machine learning model for fraud score prediction
2. Automated pattern detection for fraud rings
3. Integration with external fraud detection services
4. Advanced geolocation analysis with heatmaps
5. Batch processing for high-volume submissions
6. Fraud analytics dashboard

## Troubleshooting

### High False Positive Rate

- Adjust fraud score thresholds
- Review indicator weights
- Analyze flagged submissions for patterns

### Slow Review Queue Queries

- Add database indexes on fraudScore and status
- Implement caching for review queue
- Consider pagination optimization

### Redis Connection Issues

- Check Redis connection configuration
- Verify Redis server is running
- Review Redis error logs

## References

- **Requirements**: 4.1-4.9, 33.2-33.5
- **Related Files**:
  - `src/lib/verification/fraud-detection.ts`
  - `src/app/api/verification/fraud-check/route.ts`
  - `src/app/api/admin/review-queue/route.ts`
  - `src/components/admin/review-queue.tsx`
  - `src/components/verification/fraud-indicators.tsx`
  - `src/hooks/useFraudDetection.ts`
  - `tests/verification/fraud-detection-api.test.ts`
