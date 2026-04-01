import assert from "node:assert";
import test from "node:test";

import { verifyProof } from "../dist/verification.js";

const sampleTask = {
  slug: "transit-commute",
  name: "Low-impact commute",
  baseReward: 40,
  bonusFactor: 1.15,
};

const oracleMetadata = {
  proofType: "transit",
  oracleSource: "unit-tests",
  oracleConfidence: 0.92,
  proofDetails: {
    tapId: "tap-unit-123",
  },
};

test("verifies newer proofs and returns reward", () => {
  const result = verifyProof(
    sampleTask,
    {
      taskId: sampleTask.slug,
      proofHash: `test-${Date.now()}`,
      submittedAt: Date.now(),
    },
    oracleMetadata,
  );

  assert.strictEqual(result.verified, true);
  assert.ok(typeof result.rewardDelta === "number");
});

test("rejects proofs older than 48 hours", () => {
  const oldTimestamp = Date.now() - 48 * 60 * 60 * 1000 - 1;
  const result = verifyProof(
    sampleTask,
    {
      taskId: sampleTask.slug,
      proofHash: "old-proof",
      submittedAt: oldTimestamp,
    },
    oracleMetadata,
  );

  assert.strictEqual(result.verified, false);
  assert.strictEqual(result.reason, "Proof too old");
});
