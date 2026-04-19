
export const runtimeConfig = {
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
  initiaChainId: process.env.NEXT_PUBLIC_INITIA_CHAIN_ID ?? "ecochain105",
};

export const setupChecklist = [
  {
    env: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    label: "Clerk publishable key",
    required: true,
    value: runtimeConfig.clerkPublishableKey,
  },
  {
    env: "NEXT_PUBLIC_INITIA_CHAIN_ID",
    label: "Initia chain id",
    required: false,
    value: runtimeConfig.initiaChainId,
  },
] as const;

export const hasClerkSetup = Boolean(runtimeConfig.clerkPublishableKey);
export const hasWalletDemoSetup = true;
