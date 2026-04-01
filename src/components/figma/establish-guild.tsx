'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from './shared/navigation';

export default function EstablishGuild() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <h1 className="text-3xl font-bold mb-6">
              Establish <span className="text-lime-400">Guild</span>
            </h1>
            <p className="text-gray-400 text-sm mb-8">
              Formalize your impact squad within the Void. Define your mission and set governance code.
            </p>

            {/* Steps */}
            <div className="space-y-6 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1 h-8 bg-lime-400 rounded" />
                  <div>
                    <p className="text-xs text-gray-400">STEP 01</p>
                    <p className="font-bold">Identity Core</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">STEP 02</p>
                <p className="text-gray-500">Visual Branding</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">STEP 03</p>
                <p className="text-gray-500">Protocol & Governance</p>
              </div>
            </div>

            {/* Operator Brief */}
            <Card className="bg-black/40 backdrop-blur-sm border-lime-400/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-lime-400 rounded-full" />
                <h3 className="font-bold">Operator Brief</h3>
              </div>
              <p className="text-sm text-gray-400">
                Guilds are the primary unit of impact. Once established, your mission statement and initial governance are immutable for the first 90 cycles.
              </p>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-8 mb-6">
              <h2 className="text-2xl font-bold mb-2">Identity Core</h2>
              <p className="text-gray-400 text-sm mb-8">
                How will the Void recognize your squad?
              </p>

              {/* Squad Name */}
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">
                  SQUAD DESIGNATION (NAME)
                </label>
                <div className="bg-black/60 border border-gray-700 rounded-lg p-4">
                  <span className="text-gray-500"># e.g. NEON_SYNDICATE</span>
                </div>
              </div>

              {/* Mission Statement */}
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">
                  MISSION STATEMENT
                </label>
                <div className="bg-black/60 border border-gray-700 rounded-lg p-4 h-32">
                  <span className="text-gray-500">Describe the impact you aim to forge...</span>
                </div>
              </div>
            </Card>

            {/* Bottom Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
                <h3 className="text-xl font-bold mb-2">Insignia</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Visual operator identifier.
                </p>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-lime-400 text-2xl">☁️</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    Drag Insignia or <span className="text-lime-400">Browse</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, SVG UP TO 5MB</p>
                </div>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
                <h3 className="text-xl font-bold mb-2">Protocols</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Voting & consensus rules.
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-gray-400">QUORUM THRESHOLD</label>
                      <span className="text-lime-400 font-bold">66%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">VOTING PERIOD</label>
                    <div className="bg-black/60 border border-gray-700 rounded-lg p-3">
                      <span className="text-white">48 Hours</span>
                    </div>
                  </div>
                  <div className="bg-lime-400/10 border border-lime-400/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-lime-400 rounded-full" />
                      <span className="text-xs text-lime-400">GOVERNANCE: QUADRATIC VOTING ACTIVE</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">INITIALISATION PROGRESS: 35%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1">
                <div className="bg-lime-400 h-1 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 border-gray-700">
                Save Draft
              </Button>
              <Button className="flex-1 bg-lime-400 text-black hover:bg-lime-500">
                Next Protocol →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
