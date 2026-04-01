declare module "@prisma/client" {
  export class PrismaClient {
    task: any;
    rewardOffering: any;
    daoProposal: any;
    user: any;
    verification: any;
    ledgerEntry: any;
    bridgeRequest: any;
    notification: any;
    stake: any;
    redemption: any;
    vote: any;
    proposalExecution: any;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $queryRaw<T = unknown>(query: TemplateStringsArray, ...values: any[]): Promise<T>;
    constructor(...args: any[]);
  }
}
