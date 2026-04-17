'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from './shared/navigation';

export default function GeneralForum() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <Badge className="bg-lime-400/20 text-lime-400 mb-4">ACTIVE GOVERNANCE</Badge>
              <h1 className="text-5xl font-bold mb-4">
                General <span className="text-lime-400">Forum</span>
              </h1>
              <p className="text-gray-400">
                Debate eco-policies, propose DAO structural changes, and shape the
                future of the void. Your reputation is your currency.
              </p>
            </div>

            {/* Pinned Proposals */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-lime-400">📌</span>
                  Pinned Proposals
                </h2>
                <button className="text-lime-400 text-sm">VIEW ALL</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
                  <div className="flex gap-2 mb-3">
                    <Badge className="bg-purple-500/20 text-purple-400">POLICY</Badge>
                    <Badge className="bg-red-500/20 text-red-400">CRITICAL</Badge>
                  </div>
                  <h3 className="font-bold mb-2">
                    EVA-049: Implementation of Bio-Regenerative Hubs in Quadrant 7
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Formal request for the allocation of 450,000 $VOID for the immediate construction of vertical moss gardens in the...
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span>💬</span> 84
                      </span>
                      <span className="flex items-center gap-1 text-lime-400">
                        <span>👍</span> 1.2k
                      </span>
                    </div>
                    <span className="text-gray-500">2H AGO</span>
                  </div>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
                  <div className="flex gap-2 mb-3">
                    <Badge className="bg-blue-500/20 text-blue-400">DAO</Badge>
                    <Badge className="bg-gray-700 text-gray-300">GOVERNANCE</Badge>
                  </div>
                  <h3 className="font-bold mb-2">
                    Revised Voting Weights for Impact Score Holders Tier 4+
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    An exploratory debate on adjusting the influence of reputation-based voting in major treasury decisions to fav...
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span>💬</span> 31
                      </span>
                      <span className="flex items-center gap-1 text-lime-400">
                        <span>👍</span> 452
                      </span>
                    </div>
                    <span className="text-gray-500">6H AGO</span>
                  </div>
                </Card>
              </div>
            </div>

            {/* Hot Topics */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Hot Topics</h2>
              <div className="flex gap-2 mb-6">
                <button className="px-4 py-2 bg-lime-400 text-black rounded-lg text-sm font-bold">
                  NEWEST
                </button>
                <button className="px-4 py-2 text-gray-400 text-sm">TRENDING</button>
                <button className="px-4 py-2 text-gray-400 text-sm">BOUNTIES</button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    votes: '4.2k',
                    author: 'Operator_Void',
                    badge: 'ARCHIVIST',
                    time: '14m ago',
                    title: 'How to maximize impact score through decentralized reforestation guilds?',
                    comments: 128,
                    views: '2.4k'
                  },
                  {
                    votes: '1.8k',
                    author: 'Neon_Sage',
                    badge: 'COUNCIL',
                    time: '1.5h ago',
                    title: 'Draft Proposal: Standardizing Bio-Data streams for Guild rewards',
                    comments: 56,
                    views: '940'
                  },
                  {
                    votes: '942',
                    author: 'Ghost_Protocol',
                    badge: '7k ago',
                    time: '7k ago',
                    title: 'Debunking the atmospheric extraction theory for Zone Beta',
                    comments: 142,
                    views: '4.1k'
                  }
                ].map((topic, i) => (
                  <Card key={i} className="bg-black/40 backdrop-blur-sm border-gray-700 p-4 hover:border-lime-400/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{topic.votes}</p>
                        <p className="text-xs text-gray-500">VOTES</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-lime-400 to-green-600 rounded-full" />
                          <span className="text-lime-400 text-sm">{topic.author}</span>
                          <Badge className="bg-gray-700 text-gray-300 text-xs">{topic.badge}</Badge>
                          <span className="text-gray-500 text-xs">• {topic.time}</span>
                        </div>
                        <h3 className="font-bold mb-2">{topic.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>💬 {topic.comments} Comments</span>
                          <span>👁 {topic.views} Views</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <div className="bg-black/40 backdrop-blur-sm border border-gray-700 rounded-lg p-4 flex items-center gap-3">
                <span className="text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search threads..."
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* User Info */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-lime-400 rounded-lg" />
                <div>
                  <h3 className="font-bold">NEON SYNDICATE</h3>
                  <p className="text-xs text-gray-400">TIER 1 OPERATORS</p>
                </div>
              </div>
              <button className="w-full bg-lime-400 text-black py-2 rounded-lg font-bold hover:bg-lime-500">
                Create Squad
              </button>
            </Card>

            {/* Reputation */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-xs text-gray-400 mb-2">GLOBAL REPUTATION</p>
                <p className="text-4xl font-bold text-lime-400">12,840</p>
                <p className="text-xs text-gray-500">VX</p>
              </div>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🌿</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">TOP CONTRIBUTOR BADGE</p>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-lime-400 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
