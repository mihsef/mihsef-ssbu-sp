import React from 'react';
import { Trophy, Swords, Lock, Ban, Check, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { MatchRoom, TeamRole, Stage } from '../types';
import { CREWS_POOL, SOLOS_STARTERS, SOLOS_COUNTERPICKS } from '../data/stages';

interface BattleProgressionStepProps {
  room: MatchRoom;
  myRole: TeamRole;
  onRecordWinner: (winnerRole: TeamRole) => void;
  onStageAction: (stageId: string) => void;
}

export const BattleProgressionStep: React.FC<BattleProgressionStepProps> = ({
  room,
  myRole,
  onRecordWinner,
  onStageAction
}) => {
  const currentBattle = room.battles[room.currentBattleIndex];
  const prevBattle = room.battles[room.currentBattleIndex - 1];

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
            Match Result (Best of 3)
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

  // Active Battle is either in progress (waiting for match outcome) or in counterpick striking
  const isPlayingCurrentBattle = currentBattle?.status === 'in_progress';

  return (
    <div className="space-y-6">
      {/* Live Scoreboard */}
      <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-[#0a0c10] border border-[#262c3a]">
        <div className="text-center">
          <span className="text-[11px] font-bold text-[#FF9933] uppercase block">Home Team</span>
          <div className="text-3xl font-black font-mono text-white mt-0.5">{room.scores.home}</div>
        </div>
        <div className="text-xl font-bold text-gray-600 font-mono">VS</div>
        <div className="text-center">
          <span className="text-[11px] font-bold text-[#05d9e8] uppercase block">Away Team</span>
          <div className="text-3xl font-black font-mono text-white mt-0.5">{room.scores.away}</div>
        </div>
      </div>

      {/* Battle in progress: prompt who won! */}
      {isPlayingCurrentBattle && (
        <div className="p-5 rounded-xl bg-[#14171f] border border-[#262c3a] text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-white font-bold text-base font-outfit uppercase">
            <Swords className="w-5 h-5 text-[#FF9933]" />
            <span>Battle {currentBattle.battleNumber} in Progress</span>
          </div>

          <p className="text-xs text-gray-300 max-w-lg mx-auto">
            When all 9 stocks of either team are depleted, record the winning team below to initiate subsequent stage counterpicks:
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
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
      )}

      {/* Counterpick Stage Selection Phase for subsequent games */}
      {!isPlayingCurrentBattle && currentBattle?.status === 'striking' && prevBattle && (
        <div className="space-y-4">
          {/* Rules Reminder Callout */}
          <div className="p-4 rounded-xl bg-[#0a0c10] border border-[#262c3a] space-y-2">
            <h4 className="text-xs font-black text-[#FF9933] uppercase tracking-wider font-outfit flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#FF9933]" />
              Battle {currentBattle.battleNumber} Counterpick Rules
            </h4>
            <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside leading-relaxed">
              <li>
                <strong className="text-white">Winning Team ({prevBattle.winner?.toUpperCase()})</strong> declares their player &amp; character FIRST in Discord / Fenworks.
              </li>
              <li>
                <strong className="text-white">Losing Team</strong> declares their player &amp; character SECOND.
              </li>
              <li>
                <strong className="text-white">Winner strikes {room.mode === 'crews' ? '3 stages' : '2 stages'}</strong> from the pool.
              </li>
              <li>
                <strong className="text-white">Loser picks</strong> the battle stage from the remaining stages.
              </li>
              <li className="text-amber-300 font-semibold">
                Dave's Stupid Rule (DSR): You CANNOT pick a stage your team has already won on in this match!
              </li>
            </ol>
          </div>

          {/* Turn Banner */}
          {(() => {
            const bansNeeded = room.mode === 'crews' ? 3 : 2;
            const bansMade = currentBattle.bannedStages.filter((b) => b.by !== 'auto').length;
            const isWinnerBanning = bansMade < bansNeeded;
            const winnerTeam = prevBattle.winner;
            const loserTeam = winnerTeam === 'home' ? 'away' : 'home';

            const activeTeam = isWinnerBanning ? winnerTeam : loserTeam;
            const isMyTurn = activeTeam === myRole;

            return (
              <div
                className={`p-3 rounded-xl border text-center font-bold text-sm tracking-wide font-outfit uppercase transition-all ${
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
                      : 'Choose Stage for Battle'}
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

          {/* Stage Grid with DSR and Bans */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fullPool.map((stage) => {
              const banData = currentBattle.bannedStages.find((b) => b.stageId === stage.id);
              const isAutoBanned = banData?.by === 'auto';
              const isBanned = !!banData;

              const bansNeeded = room.mode === 'crews' ? 3 : 2;
              const bansMade = currentBattle.bannedStages.filter((b) => b.by !== 'auto').length;
              const isWinnerBanning = bansMade < bansNeeded;
              const activeTeam = isWinnerBanning
                ? prevBattle.winner
                : prevBattle.winner === 'home'
                ? 'away'
                : 'home';

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
                      <span className="text-[9px] text-gray-400">Previous Win</span>
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
