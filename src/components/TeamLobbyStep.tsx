import React, { useState } from 'react';
import { Shield, Users, Copy, Check, Lock, Radio } from 'lucide-react';
import { MatchRoom, TeamRole } from '../types';

interface TeamLobbyStepProps {
  room: MatchRoom;
  myRole: TeamRole | null;
  onSelectRole: (role: TeamRole) => void;
  onSaveArena: (arenaId: string, password?: string) => void;
}

export const TeamLobbyStep: React.FC<TeamLobbyStepProps> = ({
  room,
  myRole,
  onSelectRole,
  onSaveArena
}) => {
  const [arenaIdInput, setArenaIdInput] = useState(room.arena?.id || '');
  const [arenaPassInput, setArenaPassInput] = useState(room.arena?.password || '');
  const [copiedId, setCopiedId] = useState(false);

  const handleArenaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (arenaIdInput.trim()) {
      onSaveArena(arenaIdInput.trim(), arenaPassInput.trim());
    }
  };

  const handleCopyArenaId = async () => {
    if (!room.arena?.id) return;
    try {
      await navigator.clipboard.writeText(room.arena.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-5">
      {/* Role Selection */}
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
          Which team are you?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelectRole('home')}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              myRole === 'home'
                ? 'border-[#FF9933] bg-[#FF9933]/15 text-white ring-2 ring-[#FF9933]/50'
                : 'border-[#262c3a] bg-[#0a0c10] text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FF9933]" />
                <span className="font-extrabold font-outfit uppercase tracking-wide text-base">
                  Home Team
                </span>
              </div>
              {myRole === 'home' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#FF9933] text-black">
                  YOU
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Creates Switch Arena & strikes first in Game 1.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSelectRole('away')}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              myRole === 'away'
                ? 'border-[#05d9e8] bg-[#05d9e8]/15 text-white ring-2 ring-[#05d9e8]/50'
                : 'border-[#262c3a] bg-[#0a0c10] text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#05d9e8]" />
                <span className="font-extrabold font-outfit uppercase tracking-wide text-base">
                  Away Team
                </span>
              </div>
              {myRole === 'away' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#05d9e8] text-black">
                  YOU
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Joins Arena using ID/pass & strikes second in Game 1.
            </p>
          </button>
        </div>
      </div>

      {/* Phase 2.5: Arena Lobby Info */}
      {myRole && (
        <div className="p-4 rounded-xl bg-[#0a0c10] border border-[#262c3a] mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-[#FF9933] animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-outfit">
              Phase 2.5: Smash Arena Connection
            </h3>
          </div>

          {myRole === 'home' ? (
            <form onSubmit={handleArenaSubmit} className="space-y-3">
              <p className="text-xs text-gray-300">
                As the <strong>Home Team</strong>, please create the in-game Smash Arena and enter the credentials below so the Away team can join immediately:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase block mb-1">
                    Arena ID (5-character Switch code)
                  </label>
                  <input
                    type="text"
                    value={arenaIdInput}
                    onChange={(e) => setArenaIdInput(e.target.value.toUpperCase())}
                    maxLength={10}
                    placeholder="e.g. 7KW9P"
                    className="w-full bg-[#14171f] border border-[#262c3a] focus:border-[#FF9933] focus:outline-none rounded-lg px-3 py-2 text-sm text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase block mb-1">
                    Password (Optional)
                  </label>
                  <input
                    type="text"
                    value={arenaPassInput}
                    onChange={(e) => setArenaPassInput(e.target.value)}
                    placeholder="e.g. 1234 or leave blank"
                    className="w-full bg-[#14171f] border border-[#262c3a] focus:border-[#FF9933] focus:outline-none rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!arenaIdInput.trim()}
                className="px-4 py-2 bg-[#FF9933] hover:bg-[#ffad55] disabled:opacity-50 text-black font-bold rounded-lg text-xs uppercase tracking-wider transition-all"
              >
                {room.arena?.id ? 'Update Arena Details' : 'Broadcast Arena to Away'}
              </button>
            </form>
          ) : (
            <div>
              {room.arena?.id ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#14171f] border border-emerald-500/30">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Arena Ready
                    </span>
                    <div className="text-xl font-mono font-extrabold text-white mt-0.5 flex items-center gap-2">
                      <span>ID: {room.arena.id}</span>
                      {room.arena.password && (
                        <span className="text-xs text-gray-400 font-sans font-normal">
                          (Pass: <strong className="text-gray-200 font-mono">{room.arena.password}</strong>)
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleCopyArenaId}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#05d9e8]/20 hover:bg-[#05d9e8]/30 text-[#05d9e8] border border-[#05d9e8]/40 rounded-lg text-xs font-bold transition-all"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Arena ID</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-400 flex items-center gap-2 p-3 bg-[#14171f] rounded-lg border border-[#262c3a]">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Waiting for the Home Team to provide the Switch Arena ID and password...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
