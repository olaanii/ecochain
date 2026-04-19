import { ecoTasks } from "./data/eco";
import type { ProofMetadata } from "./oracle";
import { evaluateOracleProof } from "./oracle";

export type ProofPayload = {
  taskId: string;
  submittedAt: number;
  geoHash?: string;
  proofHash: string;
};

export type TaskContext = {
  slug: string;
  name: string;
  baseReward: number;
  bonusFactor: number;
};

const PROOF_HISTORY = new Map<string, number>();

export type VerificationResult = {
  verified: boolean;
  reason?: string;
  rewardDelta?: number;
  taskName?: string;
  oracleEvaluation?: ReturnType<typeof evaluateOracleProof>;
};

export function verifyProof(
  taskOrPayload: TaskContext | ProofPayload,
  maybePayload?: ProofPayload,
  metadata?: ProofMetadata,
): VerificationResult {
  const task = "slug" in taskOrPayload ? taskOrPayload : ecoTasks.find((entry) => entry.id === taskOrPayload.taskId);
  const payload = "slug" in taskOrPayload ? maybePayload : taskOrPayload;
  const resolvedTask = task
    ? "slug" in task
      ? task
      : {
          slug: task.id,
          name: task.name,
          baseReward: task.baseReward,
          bonusFactor: task.bonusMultiplier,
        }
    : null;

  if (!resolvedTask) {
    return { verified: false, reason: "Unknown eco task" };
  }

  if (!payload) {
    return { verified: false, reason: "Missing proof payload", taskName: resolvedTask.name };
  }

  if ("slug" in taskOrPayload && taskOrPayload.slug !== payload.taskId) {
    return { verified: false, reason: "Task mismatch", taskName: resolvedTask.name };
  }

  const oracleEvaluation = evaluateOracleProof(metadata);
  if (!oracleEvaluation.passed) {
    return {
      verified: false,
      reason: oracleEvaluation.reason ?? "Oracle check failed",
      taskName: resolvedTask.name,
      oracleEvaluation,
    };
  }

  const now = Date.now();
  const ageHours = Math.abs(now - payload.submittedAt) / (1000 * 60 * 60);

  if (ageHours >= 48) {
    return { verified: false, reason: "Proof too old", taskName: resolvedTask.name };
  }

  const duplicationKey = `${resolvedTask.slug}-${payload.proofHash}-${payload.geoHash ?? "none"}`;
  const lastSubmitted = PROOF_HISTORY.get(duplicationKey);

  if (lastSubmitted && now - lastSubmitted < 15 * 60 * 1000) {
    return {
      verified: false,
      reason: "Duplicate proof detected",
      taskName: resolvedTask.name,
    };
  }

  PROOF_HISTORY.set(duplicationKey, now);

  const reward = Math.round(
    resolvedTask.baseReward * resolvedTask.bonusFactor * (1 + Math.random() * 0.14),
  );

  return {
    verified: true,
    taskName: resolvedTask.name,
    rewardDelta: reward,
    oracleEvaluation,
  };
}
