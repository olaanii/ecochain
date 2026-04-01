import {
  analyticsSnapshots,
  complianceNotes,
  contentLibrary,
  daoProposals as fallbackProposals,
  ecoTasks,
  leaderboard as fallbackLeaderboard,
  missionHighlights,
  rewardCatalog as fallbackRewards,
} from "@/lib/data/eco";
import { initiaSubmission } from "@/lib/initia/submission";

export type EcoDataResponse = {
  tasks: Array<{
    id: string;
    name: string;
    description: string;
    verificationHint: string;
    baseReward: number;
    bonusMultiplier: number;
    category: string;
  }>;
  leaderboard: Array<{
    name: string;
    region: string;
    points: number;
    streakDays: number;
  }>;
  rewards: Array<{
    id: string;
    title: string;
    subtitle: string;
    cost: number;
    partner: string;
  }>;
  proposals: Array<{
    id: string;
    title: string;
    description: string;
    votesFor: number;
    votesAgainst: number;
    status: string;
  }>;
  analytics: Array<{
    label: string;
    value: string;
    trend: string;
    insight: string;
  }>;
  mission: string[];
  content: Array<{ title: string; blurb: string }>;
  compliance: string[];
  chainStatus: {
    chainId: string;
    deploymentLink: string;
    txnEvidence: string;
    status: string;
    blockTime: string;
    autoSign: string;
  };
  bridgeHistory: Array<{
    id: string;
    amount: number;
    denom: string;
    status: string;
    targetChain: string;
    timestamp: string;
    transactionLink: string;
    builder: string;
  }>;
  economics: {
    minted: string;
    redemptions: string;
    bridgeRequests: string;
    rebatePool: string;
    stakingSnapshot: string;
  };
};

export const fallbackDashboard: EcoDataResponse = {
  tasks: ecoTasks,
  leaderboard: fallbackLeaderboard,
  rewards: fallbackRewards,
  proposals: fallbackProposals,
  analytics: analyticsSnapshots,
  mission: missionHighlights,
  content: contentLibrary,
  compliance: complianceNotes,
  chainStatus: {
    chainId: initiaSubmission.chainId,
    deploymentLink: initiaSubmission.deploymentLink,
    txnEvidence: initiaSubmission.txnEvidence,
    status: "Demo-ready",
    blockTime: "100ms",
    autoSign: "Enabled",
  },
  bridgeHistory: [
    {
      id: "seed-bridge-1",
      amount: 42,
      denom: "INITIA",
      status: "completed",
      targetChain: initiaSubmission.chainId,
      timestamp: new Date().toISOString(),
      transactionLink: initiaSubmission.txnEvidence,
      builder: "EcoLoop demo",
    },
  ],
  economics: {
    minted: "452K INITIA",
    redemptions: "120K INITIA",
    bridgeRequests: "84",
    rebatePool: "9.4K INITIA",
    stakingSnapshot: "82% of rewards held in active missions",
  },
};
