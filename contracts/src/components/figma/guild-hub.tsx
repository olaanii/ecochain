'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from './shared/navigation';

export default function GuildHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-lime-400 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Neon Syndicate</h3>
              <p className="text-xs text-gray-500">TIER 1 OPERATORS</p>
            </div>
          </div>
          <Button className="w-full bg-lime-400 text-black hover:bg-lime-500">
            Create Squad
          </Button>
        </div>

        {/* Guild Hub Title */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">
            Guild <span className="text-lime-400">Hub</span>
          </h1>
          <p className="text-gray-400">
            Synchronize with decentralized environmental collectives to amplify your
            planetary impact through coordinated action.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex justify-end mb-8">
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">GLOBAL CO2 OFFSET</p>
            <p className="text-3xl font-bold">14.2M TONS</p>
          </div>
        </div>

        {/* Global Impact Milestone */}
        <Card className="bg-black/40 backdrop-blur-sm border-lime-400/30 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-lime-400 text-2xl">✨</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Global Impact Milestone</h3>
              <p className="text-gray-400 text-sm mb-4">
                Community reached 1 million trees planted across 14 biological corridors.
              </p>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-lime-400 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">PLASTIC RECOVERED</p>
              <p className="text-xl font-bold">420.5 <span className="text-sm">TONS</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">CLEAN ENERGY GEN</p>
              <p className="text-xl font-bold">1.2 <span className="text-sm">GWh</span></p>
            </div>
          </div>
        </Card>

        {/* Joined Guilds */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Joined Guilds</h2>
            <button className="text-lime-400 text-sm">VIEW ALL</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-green-900 to-green-700" 
                   style={{ backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFhNGQyZSIvPjwvc3ZnPg==)' }} />
              <div className="p-4">
                <Badge className="bg-lime-400/20 text-lime-400 mb-2">REFORESTATION</Badge>
                <h3 className="font-bold mb-2">Veridian Canopy</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Restoring ancient bio-corridors through AI-monitored drone seeding...
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span>👥 +13k</span>
                  </div>
                  <span className="text-gray-400">LV. 42 GUILD</span>
                </div>
              </div>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-blue-900 to-cyan-700"
                   style={{ backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzBmNGM4MSIvPjwvc3ZnPg==)' }} />
              <div className="p-4">
                <Badge className="bg-cyan-400/20 text-cyan-400 mb-2">OCEAN CLEANUP</Badge>
                <h3 className="font-bold mb-2">Azure Pulse</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Deploying autonomous reef protectors and micro-plastic filtrati...
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span>👥 +9k</span>
                  </div>
                  <span className="text-gray-400">LV. 38 GUILD</span>
                </div>
              </div>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 flex items-center justify-center h-full min-h-[280px]">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-gray-700 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">+</span>
                </div>
                <h3 className="font-bold mb-1">Discover Guilds</h3>
                <p className="text-sm text-gray-400">Join new collectives</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Trending Squads */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Trending Squads</h2>
          <div className="space-y-3">
            {[
              { name: 'Moss Rangers', location: 'TOKYO DISTRICT', members: 14, score: '+1,240 XP' },
              { name: 'Urban Harvesters', location: 'BERLIN HUB', members: 8, score: '+880 XP' },
              { name: 'Winds of Change', location: 'NORDIC SECTOR', members: 22, score: '+3,410 XP' }
            ].map((squad, i) => (
              <Card key={i} className="bg-black/40 backdrop-blur-sm border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-green-600 rounded-lg" />
                    <div>
                      <h3 className="font-bold">{squad.name}</h3>
                      <p className="text-xs text-gray-400">
                        {squad.location} • {squad.members} MEMBERS
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">IMPACT SCORE</p>
                      <p className="font-bold text-lime-400">{squad.score}</p>
                    </div>
                    <Button variant="outline" className="border-gray-700">Request</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
