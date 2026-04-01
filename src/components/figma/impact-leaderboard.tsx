'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from './shared/navigation';

export default function ImpactLeaderboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge className="bg-lime-400/20 text-lime-400 mb-4">EPOCH 04 ACTIVE</Badge>
          <h1 className="text-5xl font-bold mb-4">
            Impact <span className="text-lime-400">Leaderboard</span>
          </h1>
          <p className="text-gray-400">
            Competitive visualization of the top-tier squads generating
            decentralized ecological value. Rankings reset every 30 days.
          </p>
        </div>

        {/* Hall of Fame */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lime-400">🏆</span>
            <h2 className="text-xl font-bold">Hall of Fame</h2>
            <span className="text-gray-400 text-sm">— Epoch 03</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-yellow-900/40 to-yellow-700/20 backdrop-blur-sm border-yellow-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl font-bold text-yellow-400">1</span>
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-bold text-lg mb-1">Solaris Collective</h3>
              <p className="text-xs text-gray-400 mb-4">GLOBAL CHAMPION</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400">ECO Yield</p>
                  <div className="w-full bg-black/40 rounded-full h-2 mb-1">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '95%' }} />
                  </div>
                  <p className="text-sm font-bold">4.2M</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-gray-700/40 to-gray-600/20 backdrop-blur-sm border-gray-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl font-bold text-gray-300">2</span>
              </div>
              <h3 className="font-bold text-lg mb-1">Deep Forest DAO</h3>
              <p className="text-xs text-gray-400 mb-4">TOP OFFSETTER</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400">CO2 Offset</p>
                  <div className="w-full bg-black/40 rounded-full h-2 mb-1">
                    <div className="bg-gray-400 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <p className="text-sm font-bold">890 Tons</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/40 to-orange-700/20 backdrop-blur-sm border-orange-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl font-bold text-orange-400">3</span>
              </div>
              <h3 className="font-bold text-lg mb-1">Ocean Regen</h3>
              <p className="text-xs text-gray-400 mb-4">GROWTH STAR</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400">Active Members</p>
                  <div className="w-full bg-black/40 rounded-full h-2 mb-1">
                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <p className="text-sm font-bold">1.2k+</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Current Rankings */}
        <div>
          <h2 className="text-2xl font-bold mb-4 italic">CURRENT RANKINGS</h2>
          <p className="text-gray-400 text-sm mb-4">Real-time operator data sync</p>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button className="px-4 py-2 bg-lime-400 text-black rounded-lg font-bold">
              Global
            </button>
            <button className="px-4 py-2 text-gray-400">Regional</button>
            <button className="px-4 py-2 text-gray-400">Squad Only</button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs text-gray-400 font-bold mb-2">
            <div className="col-span-1">RANK</div>
            <div className="col-span-4">SQUAD NAME</div>
            <div className="col-span-3 text-right">TOTAL ECO</div>
            <div className="col-span-2 text-right">CO2 OFFSET</div>
            <div className="col-span-2 text-right">ACTIVE OPERATORS</div>
          </div>

          {/* Rankings */}
          <div className="space-y-2">
            {[
              { rank: 1, name: 'Neon Syndicate', tier: 'ELITE', tierNum: 1, eco: '12,450,200', co2: '2.4k Tons', operators: 842, trend: 'up' },
              { rank: 2, name: 'Void Runners', tier: 'VETERAN', tierNum: 1, eco: '11,820,500', co2: '2.1k Tons', operators: 1205, trend: 'down' },
              { rank: 3, name: 'Azure Genesis', tier: 'RISING', tierNum: 2, eco: '9,440,000', co2: '1.8k Tons', operators: 560, trend: 'up' }
            ].map((squad) => (
              <Card key={squad.rank} className="bg-black/40 backdrop-blur-sm border-gray-700 hover:border-lime-400/50 transition-colors">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                  <div className="col-span-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{squad.rank < 10 ? `0${squad.rank}` : squad.rank}</span>
                      <span className="text-lime-400 text-xs">
                        {squad.trend === 'up' ? '↑' : '↓'}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-600 rounded-lg" />
                    <div>
                      <h3 className="font-bold">{squad.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${squad.rank === 1 ? 'bg-yellow-400/20 text-yellow-400' : 'bg-gray-700 text-gray-300'}`}>
                          {squad.tier}
                        </Badge>
                        <span className="text-xs text-gray-500">TIER {squad.tierNum}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <p className="text-xl font-bold text-lime-400">{squad.eco}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="font-bold">{squad.co2}</p>
                  </div>
                  <div className="col-span-2 text-right flex items-center justify-end gap-2">
                    <p className="font-bold">{squad.operators}</p>
                    <button className="text-gray-400 hover:text-white">→</button>
                  </div>
                </div>
                {squad.rank === 1 && (
                  <div className="w-full bg-lime-400 h-1" />
                )}
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Button className="w-full bg-lime-400 text-black hover:bg-lime-500">
            Create Squad
          </Button>
        </div>
      </div>
    </div>
  );
}
