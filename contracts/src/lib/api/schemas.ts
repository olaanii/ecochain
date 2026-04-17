import { z } from "zod";

// ============================================================================
// Tasks API Schemas
// ============================================================================

/**
 * Query parameters for GET /api/tasks
 */
export const TasksQueryParamsSchema = z.object({
  category: z
    .enum(["transit", "recycling", "energy", "community"])
    .optional()
    .describe("Filter tasks by category"),
  taskId: z
    .string()
    .min(1)
    .optional()
    .describe("Retrieve a specific task by ID"),
  limit: z
    .coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .default(20)
    .describe("Maximum number of tasks to return"),
  offset: z
    .coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .default(0)
    .describe("Number of tasks to skip for pagination"),
});

export type TasksQueryParams = z.infer<typeof TasksQueryParamsSchema>;

/**
 * Single task object schema
 */
export const TaskSchema = z.object({
  id: z.string().describe("Unique task identifier"),
  name: z.string().describe("Task name"),
  description: z.string().describe("Task description"),
  category: z
    .enum(["transit", "recycling", "energy", "community"])
    .describe("Task category"),
  baseReward: z.number().nonnegative().describe("Base reward amount"),
  bonusMultiplier: z
    .number()
    .nonnegative()
    .describe("Bonus multiplier for rewards"),
  verificationHint: z.string().describe("Hint for verification process"),
});

export type Task = z.infer<typeof TaskSchema>;

/**
 * Response schema for GET /api/tasks
 */
export const TasksResponseSchema = z.object({
  tasks: z.array(TaskSchema).describe("Array of tasks"),
  total: z.number().int().nonnegative().describe("Total number of tasks"),
  limit: z.number().int().positive().describe("Limit applied to query"),
  offset: z.number().int().nonnegative().describe("Offset applied to query"),
});

export type TasksResponse = z.infer<typeof TasksResponseSchema>;

// ============================================================================
// Verification API Schemas
// ============================================================================

/**
 * Request body for POST /api/verify
 */
export const VerifyRequestSchema = z.object({
  taskId: z.string().min(1).describe("ID of the task being verified"),
  proofHash: z.string().min(1).describe("Hash of the proof submission"),
  submittedAt: z
    .number()
    .int()
    .positive()
    .describe("Unix timestamp of submission"),
  geoHash: z.string().optional().describe("Geographic hash of submission location"),
  proofType: z
    .enum(["photo", "transit", "weight", "sensor"])
    .describe("Type of proof submitted"),
  oracleSource: z
    .string()
    .optional()
    .describe("Oracle service to use for verification"),
  oracleConfidence: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Confidence score from oracle (0-1)"),
  proofDetails: z
    .record(z.unknown())
    .optional()
    .describe("Additional proof details"),
});

export type VerifyRequest = z.infer<typeof VerifyRequestSchema>;

/**
 * Verification result object
 */
export const VerificationResultSchema = z.object({
  verified: z.boolean().describe("Whether verification succeeded"),
  taskName: z.string().optional().describe("Name of verified task"),
  rewardDelta: z.number().optional().describe("Reward amount earned"),
  reason: z.string().optional().describe("Reason for verification failure"),
});

export type VerificationResult = z.infer<typeof VerificationResultSchema>;

/**
 * Ledger entry object
 */
export const LedgerEntrySchema = z.object({
  id: z.string().describe("Unique ledger entry ID"),
  taskId: z.string().describe("Associated task ID"),
  reward: z.number().describe("Reward amount"),
  mintedAt: z.string().describe("ISO 8601 timestamp of minting"),
});

export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

/**
 * Response schema for POST /api/verify
 */
export const VerifyResponseSchema = z.object({
  result: VerificationResultSchema.describe("Verification result"),
  ledger: z
    .array(LedgerEntrySchema)
    .describe("User's verification history"),
});

export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;

// ============================================================================
// Rewards API Schemas
// ============================================================================

/**
 * Single reward object schema
 */
export const RewardSchema = z.object({
  id: z.string().describe("Unique reward identifier"),
  title: z.string().describe("Reward title"),
  subtitle: z.string().describe("Reward subtitle/description"),
  cost: z.number().nonnegative().describe("Cost in tokens"),
  partner: z.string().describe("Partner organization"),
  available: z.boolean().describe("Whether reward is currently available"),
  category: z.string().describe("Reward category"),
});

export type Reward = z.infer<typeof RewardSchema>;

/**
 * Response schema for GET /api/rewards
 */
export const RewardsResponseSchema = z.object({
  rewards: z.array(RewardSchema).describe("Array of available rewards"),
});

export type RewardsResponse = z.infer<typeof RewardsResponseSchema>;

// ============================================================================
// Redemption API Schemas
// ============================================================================

/**
 * Request body for POST /api/redeem
 */
export const RedeemRequestSchema = z.object({
  rewardId: z.string().min(1).describe("ID of the reward to redeem"),
  initiaAddress: z
    .string()
    .min(1)
    .describe("User's Initia blockchain address"),
  initiaUsername: z
    .string()
    .optional()
    .describe("User's Initia username"),
  displayName: z.string().optional().describe("User's display name"),
  region: z.string().optional().describe("User's region for regional rewards"),
});

export type RedeemRequest = z.infer<typeof RedeemRequestSchema>;

/**
 * Redeemed reward details
 */
export const RedeemedRewardSchema = z.object({
  id: z.string().describe("Reward ID"),
  title: z.string().describe("Reward title"),
  cost: z.number().nonnegative().describe("Cost in tokens"),
});

export type RedeemedReward = z.infer<typeof RedeemedRewardSchema>;

/**
 * Response schema for POST /api/redeem
 */
export const RedeemResponseSchema = z.object({
  success: z.boolean().describe("Whether redemption succeeded"),
  reward: RedeemedRewardSchema.optional().describe("Redeemed reward details"),
  balanceBefore: z
    .number()
    .nonnegative()
    .describe("User balance before redemption"),
  balanceAfter: z
    .number()
    .nonnegative()
    .describe("User balance after redemption"),
  reason: z
    .string()
    .optional()
    .describe("Reason for redemption failure"),
});

export type RedeemResponse = z.infer<typeof RedeemResponseSchema>;

// ============================================================================
// Bridge API Schemas
// ============================================================================

/**
 * Bridge transaction object schema
 */
export const BridgeTransactionSchema = z.object({
  id: z.string().describe("Unique transaction identifier"),
  amount: z.number().positive().describe("Amount to bridge"),
  denom: z.string().describe("Token denomination"),
  status: z
    .enum(["pending", "completed", "failed"])
    .describe("Transaction status"),
  sourceChain: z.string().describe("Source blockchain"),
  targetChain: z.string().describe("Target blockchain"),
  timestamp: z.string().describe("ISO 8601 timestamp"),
  transactionLink: z.string().url().describe("Link to transaction explorer"),
});

export type BridgeTransaction = z.infer<typeof BridgeTransactionSchema>;

/**
 * Response schema for GET /api/bridge/history
 */
export const BridgeHistoryResponseSchema = z.object({
  transactions: z
    .array(BridgeTransactionSchema)
    .describe("Array of bridge transactions"),
});

export type BridgeHistoryResponse = z.infer<typeof BridgeHistoryResponseSchema>;

/**
 * Request body for POST /api/bridge/initiate
 */
export const BridgeInitiateRequestSchema = z.object({
  amount: z.number().positive().describe("Amount to bridge"),
  denom: z.string().min(1).describe("Token denomination"),
  sourceChain: z.string().min(1).describe("Source blockchain"),
  targetChain: z.string().min(1).describe("Target blockchain"),
  recipientAddress: z
    .string()
    .min(1)
    .describe("Recipient address on target chain"),
});

export type BridgeInitiateRequest = z.infer<typeof BridgeInitiateRequestSchema>;

/**
 * Response schema for POST /api/bridge/initiate
 */
export const BridgeInitiateResponseSchema = z.object({
  transactionId: z.string().describe("Unique transaction identifier"),
  status: z.literal("pending").describe("Initial transaction status"),
  estimatedCompletionTime: z
    .string()
    .describe("ISO 8601 estimated completion time"),
  trackingUrl: z.string().url().describe("URL to track transaction"),
});

export type BridgeInitiateResponse = z.infer<typeof BridgeInitiateResponseSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate request body against a schema
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validation result with parsed data or error
 */
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, error: result.error };
}

/**
 * Validate query parameters against a schema
 * @param schema Zod schema to validate against
 * @param searchParams URLSearchParams object
 * @returns Validation result with parsed data or error
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; error: z.ZodError } {
  // Convert URLSearchParams to plain object
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  const result = schema.safeParse(params);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, error: result.error };
}

/**
 * Format Zod validation errors for API response
 * @param error Zod validation error
 * @returns Formatted error details
 */
export function formatValidationError(error: z.ZodError): {
  message: string;
  details: Array<{ field: string; message: string }>;
} {
  const details = error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  
  return {
    message: "Validation failed",
    details,
  };
}
