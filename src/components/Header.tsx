import React from 'react';
import { RotateCcw, Undo2, ExternalLink, ShieldAlert } from 'lucide-react';
import { MatchRoom } from '../types';

interface HeaderProps {
  room: MatchRoom | null;
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export const Header: React.FC<HeaderProps> = ({ room, onReset, onUndo, canUndo }) => {
  return (
    <header className="border-b border-[#262c3a] pb-4 mb-6">
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
    </header>
  );
};
