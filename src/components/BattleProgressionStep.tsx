import React, { useState } from 'react';
import { Trophy, Swords, Lock, Ban, ShieldAlert, UserCheck, Undo2 } from 'lucide-react';
import { MatchRoom, TeamRole, Stage } from '../types';
import { CREWS_POOL, SOLOS_STARTERS, SOLOS_COUNTERPICKS } from '../data/stages';
import { CharacterInput } from './CharacterInput';
import { SelectedStageHero } from './SelectedStageHero';

interface BattleProgressionStepProps {
  room: MatchRoom;
  myRole: TeamRole;
  onRecordWinner: (winnerRole: TeamRole) => void;
  onStageAction: (stageId: string) => void;
  onDeclareCharacter: (isWinner: boolean, switching: boolean, characterName?: string) => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

export const BattleProgressionStep: React.FC<BattleProgressionStepProps> = ({
  room,
  myRole,
  onRecordWinner,
  onStageAction,
  onDeclareCharacter,
  onUndo,
  canUndo = false
}) => {
  const currentBattle = room.battles[room.currentBattleIndex];
  const prevBattle = room.battles[room.currentBattleIndex - 1];

  const [isSwitchingFighter, setIsSwitchingFighter] = useState<boolean>(false);
  const [selectedCharacterName, setSelectedCharacterName] = useState<string>('');

  // For solos, subsequent games combine starters + counterpicks (8 stages)
  const fullPool = room.mode === 'crews'
    ? CREWS_POOL
    : [...SOLOS_STARTERS, ...SOLOS_COUNTERPICKS];

  // Match Over State
  if (room.matchComplete && room.matchWinner) {
    const isWinner = room.matchWinner === myRole;
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/20 via-[#14171f] to-[#0a0c10] border-2 border-[#FF9933] text-center space-y-4 shadow-2xl">
        <Trophy className="w-16 h-16 text-[#FF9933] mx-auto animate-bounce" />
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
            Official Match Complete ({room.mode === 'crews' ? 'Best of 3' : 'Best of 5'})
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-outfit uppercase mt-1">
            {room.matchWinner.toUpperCase()} TEAM WINS THE MATCH!
          </h3>
          <div className="text-lg font-mono font-bold text-[#FF9933] mt-2">
            FINAL SCORE: Home {room.scores.home} – {room.scores.away} Away
          </div>
        </div>

        <p className="text-xs text-gray-300 max-w-md mx-auto">
          Please report this official match score in the Fenworks platform and Discord results channel. Great match!
        </p>
      </div>
    );
  }

  // Active Battle is in progress (stage chosen, games being played)
  const isPlayingCurrentBattle = currentBattle?.status === 'in_progress';
  const selectedStage = isPlayingCurrentBattle && currentBattle.selectedStageId
    ? fullPool.find((s) => s.id === currentBattle.selectedStageId)
    : null;

  // Character Declaration logic for subsequent games
  const winnerTeam = prevBattle?.winner;
  const loserTeam = winnerTeam ? (winnerTeam === 'home' ? 'away' : 'home') : undefined;

  const isMyTeamWinner = myRole === winnerTeam;
  const isMyTeamLoser = myRole === loserTeam;

  const hasWinnerDeclared = !!currentBattle?.winnerCharacter;
  const hasLoserDeclared = !!currentBattle?.loserCharacter;

  const handleConfirmSwitch = (isWinner: boolean) => {
    onDeclareCharacter(isWinner, true, selectedCharacterName);
    setIsSwitchingFighter(false);
    setSelectedCharacterName('');
  };

  const handleConfirmSame = (isWinner: boolean) => {
    onDeclareCharacter(isWinner, false);
    setIsSwitchingFighter(false);
    setSelectedCharacterName('');
  };

  return (
    <div className="space-y-6">
      {/* Live Scoreboard */}
      <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-[#0a0c10] border border-[#262c3a]">
        <div className="text-center">
          <span className="text-[11px] font-bold text-[#FF9933] uppercase block">Home Team</span>
          <div className="text-3xl font-black font-mono text-white mt-0.5">{room.scores.home}</div>
        </div>
        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest font-mono">
          {room.mode === 'crews' ? 'BEST OF 3' : 'BEST OF 5'}
        </div>
        <div className="text-center">
          <span className="text-[11px] font-bold text-[#05d9e8] uppercase block">Away Team</span>
          <div className="text-3xl font-black font-mono text-white mt-0.5">{room.scores.away}</div>
        </div>
      </div>

      {/* Battle in progress: PROMINENT HERO STAGE CARD + Win recorder buttons */}
      {isPlayingCurrentBattle && selectedStage && (
        <div className="space-y-4">
          <SelectedStageHero
            stage={selectedStage}
            battleNumber={currentBattle.battleNumber}
            mode={room.mode}
            winnerRole={prevBattle?.winner}
            winnerCharacter={currentBattle.winnerCharacter}
            loserCharacter={currentBattle.loserCharacter}
            subheading={`Battle ${currentBattle.battleNumber} active. Play until all stocks are depleted.`}
            isMutualAgreement={currentBattle.battleNumber === 1 && room.mutualStage?.status === 'agreed'}
          />

          {/* Undo previous action if misclicked */}
          {canUndo && onUndo && (
            <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300">
              <span className="text-xs text-gray-300">Misclicked on battle winner or stage selection?</span>
              <button
                type="button"
                onClick={onUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-bold transition-all active:scale-95"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo Previous Action
              </button>
            </div>
          )}

          <div className="p-4 sm:p-5 rounded-2xl bg-[#14171f] border border-[#262c3a] text-center space-y-3 shadow-lg">
            <h4 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider font-outfit">
              Conclude Battle {currentBattle.battleNumber}
            </h4>
            <p className="text-xs text-gray-300 max-w-md mx-auto">
              When all {room.mode === 'crews' ? '9 stocks' : 'stocks'} are lost, record which team won to advance:
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-1">
              <button
                type="button"
                onClick={() => onRecordWinner('home')}
                className="px-4 py-3 bg-[#FF9933] hover:bg-[#ffad55] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md"
              >
                Home Won Battle {currentBattle.battleNumber}
              </button>

              <button
                type="button"
                onClick={() => onRecordWinner('away')}
                className="px-4 py-3 bg-[#05d9e8] hover:bg-[#3be2ee] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md"
              >
                Away Won Battle {currentBattle.battleNumber}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Counterpick Stage Selection & Character Declaration Phase for subsequent games */}
      {!isPlayingCurrentBattle && currentBattle?.status === 'striking' && prevBattle && (
        <div className="space-y-5">
          {/* Character Declaration Module (Winner declares first, then Loser) */}
          <div className="p-4 rounded-xl bg-[#14171f] border border-[#262c3a] space-y-3 shadow-md">
            <div className="flex items-center gap-2 text-[#FF9933] font-bold text-xs uppercase tracking-wider font-outfit">
              <UserCheck className="w-4 h-4" />
              <span>Character Selection — Battle {currentBattle.battleNumber}</span>
            </div>

            {/* Winner Team Prompt */}
            {isMyTeamWinner && !hasWinnerDeclared && (
              <div className="p-3.5 rounded-xl bg-[#0a0c10] border border-[#FF9933]/50 space-y-2">
                <span className="text-xs font-bold text-white block">
                  You won the previous battle! Rule requirement: <strong>Declare your character first.</strong>
                </span>
                <p className="text-[11px] text-gray-400">
                  Are you changing character for Battle {currentBattle.battleNumber}?
                </p>

                {!isSwitchingFighter ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleConfirmSame(true)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow"
                    >
                      Staying Same Character
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSwitchingFighter(true)}
                      className="px-3 py-2 bg-[#262c3a] hover:bg-[#32394b] text-gray-200 font-bold text-xs rounded-xl transition-all"
                    >
                      Switching Character...
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <CharacterInput
                      label="Select Your New Character"
                      value={selectedCharacterName}
                      onChange={setSelectedCharacterName}
                      placeholder="Type character name (e.g. Pyra/Mythra, Fox, Joker)..."
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!selectedCharacterName.trim()}
                        onClick={() => handleConfirmSwitch(true)}
                        className="px-4 py-2 bg-[#FF9933] hover:bg-[#ffad55] disabled:opacity-40 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow"
                      >
                        Confirm Character
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSwitchingFighter(false)}
                        className="px-3 py-2 text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loser Team Prompt */}
            {isMyTeamLoser && (
              <div className="p-3.5 rounded-xl bg-[#0a0c10] border border-[#262c3a] space-y-2">
                {!hasWinnerDeclared ? (
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>
                      Waiting for winning team ({winnerTeam?.toUpperCase()}) to declare their character first...
                    </span>
                  </div>
                ) : !hasLoserDeclared ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-white block">
                      Winning team declared:{' '}
                      <strong className="text-emerald-400">
                        {currentBattle.winnerCharacter?.switching
                          ? currentBattle.winnerCharacter.characterName
                          : 'Same Character'}
                      </strong>
                      . Now declare your character:
                    </span>

                    {!isSwitchingFighter ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmSame(false)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow"
                        >
                          Staying Same Character
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsSwitchingFighter(true)}
                          className="px-3 py-2 bg-[#262c3a] hover:bg-[#32394b] text-gray-200 font-bold text-xs rounded-xl transition-all"
                        >
                          Switching Character...
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <CharacterInput
                          label="Select Your New Character"
                          value={selectedCharacterName}
                          onChange={setSelectedCharacterName}
                          placeholder="Type character name (e.g. Steve, Sonic, Kazuya)..."
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!selectedCharacterName.trim()}
                            onClick={() => handleConfirmSwitch(false)}
                            className="px-4 py-2 bg-[#05d9e8] hover:bg-[#3be2ee] disabled:opacity-40 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow"
                          >
                            Confirm Character
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsSwitchingFighter(false)}
                            className="px-3 py-2 text-xs text-gray-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 font-bold">
                    ✓ Both teams have declared characters for Battle {currentBattle.battleNumber}!
                  </div>
                )}
              </div>
            )}

            {/* Status Summary for both teams */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded-lg bg-[#0a0c10] border border-[#262c3a] flex items-center justify-between">
                <span className="text-gray-400 uppercase font-semibold">
                  {winnerTeam?.toUpperCase()} (Winner):
                </span>
                <span className={hasWinnerDeclared ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                  {hasWinnerDeclared
                    ? currentBattle.winnerCharacter?.switching
                      ? currentBattle.winnerCharacter.characterName
                      : 'Same Character'
                    : 'Pending'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#0a0c10] border border-[#262c3a] flex items-center justify-between">
                <span className="text-gray-400 uppercase font-semibold">
                  {loserTeam?.toUpperCase()} (Loser):
                </span>
                <span className={hasLoserDeclared ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                  {hasLoserDeclared
                    ? currentBattle.loserCharacter?.switching
                      ? currentBattle.loserCharacter.characterName
                      : 'Same Character'
                    : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Rules Reminder Callout */}
          <div className="p-3.5 rounded-xl bg-[#0a0c10] border border-[#262c3a] space-y-1.5">
            <h4 className="text-xs font-black text-[#FF9933] uppercase tracking-wider font-outfit flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#FF9933]" />
              Battle {currentBattle.battleNumber} Striking Procedure
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Winner ({winnerTeam?.toUpperCase()}) strikes {room.mode === 'crews' ? '3 stages' : '2 stages'}.
              Loser ({loserTeam?.toUpperCase()}) picks the battle stage from the remaining stages.
            </p>
            <p className="text-[11px] text-amber-300 font-semibold">
              Dave's Stupid Rule (DSR): You cannot pick a stage your team has already won on in this match (opposing team's past wins are permitted).
            </p>
          </div>

          {/* Turn Banner */}
          {(() => {
            const bansNeeded = room.mode === 'crews' ? 3 : 2;
            const bansMade = currentBattle.bannedStages.filter((b) => b.by !== 'auto').length;
            const isWinnerBanning = bansMade < bansNeeded;
            const activeTeam = isWinnerBanning ? winnerTeam : loserTeam;
            const isMyTurn = activeTeam === myRole;

            return (
              <div
                className={`p-3.5 rounded-xl border text-center font-bold text-sm tracking-wide font-outfit uppercase transition-all ${
                  isMyTurn
                    ? 'bg-[#FF9933]/20 border-[#FF9933] text-white ring-2 ring-[#FF9933]/40 animate-pulse'
                    : 'bg-[#0a0c10] border-[#262c3a] text-gray-400'
                }`}
              >
                {isMyTurn ? (
                  <span>
                    YOUR TURN ({myRole.toUpperCase()}):{' '}
                    {isWinnerBanning
                      ? `Strike Stage (${bansMade + 1} of ${bansNeeded})`
                      : 'Pick Stage for Battle'}
                  </span>
                ) : (
                  <span>
                    Waiting for {activeTeam?.toUpperCase()} Team to{' '}
                    {isWinnerBanning
                      ? `strike stage (${bansMade + 1} of ${bansNeeded})`
                      : 'pick next stage'}
                    ...
                  </span>
                )}
              </div>
            );
          })()}

          {/* High-Visibility Undo Bar right by the counterpick stages */}
          {canUndo && onUndo && (
            <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-amber-500/15 border-2 border-amber-500/50 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                <Undo2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Misclicked a counterpick ban or stage?</span>
              </div>
              <button
                type="button"
                onClick={onUndo}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-95 shrink-0"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo Last Strike
              </button>
            </div>
          )}

          {/* Stage Grid with DSR and Bans */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fullPool.map((stage) => {
              const banData = currentBattle.bannedStages.find((b) => b.stageId === stage.id);
              const isAutoBanned = banData?.by === 'auto';
              const isBanned = !!banData;

              const bansNeeded = room.mode === 'crews' ? 3 : 2;
              const bansMade = currentBattle.bannedStages.filter((b) => b.by !== 'auto').length;
              const isWinnerBanning = bansMade < bansNeeded;
              const activeTeam = isWinnerBanning ? winnerTeam : loserTeam;

              const canClick = activeTeam === myRole && !isBanned;

              return (
                <button
                  key={stage.id}
                  type="button"
                  disabled={!canClick}
                  onClick={() => onStageAction(stage.id)}
                  className={`group relative rounded-xl overflow-hidden border text-left transition-all ${
                    isAutoBanned
                      ? 'border-amber-600/40 opacity-50 grayscale cursor-not-allowed'
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

                  {/* DSR Lock Overlay */}
                  {isAutoBanned && (
                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-2 text-center">
                      <Lock className="w-6 h-6 text-amber-400 mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                        Auto-Banned (DSR)
                      </span>
                      <span className="text-[9px] text-gray-400">Your Previous Win</span>
                    </div>
                  )}

                  {/* Standard Ban Overlay */}
                  {isBanned && !isAutoBanned && (
                    <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center p-2 text-center">
                      <Ban className="w-8 h-8 text-red-500 mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-300">
                        Banned by {banData.by.toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-black/85 px-2 py-1.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-200 block truncate">
                      {stage.name}
                    </span>
                    {canClick && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#FF9933] text-black shrink-0">
                        {isWinnerBanning ? 'BAN' : 'PICK'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
