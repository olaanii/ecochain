const log = (label, value) => console.log(`[Demo] ${label}:`, value);

async function runDemo() {
  const TASKS_URL = "http://localhost:3000/api/tasks";
  const VERIFY_URL = "http://localhost:3000/api/verify";
  const BRIDGE_URL = "http://localhost:3000/api/bridge";

  log("Step", "Fetching mission data");
  const tasksResponse = await fetch(TASKS_URL);
  const tasksData = await tasksResponse.json();
  const task = tasksData.tasks?.[0];
  const reward = tasksData.rewards?.[0];
  log("Tasks", `${tasksData.tasks?.length || 0} tasks loaded (${task?.name})`);

  log("Step", "Submitting proof for task");
  const verifyResponse = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      taskId: task?.id ?? "transit-commute",
      proofHash: `demo-proof-${Date.now()}`,
      geoHash: "demo-geo-hash",
      submittedAt: Date.now(),
    }),
  });
  const verifyPayload = await verifyResponse.json();
  log("Verification", verifyPayload.result);

  log("Step", "Redeeming reward from catalog");
  const redeemResponse = await fetch("http://localhost:3000/api/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rewardId: reward?.id,
      displayName: "Demo builder",
      initiaUsername: "demo.init",
      initiaAddress: "initia1demo",
    }),
  });
  const redeemPayload = await redeemResponse.json();
  log("Redemption", redeemPayload);

  log("Step", "Calling bridge");
  const bridgeResponse = await fetch(BRIDGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: 50,
      denom: "INITIA",
      targetChain: process.env.NEXT_PUBLIC_INITIA_CHAIN_ID ?? "initia-test-1",
    }),
  });
  const bridgePayload = await bridgeResponse.json();
  log("Bridge", bridgePayload.entry);

  log("Complete", "Demo flow executed (server must be running)");
}

runDemo().catch((error) => {
  console.error("[Demo] Script failed:", error);
  process.exit(1);
});
