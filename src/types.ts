export interface Stage {
  id: string;
  name: string;
  img: string;
  isStarter?: boolean;
}

export type TeamRole = 'home' | 'away';

export interface ArenaInfo {
  id: string;
  password?: string;
  updatedAt?: number;
}

export interface MutualStageState {
  enabled: boolean;
  homeCommitment?: string; // SHA256(stageId + ":" + salt)
  awayCommitment?: string;
  homeRevealed?: { stageId: string; salt: string };
  awayRevealed?: { stageId: string; salt: string };
  status: 'pending' | 'agreed' | 'mismatched' | 'skipped';
  matchedStageId?: string;
  skippedBy?: TeamRole;
}

export interface BanAction {
  stageId: string;
  by: TeamRole | 'auto';
  stepIndex: number;
}

export interface CharacterDeclaration {
  switching: boolean;
  characterName?: string;
  declaredAt?: number;
}

export interface BattleState {
  battleNumber: number; // 1, 2, 3
  status: 'striking' | 'in_progress' | 'complete';
  selectedStageId?: string;
  winner?: TeamRole;
  bannedStages: BanAction[];
  stepIndex: number; // Index in striking sequence
  winnerCharacter?: CharacterDeclaration;
  loserCharacter?: CharacterDeclaration;
}

export interface MatchRoom {
  roomId: string;
  createdAt: number;
  lastUpdated: number;
  mode: 'crews' | 'solos';

  // Connected roles & presence
  homeConnected: boolean;
  awayConnected: boolean;

  // Switch Arena Lobby Info (Optional)
  arena?: ArenaInfo;

  // Phase 3: Mutual Friendly Starting Stage Pick
  mutualStage?: MutualStageState;

  // Current battle index (0 = Battle 1, 1 = Battle 2, 2 = Battle 3)
  currentBattleIndex: number;
  battles: BattleState[];

  // Scores
  scores: {
    home: number;
    away: number;
  };

  matchComplete: boolean;
  matchWinner?: TeamRole;

  // Undo history stack
  history?: Array<Partial<MatchRoom>>;
}
