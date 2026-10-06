import React, { useState, useEffect } from 'react';
import { Shield, Users, Copy, Check, Radio, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { MatchRoom, TeamRole } from '../types';

interface TeamLobbyStepProps {
  room: MatchRoom;
  myRole: TeamRole | null;
  onSelectRole: (role: TeamRole) => void;
  onSaveArena: (arenaId: string, password?: string) => void;
  onConfirmLobby?: () => void;
  isEditing?: boolean;
  onDoneEditing?: () => void;
}

export const TeamLobbyStep: React.FC<TeamLobbyStepProps> = ({
  room,
  myRole,
  onSelectRole,
  onSaveArena,
  onConfirmLobby,
  isEditing = false,
  onDoneEditing
}) => {
  const [arenaIdInput, setArenaIdInput] = useState(room.arena?.id || '');
  const [arenaPassInput, setArenaPassInput] = useState(room.arena?.password || '');
  const [copiedId, setCopiedId] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync inputs if arena is updated remotely
  useEffect(() => {
    if (room.arena?.id) {
      setArenaIdInput(room.arena.id);
      setArenaPassInput(room.arena.password || '');
    }
  }, [room.arena?.id, room.arena?.password]);

  const handleArenaSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (arenaIdInput.trim()) {
      onSaveArena(arenaIdInput.trim(), arenaPassInput.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
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

  const handleContinue = () => {
    // If Home entered arena details but didn't click save button yet, save automatically
    if (myRole === 'home' && arenaIdInput.trim() && arenaIdInput.trim() !== (room.arena?.id || '')) {
      onSaveArena(arenaIdInput.trim(), arenaPassInput.trim());
    }

    if (isEditing && onDoneEditing) {
      onDoneEditing();
    } else if (onConfirmLobby) {
      onConfirmLobby();
    }
  };

  const hasGame1Started = (room.battles[0]?.bannedStages?.length || 0) > 0 || !!room.battles[0]?.selectedStageId;

  return (
    <div className="space-y-5">
      {/* Role Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            1. Select Your Team Role:
          </label>
          {myRole && (
            <span className="text-[11px] text-gray-400">
              Selected: <strong className={myRole === 'home' ? 'text-[#FF9933]' : 'text-[#05d9e8]'}>{myRole.toUpperCase()} TEAM</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelectRole('home')}
            className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
              myRole === 'home'
                ? 'border-[#FF9933] bg-[#FF9933]/15 text-white ring-2 ring-[#FF9933]/50 shadow-md'
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
              {myRole === 'home' ? (
                <span className="text-xs font-black px-2 py-0.5 rounded bg-[#FF9933] text-black">
                  YOU
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1b202a] text-gray-400 border border-gray-700">
                  Select
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
            className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
              myRole === 'away'
                ? 'border-[#05d9e8] bg-[#05d9e8]/15 text-white ring-2 ring-[#05d9e8]/50 shadow-md'
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
              {myRole === 'away' ? (
                <span className="text-xs font-black px-2 py-0.5 rounded bg-[#05d9e8] text-black">
                  YOU
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1b202a] text-gray-400 border border-gray-700">
                  Select
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Joins Arena using ID/pass & strikes second in Game 1.
            </p>
          </button>
        </div>
      </div>

      {/* Warning if switching roles during active match */}
      {isEditing && hasGame1Started && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Note: Changing your team role will update your perspective and active turn. Previously recorded strikes remain intact.
          </span>
        </div>
      )}

      {/* Switch Arena Lobby Info (Optional) */}
      {myRole && (
        <div className="p-4 rounded-xl bg-[#0a0c10] border border-[#262c3a] space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#FF9933]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-outfit">
                2. Switch Battle Arena (Optional)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400 uppercase tracking-wider">
              Skip if playing offline / in-person
            </span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            If you are playing in-person or communicating arena codes over Discord, <strong>you can skip this</strong> and proceed straight to stage bans below.
          </p>

          {myRole === 'home' ? (
            <form onSubmit={handleArenaSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase block mb-1">
                    Arena ID (5-character code)
                  </label>
                  <input
                    type="text"
                    value={arenaIdInput}
                    onChange={(e) => setArenaIdInput(e.target.value.toUpperCase())}
                    maxLength={10}
                    placeholder="e.g. 7KW9P (or leave blank)"
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
                    placeholder="e.g. 1234 (or leave blank)"
                    className="w-full bg-[#14171f] border border-[#262c3a] focus:border-[#FF9933] focus:outline-none rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={!arenaIdInput.trim() || arenaIdInput.trim() === (room.arena?.id || '')}
                  className="px-3.5 py-1.5 bg-[#FF9933] hover:bg-[#ffad55] disabled:opacity-40 text-black font-bold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {room.arena?.id ? 'Update Arena Code' : 'Broadcast Arena to Away'}
                </button>

                {savedSuccess && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Arena Saved & Broadcasted!</span>
                  </span>
                )}
                {room.arena?.id && !savedSuccess && (
                  <span className="text-[11px] text-gray-400 font-mono">
                    Current Live: <strong className="text-white">{room.arena.id}</strong>
                    {room.arena.password && ` (${room.arena.password})`}
                  </span>
                )}
              </div>
            </form>
          ) : (
            <div>
              {room.arena?.id ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#14171f] border border-emerald-500/30">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Arena Details Posted by Home Team
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
                    type="button"
                    onClick={handleCopyArenaId}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#05d9e8]/20 hover:bg-[#05d9e8]/30 text-[#05d9e8] border border-[#05d9e8]/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
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
                <div className="text-xs text-gray-400 p-3 bg-[#14171f] rounded-lg border border-[#262c3a] leading-relaxed">
                  No online arena code posted yet by Home team (optional if playing in-person or sharing via Discord). You can proceed straight to stage bans below.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Primary Action Button: Advance to Stage Selection or Close Edit */}
      {myRole && (
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF9933] to-amber-500 hover:from-[#ffad55] hover:to-amber-400 text-black font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-orange-950/30 transition-all active:scale-95 cursor-pointer"
          >
            <span>{isEditing ? 'Done & Return to Match' : 'Continue to Game 1 Stage Selection'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
