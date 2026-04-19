'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from './shared/navigation';

export default function OperatorProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Profile Header */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-8 mb-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                    <div className="w-24 h-32 bg-gradient-to-b from-orange-300 via-orange-400 to-orange-500 rounded-t-full" />
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-lime-400 rounded-full h-1.5">
                        <div className="bg-lime-400 h-1.5 rounded-full" style={{ width: '98%' }} />
                      </div>
                      <span className="text-xs font-bold">98.4%</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                    NEURAL SYNC STATUS
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <Badge className="bg-lime-400/20 text-lime-400 mb-2">ACTIVE OPERATOR</Badge>
                  <h1 className="text-4xl font-bold mb-2">
                    KAIROS<span className="text-lime-400">_0X1</span>
                  </h1>
                  <p className="text-gray-400 mb-6">
                    Lead Architect of the Neon Syndicate. Specialized in high-velocity DAO governance and cross-chain impact verification.
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">TOTAL VERIFIED IMPACT</p>
                      <p className="text-2xl font-bold">12.8K</p>
                      <p className="text-xs text-lime-400">↑ 12% this cycle</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">GUILD MEMBERSHIP</p>
                      <p className="text-2xl font-bold">Level 42</p>
                      <p className="text-xs text-gray-400">Top 1% Global</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">DAO VOTING POWER</p>
                      <p className="text-2xl font-bold">840VP</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-6 h-6 bg-gray-700 rounded-full" />
                        <div className="w-6 h-6 bg-gray-700 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Achievement Badge Case */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>🏆</span>
                  Achievement Badge Case
                </h2>
                <span className="text-sm text-gray-400">12 / 48 Collected</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: '✨', unlocked: true },
                  { icon: '🛡️', unlocked: true },
                  { icon: '📦', unlocked: true },
                  { icon: '💀', unlocked: true },
                  { icon: '💎', unlocked: true },
                  { icon: '🔒', unlocked: false }
                ].map((badge, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl flex items-center justify-center text-4xl ${
                      badge.unlocked
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                        : 'bg-black/40 border border-gray-800'
                    }`}
                  >
                    <span className={badge.unlocked ? '' : 'opacity-20'}>{badge.icon}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Current Squad */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">Current Squad</h2>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-green-600 rounded-lg" />
                  <div>
                    <h3 className="text-xl font-bold">Operation: Zero-G Horizon</h3>
                    <Badge className="bg-red-500/20 text-red-400 mt-1">MISSION LIVE</Badge>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Deploying autonomous reef protectors in the Pacific Dead Zone.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Impact Velocity</p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div
                          key={i}
                          className={`h-8 w-3 rounded ${
                            i === 7 ? 'bg-lime-400' : i > 4 ? 'bg-lime-400/60' : 'bg-gray-700'
                          }`}
                          style={{ height: `${20 + i * 4}px` }}
                        />
                      ))}
                      <span className="text-lime-400 font-bold ml-2">+4.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Guild Info */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-lime-400 rounded-lg" />
                <div>
                  <h3 className="font-bold">NEON SYNDICATE</h3>
                  <p className="text-xs text-gray-400">Tier 1 Operators</p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3 mb-6">
              <Button className="w-full bg-lime-400 text-black hover:bg-lime-500">
                Create Squad
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
