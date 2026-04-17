'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from './shared/navigation';

export default function Messages() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Left Sidebar - Contacts */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-lime-400 rounded-lg" />
                  <div>
                    <h3 className="font-bold">Neon Syndicate</h3>
                    <p className="text-xs text-gray-400">TIER 1 OPERATORS</p>
                  </div>
                </div>
                
                {/* Search */}
                <div className="bg-black/60 border border-gray-700 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search Operators..."
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
                  />
                </div>
              </div>

              {/* Active Comms */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-xs text-gray-400 font-bold mb-3">ACTIVE COMMS</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'Cipher_X', status: 'online', message: 'Payload confirmed for Sector 7...', time: '2m ago', unread: true },
                      { name: 'Ghost_Protocol', status: 'online', message: 'Waiting for extraction coords.', time: '1h ago', unread: false },
                      { name: 'Null_Ptr', status: 'away', message: 'System breach detected in Node 5...', time: '3h ago', unread: false }
                    ].map((contact, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          i === 0 ? 'bg-gray-800 border border-lime-400/30' : 'hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-600 rounded-full" />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${
                              contact.status === 'online' ? 'bg-lime-400' : 'bg-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-sm">{contact.name}</h4>
                              <span className="text-xs text-gray-500">{contact.time}</span>
                            </div>
                            <p className="text-xs text-gray-400 truncate">{contact.message}</p>
                          </div>
                          {contact.unread && (
                            <div className="w-2 h-2 bg-lime-400 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-lime-400 rounded-full border-2 border-black" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Cipher_X</h2>
                      <Badge className="bg-lime-400/20 text-lime-400 text-xs">
                        QUANTUM ENCRYPTED CHANNEL
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                      📹
                    </button>
                    <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                      📞
                    </button>
                    <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                      ⋮
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex justify-center">
                  <Badge className="bg-gray-800 text-gray-400 text-xs">TODAY</Badge>
                </div>

                {/* Received Message */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-2xl rounded-tl-none p-4 max-w-md">
                      <p className="text-sm">
                        The data packet for the Neon Syndicate has been fully decrypted. We're seeing unusual activity in the South Quadrant.
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-2">14:22 • Cipher_X</p>
                  </div>
                </div>

                {/* Sent Message */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="flex-1 flex flex-col items-end">
                    <div className="bg-lime-400 text-black rounded-2xl rounded-tr-none p-4 max-w-md">
                      <p className="text-sm font-medium">
                        Permission to engage?
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 mr-2">14:23</p>
                  </div>
                </div>

                {/* Received Message */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-2xl rounded-tl-none p-4 max-w-md">
                      <p className="text-sm">Proceed with caution.</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-2">14:24 • Cipher_X</p>
                  </div>
                </div>

                {/* Translation Badge */}
                <div className="flex justify-center">
                  <Badge className="bg-lime-400/20 text-lime-400 text-xs">
                    ⚡ REAL-TIME TRANSLATION ACTIVE
                  </Badge>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-800">
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                    ➕
                  </button>
                  <div className="flex-1 bg-black/60 border border-gray-700 rounded-lg p-3 flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Type your encrypted message..."
                      className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                    />
                    <button className="text-gray-400 hover:text-white">
                      😊
                    </button>
                  </div>
                  <button className="w-12 h-12 bg-lime-400 rounded-lg flex items-center justify-center hover:bg-lime-500">
                    <span className="text-black text-xl">→</span>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-6">
          <Button className="w-full bg-gray-800 hover:bg-gray-700">
            CREATE SQUAD
          </Button>
        </div>
      </div>
    </div>
  );
}
