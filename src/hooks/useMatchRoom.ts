import { useState, useEffect, useCallback } from 'react';
import { MatchRoom, TeamRole } from '../types';
import {
  subscribeToRoom,
  createOrGetRoom,
  claimTeamRole,
  updateArenaInfo,
  submitMutualCommitment,
  revealMutualChoice,
  skipMutualStage,
  banOrPickStage,
  recordBattleWinner,
  undoLastAction,
  resetRoomToInitial
} from '../lib/firestore';
import { hashStageChoice, generateSalt } from '../lib/crypto';

export function useMatchRoom() {
  const [roomId, setRoomId] = useState<string>('');
  const [room, setRoom] = useState<MatchRoom | null>(null);
  const [myRole, setMyRole] = useState<TeamRole | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check URL params on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('match') || params.get('id');
    if (roomParam) {
      const cleanId = roomParam.trim().toUpperCase();
      setRoomId(cleanId);
      joinRoom(cleanId);
    }
  }, []);

  // Restore stored role for this room
  useEffect(() => {
    if (!roomId) return;
    const stored = sessionStorage.getItem(`ssbu_role_${roomId}`);
    if (stored === 'home' || stored === 'away') {
      setMyRole(stored);
    }
  }, [roomId]);

  // Subscribe to room changes when roomId is set
  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToRoom(
      roomId,
      (updatedRoom) => {
        setRoom(updatedRoom);
        setLoading(false);
      },
      (err) => {
        console.error('Room subscription error:', err);
        setError('Failed to connect to match room. Please check your connection.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  const joinRoom = useCallback(async (id: string, mode: 'crews' | 'solos' = 'crews') => {
    const cleanId = id.trim().toUpperCase();
    if (!cleanId) return;

    try {
      setLoading(true);
      setError(null);
      setRoomId(cleanId);

      // Update URL query parameter without full reload
      const url = new URL(window.location.href);
      url.searchParams.set('room', cleanId);
      window.history.replaceState({}, '', url.toString());

      const data = await createOrGetRoom(cleanId, mode);
      setRoom(data);
    } catch (err: any) {
      console.error('Error joining room:', err);
      setError(err?.message || 'Could not join room');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectRole = useCallback(
    async (role: TeamRole) => {
      if (!roomId) return;
      try {
        setMyRole(role);
        sessionStorage.setItem(`ssbu_role_${roomId}`, role);
        await claimTeamRole(roomId, role, true);
      } catch (err: any) {
        console.error('Error claiming role:', err);
      }
    },
    [roomId]
  );

  const saveArena = useCallback(
    async (arenaId: string, password?: string) => {
      if (!roomId) return;
      try {
        await updateArenaInfo(roomId, arenaId, password);
      } catch (err: any) {
        console.error('Error updating arena:', err);
      }
    },
    [roomId]
  );

  const proposeMutualStage = useCallback(
    async (stageId: string) => {
      if (!roomId || !myRole) return;
      try {
        const salt = generateSalt();
        const commitment = await hashStageChoice(stageId, salt);

        // Store salt/stageId in session for reveal
        sessionStorage.setItem(`ssbu_mutual_${roomId}_${myRole}`, JSON.stringify({ stageId, salt }));

        await submitMutualCommitment(roomId, myRole, commitment);
      } catch (err: any) {
        console.error('Error submitting mutual stage:', err);
      }
    },
    [roomId, myRole]
  );

  // Auto-reveal if both commitments exist
  useEffect(() => {
    if (!roomId || !myRole || !room?.mutualStage) return;
    const mutual = room.mutualStage;

    if (mutual.homeCommitment && mutual.awayCommitment && mutual.status === 'pending') {
      const stored = sessionStorage.getItem(`ssbu_mutual_${roomId}_${myRole}`);
      if (stored) {
        try {
          const { stageId, salt } = JSON.parse(stored);
          const alreadyRevealed = myRole === 'home' ? mutual.homeRevealed : mutual.awayRevealed;
          if (!alreadyRevealed) {
            revealMutualChoice(roomId, myRole, stageId, salt);
          }
        } catch (e) {
          console.error('Failed to parse stored mutual pick:', e);
        }
      }
    }
  }, [roomId, myRole, room?.mutualStage]);

  const optOutMutual = useCallback(async () => {
    if (!roomId) return;
    try {
      await skipMutualStage(roomId);
    } catch (err) {
      console.error('Error opting out of mutual pick:', err);
    }
  }, [roomId]);

  const handleStageAction = useCallback(
    async (stageId: string) => {
      if (!roomId || !myRole) return;
      try {
        await banOrPickStage(roomId, stageId, myRole);
      } catch (err: any) {
        console.error('Error executing stage ban/pick:', err);
      }
    },
    [roomId, myRole]
  );

  const handleBattleWin = useCallback(
    async (winnerRole: TeamRole) => {
      if (!roomId) return;
      try {
        await recordBattleWinner(roomId, winnerRole);
      } catch (err: any) {
        console.error('Error recording winner:', err);
      }
    },
    [roomId]
  );

  const handleUndo = useCallback(async () => {
    if (!roomId) return;
    try {
      await undoLastAction(roomId);
    } catch (err: any) {
      console.error('Error executing undo:', err);
    }
  }, [roomId]);

  const handleReset = useCallback(async () => {
    if (!roomId) return;
    try {
      await resetRoomToInitial(roomId, room?.mode || 'crews');
    } catch (err: any) {
      console.error('Error resetting room:', err);
    }
  }, [roomId, room?.mode]);

  return {
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
  };
}
