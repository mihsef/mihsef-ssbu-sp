import React, { useState } from 'react';
import { Share2, Copy, Check, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { MatchRoom } from '../types';

interface RoomJoinStepProps {
  room: MatchRoom | null;
  onJoin: (id: string, mode: 'crews' | 'solos') => void;
  loading: boolean;
}

export const RoomJoinStep: React.FC<RoomJoinStepProps> = ({ room, onJoin, loading }) => {
  const [inputVal, setInputVal] = useState('');
  const [selectedMode, setSelectedMode] = useState<'crews' | 'solos'>('crews');
  const [copied, setCopied] = useState(false);

  // Helper to extract Match ID from input (allows raw ID or Fenworks URL)
  const parseMatchId = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return '';

    // If it's a URL (e.g. fan.fenworks.com/.../match/12345 or similar)
    const matchUrlPattern = /(?:match\/|id=)([a-zA-Z0-9_-]+)/i;
    const match = trimmed.match(matchUrlPattern);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }

    // Otherwise alphanumeric code
    return trimmed.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
  };

  const handleGenerate = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onJoin(code, selectedMode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = parseMatchId(inputVal);
    if (clean) {
      onJoin(clean, selectedMode);
    }
  };

  const roomUrl = room ? `${window.location.origin}${window.location.pathname}?room=${room.roomId}` : '';

  const handleShare = async () => {
    if (!room) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MiHSEF SSBU Match: ${room.roomId}`,
          text: `Join our MiHSEF SSBU Stage Striking lobby for room ${room.roomId}:`,
          url: roomUrl
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share canceled or not supported
      }
    }

    // Fallback: Copy to clipboard
    handleCopyLink();
  };

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

  // If already in a room, render the room share panel
  if (room) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0a0c10] border border-[#262c3a]">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Active Match Room
            </span>
            <div className="text-2xl font-mono font-extrabold text-[#FF9933] tracking-widest mt-0.5">
              {room.roomId}
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Format: <strong className="text-gray-200 uppercase">{room.mode}</strong> ({room.mode === 'crews' ? 'Best of 3' : 'Best of 5'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FF9933] hover:bg-[#ffad55] text-black font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Room</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#1b202a] hover:bg-[#262c3a] text-gray-200 border border-gray-700 rounded-xl text-sm font-semibold transition-all active:scale-95"
              title="Copy room link for Discord"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-300" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 italic">
          💡 Send this link or 6-digit code to the opposing team over Discord or Fenworks chat to synchronize both screens.
        </p>
      </div>
    );
  }

  // Not in a room: Show join / create form
  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
          Select Match Format
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedMode('crews')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedMode === 'crews'
                ? 'border-[#FF9933] bg-[#FF9933]/10 text-white font-bold'
                : 'border-[#262c3a] bg-[#0a0c10] text-gray-400 hover:border-gray-600'
            }`}
          >
            <div className="text-sm font-bold font-outfit uppercase">Crews (9-Stock 3v3)</div>
            <div className="text-xs text-gray-400 font-normal mt-0.5">
              9-stage pool • Stays until 9 stocks lost
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('solos')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedMode === 'solos'
                ? 'border-[#05d9e8] bg-[#05d9e8]/10 text-white font-bold'
                : 'border-[#262c3a] bg-[#0a0c10] text-gray-400 hover:border-gray-600'
            }`}
          >
            <div className="text-sm font-bold font-outfit uppercase">Solos (1v1 Standard)</div>
            <div className="text-xs text-gray-400 font-normal mt-0.5">
              5 starters • 3 counterpicks • 1-2-1 strikes
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
          Enter Fenworks Match ID or Match URL
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="e.g. 748291 or paste full Fenworks match URL"
            className="flex-1 bg-[#0a0c10] border border-[#262c3a] focus:border-[#FF9933] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono transition-colors"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || loading}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#FF9933] hover:bg-[#ffad55] disabled:opacity-50 text-black font-bold rounded-xl text-sm transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Joining...' : 'Join Room'}</span>
          </button>
        </div>
      </form>

      <div className="relative flex items-center justify-center my-2">
        <div className="border-t border-[#262c3a] w-full"></div>
        <span className="bg-[#14171f] px-3 text-xs text-gray-500 uppercase font-mono tracking-widest absolute">
          or
        </span>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1b202a] hover:bg-[#262c3a] text-gray-200 border border-gray-700 rounded-xl text-sm font-bold transition-all active:scale-[0.99]"
      >
        <Sparkles className="w-4 h-4 text-[#FF9933]" />
        <span>Generate New Random 6-Character Code</span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
};
