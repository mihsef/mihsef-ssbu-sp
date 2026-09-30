import React, { useState } from 'react';
import { Sparkles, EyeOff, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { MatchRoom, TeamRole, Stage } from '../types';
import { CREWS_POOL, SOLOS_STARTERS } from '../data/stages';

interface MutualStageStepProps {
  room: MatchRoom;
  myRole: TeamRole;
  onPropose: (stageId: string) => void;
  onOptOut: () => void;
}

export const MutualStageStep: React.FC<MutualStageStepProps> = ({
  room,
  myRole,
  onPropose,
  onOptOut
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const mutual = room.mutualStage;
  const pool = room.mode === 'crews' ? CREWS_POOL : SOLOS_STARTERS;

  const myCommitment = myRole === 'home' ? mutual?.homeCommitment : mutual?.awayCommitment;
  const oppCommitment = myRole === 'home' ? mutual?.awayCommitment : mutual?.homeCommitment;

  const handleSelect = (stageId: string) => {
    if (myCommitment) return; // already locked
    setSelectedStageId(stageId);
  };

  const handleConfirmPick = () => {
    if (selectedStageId && !myCommitment) {
      onPropose(selectedStageId);
    }
  };

  if (mutual?.status === 'agreed' && mutual.matchedStageId) {
    const matched = pool.find((s) => s.id === mutual.matchedStageId);
    return (
      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold uppercase tracking-wider text-base font-outfit">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
          <span>Mutual Match! Friendly Stage Selected</span>
        </div>
        <p className="text-xs text-gray-300">
          Both teams secretly chose <strong>{matched?.name || mutual.matchedStageId}</strong>! Banning is bypassed.
        </p>
        {matched && (
          <div className="inline-block relative rounded-xl overflow-hidden border-2 border-emerald-400 shadow-lg">
            <img src={matched.img} alt={matched.name} className="w-48 h-28 object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1 text-center font-bold text-xs text-emerald-300">
              {matched.name}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mutual?.status === 'mismatched' || mutual?.status === 'skipped') {
    return (
      <div className="p-3.5 rounded-xl bg-[#0a0c10] border border-[#262c3a] text-xs text-gray-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {mutual.status === 'mismatched'
              ? 'Secret stage choices differed. Selections remain confidential — dropping into official bans.'
              : 'Mutual friendly stage agreement skipped. Proceeding to official bans.'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#0a0c10] p-3.5 rounded-xl border border-[#262c3a]">
        <div className="flex items-center gap-2 text-[#FF9933] font-bold text-xs uppercase tracking-wider mb-1 font-outfit">
          <EyeOff className="w-4 h-4" />
          <span>Blind Mutual Stage Agreement (Gentleman's Choice)</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Both teams can secretly nominate a starting stage. If your pick matches the opposing team's, that stage is instantly chosen and the ban phase is skipped. If choices differ or either team skips, your picks stay 100% confidential and you proceed to standard strikes.
        </p>
      </div>

      {/* Secret Pick Status Badges */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-[#0a0c10] border border-[#262c3a] flex items-center gap-2">
          {myCommitment ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
          )}
          <span className="text-gray-300">
            {myCommitment ? 'Your Secret Pick: Locked' : 'Your Secret Pick: Pending'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#0a0c10] border border-[#262c3a] flex items-center gap-2">
          {oppCommitment ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
          )}
          <span className="text-gray-300">
            {oppCommitment ? 'Opponent: Locked' : 'Opponent: Choosing...'}
          </span>
        </div>
      </div>

      {!myCommitment && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {pool.map((stage) => {
              const isSelected = selectedStageId === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleSelect(stage.id)}
                  className={`group relative rounded-lg overflow-hidden border transition-all text-left ${
                    isSelected
                      ? 'border-[#FF9933] ring-2 ring-[#FF9933] scale-[1.02]'
                      : 'border-[#262c3a] hover:border-gray-500 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={stage.img}
                    alt={stage.name}
                    className="w-full h-16 sm:h-20 object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/85 px-1.5 py-1">
                    <span className="text-[10px] font-bold text-gray-200 block truncate">
                      {stage.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={handleConfirmPick}
              disabled={!selectedStageId}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#FF9933] hover:bg-[#ffad55] disabled:opacity-40 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Lock In Secret Stage
            </button>

            <button
              type="button"
              onClick={onOptOut}
              className="text-xs text-gray-400 hover:text-white underline transition-colors"
            >
              Skip Mutual Pick → Go to Standard Bans
            </button>
          </div>
        </div>
      )}

      {myCommitment && (
        <div className="p-3 bg-[#0a0c10] border border-[#262c3a] rounded-xl text-center text-xs text-gray-300">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
          Your choice is committed securely. Waiting for the opposing team to submit their secret choice or skip...
        </div>
      )}
    </div>
  );
};
