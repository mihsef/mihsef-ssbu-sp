import React, { useState } from 'react';
import { AlertTriangle, Check, Ban, Swords, EyeOff, Sparkles, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import { MatchRoom, TeamRole, Stage } from '../types';
import { CREWS_POOL, SOLOS_STARTERS, CREWS_GAME1_STEPS, SOLOS_GAME1_STEPS } from '../data/stages';
import { SelectedStageHero } from './SelectedStageHero';

interface Game1StrikingStepProps {
  room: MatchRoom;
  myRole: TeamRole;
  onStageAction: (stageId: string) => void;
  onProposeMutual?: (stageId: string) => void;
  onOptOutMutual?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

export const Game1StrikingStep: React.FC<Game1StrikingStepProps> = ({
  room,
  myRole,
  onStageAction,
  onProposeMutual,
  onOptOutMutual,
  onUndo,
  canUndo = false
}) => {
  const battle = room.battles[0];
  const pool = room.mode === 'crews' ? CREWS_POOL : SOLOS_STARTERS;
  const stepsConfig = room.mode === 'crews' ? CREWS_GAME1_STEPS : SOLOS_GAME1_STEPS;

  const [selectedMutualId, setSelectedMutualId] = useState<string>('');
  const [showBanHistory, setShowBanHistory] = useState<boolean>(false);

  const mutual = room.mutualStage;
  const isMutualPending = mutual && mutual.status === 'pending';
  const myCommitment = myRole === 'home' ? mutual?.homeCommitment : mutual?.awayCommitment;
  const oppCommitment = myRole === 'home' ? mutual?.awayCommitment : mutual?.homeCommitment;

  const currentStep = stepsConfig[battle?.stepIndex || 0];
  const isComplete = battle?.status === 'in_progress' || battle?.status === 'complete';
  const isMyTurn = !isComplete && currentStep?.team === myRole;

  const selectedStage = isComplete && battle?.selectedStageId
    ? pool.find((s) => s.id === battle.selectedStageId)
    : null;

  const handleConfirmMutual = () => {
    if (selectedMutualId && onProposeMutual && !myCommitment) {
      onProposeMutual(selectedMutualId);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. When stage is selected, show PROMINENT HERO DISPLAY */}
      {isComplete && selectedStage ? (
        <div className="space-y-4">
          <SelectedStageHero
            stage={selectedStage}
            battleNumber={1}
            mode={room.mode}
            subheading="Battle 1 starting stage selected via official MiHSEF striking procedure."
          />

          {/* Undo final selection if misclicked */}
          {canUndo && onUndo && (
            <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300">
              <span className="text-xs text-gray-300">Misclicked the final pick?</span>
              <button
                type="button"
                onClick={onUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-bold transition-all active:scale-95"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo Stage Selection
              </button>
            </div>
          )}

          {/* Collapsible Ban History */}
          <div className="rounded-xl border border-[#262c3a] bg-[#0a0c10] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowBanHistory(!showBanHistory)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              <span>View Ban History ({battle.bannedStages.length} stages struck)</span>
              {showBanHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showBanHistory && (
              <div className="p-3 border-t border-[#262c3a] grid grid-cols-2 sm:grid-cols-4 gap-2">
                {battle.bannedStages.map((ban, i) => {
                  const s = pool.find((p) => p.id === ban.stageId);
                  return (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-[#14171f] border border-[#262c3a] flex items-center gap-2 text-[11px]"
                    >
                      <Ban className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-gray-300 font-bold block truncate">{s?.name || ban.stageId}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{ban.by} Ban</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* 2. Optional Blind Friendly Stage Agreement Banner (if still pending) */}
          {isMutualPending && (
            <div className="p-4 rounded-xl bg-[#14171f] border border-[#262c3a] space-y-3 shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-[#FF9933] font-bold text-xs uppercase tracking-wider font-outfit">
                  <EyeOff className="w-4 h-4" />
                  <span>Optional: Blind Friendly Stage Agreement</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span className={myCommitment ? 'text-emerald-400 font-bold' : ''}>
                    You: {myCommitment ? '✓ Locked' : 'Pending'}
                  </span>
                  <span>•</span>
                  <span className={oppCommitment ? 'text-emerald-400 font-bold' : ''}>
                    Opponent: {oppCommitment ? '✓ Locked' : 'Pending'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Secretly nominate a stage below. If your pick matches opponent's, it locks in instantly! If you begin banning stages below, friendly agreement is automatically bypassed.
              </p>

              {!myCommitment ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <select
                    value={selectedMutualId}
                    onChange={(e) => setSelectedMutualId(e.target.value)}
                    className="flex-1 bg-[#0a0c10] border border-[#262c3a] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF9933] focus:outline-none"
                  >
                    <option value="">Select a stage to nominate secretly...</option>
                    {pool.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={!selectedMutualId}
                    onClick={handleConfirmMutual}
                    className="px-4 py-2 bg-[#FF9933] hover:bg-[#ffad55] disabled:opacity-40 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0"
                  >
                    Lock Secret Pick
                  </button>

                  {onOptOutMutual && (
                    <button
                      type="button"
                      onClick={onOptOutMutual}
                      className="px-3 py-2 bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-semibold rounded-xl transition-all shrink-0"
                    >
                      Decline &amp; Strike
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
                  <span>✓ Your secret nomination is locked. Waiting for opponent or proceed to strikes below.</span>
                </div>
              )}
            </div>
          )}

          {/* 3. 9-Stock Permanence Alert Banner for Crews */}
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wide font-outfit">
                  Rule Reminder: {room.mode === 'crews' ? '9-Stock Stage Permanence' : 'Solos Game 1 Striking'}
                </h4>
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  {room.mode === 'crews' ? (
                    <>
                      Teams <strong>STAY ON THIS STAGE</strong> until one entire team loses all <strong>9 stocks</strong> (3 players × 3 stocks). <strong>Do NOT change stages between players!</strong>
                    </>
                  ) : (
                    <>
                      Starter stages only. Home strikes 1, Away strikes 2, Home strikes 1, remaining stage is used.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Striking Turn Sequence Header */}
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

          {/* High-Visibility Undo Bar right by the stages */}
          {canUndo && onUndo && (
            <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-amber-500/15 border-2 border-amber-500/50 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                <Undo2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Misclicked a stage ban?</span>
              </div>
              <button
                type="button"
                onClick={onUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-95 shrink-0"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo Last Ban
              </button>
            </div>
          )}

          {/* 5. Stages Grid for Striking */}
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
        </>
      )}
    </div>
  );
};
