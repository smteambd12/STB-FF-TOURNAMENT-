
export enum MatchType {
  SOLO = 'Solo',
  DUO = 'Duo',
  SQUAD = 'Squad'
}

export enum MatchMap {
  BERMUDA = 'Bermuda',
  PURGATORY = 'Purgatory',
  KALAHARI = 'Kalahari',
  ALPINE = 'Alpine'
}

export enum MatchVersion {
  MOBILE = 'Mobile',
  PC = 'PC/Emulator'
}

export enum TransactionStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected'
}

export interface User {
  id: string;
  numericId: number; // For numeric display
  name: string;
  email: string;
  phone: string;
  depositBalance: number;
  winningBalance: number;
  totalKills: number;
  totalEarnings: number;
  totalMatchesJoined: number;
  isAdmin: boolean;
  avatarUrl?: string;
}

export interface Match {
  id: string;
  title: string;
  startTime: string;
  type: MatchType;
  map: MatchMap;
  version: MatchVersion;
  entryFee: number;
  prizePool: number;
  prizePerKill: number;
  totalSlots: number;
  joinedSlots: string[];
  rules: string[];
  roomId?: string;
  roomPass?: string;
  isCompleted: boolean;
  imageUrl?: string;
  isPointSystem: boolean;
  pointsPerKill: number;
  totalMatchesCount: number;
  positionPoints: { [rank: number]: number };
}

export interface Transaction {
  id: string;
  userId: string;
  userNumericId: number;
  amount: number;
  method: 'bKash' | 'Nagad' | 'Rocket';
  targetAccount: string; // The user's personal number for withdraw, or txid for deposit
  transactionId: string;
  type: 'Deposit' | 'Withdraw' | 'Match_Join_Payment';
  matchId?: string;
  matchTitle?: string;
  status: TransactionStatus;
  timestamp: string;
}

export interface SiteSettings {
  notice: string;
  popupNotice: string;
  isPopupActive: boolean;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  paymentInstructions: string;
  isMaintenance: boolean;
  globalRules: string[];
  minWithdrawAmount: number;
  isWithdrawEnabled: boolean;
  leaderboardTitle: string;
  leaderboardSubtitle: string;
}
