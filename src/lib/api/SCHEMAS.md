# API Validation Schemas

This file contains Zod validation schemas for all API endpoints in the EcoChain application.

## Overview

The schemas provide runtime type validation for API requests and responses, ensuring data integrity and type safety across the backend API layer.

## Schemas

### Tasks API

- **TasksQueryParamsSchema**: Query parameters for `GET /api/tasks`
  - `category`: Optional filter by task category (transit, recycling, energy, community)
  - `taskId`: Optional specific task ID to retrieve
  - `limit`: Maximum number of tasks (default: 20, max: 100)
  - `offset`: Pagination offset (default: 0)

- **TaskSchema**: Single task object structure
- **TasksResponseSchema**: Response format for tasks endpoint

### Verification API

- **VerifyRequestSchema**: Request body for `POST /api/verify`
  - Required: `taskId`, `proofHash`, `submittedAt`, `proofType`
  - Optional: `geoHash`, `oracleSource`, `oracleConfidence`, `proofDetails`

- **VerificationResultSchema**: Verification result object
- **LedgerEntrySchema**: Ledger entry for verification history
- **VerifyResponseSchema**: Response format for verification endpoint

### Rewards API

- **RewardSchema**: Single reward object structure
- **RewardsResponseSchema**: Response format for rewards endpoint

### Redemption API

- **RedeemRequestSchema**: Request body for `POST /api/redeem`
  - Required: `rewardId`, `initiaAddress`
  - Optional: `initiaUsername`, `displayName`, `region`

- **RedeemedRewardSchema**: Redeemed reward details
- **RedeemResponseSchema**: Response format for redemption endpoint

### Bridge API

- **BridgeTransactionSchema**: Bridge transaction object structure
- **BridgeHistoryResponseSchema**: Response format for `GET /api/bridge/history`
- **BridgeInitiateRequestSchema**: Request body for `POST /api/bridge/initiate`
  - Required: `amount`, `denom`, `sourceChain`, `targetChain`, `recipientAddress`

- **BridgeInitiateResponseSchema**: Response format for bridge initiation

## Helper Functions

### validateRequestBody

Validates request body data against a Zod schema.

```typescript
const result = validateRequestBody(RedeemRequestSchema, requestData);
if (result.success) {
  // Use result.data (typed)
} else {
  // Handle result.error
}
```

### validateQueryParams

Validates URL query parameters against a Zod schema.

```typescript
const result = validateQueryParams(TasksQueryParamsSchema, searchParams);
if (result.success) {
  // Use result.data (typed)
} else {
  // Handle result.error
}
```

### formatValidationError

Formats Zod validation errors for API responses.

```typescript
const formatted = formatValidationError(zodError);
// Returns: { message: string, details: Array<{ field: string, message: string }> }
```

## Usage Example

```typescript
import { NextRequest, NextResponse } from "next/server";
import { validateRequestBody, RedeemRequestSchema, formatValidationError } from "@/lib/api/schemas";
import { formatErrorResponse, jsonResponse } from "@/lib/api/middleware";

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate request body
  const validation = validateRequestBody(RedeemRequestSchema, body);
  
  if (!validation.success) {
    const errorDetails = formatValidationError(validation.error);
    return jsonResponse(
      formatErrorResponse("VALIDATION_ERROR", errorDetails.message, errorDetails.details),
      400
    );
  }
  
  // Use validated data (fully typed)
  const { rewardId, initiaAddress } = validation.data;
  
  // ... rest of handler logic
}
```

## Type Safety

All schemas export TypeScript types that can be imported and used throughout the application:

```typescript
import type { 
  TasksQueryParams, 
  VerifyRequest, 
  RedeemRequest,
  BridgeInitiateRequest 
} from "@/lib/api/schemas";
```

## Testing

Comprehensive unit tests are available in `tests/api-schemas.test.ts` covering:
- Valid data validation
- Invalid data rejection
- Default value application
- Edge cases (empty strings, out-of-range values)
- Helper function behavior

Run tests with:
```bash
npx tsc --project tsconfig.schemas-test.json
node --test dist-test/tests/api-schemas.test.js
```

## Requirements Validation

This implementation validates:
- **Requirement 5.3**: Schema validation for all API endpoints
- **Requirement 5.4**: Validation error handling with 400 status codes
