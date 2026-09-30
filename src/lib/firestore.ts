import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { MatchRoom, TeamRole, BattleState, CharacterDeclaration } from '../types';
import { CREWS_POOL, CREWS_GAME1_STEPS, SOLOS_GAME1_STEPS, SOLOS_STARTERS } from '../data/stages';
import { verifyStageChoice } from './crypto';

const COLLECTION_NAME = 'ssbu_rooms';

function createSnapshotHistory(data: MatchRoom): Array<Partial<MatchRoom>> {
  const snapshot = JSON.parse(JSON.stringify(data));
  delete snapshot.history;
  const history = data.history || [];
  return [...history, snapshot].slice(-15);
}

export function getInitialRoom(roomId: string, mode: 'crews' | 'solos' = 'crews'): MatchRoom {
  const initialBattle: BattleState = {
    battleNumber: 1,
    status: 'striking',
    bannedStages: [],
    stepIndex: 0
  };

  return {
    roomId: roomId.toUpperCase(),
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    mode,
    homeConnected: false,
    awayConnected: false,
    currentBattleIndex: 0,
    battles: [initialBattle],
    scores: { home: 0, away: 0 },
    matchComplete: false,
    mutualStage: {
      enabled: true,
      status: 'pending'
    },
    history: []
  };
}

export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: MatchRoom | null) => void,
  onError?: (err: Error) => void
) {
  const roomRef = doc(db, COLLECTION_NAME, roomId.toUpperCase());
  return onSnapshot(
    roomRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as MatchRoom);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function createOrGetRoom(
  roomId: string,
  mode: 'crews' | 'solos' = 'crews'
): Promise<MatchRoom> {
  const upperId = roomId.toUpperCase();
  const roomRef = doc(db, COLLECTION_NAME, upperId);
  const snap = await getDoc(roomRef);

  if (snap.exists()) {
    return snap.data() as MatchRoom;
  }

  const initial = getInitialRoom(upperId, mode);
  await setDoc(roomRef, initial);
  return initial;
}

export async function claimTeamRole(
  roomId: string,
  role: TeamRole,
  connected: boolean
): Promise<void> {
  const roomRef = doc(db, COLLECTION_NAME, roomId.toUpperCase());
  const field = role === 'home' ? 'homeConnected' : 'awayConnected';
  await updateDoc(roomRef, {
    [field]: connected,
    lastUpdated: Date.now()
  });
}

export async function updateArenaInfo(
  roomId: string,
  arenaId: string,
  password?: string
): Promise<void> {
  const roomRef = doc(db, COLLECTION_NAME, roomId.toUpperCase());
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(roomRef);
    if (!snap.exists()) return;
    const data = snap.data() as MatchRoom;

    const newHistory = createSnapshotHistory(data);

    txn.update(roomRef, {
      arena: {
        id: arenaId.trim().toUpperCase(),
        password: password?.trim() || '',
        updatedAt: Date.now()
      },
      history: newHistory,
      lastUpdated: Date.now()
    });
  });
}

export async function submitMutualCommitment(
  roomId: string,
  role: TeamRole,
  commitment: string
): Promise<void> {
  const roomRef = doc(db, COLLECTION_NAME, roomId.toUpperCase());
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(roomRef);
    if (!snap.exists()) return;
    const data = snap.data() as MatchRoom;
    const newHistory = createSnapshotHistory(data);

    const currentMutual = data.mutualStage || { enabled: true, status: 'pending' };
    const updatedMutual = {
      ...currentMutual,
      enabled: true,
      status: 'pending' as const,
      [role === 'home' ? 'homeCommitment' : 'awayCommitment']: commitment
    };

    txn.update(roomRef, {
      mutualStage: updatedMutual,
      history: newHistory,
      lastUpdated: Date.now()
    });
  });
}

export async function clearMutualCommitment(
  roomId: string,
  role: TeamRole
): Promise<void> {
  const roomRef = doc(db, COLLECTION_NAME, roomId.toUpperCase());
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(roomRef);
    if (!snap.exists()) return;
    const data = snap.data() as MatchRoom;
    const newHistory = createSnapshotHistory(data);

    const currentMutual = data.mutualStage || { enabled: true, status: 'pending' };
    const updatedMutual: Record<string, any> = {
      ...currentMutual,
      enabled: true,
      status: 'pending' as const
    };

    if (role === 'home') {
      delete updatedMutual.homeCommitment;
      delete updatedMutual.homeRevealed;
    } else {
      delete updatedMutual.awayCommitment;
      delete updatedMutual.awayRevealed;
    }

    txn.update(roomRef, {
      mutualStage: updatedMutual,
      history: newHistory,
      lastUpdated: Date.now()
    });
  });
}

export async function revealMutualChoice(
  roomId: string,
  role: TeamRole,
  stageId: string,
  salt: string
): Promise<void> {
  const roomRef = doc(db, COLLECTION_NAME, roomId.toUpperCase());
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(roomRef);
    if (!snap.exists()) return;
    const data = snap.data() as MatchRoom;
    if (!data.mutualStage) return;

    const newHistory = createSnapshotHistory(data);

    const mutual = { ...data.mutualStage };
    if (role === 'home') {
      mutual.homeRevealed = { stageId, salt };
    } else {
      mutual.awayRevealed = { stageId, salt };
    }

    // If both revealed, resolve!
    if (mutual.homeRevealed && mutual.awayRevealed && mutual.homeCommitment && mutual.awayCommitment) {
      const homeValid = await verifyStageChoice(
        mutual.homeRevealed.stageId,
        mutual.homeRevealed.salt,
        mutual.homeCommitment
      );
      const awayValid = await verifyStageChoice(
        mutual.awayRevealed.stageId,
        mutual.awayRevealed.salt,
        mutual.awayCommitment
      );

      if (homeValid && awayValid && mutual.homeRevealed.stageId === mutual.awayRevealed.stageId) {
        // MATCH!
        mutual.status = 'agreed';
        mutual.matchedStageId = mutual.homeRevealed.stageId;

        // Auto-lock Battle 1 stage!
        const currentBattle = data.battles[data.currentBattleIndex];
        currentBattle.status = 'in_progress';
        currentBattle.selectedStageId = mutual.matchedStageId;
      } else {
        // MISMATCH
        mutual.status = 'mismatched';
      }

      // CRITICAL FOR PRIVACY:
      // Strip all revealed stage data, salts, and commitments immediately upon resolution
      delete mutual.homeRevealed;
      delete mutual.awayRevealed;
      delete mutual.homeCommitment;
      delete mutual.awayCommitment;
    }

    txn.update(roomRef, {
      mutualStage: mutual,
      battles: data.battles,
      history: newHistory,
      lastUpdated: Date.now()
    });
  });
}

export async function skipMutualStage(roomId: string, byRole?: TeamRole): Promise<void> {
  const roomRef = doc(db, COLLECTION_NAME, roomId.toUpperCase());
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(roomRef);
    if (!snap.exists()) return;
    const data = snap.data() as MatchRoom;
    const newHistory = createSnapshotHistory(data);

    const mutual = { ...(data.mutualStage || { enabled: false, status: 'skipped' as const }) };
    mutual.status = 'skipped';
    if (byRole) {
      mutual.skippedBy = byRole;
    }
    delete mutual.homeCommitment;
    delete mutual.awayCommitment;
    delete mutual.homeRevealed;
    delete mutual.awayRevealed;

    txn.update(roomRef, {
      mutualStage: mutual,
      history: newHistory,
      lastUpdated: Date.now()
    });
  });
}

export async function banOrPickStage(
  roomId: string,
  stageId: string,
  byRole: TeamRole
): Promise<void> {
  const roomRef = doc(db, COLLECTION_NAME, roomId.toUpperCase());
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(roomRef);
    if (!snap.exists()) return;
    const data = snap.data() as MatchRoom;

    const newHistory = createSnapshotHistory(data);

    const battle = data.battles[data.currentBattleIndex];
    if (!battle || battle.status !== 'striking') return;

    // Verify stage not already banned
    if (battle.bannedStages.some((b) => b.stageId === stageId)) return;

    // If mutual stage was pending and someone starts banning, automatically skip friendly!
    let mutual = data.mutualStage;
    if (mutual && mutual.status === 'pending') {
      mutual = { ...mutual, status: 'skipped', skippedBy: byRole };
      delete mutual.homeCommitment;
      delete mutual.awayCommitment;
      delete mutual.homeRevealed;
      delete mutual.awayRevealed;
    }

    const isGame1 = battle.battleNumber === 1;

    if (isGame1) {
      if (data.mode === 'crews') {
        const step = CREWS_GAME1_STEPS[battle.stepIndex];
        if (!step || step.team !== byRole) return;

        const newBans = [
          ...battle.bannedStages,
          { stageId, by: byRole, stepIndex: battle.stepIndex }
        ];
        const nextStepIndex = battle.stepIndex + 1;

        // If this was the last ban (step 7, so 8 bans total from 9 pool), the 1 remaining stage is selected!
        if (nextStepIndex >= CREWS_GAME1_STEPS.length) {
          const remaining = CREWS_POOL.find(
            (s) => !newBans.some((b) => b.stageId === s.id)
          );
          battle.bannedStages = newBans;
          battle.stepIndex = nextStepIndex;
          battle.selectedStageId = remaining?.id;
          battle.status = 'in_progress';
        } else {
          battle.bannedStages = newBans;
          battle.stepIndex = nextStepIndex;
        }
      } else {
        // Solos Game 1 (1-2-1)
        const step = SOLOS_GAME1_STEPS[battle.stepIndex];
        if (!step || step.team !== byRole) return;

        if (step.action === 'pick') {
          // Home picks from the 2 remaining
          battle.selectedStageId = stageId;
          battle.status = 'in_progress';
          battle.stepIndex = battle.stepIndex + 1;
        } else {
          const newBans = [
            ...battle.bannedStages,
            { stageId, by: byRole, stepIndex: battle.stepIndex }
          ];
          battle.bannedStages = newBans;
          battle.stepIndex = battle.stepIndex + 1;
        }
      }
    } else {
      // Subsequent Battles (Game 2 / 3)
      const prevBattle = data.battles[data.currentBattleIndex - 1];
      const prevWinner = prevBattle.winner;
      const prevLoser = prevWinner === 'home' ? 'away' : 'home';

      const bansNeeded = data.mode === 'crews' ? 3 : 2;
      const bansMade = battle.bannedStages.filter((b) => b.by !== 'auto').length;

      if (bansMade < bansNeeded) {
        // Must be winner banning
        if (byRole !== prevWinner) return;
        battle.bannedStages.push({
          stageId,
          by: byRole,
          stepIndex: battle.stepIndex
        });
        battle.stepIndex += 1;
      } else {
        // Loser picking
        if (byRole !== prevLoser) return;
        battle.selectedStageId = stageId;
        battle.status = 'in_progress';
      }
    }

    const updatePayload: Record<string, any> = {
      battles: data.battles,
      history: newHistory,
      lastUpdated: Date.now()
    };
    if (mutual) {
      updatePayload.mutualStage = mutual;
    }
    txn.update(roomRef, updatePayload);
  });
}

export async function recordBattleWinner(
  roomId: string,
  winnerRole: TeamRole
): Promise<void> {
  const roomRef = doc(db, COLLECTION_NAME, roomId.toUpperCase());
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(roomRef);
    if (!snap.exists()) return;
    const data = snap.data() as MatchRoom;

    const currentBattle = data.battles[data.currentBattleIndex];
    if (!currentBattle) return;

    // Take deep-cloned snapshot of state before modifying winner/scores
    const newHistory = createSnapshotHistory(data);

    currentBattle.winner = winnerRole;
    currentBattle.status = 'complete';

    // Update scores
    const newScores = {
      home: data.scores.home + (winnerRole === 'home' ? 1 : 0),
      away: data.scores.away + (winnerRole === 'away' ? 1 : 0)
    };

    // Series length: Crews is Best-of-3 (2 wins), Solos is Best-of-5 (3 wins)
    const targetWins = data.mode === 'crews' ? 2 : 3;
    const isFinished = newScores.home >= targetWins || newScores.away >= targetWins;

    if (isFinished) {
      data.matchComplete = true;
      data.matchWinner = newScores.home >= targetWins ? 'home' : 'away';
    } else {
      const nextBattleNumber = data.battles.length + 1;
      // The loser of this completed battle will be the team picking in the next battle
      const nextBattleLoser = winnerRole === 'home' ? 'away' : 'home';

      // DSR: Only auto-ban stages that the picking team (nextBattleLoser) has already won on in this match
      const autoBans = data.battles
        .filter((b) => b.winner === nextBattleLoser && b.selectedStageId)
        .map((b) => ({
          stageId: b.selectedStageId!,
          by: 'auto' as const,
          stepIndex: -1
        }));

      const nextBattle: BattleState = {
        battleNumber: nextBattleNumber,
        status: 'striking',
        bannedStages: autoBans,
        stepIndex: 0
      };

      data.currentBattleIndex += 1;
      data.battles.push(nextBattle);
    }

    const updatePayload: Record<string, any> = {
      battles: data.battles,
      scores: newScores,
      currentBattleIndex: data.currentBattleIndex,
      matchComplete: data.matchComplete,
      history: newHistory,
      lastUpdated: Date.now()
    };

    if (data.matchWinner) {
      updatePayload.matchWinner = data.matchWinner;
    }

    txn.update(roomRef, updatePayload);
  });
}

export async function undoLastAction(roomId: string): Promise<boolean> {
  const roomRef = doc(db, COLLECTION_NAME, roomId.toUpperCase());
  return await runTransaction(db, async (txn) => {
    const snap = await txn.get(roomRef);
    if (!snap.exists()) return false;
    const data = snap.data() as MatchRoom;

    const history = data.history || [];
    if (history.length === 0) return false;

    // Pop the latest state
    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    txn.set(roomRef, {
      ...previousState,
      history: newHistory,
      lastUpdated: Date.now()
    });

    return true;
  });
}

export async function resetRoomToInitial(roomId: string, mode: 'crews' | 'solos' = 'crews'): Promise<void> {
  const roomRef = doc(db, COLLECTION_NAME, roomId.toUpperCase());
  const initial = getInitialRoom(roomId, mode);
  await setDoc(roomRef, initial);
}

export async function declareBattleCharacter(
  roomId: string,
  isWinner: boolean,
  switching: boolean,
  characterName?: string
): Promise<void> {
  const roomRef = doc(db, COLLECTION_NAME, roomId.toUpperCase());
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(roomRef);
    if (!snap.exists()) return;
    const data = snap.data() as MatchRoom;

    const currentBattle = data.battles[data.currentBattleIndex];
    if (!currentBattle) return;

    const newHistory = createSnapshotHistory(data);

    const declaration: CharacterDeclaration = {
      switching,
      declaredAt: Date.now()
    };
    if (switching && characterName && characterName.trim()) {
      declaration.characterName = characterName.trim();
    }

    if (isWinner) {
      currentBattle.winnerCharacter = declaration;
    } else {
      currentBattle.loserCharacter = declaration;
    }

    txn.update(roomRef, {
      battles: data.battles,
      history: newHistory,
      lastUpdated: Date.now()
    });
  });
}
