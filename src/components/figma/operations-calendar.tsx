'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from './shared/navigation';

export default function OperationsCalendar() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-lime-400 rounded-lg" />
          <div>
            <h2 className="text-xl font-bold">Neon Syndicate</h2>
            <p className="text-sm text-gray-400">TIER 1 OPERATORS</p>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 italic">
            OPERATIONS <span className="text-lime-400">CALENDAR</span>
          </h1>
          <p className="text-gray-400">
            Deploy your squad for upcoming community nodes and decentralized
            environmental governance syncs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            {/* View Tabs */}
            <div className="flex gap-3 mb-6">
              <button className="px-4 py-2 bg-lime-400 text-black rounded-lg font-bold">
                Month
              </button>
              <button className="px-4 py-2 text-gray-400">Week</button>
              <button className="px-4 py-2 text-gray-400">Agenda</button>
            </div>

            {/* Calendar Grid */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
              {/* Days Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                  <div key={day} className="text-center text-xs text-gray-400 font-bold py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {/* Previous month days */}
                {[28, 29, 30].map((day) => (
                  <div key={`prev-${day}`} className="aspect-square p-2 text-gray-600">
                    <span className="text-sm">{day}</span>
                  </div>
                ))}

                {/* Current month days */}
                {Array.from({ length: 25 }, (_, i) => i + 1).map((day) => {
                  const hasEvent = [3, 6, 14, 24].includes(day);
                  const eventType = day === 3 ? 'cleanup' : day === 6 ? 'dao' : day === 14 ? 'sync' : 'cleanup';
                  
                  return (
                    <div
                      key={day}
                      className={`aspect-square p-2 rounded-lg ${
                        hasEvent ? 'bg-gray-800' : 'hover:bg-gray-800/50'
                      } transition-colors cursor-pointer`}
                    >
                      <span className="text-sm font-bold">{day}</span>
                      {hasEvent && (
                        <div className={`mt-1 text-xs p-1 rounded ${
                          eventType === 'cleanup' ? 'bg-lime-400 text-black' :
                          eventType === 'dao' ? 'bg-gray-700 text-white' :
                          'bg-lime-400 text-black'
                        }`}>
                          {eventType === 'cleanup' ? 'CLEANUP' :
                           eventType === 'dao' ? 'DAO' :
                           'SYNC'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Featured Events */}
            <div className="mb-6">
              <h3 className="font-bold mb-4">Featured Events</h3>
              <div className="space-y-4">
                <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-4">
                  <Badge className="bg-red-500/20 text-red-400 mb-2 text-xs">
                    HIGH PRIORITY
                  </Badge>
                  <p className="text-xs text-gray-400 mb-1">May 03</p>
                  <h4 className="font-bold mb-2">DAO Town Hall</h4>
                  <p className="text-xs text-gray-400 mb-3">
                    Governance proposal voting for Q3 reforestation budget allocation.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="w-6 h-6 bg-gradient-to-br from-lime-400 to-green-600 rounded-full border-2 border-black" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">+42</span>
                  </div>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-4">
                  <Badge className="bg-blue-500/20 text-blue-400 mb-2 text-xs">
                    GLOBAL SYNC
                  </Badge>
                  <p className="text-xs text-gray-400 mb-1">May 14</p>
                  <h4 className="font-bold mb-2">Global Reforestation Sync</h4>
                  <p className="text-xs text-gray-400 mb-3">
                    Cross-guild strategy session for the Amazonian basin restoration node.
                  </p>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-4">
                  <Badge className="bg-lime-400/20 text-lime-400 mb-2 text-xs">
                    LOCAL OP
                  </Badge>
                  <p className="text-xs text-gray-400 mb-1">May 24</p>
                  <h4 className="font-bold mb-2">Urban Scrap Recovery</h4>
                  <p className="text-xs text-gray-400 mb-3">
                    Local physical clean-up event at Sector 7 industrial hub.
                  </p>
                </Card>
              </div>
            </div>

            {/* Syndicate Stats */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
              <h3 className="font-bold mb-4 italic">SYNDICATE STATS</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Scheduled Ops</span>
                    <span className="text-xl font-bold">12</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-lime-400 h-1.5 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Governance Participation</span>
                    <span className="text-xl font-bold">88%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-lime-400 h-1.5 rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>
              </div>
            </Card>
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
