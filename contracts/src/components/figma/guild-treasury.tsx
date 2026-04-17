'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from './shared/navigation';

export default function GuildTreasury() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-lime-400 rounded-lg" />
            <div>
              <h2 className="text-2xl font-bold">Neon Syndicate</h2>
              <p className="text-sm text-gray-400">Tier 1 Operators</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-gray-700">
              Deposit ECO
            </Button>
            <Button className="bg-lime-400 text-black hover:bg-lime-500">
              New Proposal
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <Badge className="bg-lime-400/20 text-lime-400 mb-4">LIVE TREASURY PROTOCOL</Badge>
          <h1 className="text-5xl font-bold mb-4">
            Guild <span className="text-lime-400">Treasury</span>
          </h1>
          <p className="text-gray-400">
            Real-time governance and allocation of the Neon Syndicate's ECO token reserves.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Balance Card */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2">TOTAL BALANCE</p>
                  <h2 className="text-5xl font-bold">
                    4,285,190 <span className="text-lime-400 text-3xl">ECO</span>
                  </h2>
                </div>
                <button className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                  📋
                </button>
              </div>

              {/* Chart */}
              <div className="h-32 flex items-end gap-2 mb-4">
                <div className="text-xs text-gray-500 mb-2">JAN 01</div>
                <div className="flex-1 flex items-end gap-1">
                  {[30, 35, 32, 40, 38, 50, 100].map((height, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${i === 6 ? 'bg-lime-400' : 'bg-gray-800'}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500 mb-2">CURRENT RESERVE</div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
                <p className="text-sm text-gray-400 mb-2">PENDING ALLOCATIONS</p>
                <p className="text-3xl font-bold">
                  840,000 <span className="text-lime-400 text-xl">ECO</span>
                </p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Active Operations</span>
                    <span className="font-bold">520k</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
                    <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: '62%' }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Guild Maintenance</span>
                    <span className="font-bold">320k</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-gray-600 h-1.5 rounded-full" style={{ width: '38%' }} />
                  </div>
                </div>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
                <p className="text-sm text-gray-400 mb-2">STAKING YIELD</p>
                <p className="text-3xl font-bold text-lime-400">
                  +12.4% <span className="text-sm text-gray-400">APR</span>
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 bg-gradient-to-br from-lime-400 to-green-600 rounded-full border-2 border-black" />
                    ))}
                    <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-black flex items-center justify-center text-xs">
                      +8
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">VERIFIED DAO SIGNATORIES</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Voted Spending Proposals */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Voted Spending Proposals</h2>
                <button className="text-lime-400 text-sm">View History →</button>
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 mb-4">4 Active</Badge>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-black/40 backdrop-blur-sm border-yellow-500/30 p-6">
                  <Badge className="bg-yellow-500/20 text-yellow-400 mb-3">IN PROGRESS</Badge>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">Infrastructure Upgrade: Node v2.0</h3>
                    <span className="text-xs text-gray-500">ID: ESP-402</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Funding for high-latency node synchronization across the eastern quadrant guilds for better transaction speed.
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Voting Power (For)</span>
                      <span className="font-bold">88.4%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-lime-400 h-2 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">REQUESTED AMOUNT</p>
                      <p className="text-xl font-bold">250,000 ECO</p>
                    </div>
                    <Button variant="outline" className="border-gray-700 text-xs">
                      Details
                    </Button>
                  </div>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-blue-500/30 p-6">
                  <Badge className="bg-blue-500/20 text-blue-400 mb-3">VOTING PHASE</Badge>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">Seasonal Reward Pool Expansion</h3>
                    <span className="text-xs text-gray-500">ID: ESP-405</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Increase the monthly bounty allocations for Tier 2 operators to incentivize exploration of the void territories.
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Voting Power (For)</span>
                      <span className="font-bold">62.1%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full" style={{ width: '62%' }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">REQUESTED AMOUNT</p>
                      <p className="text-xl font-bold">125,000 ECO</p>
                    </div>
                    <Button className="bg-lime-400 text-black hover:bg-lime-500 text-xs">
                      Vote For
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Recent Ledger */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Recent Ledger</h3>
                <div className="flex gap-2">
                  <button className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700">
                    ☰
                  </button>
                  <button className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700">
                    ⬇
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 text-xs text-gray-400 pb-2 border-b border-gray-800">
                  <div className="col-span-4">TRANSACTION</div>
                  <div className="col-span-3">TYPE</div>
                  <div className="col-span-3">SIGNER</div>
                  <div className="col-span-2 text-right">AMOUNT</div>
                </div>
                {[
                  { name: 'Bounty Payout #921', type: 'Treasury Disbursement', signer: '0x882...1ac', amount: '- 12,400 ECO', color: 'text-red-400' },
                  { name: 'Yield Collection', type: 'Staking Reward', signer: 'System Protocol', amount: '+ 4,200 ECO', color: 'text-lime-400' },
                  { name: 'Internal Rebalance', type: 'Liquidity Shift', signer: '0x21a...fb3', amount: '85,000 ECO', color: 'text-white' }
                ].map((tx, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 text-sm items-center py-2">
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                        {i === 0 ? '↗' : i === 1 ? '✓' : '↔'}
                      </div>
                      <span>{tx.name}</span>
                    </div>
                    <div className="col-span-3 text-gray-400">{tx.type}</div>
                    <div className="col-span-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-lime-400 to-green-600 rounded-full" />
                      <span className="text-gray-400">{tx.signer}</span>
                    </div>
                    <div className={`col-span-2 text-right font-bold ${tx.color}`}>{tx.amount}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6 mb-6">
              <div className="bg-black/60 border border-gray-700 rounded-lg p-4 mb-4 flex items-center gap-3">
                <span className="text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search treasury..."
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Button className="w-full bg-lime-400 text-black hover:bg-lime-500">
            + Create Squad
          </Button>
        </div>
      </div>
    </div>
  );
}
