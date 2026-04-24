/**
 * OpenAPI 3.1 spec generator from Zod schemas
 * Generates spec dynamically for API documentation and client SDK generation
 */

import { z } from "zod";
import {
  TasksQueryParamsSchema,
  TasksResponseSchema,
  TaskSchema,
  VerifyRequestSchema,
  VerifyResponseSchema,
  StakeRequestSchema,
  StakeResponseSchema,
  BridgeRequestSchema,
  BridgeResponseSchema,
  RedeemRequestSchema,
  RedeemResponseSchema,
  PaginatedResponseSchema,
} from "./schemas";

// OpenAPI version
const OPENAPI_VERSION = "3.1.0";

// API metadata
const API_INFO = {
  title: "EcoChain API",
  version: "1.0.0",
  description: "Blockchain-based sustainability rewards platform API",
  contact: {
    name: "EcoChain Support",
    email: "api@ecochain.example.com",
  },
  license: {
    name: "MIT",
    url: "https://opensource.org/licenses/MIT",
  },
};

const SERVERS = [
  { url: "https://api.ecochain.example.com", description: "Production" },
  { url: "http://localhost:3000", description: "Development" },
];

// Zod to OpenAPI schema converter
function zodToOpenApi(zodSchema: z.ZodTypeAny): Record<string, unknown> {
  const def = zodSchema._def;

  // Handle optional/nullable
  if (def.typeName === "ZodOptional" || def.typeName === "ZodNullable") {
    return zodToOpenApi(def.innerType);
  }

  // Handle default values
  if (def.typeName === "ZodDefault") {
    const inner = zodToOpenApi(def.innerType);
    return { ...inner, default: def.defaultValue() };
  }

  // Handle coercion (numbers from strings)
  if (def.typeName === "ZodEffects" && def.effect?.type === "transform") {
    // Coerced number — treat as number
    return { type: "number" };
  }

  switch (def.typeName) {
    case "ZodString":
      return { type: "string", minLength: def.minLength?.value, maxLength: def.maxLength?.value };

    case "ZodNumber":
    case "ZodBigInt":
      return {
        type: def.coerce ? "number" : "number",
        minimum: def.min?.value,
        maximum: def.max?.value,
      };

    case "ZodBoolean":
      return { type: "boolean" };

    case "ZodDate":
      return { type: "string", format: "date-time" };

    case "ZodEnum":
      return { type: "string", enum: def.values };

    case "ZodArray":
      return {
        type: "array",
        items: zodToOpenApi(def.type),
        minItems: def.minLength?.value,
        maxItems: def.maxLength?.value,
      };

    case "ZodObject":
      const shape = def.shape();
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        properties[key] = zodToOpenApi(value as z.ZodTypeAny);
        if (!(value as z.ZodTypeAny).isOptional()) {
          required.push(key);
        }
      }

      return {
        type: "object",
        properties,
        ...(required.length > 0 ? { required } : {}),
      };

    case "ZodUnion":
      return {
        oneOf: def.options.map((opt: z.ZodTypeAny) => zodToOpenApi(opt)),
      };

    case "ZodLiteral":
      return { type: typeof def.value === "string" ? "string" : "number", enum: [def.value] };

    case "ZodRecord":
      return {
        type: "object",
        additionalProperties: zodToOpenApi(def.valueType),
      };

    case "ZodUnknown":
    case "ZodAny":
      return {};

    default:
      return { type: "string" };
  }
}

// Build OpenAPI spec
export function generateOpenApiSpec(): Record<string, unknown> {
  const schemas: Record<string, unknown> = {
    Task: zodToOpenApi(TaskSchema),
    TasksResponse: zodToOpenApi(TasksResponseSchema),
    VerifyRequest: zodToOpenApi(VerifyRequestSchema),
    VerifyResponse: zodToOpenApi(VerifyResponseSchema),
    StakeRequest: zodToOpenApi(StakeRequestSchema),
    StakeResponse: zodToOpenApi(StakeResponseSchema),
    BridgeRequest: zodToOpenApi(BridgeRequestSchema),
    BridgeResponse: zodToOpenApi(BridgeResponseSchema),
    RedeemRequest: zodToOpenApi(RedeemRequestSchema),
    RedeemResponse: zodToOpenApi(RedeemResponseSchema),
    PaginatedResponse: zodToOpenApi(PaginatedResponseSchema),
  };

  const paths: Record<string, unknown> = {
    "/api/tasks": {
      get: {
        operationId: "listTasks",
        summary: "List available tasks",
        description: "Returns paginated list of sustainability tasks with filtering options",
        tags: ["Tasks"],
        parameters: [
          {
            name: "category",
            in: "query",
            schema: { type: "string", enum: ["transit", "recycling", "energy", "community"] },
            description: "Filter by task category",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            description: "Maximum results per page",
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", minimum: 0, default: 0 },
            description: "Number of results to skip",
          },
        ],
        responses: {
          "200": {
            description: "List of tasks",
            content: { "application/json": { schema: { $ref: "#/components/schemas/TasksResponse" } } },
          },
          "401": { description: "Unauthorized" },
          "429": { description: "Rate limit exceeded" },
        },
      },
    },
    "/api/verify": {
      post: {
        operationId: "submitVerification",
        summary: "Submit task verification",
        description: "Submit proof of task completion for verification",
        tags: ["Verification"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/VerifyRequest" } } },
        },
        responses: {
          "200": {
            description: "Verification submitted",
            content: { "application/json": { schema: { $ref: "#/components/schemas/VerifyResponse" } } },
          },
          "400": { description: "Invalid request" },
          "401": { description: "Unauthorized" },
          "429": { description: "Rate limit exceeded" },
        },
      },
    },
    "/api/stake": {
      post: {
        operationId: "stakeTokens",
        summary: "Stake ECO tokens",
        description: "Stake tokens for governance participation and rewards",
        tags: ["Staking"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StakeRequest" } } },
        },
        responses: {
          "200": {
            description: "Stake created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StakeResponse" } } },
          },
          "400": { description: "Invalid request" },
          "401": { description: "Unauthorized" },
          "429": { description: "Rate limit exceeded" },
        },
      },
    },
    "/api/bridge": {
      post: {
        operationId: "bridgeTokens",
        summary: "Bridge ECO tokens",
        description: "Bridge tokens between Initia and EVM chains",
        tags: ["Bridge"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/BridgeRequest" } } },
        },
        responses: {
          "200": {
            description: "Bridge initiated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/BridgeResponse" } } },
          },
          "400": { description: "Invalid request" },
          "401": { description: "Unauthorized" },
          "429": { description: "Rate limit exceeded" },
        },
      },
    },
    "/api/redeem": {
      post: {
        operationId: "redeemRewards",
        summary: "Redeem rewards",
        description: "Redeem ECO tokens for rewards or fiat off-ramp",
        tags: ["Rewards"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RedeemRequest" } } },
        },
        responses: {
          "200": {
            description: "Redemption initiated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/RedeemResponse" } } },
          },
          "400": { description: "Invalid request" },
          "401": { description: "Unauthorized" },
          "429": { description: "Rate limit exceeded" },
        },
      },
    },
    "/api/health": {
      get: {
        operationId: "healthCheck",
        summary: "Health check",
        description: "Check API health status",
        tags: ["Health"],
        responses: {
          "200": {
            description: "Healthy",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" } } } } },
          },
        },
      },
    },
    "/api/me": {
      get: {
        operationId: "getCurrentUser",
        summary: "Get current user",
        description: "Get authenticated user profile",
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    role: { type: "string", enum: ["user", "sponsor", "admin", "owner"] },
                    displayName: { type: "string" },
                    initiaAddress: { type: "string" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "404": { description: "User not found" },
        },
      },
      patch: {
        operationId: "updateCurrentUser",
        summary: "Update current user",
        description: "Update authenticated user profile (e.g., role)",
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  role: { type: "string", enum: ["user", "sponsor", "admin"] },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    role: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid request" },
          "401": { description: "Unauthorized" },
          "502": { description: "Role sync failed" },
        },
      },
    },
    "/api/rewards": {
      get: {
        operationId: "getRewards",
        summary: "Get user rewards",
        description: "Get rewards history and balance for authenticated user",
        tags: ["Rewards"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Rewards data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    balance: { type: "string" },
                    history: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/governance/proposals": {
      get: {
        operationId: "getProposals",
        summary: "Get governance proposals",
        description: "List all governance proposals",
        tags: ["Governance"],
        responses: {
          "200": {
            description: "Proposals list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                      status: { type: "string" },
                      startTime: { type: "string", format: "date-time" },
                      endTime: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/governance/vote": {
      post: {
        operationId: "castVote",
        summary: "Cast vote on proposal",
        description: "Submit vote on a governance proposal",
        tags: ["Governance"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  proposalId: { type: "string" },
                  support: { type: "boolean" },
                },
                required: ["proposalId", "support"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Vote cast successfully" },
          "400": { description: "Invalid request" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/bridge/history": {
      get: {
        operationId: "getBridgeHistory",
        summary: "Get bridge transaction history",
        description: "Get bridge transaction history for authenticated user",
        tags: ["Bridge"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Bridge history",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      fromChain: { type: "string" },
                      toChain: { type: "string" },
                      amount: { type: "string" },
                      status: { type: "string" },
                      timestamp: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
  };

  return {
    openapi: OPENAPI_VERSION,
    info: API_INFO,
    servers: SERVERS,
    paths,
    components: {
      schemas,
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Clerk JWT token",
        },
        apiKey: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "API key for service-to-service calls",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Tasks", description: "Sustainability task management" },
      { name: "Verification", description: "Task verification and proof submission" },
      { name: "Staking", description: "Token staking operations" },
      { name: "Bridge", description: "Cross-chain bridging" },
      { name: "Rewards", description: "Reward redemption" },
      { name: "Health", description: "Health check endpoints" },
      { name: "User", description: "User profile and management" },
      { name: "Governance", description: "Governance proposals and voting" },
    ],
  };
}

export function getOpenApiJson(): string {
  return JSON.stringify(generateOpenApiSpec(), null, 2);
}
