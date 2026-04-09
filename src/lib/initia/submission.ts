export const initiaSubmission = {
  name: "EcoLoop",
  summary:
    "Sustainability rewards appchain powered by Initia Auto-sign, Interwoven Bridge, DAO governance, and eco-task verification.",
  chainId: process.env.NEXT_PUBLIC_INITIA_CHAIN_ID ?? "ecochain105",
  deploymentLink: "https://github.com/username/ecoloop",
  txnEvidence: "https://explorer.initia.xyz/tx/0xabc123",
  demoVideo: "https://youtu.be/example-demo",
  initiaFeatures: [
    "InterwovenKit wallet and bridge integration",
    "Auto-sign session UX",
    ".init username registration awareness",
    "Initia-native reward issuance",
    "Oracle-backed proof evaluation",
  ],
} as const;
