import React, { useState } from 'react';
import { RotateCcw, Undo2, ExternalLink, Hash, Copy, Check, Share2, Plus } from 'lucide-react';
import { MatchRoom, TeamRole } from '../types';

interface HeaderProps {
  room: MatchRoom | null;
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  room,
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
      {/* Top Bar: Official Branding, Logo, and Quick Nav */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Clickable MiHSEF Logo + Title to return home / completely start over */}
        <a
          href="/"
          className="group flex items-center gap-3 transition-transform active:scale-98"
          title="MiHSEF SSBU Stage Wizard (Click to return to main page)"
        >
          <img
            src="/mihsef-crest.png"
            alt="MiHSEF Official Crest"
            className="w-12 h-12 rounded-xl object-contain shadow-md border border-[#FF9933]/30 p-0.5 bg-[#14171f] group-hover:border-[#FF9933] transition-colors"
          />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded bg-[#FF9933]/15 text-[#FF9933] border border-[#FF9933]/30 uppercase font-mono">
                MIHSEF OFFICIAL
              </span>
              {room && (
                <span className="text-[11px] text-gray-400 font-mono">
                  {room.mode === 'crews' ? 'CREWS (9-STOCK 3v3)' : 'SOLOS (1v1)'}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-orange-400 to-[#05d9e8] font-outfit uppercase mt-0.5 group-hover:opacity-90">
              SSBU Stage Wizard
            </h1>
          </div>
        </a>

        {/* Action Controls for Coaches & Players */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick link to completely start over / return home */}
          {room && (
            <a
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b202a] hover:bg-gray-800 text-gray-300 hover:text-white border border-[#262c3a] rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Leave room and return to main page to start over"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>Start Over</span>
            </a>
          )}

          {/* Open fresh match wizard in new tab for multi-match coaches */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b202a] hover:bg-[#262c3a] text-[#05d9e8] border border-[#05d9e8]/40 hover:border-[#05d9e8] rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Open a clean match wizard in a new tab (manage multiple concurrent matches)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Match Tab</span>
            <ExternalLink className="w-3 h-3 text-[#05d9e8]/70" />
          </a>

          {canUndo && (
            <button
              onClick={onUndo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b202a] hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Undo last misclick"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}

          <a
            href="https://mihsef.org/docs/game-manuals/ssbu-crews"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-[#14171f] hover:bg-[#1b202a] text-gray-300 hover:text-white border border-[#262c3a] rounded-lg text-xs font-semibold transition-all"
            title="View official MiHSEF Fall 2026 ruleset"
          >
            <span>Rules</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Prominent Large Room ID, Share & Multi-Device Header Bar */}
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
              title="Share match link with opposing coach / team"
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
