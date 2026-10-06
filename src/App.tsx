import React, { useState, useEffect } from 'react';
import { Edit3, X } from 'lucide-react';
import { Header } from './components/Header';
import { StepCard } from './components/StepCard';
import { RoomJoinStep } from './components/RoomJoinStep';
import { TeamLobbyStep } from './components/TeamLobbyStep';
import { Game1StrikingStep } from './components/Game1StrikingStep';
import { BattleProgressionStep } from './components/BattleProgressionStep';
import { useMatchRoom } from './hooks/useMatchRoom';
import { CREWS_POOL, SOLOS_STARTERS } from './data/stages';

export const App: React.FC = () => {
  const {
    roomId,
    room,
    myRole,
    loading,
    error,
    joinRoom,
    selectRole,
    saveArena,
    proposeMutualStage,
    optOutMutual,
    cancelMutualStage,
    handleStageAction,
    handleCharacterDeclaration,
    handleBattleWin,
    handleUndo,
    handleReset
  } = useMatchRoom();

  const [step2Confirmed, setStep2Confirmed] = useState<boolean>(false);
  const [step2Editing, setStep2Editing] = useState<boolean>(false);

  // Restore step 2 confirmed state from session storage for active room
  useEffect(() => {
    if (!roomId) return;
    const stored = sessionStorage.getItem(`ssbu_step2_confirmed_${roomId}`);
    if (stored === 'true') {
      setStep2Confirmed(true);
    } else {
      setStep2Confirmed(false);
    }
    setStep2Editing(false);
  }, [roomId]);

  // Determine stage & step completion status
  const hasRoom = !!room;
  const hasRole = !!myRole;
  const hasArena = !!room?.arena?.id;

  const battle1 = room?.battles[0];
  const hasGame1Started = (battle1?.bannedStages?.length || 0) > 0 || !!battle1?.selectedStageId;
  const isBattle1Selected = (battle1?.status === 'in_progress' || battle1?.status === 'complete') && !!battle1?.selectedStageId;

  // Step 2 is only completed once a role is selected AND confirmed (or strikes already began)
  const isStep2Completed = hasRole && (step2Confirmed || hasGame1Started);

  const pool = room?.mode === 'solos' ? SOLOS_STARTERS : CREWS_POOL;
  const battle1StageObj = pool.find((s) => s.id === battle1?.selectedStageId);

  // Active step computation:
  // Step 1: Room Join & Share
  // Step 2: Role & Arena (Arena optional - requires continue click)
  // Step 3: Game 1 Stage Striking (Friendly nomination embedded)
  // Step 4: Subsequent Battles, Character Declarations & Results
  const activeStepNumber = !hasRoom
    ? 1
    : !isStep2Completed
    ? 2
    : !isBattle1Selected
    ? 3
    : 4;

  const canUndo = (room?.history?.length || 0) > 0;
  const seriesFormatText = room?.mode === 'crews' ? 'Best of 3' : 'Best of 5';

  const handleConfirmLobby = () => {
    setStep2Confirmed(true);
    if (roomId) {
      sessionStorage.setItem(`ssbu_step2_confirmed_${roomId}`, 'true');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#f3f4f6] flex justify-center py-6 px-3 sm:px-6">
      <div className="w-full max-w-3xl">
        <Header
          room={room}
          onReset={handleReset}
          onUndo={handleUndo}
          canUndo={canUndo}
        />

        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Phase 1: Room Join & Share */}
        <StepCard
          stepNumber="1"
          title="Match Room & Team Sharing"
          isCompleted={hasRoom}
          isActive={activeStepNumber === 1}
          summary={
            room ? (
              <span className="font-mono text-[#FF9933]">
                Room: {room.roomId} • Format: {room.mode.toUpperCase()} ({seriesFormatText})
              </span>
            ) : null
          }
        >
          <RoomJoinStep
            room={room}
            onJoin={joinRoom}
            loading={loading}
          />
        </StepCard>

        {/* Step 2: Role & Arena Connection (Arena Optional) */}
        <StepCard
          stepNumber="2"
          title="Team Role & Arena Lobby (Optional)"
          isCompleted={isStep2Completed}
          isActive={activeStepNumber === 2}
          isExpanded={step2Editing}
          action={
            isStep2Completed ? (
              <button
                type="button"
                onClick={() => setStep2Editing(!step2Editing)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1b202a] hover:bg-[#262c3a] text-gray-300 hover:text-white border border-[#262c3a] hover:border-gray-500 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                title="Switch teams or update Switch Arena lobby details"
              >
                {step2Editing ? (
                  <>
                    <X className="w-3.5 h-3.5 text-gray-400" />
                    <span>Close Edit</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>Change Team / Arena</span>
                  </>
                )}
              </button>
            ) : null
          }
          summary={
            hasRole ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  myRole === 'home' ? 'bg-[#FF9933]/20 text-[#FF9933]' : 'bg-[#05d9e8]/20 text-[#05d9e8]'
                }`}>
                  {myRole.toUpperCase()} TEAM
                </span>
                {room?.arena?.id && (
                  <span className="text-xs text-gray-300 font-mono">
                    Arena: <strong className="text-white">{room.arena.id}</strong>
                    {room.arena.password && ` (Pass: ${room.arena.password})`}
                  </span>
                )}
              </div>
            ) : null
          }
        >
          {room && (
            <TeamLobbyStep
              room={room}
              myRole={myRole}
              onSelectRole={selectRole}
              onSaveArena={saveArena}
              onConfirmLobby={handleConfirmLobby}
              isEditing={step2Editing}
              onDoneEditing={() => setStep2Editing(false)}
            />
          )}
        </StepCard>

        {/* Phase 3: Game 1 Stage Selection & Striking (Friendly Embedded + Striking Grid) */}
        {hasRole && (
          <StepCard
            stepNumber="3"
            title="Game 1 Stage Selection"
            isCompleted={isBattle1Selected}
            isActive={activeStepNumber === 3}
            summary={
              battle1StageObj ? (
                <span className="text-emerald-400 font-semibold">
                  ✓ Selected Stage: {battle1StageObj.name} {room.mode === 'crews' ? '(9-Stock Permanence)' : ''}
                </span>
              ) : null
            }
          >
            {room && myRole && (
              <Game1StrikingStep
                room={room}
                myRole={myRole}
                onStageAction={handleStageAction}
                onProposeMutual={proposeMutualStage}
                onOptOutMutual={optOutMutual}
                onCancelMutual={cancelMutualStage}
                onUndo={handleUndo}
                canUndo={canUndo}
                onSwitchRole={selectRole}
              />
            )}
          </StepCard>
        )}

        {/* Phase 4: Subsequent Battles, Character Declarations, Counterpicks & Match Resolution */}
        {hasRole && isBattle1Selected && (
          <StepCard
            stepNumber="4"
            title="Battle Progression, Character Declarations & DSR Counterpicks"
            isCompleted={room?.matchComplete || false}
            isActive={activeStepNumber === 4}
            summary={
              room?.matchComplete ? (
                <span className="text-[#FF9933] font-bold">
                  ✓ Match Complete: {room.matchWinner?.toUpperCase()} WON ({room.scores.home}–{room.scores.away})
                </span>
              ) : (
                <span className="text-gray-300 font-mono">
                  Score: Home {room?.scores.home} – {room?.scores.away} Away
                </span>
              )
            }
          >
            {room && myRole && (
              <BattleProgressionStep
                room={room}
                myRole={myRole}
                onRecordWinner={handleBattleWin}
                onStageAction={handleStageAction}
                onDeclareCharacter={handleCharacterDeclaration}
                onUndo={handleUndo}
                canUndo={canUndo}
                onSwitchRole={selectRole}
              />
            )}
          </StepCard>
        )}

        <footer className="mt-12 text-center text-xs text-gray-500 border-t border-[#262c3a] pt-6 space-y-1">
          <p>
            Official Michigan High School Esports Federation (MiHSEF) SSBU Match Coordinator
          </p>
          <p className="text-[11px] text-gray-600">
            Stages, character declarations, and strike sequences align with the official Fall 2026 SSBU Ruleset.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
