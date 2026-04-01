import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";
import { validateBech32Address, sanitizeString as sanitizeStringUtil } from "../validation";

/**
 * Validation middleware
 * Validates request body against Zod schema
 * Requirements: 25.1, 25.2, 25.3, 25.5, 25.6, 25.7, 25.8
 */
export async function validationMiddleware(
  request: NextRequest,
  schema: ZodSchema,
): Promise<{ data?: any; error?: NextResponse }> {
  try {
    const body = await request.json();

    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      }));

      return {
        error: NextResponse.json(
          {
            error: "Validation Error",
            message: "Request body validation failed",
            details: errors,
          },
          { status: 400 },
        ),
      };
    }

    return { data: result.data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        error: NextResponse.json(
          {
            error: "Bad Request",
            message: "Invalid JSON in request body",
          },
          { status: 400 },
        ),
      };
    }

    return {
      error: NextResponse.json(
        {
          error: "Bad Request",
          message: "Failed to parse request body",
        },
        { status: 400 },
      ),
    };
  }
}

/**
 * Input sanitization
 * Removes potentially malicious content
 * Requirements: 25.3
 */
export function sanitizeInput(input: string): string {
  return sanitizeStringUtil(input);
}

/**
 * Sanitize object recursively
 * Requirements: 25.3
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Common validation schemas
 * Requirements: 25.1, 25.5, 25.6, 25.7, 25.8
 */
export const ValidationSchemas = {
  // Wallet address validation
  walletAddress: z
    .string()
    .min(1, "Wallet address is required")
    .refine(
      (addr) => validateBech32Address(addr),
      "Invalid wallet address format",
    ),

  // Token amount validation
  tokenAmount: z
    .number()
    .positive("Amount must be positive")
    .int("Amount must be an integer")
    .max(Number.MAX_SAFE_INTEGER, "Amount is too large"),

  // Timestamp validation
  timestamp: z
    .number()
    .int("Timestamp must be an integer")
    .refine(
      (ts) => ts <= Date.now(),
      "Timestamp cannot be in the future",
    )
    .refine(
      (ts) => ts > Date.now() - 48 * 60 * 60 * 1000,
      "Timestamp must be within 48 hours",
    ),

  // Task ID validation
  taskId: z
    .string()
    .min(1, "Task ID is required")
    .regex(/^[a-z0-9-]+$/, "Invalid task ID format"),

  // Proof hash validation
  proofHash: z
    .string()
    .min(64, "Proof hash must be 64 characters")
    .max(64, "Proof hash must be 64 characters")
    .regex(/^[a-f0-9]{64}$/, "Invalid proof hash format"),

  // Stake duration validation
  stakeDuration: z
    .number()
    .int("Duration must be an integer")
    .refine(
      (duration) => [30, 90, 180, 365].includes(duration),
      "Duration must be 30, 90, 180, or 365 days",
    ),

  // Pagination validation
  pagination: z.object({
    limit: z
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .optional()
      .default(50),
    offset: z
      .number()
      .int()
      .min(0, "Offset must be non-negative")
      .optional()
      .default(0),
  }),

  // Category filter validation
  category: z
    .enum(["transit", "recycling", "energy", "community"])
    .optional(),

  // Status filter validation
  status: z
    .enum(["pending", "verified", "rejected", "expired"])
    .optional(),
};

/**
 * Create a validation schema for proof submission
 */
export const ProofSubmissionSchema = z.object({
  taskId: ValidationSchemas.taskId,
  proofData: z
    .string()
    .min(1, "Proof data is required")
    .max(10 * 1024 * 1024, "Proof data exceeds 10MB limit"),
  timestamp: ValidationSchemas.timestamp,
  geolocation: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
});

/**
 * Create a validation schema for stake submission
 */
export const StakeSubmissionSchema = z.object({
  amount: ValidationSchemas.tokenAmount.min(100, "Minimum stake is 100 ECO"),
  duration: ValidationSchemas.stakeDuration,
});

/**
 * Create a validation schema for redemption
 */
export const RedemptionSchema = z.object({
  rewardId: z.string().min(1, "Reward ID is required"),
});

/**
 * Create a validation schema for vote submission
 */
export const VoteSubmissionSchema = z.object({
  proposalId: z.string().min(1, "Proposal ID is required"),
  support: z.enum(["for", "against", "abstain"]),
  reason: z.string().max(500, "Reason cannot exceed 500 characters").optional(),
});
