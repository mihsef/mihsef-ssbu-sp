import React from 'react';
import { AlertTriangle, Check, Ban, Swords, ShieldAlert } from 'lucide-react';
import { MatchRoom, TeamRole, Stage } from '../types';
import { CREWS_POOL, SOLOS_STARTERS, CREWS_GAME1_STEPS, SOLOS_GAME1_STEPS } from '../data/stages';

interface Game1StrikingStepProps {
  room: MatchRoom;
  myRole: TeamRole;
  onStageAction: (stageId: string) => void;
}

export const Game1StrikingStep: React.FC<Game1StrikingStepProps> = ({
  room,
  myRole,
  onStageAction
}) => {
  const battle = room.battles[0];
  const pool = room.mode === 'crews' ? CREWS_POOL : SOLOS_STARTERS;
  const stepsConfig = room.mode === 'crews' ? CREWS_GAME1_STEPS : SOLOS_GAME1_STEPS;

  const currentStep = stepsConfig[battle?.stepIndex || 0];
  const isComplete = battle?.status === 'in_progress' || battle?.status === 'complete';
  const isMyTurn = !isComplete && currentStep?.team === myRole;

  const selectedStage = isComplete && battle.selectedStageId
    ? pool.find((s) => s.id === battle.selectedStageId)
    : null;

  return (
    <div className="space-y-5">
      {/* 9-Stock Stage Persistence Warning Banner */}
      <div className="p-4 rounded-xl bg-amber-500/15 border-2 border-amber-500/50 shadow-md">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-amber-300 uppercase tracking-wide font-outfit">
              Rule Requirement: Stage Permanence
            </h4>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              {room.mode === 'crews' ? (
                <>
                  Both players enter the arena on the selected stage. Teams <strong>STAY ON THIS STAGE</strong> until one entire team loses all <strong>9 stocks</strong> (3 players × 3 stocks). <strong>Do NOT switch stages between individual player rounds!</strong>
                </>
              ) : (
                <>
                  Both players enter the arena on the selected stage for Game 1. Characters for Game 1 are selected blindly.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Striking Turn Banner */}
      {!isComplete && currentStep && (
        <div className="space-y-2">
          {/* Progress Sequence Bubbles */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
            {stepsConfig.map((step, idx) => {
              const isPast = idx < (battle?.stepIndex || 0);
              const isCurrent = idx === (battle?.stepIndex || 0);
              return (
                <div
                  key={idx}
                  className={`flex-1 text-center py-1.5 px-1 rounded-md text-[10px] font-extrabold uppercase tracking-tighter transition-all ${
                    isPast
                      ? 'bg-gray-800 text-gray-500'
                      : isCurrent
                      ? step.team === 'home'
                        ? 'bg-[#FF9933] text-black font-black ring-2 ring-[#FF9933]/50 scale-105'
                        : 'bg-[#05d9e8] text-black font-black ring-2 ring-[#05d9e8]/50 scale-105'
                      : 'bg-[#1b202a] text-gray-400 border border-[#262c3a]'
                  }`}
                >
                  {step.team === 'home' ? 'H' : 'A'} {step.action === 'pick' ? 'PICK' : 'BAN'}
                </div>
              );
            })}
          </div>

          <div
            className={`p-3.5 rounded-xl border text-center font-bold text-sm tracking-wide font-outfit uppercase transition-all ${
              isMyTurn
                ? currentStep.team === 'home'
                  ? 'bg-[#FF9933]/20 border-[#FF9933] text-white ring-2 ring-[#FF9933]/40 animate-pulse'
                  : 'bg-[#05d9e8]/20 border-[#05d9e8] text-white ring-2 ring-[#05d9e8]/40 animate-pulse'
                : 'bg-[#0a0c10] border-[#262c3a] text-gray-400'
            }`}
          >
            {isMyTurn ? (
              <span className="flex items-center justify-center gap-2">
                <Swords className="w-4 h-4" />
                YOUR TURN: {currentStep.label}
              </span>
            ) : (
              <span>Waiting for {currentStep.label}...</span>
            )}
          </div>
        </div>
      )}

      {/* Selected Stage Announcement */}
      {isComplete && selectedStage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border-2 border-emerald-500 text-center space-y-3 shadow-lg">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold uppercase tracking-wider text-base font-outfit">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>Battle 1 Stage Selected!</span>
          </div>
          <div className="inline-block relative rounded-xl overflow-hidden border-2 border-emerald-400 shadow-xl">
            <img src={selectedStage.img} alt={selectedStage.name} className="w-64 h-36 object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-black/90 py-1.5 text-center font-extrabold text-sm text-emerald-300 font-outfit uppercase tracking-wider">
              {selectedStage.name}
            </div>
          </div>
          <p className="text-xs text-emerald-200/90 font-semibold">
            Arena Host: Select <strong>{selectedStage.name}</strong> on Nintendo Switch and begin Battle 1!
          </p>
        </div>
      )}

      {/* Stages Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {pool.map((stage) => {
          const banData = battle?.bannedStages.find((b) => b.stageId === stage.id);
          const isBanned = !!banData;
          const isPicked = battle?.selectedStageId === stage.id;
          const canClick = isMyTurn && !isBanned && !isComplete;

          return (
            <button
              key={stage.id}
              type="button"
              disabled={!canClick}
              onClick={() => onStageAction(stage.id)}
              className={`group relative rounded-xl overflow-hidden border text-left transition-all ${
                isPicked
                  ? 'border-emerald-500 ring-2 ring-emerald-500 scale-[1.02] shadow-lg'
                  : isBanned
                  ? 'border-red-950/60 opacity-40 grayscale cursor-not-allowed'
                  : canClick
                  ? 'border-[#262c3a] hover:border-[#FF9933] hover:scale-[1.02] cursor-pointer shadow-md'
                  : 'border-[#262c3a] opacity-80 cursor-not-allowed'
              }`}
            >
              <img
                src={stage.img}
                alt={stage.name}
                className="w-full h-24 sm:h-28 object-cover"
              />

              {/* Banned Overlay */}
              {isBanned && (
                <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center p-2 text-center">
                  <Ban className="w-8 h-8 text-red-500 mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-300">
                    Banned by {banData.by.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Picked Overlay */}
              {isPicked && (
                <div className="absolute inset-0 bg-emerald-950/70 flex flex-col items-center justify-center p-2 text-center">
                  <Check className="w-8 h-8 text-emerald-400 mb-1" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                    LOCKED IN
                  </span>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-black/85 px-2 py-1.5 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-200 block truncate">
                  {stage.name}
                </span>
                {canClick && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#FF9933] text-black shrink-0">
                    {currentStep?.action === 'pick' ? 'PICK' : 'BAN'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
