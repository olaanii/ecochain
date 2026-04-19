export type EcoTask = {
  id: string;
  name: string;
  description: string;
  verificationHint: string;
  baseReward: number;
  bonusMultiplier: number;
  category: "Transport" | "Recycling" | "Energy" | "Community";
};

export type RewardOffering = {
  id: string;
  title: string;
  subtitle: string;
  cost: number;
  partner: string;
};

export type LeaderboardEntry = {
  name: string;
  region: string;
  points: number;
  streakDays: number;
};

export type DaoProposal = {
  id: string;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  status: "live" | "queued" | "approved";
};

export type AnalyticsSnapshot = {
  label: string;
  value: string;
  trend: string;
  insight: string;
};

export const ecoTasks: EcoTask[] = [
  {
    id: "transit-commute",
    name: "Low-impact commute",
    description: "Tap your transit card or log bus/train rides with the transit API.",
    verificationHint: "Upload tap-in receipt or use public transit open API.",
    baseReward: 40,
    bonusMultiplier: 1.15,
    category: "Transport",
  },
  {
    id: "curbside-recycle",
    name: "Curbside recycling",
    description:
      "Submit weight/photo proof of curbside bins or use IoT-enabled bin sensors.",
    verificationHint: "Attach photo + weight stamp; we hash and verify metadata.",
    baseReward: 55,
    bonusMultiplier: 1.25,
    category: "Recycling",
  },
  {
    id: "energy-saver",
    name: "Energy savings",
    description:
      "Log smart meter reductions or upload bills showing decreased usage.",
    verificationHint: "Compare this month vs last; auto proof uses OCR tags.",
    baseReward: 65,
    bonusMultiplier: 1.2,
    category: "Energy",
  },
  {
    id: "community-garden",
    name: "Community garden shift",
    description:
      "Record volunteer time with GPS proof plus supervisor signature (ZK optional).",
    verificationHint: "Share meeting ID + GPS geo + optional ZK proof.",
    baseReward: 70,
    bonusMultiplier: 1.3,
    category: "Community",
  },
];

export const rewardCatalog: RewardOffering[] = [
  {
    id: "green-labs",
    title: "Green Labs credits",
    subtitle: "Exchange for eco-products or renewable workshops.",
    cost: 120,
    partner: "Green Labs Network",
  },
  {
    id: "transit-pass",
    title: "Monthly transit pass",
    subtitle: "Valid on participating metros and bus rails.",
    cost: 90,
    partner: "Regional Transit Alliance",
  },
  {
    id: "eco-market",
    title: "Eco-market voucher",
    subtitle: "Reusable rewards at partner retailers.",
    cost: 75,
    partner: "Sustainability Marketplace",
  },
];

export const leaderboard: LeaderboardEntry[] = [
  { name: "Lina", region: "Cape Town", points: 1180, streakDays: 42 },
  { name: "Mateo", region: "Mexico City", points: 1085, streakDays: 31 },
  { name: "Aria", region: "Nairobi", points: 1043, streakDays: 28 },
  { name: "Sol", region: "Lisbon", points: 972, streakDays: 24 },
];

export const daoProposals: DaoProposal[] = [
  {
    id: "proposal-01",
    title: "New rebate for shared EV charging",
    description:
      "Add an eco-task rule that rewards EV rides where drivers share charging stations.",
    votesFor: 312,
    votesAgainst: 64,
    status: "live",
  },
  {
    id: "proposal-02",
    title: "Regional pilot: biomaterial takeback",
    description:
      "Launch pilot with local partners for curbside compost + biomaterial redemption.",
    votesFor: 418,
    votesAgainst: 29,
    status: "queued",
  },
  {
    id: "proposal-03",
    title: "Community education fund",
    description:
      "Allocate 15% of token revenue to fund tutorials and eco-coaches in under-served cities.",
    votesFor: 589,
    votesAgainst: 41,
    status: "approved",
  },
];

export const analyticsSnapshots: AnalyticsSnapshot[] = [
  {
    label: "Participation",
    value: "4.8K builders",
    trend: "+21% vs last week",
    insight: "Local campaigns in 3 cities sparked transit + recycling spikes.",
  },
  {
    label: "Eco actions verified",
    value: "2,130",
    trend: "+14% verified rate",
    insight: "IoT verification reduced manual review time by 35%.",
  },
  {
    label: "Value retained",
    value: "452K INITIA",
    trend: "Auto-sign fees hold at 0.02%",
    insight: "Revenue captured stays with the brand thanks to appchain fees.",
  },
];

export const missionHighlights = [
  "Transparent verification with public dashboards",
  "DAO governance for policy + fairness",
  "Accessible onboarding (multi-language, guided eco tasks)",
  "Fair rewards & anti-gaming logic baked into verification layers",
];

export const contentLibrary = [
  {
    title: "How to verify curbside recycling",
    blurb: "Step-by-step doc for scanning items, capturing weight, and submitting proof.",
  },
  {
    title: "Guide to Initia Auto-sign UX",
    blurb: "Set up Auto-sign so you can mint rewards without popping extra approvals.",
  },
  {
    title: "Regional eco challenges",
    blurb: "City-specific campaigns with leaderboard badges and collaborative teams.",
  },
];

export const complianceNotes = [
  "Clear data usage + reward terms, with opt-in record in Clerk/Initia wallets.",
  "Zero-knowledge proofs kept private while verifications publish hashes.",
  "Protect against gaming by limiting repeated proofs per task in 24h window.",
  "Transparency dashboards show audit trails and reward economics.",
];
