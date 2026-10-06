import React, { useState } from 'react';
import { AlertTriangle, Check, Ban, Swords, EyeOff, Sparkles, ChevronDown, ChevronUp, Undo2, Handshake, Zap, X, ArrowLeftRight } from 'lucide-react';
import { MatchRoom, TeamRole, Stage } from '../types';
import { CREWS_POOL, SOLOS_STARTERS, CREWS_GAME1_STEPS, SOLOS_GAME1_STEPS } from '../data/stages';
import { SelectedStageHero } from './SelectedStageHero';

interface Game1StrikingStepProps {
  room: MatchRoom;
  myRole: TeamRole;
  onStageAction: (stageId: string) => void;
  onProposeMutual?: (stageId: string) => void;
  onOptOutMutual?: () => void;
  onCancelMutual?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onSwitchRole?: (role: TeamRole) => void;
}

export const Game1StrikingStep: React.FC<Game1StrikingStepProps> = ({
  room,
  myRole,
  onStageAction,
  onProposeMutual,
  onOptOutMutual,
  onCancelMutual,
  onUndo,
  canUndo = false,
  onSwitchRole
}) => {
  const battle = room.battles[0];
  const pool = room.mode === 'crews' ? CREWS_POOL : SOLOS_STARTERS;
  const stepsConfig = room.mode === 'crews' ? CREWS_GAME1_STEPS : SOLOS_GAME1_STEPS;

  const [gridMode, setGridMode] = useState<'ban' | 'offer'>('ban');
  const [showBanHistory, setShowBanHistory] = useState<boolean>(false);
  const [dismissedMismatchNotice, setDismissedMismatchNotice] = useState<boolean>(false);
  const [dismissedSkipNotice, setDismissedSkipNotice] = useState<boolean>(false);

  const mutual = room.mutualStage;
  const isMutualPending = !mutual || mutual.status === 'pending';
  const myCommitment = myRole === 'home' ? mutual?.homeCommitment : mutual?.awayCommitment;
  const oppCommitment = myRole === 'home' ? mutual?.awayCommitment : mutual?.homeCommitment;

  // Retrieve plain text secret offer from sessionStorage if committed
  const getStoredOffer = (): string | null => {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(`ssbu_mutual_${room.roomId}_${myRole}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return (parsed.stageId as string) || null;
    } catch {
      return null;
    }
  };

  const storedOfferId = getStoredOffer();

  const currentStep = stepsConfig[battle?.stepIndex || 0];
  const isComplete = battle?.status === 'in_progress' || battle?.status === 'complete';
  const isMyTurn = !isComplete && currentStep?.team === myRole;

  const selectedStage = isComplete && battle?.selectedStageId
    ? pool.find((s) => s.id === battle.selectedStageId)
    : null;

  const isMutualAgreement = mutual?.status === 'agreed';

  const handleStageClick = (stageId: string) => {
    if (gridMode === 'offer' && onProposeMutual && !myCommitment) {
      onProposeMutual(stageId);
      setGridMode('ban');
    } else {
      onStageAction(stageId);
    }
  };

  const handleCancelOffer = () => {
    if (onCancelMutual) {
      onCancelMutual();
    }
    setGridMode('offer');
  };

  return (
    <div className="space-y-5">
      {/* 1. When stage is selected, show PROMINENT HERO DISPLAY */}
      {isComplete && selectedStage ? (
        <div className="space-y-4">
          {/* Celebratory Friendly Agreement Banner if mutual agreed */}
          {isMutualAgreement && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-900/70 to-emerald-950/90 border-2 border-emerald-400 text-center space-y-1.5 shadow-[0_0_35px_rgba(16,185,129,0.35)] animate-pulse">
              <div className="flex items-center justify-center gap-2 text-emerald-300 font-black text-sm sm:text-base uppercase tracking-widest font-outfit">
                <Handshake className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>🤝 Friendly Stage Agreement Reached! 🤝</span>
                <Handshake className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                Both teams offered <strong>{selectedStage.name}</strong>! Stage striking was bypassed by mutual agreement.
              </p>
            </div>
          )}

          <SelectedStageHero
            stage={selectedStage}
            battleNumber={1}
            mode={room.mode}
            isMutualAgreement={isMutualAgreement}
            subheading="Battle 1 starting stage locked in. Play until entire team is eliminated."
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

          {/* Collapsible Ban History (if strikes took place) */}
          {battle.bannedStages.length > 0 && (
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
          )}
        </div>
      ) : (
        <>
          {/* Notice of Mismatch if both submitted differing secret offers */}
          {mutual?.status === 'mismatched' && !dismissedMismatchNotice && (
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs flex items-center justify-between gap-3 text-purple-200 shadow-md animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <Handshake className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <span className="font-extrabold uppercase tracking-wide text-purple-300 block">
                    Friendly Stage Offers Differed
                  </span>
                  <span className="text-gray-300 text-[11px] leading-relaxed">
                    Both teams offered a friendly stage, but selected different stages. All choices remain confidential — proceeding to stage bans.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissedMismatchNotice(true)}
                className="text-gray-400 hover:text-white text-xs font-bold p-1 rounded hover:bg-white/10"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Notice of Friendly Offer Cancelled/Skipped by Opponent */}
          {mutual?.status === 'skipped' && storedOfferId && mutual.skippedBy && mutual.skippedBy !== myRole && !dismissedSkipNotice && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs flex items-center justify-between gap-3 text-amber-200 shadow-md animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <Ban className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-extrabold uppercase tracking-wide text-amber-300 block">
                    Notice: Friendly Offer Skipped
                  </span>
                  <span className="text-gray-300 text-[11px] leading-relaxed">
                    {mutual.skippedBy.toUpperCase()} team started stage bans. Proceeding with stage bans.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissedSkipNotice(true)}
                className="text-gray-400 hover:text-white text-xs font-bold p-1 rounded hover:bg-white/10"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2. Unified Striking & Friendly Action Mode Bar */}
          {isMutualPending && !myCommitment && (
            <div className="flex items-center justify-between gap-2 p-1.5 bg-[#14171f] border border-[#262c3a] rounded-xl">
              <button
                type="button"
                onClick={() => setGridMode('ban')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  gridMode === 'ban'
                    ? 'bg-[#FF9933] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Strike Stages (Standard)</span>
              </button>

              <button
                type="button"
                onClick={() => setGridMode('offer')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  gridMode === 'offer'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-gray-400 hover:text-emerald-400'
                }`}
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Offer Friendly</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ml-1 ${
                  gridMode === 'offer'
                    ? 'bg-black/25 text-black'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  Optional
                </span>
              </button>
            </div>
          )}

          {/* Active Mode Explanation & Status */}
          {isMutualPending && (
            <div className={`p-3.5 rounded-xl border text-xs transition-all ${
              myCommitment
                ? 'bg-emerald-950/30 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                : gridMode === 'offer'
                ? 'bg-[#0e161c] border-emerald-500/30'
                : 'bg-[#0a0c10] border-[#262c3a]'
            }`}>
              {myCommitment ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <Handshake className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0 animate-pulse" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-white text-xs uppercase tracking-wide">
                          Friendly Stage Offered
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                          Submitted 🔒
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          (Optional — you can cancel or strike stages at any time)
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 mt-0.5">
                        {oppCommitment ? (
                          <strong className="text-emerald-300">
                            Opponent also submitted an offer! Checking for agreement...
                          </strong>
                        ) : (
                          <span>
                            Waiting on opponent... (Optional — tap any stage below to strike or cancel offer)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelOffer}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Cancel Offer</span>
                  </button>
                </div>
              ) : gridMode === 'offer' ? (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Handshake className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-emerald-400 uppercase tracking-wide">
                          🤝 Offer Friendly Stage Agreement
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                          Optional
                        </span>
                      </div>
                      <p className="text-gray-300 text-[11px] leading-relaxed mt-1">
                        <strong>Completely optional gentleman's agreement:</strong> Both teams can optionally offer a stage. If both independently choose the same stage, stage bans are bypassed entirely. If choices differ or either team starts striking stages, standard stage striking proceeds.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGridMode('ban')}
                    className="text-gray-400 hover:text-white font-bold text-xs shrink-0 underline cursor-pointer"
                  >
                    Back to Striking
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Ban className="w-4 h-4 text-[#FF9933] shrink-0" />
                    <span>
                      <strong>Standard Stage Striking:</strong> Tap stages below to strike on your turn.
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1.5 shrink-0 bg-[#14171f] px-2.5 py-1 rounded-lg border border-[#262c3a]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Offering a friendly is <strong>100% optional</strong></span>
                  </div>
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

          {/* Active Perspective & Quick Role Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 px-3 rounded-xl bg-[#0e1218] border border-[#262c3a] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                You are:
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase font-mono tracking-wider ${
                myRole === 'home'
                  ? 'bg-[#FF9933]/20 text-[#FF9933] border border-[#FF9933]/40'
                  : 'bg-[#05d9e8]/20 text-[#05d9e8] border border-[#05d9e8]/40'
              }`}>
                {myRole.toUpperCase()} TEAM
              </span>
            </div>

            {onSwitchRole && (
              <button
                type="button"
                onClick={() => onSwitchRole(myRole === 'home' ? 'away' : 'home')}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer group"
                title={`Switch your local perspective to ${myRole === 'home' ? 'Away' : 'Home'} team`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-180 transition-transform" />
                <span>Wrong team? Switch to <strong className="text-white underline">{myRole === 'home' ? 'Away' : 'Home'}</strong></span>
              </button>
            )}
          </div>

          {/* 4. Striking Turn Sequence Header (shown in Ban mode) */}
          {!isComplete && currentStep && gridMode === 'ban' && (
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

          {/* High-Visibility Undo Bar right above stages */}
          {canUndo && onUndo && (
            <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-amber-500/15 border-2 border-amber-500/50 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                <Undo2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Misclicked a stage ban?</span>
              </div>
              <button
                type="button"
                onClick={onUndo}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-95 shrink-0"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo Last Ban
              </button>
            </div>
          )}

          {/* 5. Stages Grid for Striking & Mutual Offering */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pool.map((stage) => {
              const banData = battle?.bannedStages.find((b) => b.stageId === stage.id);
              const isBanned = !!banData;
              const isPicked = battle?.selectedStageId === stage.id;

              const isOfferingMode = gridMode === 'offer' && isMutualPending && !myCommitment;
              const canClick = isOfferingMode ? !isBanned : isMyTurn && !isBanned && !isComplete;

              return (
                <button
                  key={stage.id}
                  type="button"
                  disabled={!canClick}
                  onClick={() => handleStageClick(stage.id)}
                  className={`group relative rounded-xl overflow-hidden border text-left transition-all ${
                    isPicked
                      ? 'border-emerald-500 ring-2 ring-emerald-500 scale-[1.02] shadow-lg'
                      : isBanned
                      ? 'border-red-950/60 opacity-40 grayscale cursor-not-allowed'
                      : isOfferingMode
                      ? 'border-emerald-500/40 hover:border-emerald-400 hover:scale-[1.02] cursor-pointer shadow-md'
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
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                        isOfferingMode
                          ? 'bg-emerald-400 text-black'
                          : 'bg-[#FF9933] text-black'
                      }`}>
                        {isOfferingMode ? 'OFFER' : currentStep?.action === 'pick' ? 'PICK' : 'BAN'}
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
