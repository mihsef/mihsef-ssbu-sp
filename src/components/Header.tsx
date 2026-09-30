import React, { useState } from 'react';
import { RotateCcw, Undo2, ExternalLink, Hash, Copy, Check, Share2 } from 'lucide-react';
import { MatchRoom } from '../types';

interface HeaderProps {
  room: MatchRoom | null;
  myRole?: TeamRole | null;
  onSelectRole?: (role: TeamRole) => void;
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  room,
  myRole,
  onSelectRole,
  onReset,
  onUndo,
  canUndo
}) => {
  const [copied, setCopied] = useState(false);

  const roomUrl = room ? `${window.location.origin}${window.location.pathname}?room=${room.roomId}` : '';

  const handleCopyLink = async () => {
    if (!roomUrl) return;
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleShare = async () => {
    if (!room) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MiHSEF SSBU Match: ${room.roomId}`,
          text: `Join our MiHSEF SSBU Stage Wizard room ${room.roomId}:`,
          url: roomUrl
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share canceled or not supported
      }
    }
    handleCopyLink();
  };

  return (
    <header className="border-b border-[#262c3a] pb-5 mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold tracking-widest px-2 py-0.5 rounded bg-[#FF9933]/15 text-[#FF9933] border border-[#FF9933]/30">
              MIHSEF OFFICIAL
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {room?.mode === 'crews' ? 'CREWS (9-STOCK 3v3)' : 'SOLOS (1v1)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-orange-400 to-[#05d9e8] mt-1 font-outfit uppercase">
            SSBU Stage Wizard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {canUndo && (
            <button
              onClick={onUndo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b202a] hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Undo last misclick"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Undo
            </button>
          )}

          {room && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset this match room back to Step 1?')) {
                  onReset();
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1b202a] hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-gray-700 hover:border-red-500/40 rounded-lg text-xs font-semibold transition-all active:scale-95"
              title="Reset match strikes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <a
            href="https://mihsef.org/docs/game-manuals/ssbu-crews"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-[#14171f] hover:bg-[#1b202a] text-[#05d9e8] border border-[#05d9e8]/30 rounded-lg text-xs font-semibold transition-all"
          >
            <span>Rules</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Prominent Large Room ID & Copy Link Header Bar */}
      {room && (
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#14171f] via-[#1b202b] to-[#14171f] border-2 border-[#FF9933]/60 shadow-[0_0_20px_rgba(255,153,51,0.12)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#FF9933]/15 border border-[#FF9933]/40 text-[#FF9933] shrink-0">
              <Hash className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-400 block font-mono">
                Match Room Code
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] to-amber-200">
                {room.roomId}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center">
            {/* Quick Role Switcher Pill if role claimed */}
            {myRole && onSelectRole && (
              <div className="flex items-center p-1 rounded-xl bg-[#0a0c10] border border-[#262c3a] text-xs font-bold mr-1">
                <button
                  type="button"
                  onClick={() => onSelectRole('home')}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                    myRole === 'home'
                      ? 'bg-[#FF9933] text-black font-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Switch active device role to Home"
                >
                  Home Team
                </button>
                <button
                  type="button"
                  onClick={() => onSelectRole('away')}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                    myRole === 'away'
                      ? 'bg-[#05d9e8] text-black font-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Switch active device role to Away"
                >
                  Away Team
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#FF9933] hover:bg-[#ffad55] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-black" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#1b202a] hover:bg-[#262c3a] text-gray-200 border border-gray-700 hover:border-gray-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer"
              title="Share with opposing team"
            >
              <Share2 className="w-4 h-4 text-[#05d9e8]" />
              <span>Share</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
