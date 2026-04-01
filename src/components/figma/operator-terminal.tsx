'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navigation from './shared/navigation';

export default function OperatorTerminal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* User Info */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-green-600 rounded-lg" />
                <div>
                  <h3 className="font-bold">Neon Syndicate</h3>
                  <p className="text-xs text-gray-400">TIER 1 OPERATORS</p>
                </div>
              </div>
            </Card>

            {/* Core Specs */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span>📖</span>
                <h3 className="font-bold">Core Specs</h3>
              </div>
              <div className="space-y-3">
                {[
                  { id: '01', title: 'Solar Node Setup' },
                  { id: '02', title: 'H2O Sensor Calibration' },
                  { id: '03', title: 'Mesh Network Linking' }
                ].map((spec) => (
                  <div key={spec.id} className="flex items-center justify-between p-3 bg-black/40 rounded-lg hover:bg-black/60 transition-colors cursor-pointer">
                    <span className="text-sm">{spec.id} {spec.title}</span>
                    <span className="text-gray-400">→</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-lime-400 rounded-full" />
                  <h4 className="text-sm font-bold">LIVE STATUS</h4>
                </div>
                <p className="text-xs text-gray-400">Documentation v4.2 Online</p>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="text-sm text-gray-400 mb-2">FORUM › TECH SUPPORT</div>
              <h1 className="text-5xl font-bold mb-4 italic">
                OPERATOR_<span className="text-lime-400">TERMINAL</span>
              </h1>
              <p className="text-gray-400">
                Peer-to-peer technical integration for hardware sensors, solar arrays, and
                decentralized node infrastructure.
              </p>
            </div>

            {/* Search and Actions */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 bg-black/40 backdrop-blur-sm border border-gray-700 rounded-lg p-3 flex items-center gap-3">
                <span className="text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search Logs"
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                />
              </div>
              <Button className="bg-lime-400 text-black hover:bg-lime-500">
                + New Request
              </Button>
            </div>

            {/* Featured Thread */}
            <Card className="bg-black/40 backdrop-blur-sm border-lime-400/30 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-2">
                  <Badge className="bg-orange-500/20 text-orange-400">SOLAR</Badge>
                  <Badge className="bg-lime-400/20 text-lime-400">SOLUTION VERIFIED</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-lime-400 to-green-600 border-2 border-black" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">+12</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">
                Lumina-X Grid flickering after 18:00 UTC?
              </h2>
              <p className="text-gray-400 mb-4">
                Has anyone experienced voltage drops on the Lumina-X controllers when switching from battery to grid bypass? I've checked the invert...
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">💬 24 Replies</span>
                  <span className="text-gray-400">👁 1.2k Views</span>
                </div>
                <span className="text-gray-500">MODIFIED 2H AGO</span>
              </div>
            </Card>

            {/* Other Threads */}
            <div className="space-y-3">
              <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400">SENSORS</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-black" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">+3</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Calibration error E-114 on Aqua-Probe Gen 2
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Running into persistent E-114 errors during the initialization phase of the soil moisture sensors. Firmware is up to date (v2.1.0). Any hardware...
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">💬 8 Replies</span>
                    <span className="text-gray-400">👁 456 Views</span>
                  </div>
                  <span className="text-gray-500">MODIFIED 5H AGO</span>
                </div>
              </Card>
            </div>

            {/* Top Contributors */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6 mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Top Contributors</h3>
                <button className="text-lime-400 text-sm">FULL LEADERBOARD →</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: '@bit_shifter', solutions: '242 Solutions' },
                  { name: '@circuit_queen', solutions: '189 Solutions' },
                  { name: '@node_master', solutions: '156 Solutions' }
                ].map((contributor, i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-green-600 rounded-full mx-auto mb-2" />
                    <p className="text-sm font-bold mb-1">{contributor.name}</p>
                    <p className="text-xs text-gray-400">{contributor.solutions}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
