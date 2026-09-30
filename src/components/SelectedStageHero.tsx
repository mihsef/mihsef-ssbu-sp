import React from 'react';
import { CheckCircle2, ShieldAlert, Swords, Tv } from 'lucide-react';
import { Stage, TeamRole, CharacterDeclaration } from '../types';

interface SelectedStageHeroProps {
  stage: Stage;
  battleNumber: number;
  mode: 'crews' | 'solos';
  winnerRole?: TeamRole;
  winnerCharacter?: CharacterDeclaration;
  loserCharacter?: CharacterDeclaration;
  subheading?: string;
}

export const SelectedStageHero: React.FC<SelectedStageHeroProps> = ({
  stage,
  battleNumber,
  mode,
  winnerRole,
  winnerCharacter,
  loserCharacter,
  subheading
}) => {
  const loserRole = winnerRole ? (winnerRole === 'home' ? 'away' : 'home') : undefined;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-400 bg-[#0e131d] shadow-[0_0_35px_rgba(16,185,129,0.25)] transition-all">
      {/* Top Banner Tag */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-black font-black uppercase text-xs sm:text-sm tracking-wider font-outfit">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          <span>Battle {battleNumber} Stage Locked In</span>
        </div>
        <span className="bg-black/30 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          {mode === 'crews' ? 'Crews (9 Stocks)' : 'Solos 1v1'}
        </span>
      </div>

      {/* Cinematic Stage Artwork & Stage Name */}
      <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-black">
        <img
          src={stage.img}
          alt={stage.name}
          className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-700 brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e131d] via-[#0e131d]/40 to-transparent" />

        {/* Large Stage Name Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-center space-y-1">
          <span className="text-[11px] sm:text-xs font-black tracking-widest text-emerald-300 uppercase block font-mono">
            Official Selected Arena
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-outfit uppercase tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            {stage.name}
          </h2>
          {subheading && (
            <p className="text-xs text-gray-300 font-medium">{subheading}</p>
          )}
        </div>
      </div>

      {/* Action / Host Guidance Box */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50">
          <Tv className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-extrabold text-emerald-300 uppercase tracking-wide font-outfit">
              Host Instruction: Select on Switch
            </h4>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Both players / lobby host: Navigate to stage select in the Smash Arena and choose{' '}
              <strong className="text-white underline underline-offset-2">{stage.name}</strong> to begin Battle {battleNumber}.
            </p>
          </div>
        </div>

        {/* 9-Stock Permanence Alert for Crews */}
        {mode === 'crews' && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/50">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wide font-outfit">
                Mandatory Stage Permanence (9 Stocks)
              </h4>
              <p className="text-xs text-amber-100 leading-relaxed">
                Both crews <strong>STAY ON {stage.name.toUpperCase()}</strong> until an entire team loses all{' '}
                <strong>9 stocks</strong> (3 players × 3 stocks).{' '}
                <span className="font-bold underline">Do NOT change stages between individual player rounds!</span>
              </p>
            </div>
          </div>
        )}

        {/* Fighter Matchup Display (if characters declared) */}
        {(winnerCharacter || loserCharacter) && (
          <div className="p-3.5 rounded-xl bg-[#0a0c10] border border-[#262c3a] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Swords className="w-4 h-4 text-[#FF9933]" />
              <span>Battle {battleNumber} Fighter Matchup</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Winner Team declaration */}
              <div className="p-2.5 rounded-lg bg-[#14171f] border border-[#262c3a]">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  {winnerRole?.toUpperCase()} Team (Prev Winner)
                </span>
                <span className="font-extrabold text-white text-sm block mt-0.5">
                  {winnerCharacter?.switching
                    ? winnerCharacter.characterName || 'Switching Fighter'
                    : 'Same Fighter'}
                </span>
              </div>

              {/* Loser Team declaration */}
              <div className="p-2.5 rounded-lg bg-[#14171f] border border-[#262c3a]">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  {loserRole?.toUpperCase()} Team (Counterpicker)
                </span>
                <span className="font-extrabold text-white text-sm block mt-0.5">
                  {loserCharacter?.switching
                    ? loserCharacter.characterName || 'Switching Fighter'
                    : loserCharacter
                    ? 'Same Fighter'
                    : 'Awaiting declaration'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
