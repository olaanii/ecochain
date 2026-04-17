'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from './shared/navigation';

export default function SquadHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-lime-400 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🌿</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Neon Syndicate</h2>
            <p className="text-sm text-gray-400">Tier 1 Operators</p>
          </div>
        </div>

        {/* High Priority Mission */}
        <Card className="bg-gradient-to-br from-lime-900/20 to-green-900/20 backdrop-blur-sm border-lime-400/30 p-8 mb-8">
          <Badge className="bg-lime-400/20 text-lime-400 mb-4">HIGH PRIORITY MISSION</Badge>
          <h1 className="text-5xl font-bold mb-4">
            Reforest<br />Sector 7
          </h1>
          <p className="text-gray-300 mb-6 max-w-2xl">
            A massive collective operation to restore the atmospheric scrubbers in the Eastern Dead Zone. We need 50,000 operators to deploy bio-seeds.
          </p>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold">42%</span>
              <span className="text-sm text-gray-400">21,000 / 50,000 OPERATORS</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-3">
              <div className="bg-lime-400 h-3 rounded-full" style={{ width: '42%' }} />
            </div>
          </div>
          <div className="flex gap-4">
            <Button className="bg-lime-400 text-black hover:bg-lime-500">
              Join Task Force
            </Button>
            <Button variant="outline" className="border-gray-700">
              Mission Intel
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Active Operations */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Active Operations</h2>
                <button className="text-lime-400 text-sm">VIEW ALL MISSIONS</button>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Ongoing environmental missions requiring community effort.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-black/40 backdrop-blur-sm border-cyan-500/30 p-6">
                  <Badge className="bg-cyan-400/20 text-cyan-400 mb-3">HYDRATION</Badge>
                  <h3 className="text-xl font-bold mb-2">Purify North Basin</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Systemic chemical filtration of the main water supply for Sector T-4. High technical skill required.
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Purity Goal</span>
                      <span className="font-bold">78%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-gray-700">
                    Participate
                  </Button>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 p-6">
                  <Badge className="bg-orange-400/20 text-orange-400 mb-3">ENERGY</Badge>
                  <h3 className="text-xl font-bold mb-2">Solar Grid Sync</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Aligning decentralized solar arrays during the Eclipse Phase.
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-lime-400 to-green-600 border-2 border-black" />
                      ))}
                      <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-black flex items-center justify-center text-xs">
                        +2
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mb-4">
                    <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: '15%' }} />
                  </div>
                  <Button variant="outline" className="w-full border-gray-700">
                    Join Sync
                  </Button>
                </Card>
              </div>

              <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
                <Badge className="bg-gray-700 text-gray-300 mb-3">HARDWARE</Badge>
                <h3 className="text-xl font-bold mb-2">Circuit Salvage</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Recover rare minerals from the Wasteland Relay.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">92%</p>
                  </div>
                  <div className="w-12 h-12 bg-lime-400/20 rounded-full flex items-center justify-center">
                    <span className="text-lime-400 text-xl">✓</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Live Contribution Feed */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6 mb-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="text-lime-400">📡</span>
                LIVE CONTRIBUTION FEED
              </h3>
              <div className="space-y-4">
                {[
                  { user: 'Kael_01', action: 'joined Squad Iron Bloom', time: '2m ago', type: 'Deployment: Sector 7-B' },
                  { user: 'Void_Walker', action: 'contributed 500 Bio-Units', time: '5m ago', type: 'Resource Sync' },
                  { user: 'New Beacon', action: 'established in Zone Delta', time: '12m ago', type: 'System Update' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-800 last:border-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-green-600 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="text-lime-400">Operator {item.user}</span> {item.action}
                      </p>
                      <p className="text-xs text-gray-500">{item.time} • {item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Network Status */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">NETWORK STATUS</h3>
                <Badge className="bg-lime-400/20 text-lime-400">STABLE</Badge>
              </div>
            </Card>

            {/* Network Impact */}
            <Card className="bg-gradient-to-br from-lime-400 to-green-500 p-6 text-black">
              <h3 className="text-2xl font-bold mb-2">Network Impact</h3>
              <p className="text-sm mb-6 opacity-80">
                Collective actions have reduced carbon levels by 12.4% this quarter. The DAO Treasury has distributed 1.2M ECO tokens.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-xs opacity-70 mb-1">TOKENS BURNT</p>
                  <p className="text-xl font-bold">450K</p>
                </div>
                <div>
                  <p className="text-xs opacity-70 mb-1">TOTAL POOL</p>
                  <p className="text-xl font-bold">1.2M</p>
                </div>
                <div>
                  <p className="text-xs opacity-70 mb-1">ACTIVE DAO</p>
                  <p className="text-xl font-bold">15K</p>
                </div>
              </div>
              <div className="h-20 flex items-end gap-1">
                {[40, 55, 45, 70, 60, 85, 75].map((height, i) => (
                  <div key={i} className="flex-1 bg-black/20 rounded-t" style={{ height: `${height}%` }} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
