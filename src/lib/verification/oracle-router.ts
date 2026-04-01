/**
 * Oracle Router
 * 
 * Requirement 3.1, 3.2, 3.3
 * Routes different proof types to appropriate oracle services
 */

import { ProofType } from "@/types/verification";

export enum OracleType {
  AI_VISION = "ai_vision",
  TRANSIT_API = "transit_api",
  SENSOR_IOT = "sensor_iot",
  EXTERNAL_API = "external_api",
}

export interface OracleRoute {
  type: OracleType;
  timeout: number; // milliseconds
  retryCount: number;
  retryBackoff: number; // exponential backoff multiplier
}

/**
 * Route proof types to appropriate oracle services
 * Requirement 3.1, 3.2, 3.3
 */
export function routeProofToOracle(proofType: ProofType): OracleRoute {
  switch (proofType) {
    case "photo":
      // Photo proofs go to AI vision oracle
      return {
        type: OracleType.AI_VISION,
        timeout: 30000, // 30 seconds
        retryCount: 3,
        retryBackoff: 2,
      };

    case "transit_card":
      // Transit card proofs go to transit API oracle
      return {
        type: OracleType.TRANSIT_API,
        timeout: 30000,
        retryCount: 3,
        retryBackoff: 2,
      };

    case "iot_sensor":
      // IoT sensor proofs go to sensor oracle
      return {
        type: OracleType.SENSOR_IOT,
        timeout: 30000,
        retryCount: 3,
        retryBackoff: 2,
      };

    case "api":
      // API proofs go to external API verification
      return {
        type: OracleType.EXTERNAL_API,
        timeout: 30000,
        retryCount: 3,
        retryBackoff: 2,
      };

    default:
      throw new Error(`Unknown proof type: ${proofType}`);
  }
}

/**
 * Get oracle service endpoint based on oracle type
 */
export function getOracleEndpoint(oracleType: OracleType): string {
  switch (oracleType) {
    case OracleType.AI_VISION:
      return process.env.OPENAI_API_ENDPOINT || "https://api.openai.com/v1";

    case OracleType.TRANSIT_API:
      return process.env.TRANSIT_API_ENDPOINT || "https://transit-api.example.com";

    case OracleType.SENSOR_IOT:
      return process.env.SENSOR_API_ENDPOINT || "https://sensor-api.example.com";

    case OracleType.EXTERNAL_API:
      return process.env.EXTERNAL_API_ENDPOINT || "https://external-api.example.com";

    default:
      throw new Error(`Unknown oracle type: ${oracleType}`);
  }
}

/**
 * Get oracle API key based on oracle type
 */
export function getOracleApiKey(oracleType: OracleType): string {
  switch (oracleType) {
    case OracleType.AI_VISION:
      return process.env.OPENAI_API_KEY || "";

    case OracleType.TRANSIT_API:
      return process.env.TRANSIT_API_KEY || "";

    case OracleType.SENSOR_IOT:
      return process.env.SENSOR_API_KEY || "";

    case OracleType.EXTERNAL_API:
      return process.env.EXTERNAL_API_KEY || "";

    default:
      throw new Error(`Unknown oracle type: ${oracleType}`);
  }
}
