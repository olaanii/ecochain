import {
  InterwovenKitProvider,
  TESTNET,
} from "@initia/interwovenkit-react";
import type { ComponentProps } from "react";

type InitiaConfig = Omit<ComponentProps<typeof InterwovenKitProvider>, "children">;


const customChain = {
  chain_id: process.env.NEXT_PUBLIC_INITIA_CHAIN_ID || "ecochain105",
  chain_name: "Ecochain",
  network_type: "testnet",
  bech32_prefix: "init",
  apis: {
    rpc: [{ address: process.env.NEXT_PUBLIC_INITIA_RPC || "http://localhost:26657" }],
    rest: [{ address: process.env.NEXT_PUBLIC_INITIA_REST || "http://localhost:1317" }],
    indexer: [{ address: "http://localhost:8080" }],
    "json-rpc": [{ address: process.env.NEXT_PUBLIC_INITIA_JSON_RPC || "http://localhost:8545" }],
  },
  fees: {
    fee_tokens: [
      {
        denom: "GAS",
        fixed_min_gas_price: 0,
        low_gas_price: 0,
        average_gas_price: 0,
        high_gas_price: 0,
      },
    ],
  },
  staking: { staking_tokens: [{ denom: "GAS" }] },
  native_assets: [
    { denom: "GAS", name: "GAS", symbol: "GAS", decimals: 18 },
  ],
  metadata: { is_l1: false, minitia: { type: "minievm" } },
};

export const initiaConfig = {
  ...TESTNET,
  customChain,
  defaultChainId: process.env.NEXT_PUBLIC_INITIA_CHAIN_ID ?? TESTNET.defaultChainId,
  routerApiUrl:
    process.env.NEXT_PUBLIC_INITIA_ROUTER_API_URL ?? TESTNET.routerApiUrl,
  registryUrl:
    process.env.NEXT_PUBLIC_INITIA_REGISTRY_URL ?? TESTNET.registryUrl,
  glyphUrl: process.env.NEXT_PUBLIC_INITIA_GLYPH_URL ?? TESTNET.glyphUrl,
  usernamesModuleAddress:
    process.env.NEXT_PUBLIC_INITIA_USERNAMES_MODULE ??
    "initia1usernamesmodule000000000000",
  lockStakeModuleAddress:
    process.env.NEXT_PUBLIC_INITIA_LOCK_STAKE_MODULE ??
    "initia1lockstake0000000000000",
  minityUrl: process.env.NEXT_PUBLIC_INITIA_MINITY_URL ?? "https://minity.initia.xyz",
  dexUrl: process.env.NEXT_PUBLIC_INITIA_DEX_URL ?? "https://dex.initia.xyz",
  vipUrl: process.env.NEXT_PUBLIC_INITIA_VIP_URL ?? "https://vip.initia.xyz",
  theme: "dark",
  enableAutoSign: true,
  disableAnalytics: true,

} satisfies InitiaConfig;

