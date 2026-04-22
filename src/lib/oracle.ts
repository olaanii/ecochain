export type ProofType = "photo" | "transit" | "weight" | "sensor";

export type ProofMetadata = {
  proofType: ProofType;
  oracleSource?: string;
  oracleConfidence?: number;
  proofDetails?: Record<string, unknown>;
};

export type OracleEvaluation = {
  passed: boolean;
  reason?: string;
  confidence: number;
  insight: string;
};

export function evaluateOracleProof(metadata?: ProofMetadata): OracleEvaluation {
  const proofType = metadata?.proofType ?? "photo";
  const defaultConfidence =
    metadata?.oracleConfidence ?? (proofType === "transit" ? 0.82 : proofType === "weight" ? 0.76 : 0.72);
  const confidence = Math.min(1, Math.max(0, defaultConfidence));
  let passed = true;
  let reason: string | undefined;
  const source = metadata?.oracleSource ?? "unknown oracle";

  if (!metadata?.oracleSource) {
    passed = false;
    reason = "No oracle source provided";
  }

  if (confidence < 0.55) {
    passed = false;
    reason = "Oracle confidence too low";
  }

  if (proofType === "transit" && !metadata?.proofDetails?.["tapId"]) {
    passed = false;
    reason = "Transit tap ID is required";
  }

  if (proofType === "weight") {
    const weight = Number(metadata?.proofDetails?.["weight"] ?? 0);
    if (weight <= 0) {
      passed = false;
      reason = "Weight proof requires a positive kilogram value";
    } else if (weight < 5) {
      reason = "Light weight proofs may trigger manual review";
    }
  }

  if (proofType === "photo" && !metadata?.proofDetails?.["imageHash"]) {
    passed = false;
    reason = "Image hash is required for photo proofs";
  }

  const insight = `${source} reported ${proofType} proof with ${(confidence * 100).toFixed(0)}% confidence.`;
  return { passed, reason, confidence, insight };
}



