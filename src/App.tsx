import React from 'react';
import { Header } from './components/Header';
import { StepCard } from './components/StepCard';
import { RoomJoinStep } from './components/RoomJoinStep';
import { TeamLobbyStep } from './components/TeamLobbyStep';
import { MutualStageStep } from './components/MutualStageStep';
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
    handleStageAction,
    handleBattleWin,
    handleUndo,
    handleReset
  } = useMatchRoom();

  // Determine stage & step completion status
  const hasRoom = !!room;
  const hasRole = !!myRole;
  const hasArena = !!room?.arena?.id;

  const mutualStatus = room?.mutualStage?.status;
  const isMutualAgreed = mutualStatus === 'agreed';
  const isMutualResolved = isMutualAgreed || mutualStatus === 'mismatched' || mutualStatus === 'skipped';

  const battle1 = room?.battles[0];
  const isBattle1Selected = (battle1?.status === 'in_progress' || battle1?.status === 'complete') && !!battle1?.selectedStageId;
  const isBattle1Complete = battle1?.status === 'complete';

  const pool = room?.mode === 'solos' ? SOLOS_STARTERS : CREWS_POOL;
  const battle1StageObj = pool.find((s) => s.id === battle1?.selectedStageId);

  // Active step computation
  // Step 1: Room Join & Share
  // Step 2: Role & Arena
  // Step 3: Mutual Friendly Stage
  // Step 4: Battle 1 Striking
  // Step 5: Subsequent Battles & Result
  const activeStepNumber = !hasRoom
    ? 1
    : !hasRole || (myRole === 'home' && !hasArena)
    ? 2
    : !isMutualResolved
    ? 3
    : !isBattle1Selected
    ? 4
    : 5;

  const canUndo = (room?.history?.length || 0) > 0;

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
                Room: {room.roomId} • Format: {room.mode.toUpperCase()} (Best of 3)
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

        {/* Phase 2 & 2.5: Role & Arena Connection */}
        <StepCard
          stepNumber="2"
          title="Team Role & Arena Lobby"
          isCompleted={hasRole && (myRole === 'away' || hasArena)}
          isActive={activeStepNumber === 2}
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
            />
          )}
        </StepCard>

        {/* Phase 3: Mutual Friendly Stage Agreement */}
        {hasRole && (
          <StepCard
            stepNumber="3"
            title="Mutual Friendly Stage Agreement (Optional)"
            isCompleted={isMutualResolved}
            isActive={activeStepNumber === 3}
            summary={
              isMutualAgreed ? (
                <span className="text-emerald-400 font-semibold">
                  ✓ Mutually agreed on {pool.find((s) => s.id === room?.mutualStage?.matchedStageId)?.name || 'Stage'}
                </span>
              ) : isMutualResolved ? (
                <span className="text-gray-400">
                  Skipped / Mismatched → Proceeded to official bans
                </span>
              ) : null
            }
          >
            {room && myRole && (
              <MutualStageStep
                room={room}
                myRole={myRole}
                onPropose={proposeMutualStage}
                onOptOut={optOutMutual}
              />
            )}
          </StepCard>
        )}

        {/* Phase 4: Battle 1 Stage Striking & 9-Stock Callout */}
        {hasRole && isMutualResolved && (
          <StepCard
            stepNumber="4"
            title="Battle 1 Stage Striking & Permanence Rule"
            isCompleted={isBattle1Selected}
            isActive={activeStepNumber === 4}
            summary={
              battle1StageObj ? (
                <span className="text-emerald-400 font-semibold">
                  ✓ Battle 1 Stage: {battle1StageObj.name} (Stays until 9 stocks lost)
                </span>
              ) : null
            }
          >
            {room && myRole && (
              <Game1StrikingStep
                room={room}
                myRole={myRole}
                onStageAction={handleStageAction}
              />
            )}
          </StepCard>
        )}

        {/* Phase 5 & 6: Subsequent Battles, Counterpicks & Match Resolution */}
        {hasRole && isBattle1Selected && (
          <StepCard
            stepNumber="5"
            title="Battle Results, DSR Counterpicks & Match Resolution"
            isCompleted={room?.matchComplete || false}
            isActive={activeStepNumber === 5}
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
              />
            )}
          </StepCard>
        )}

        <footer className="mt-12 text-center text-xs text-gray-500 border-t border-[#262c3a] pt-6 space-y-1">
          <p>
            Official Michigan High School Esports Federation (MiHSEF) SSBU Match Coordinator
          </p>
          <p className="text-[11px] text-gray-600">
            Stages and strike sequences align with the official Fall 2026 SSBU Ruleset.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
