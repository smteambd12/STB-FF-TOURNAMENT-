
import { User, Match, Transaction, MatchType, MatchMap, MatchVersion, TransactionStatus, SiteSettings } from '../types';

const INITIAL_MATCHES: Match[] = [];

const DEFAULT_SETTINGS: SiteSettings = {
  notice: "Welcome to STB FF TOURNAMENT! Best of luck to all fighters.",
  popupNotice: "Register for the upcoming Elite Battle and win ৳2000! Join now.",
  isPopupActive: true,
  bkashNumber: "017XXXXXXXX",
  nagadNumber: "018XXXXXXXX",
  rocketNumber: "019XXXXXXXX",
  paymentInstructions: "Please send money as PERSONAL only. Use your numeric ID as reference.",
  isMaintenance: false,
  globalRules: [
    "Room ID & Pass will be given 15 mins before match.",
    "Emulator not allowed unless specified.",
    "Hacking or teaming results in instant ban without refund."
  ],
  minWithdrawAmount: 100,
  isWithdrawEnabled: true,
  leaderboardTitle: "HALL OF FAME",
  leaderboardSubtitle: "The elite legends of STB battlefield."
};

class DBService {
  private getStorage<T,>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private setStorage<T,>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('storage_update'));
  }

  getUsers(): User[] { 
    return this.getStorage<User[]>('users', []);
  }
  
  getMatches(): Match[] { return this.getStorage<Match[]>('matches', INITIAL_MATCHES); }
  getTransactions(): Transaction[] { return this.getStorage<Transaction[]>('transactions', []); }
  getSettings(): SiteSettings { return this.getStorage<SiteSettings>('site_settings', DEFAULT_SETTINGS); }

  updateSettings(settings: SiteSettings) {
    this.setStorage('site_settings', settings);
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  generateNumericId(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  saveCurrentUser(user: User) {
    const users = this.getUsers();
    let existing = users.find(u => u.id === user.id);
    
    if (!existing) {
      user.numericId = this.generateNumericId();
    } else {
      user.numericId = existing.numericId;
    }

    this.setStorage('currentUser', user);
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) users[idx] = user;
    else users.push(user);
    this.setStorage('users', users);
  }

  isSystemAdmin(): boolean {
    return sessionStorage.getItem('is_system_admin') === 'true';
  }

  setSystemAdmin(status: boolean) {
    if (status) sessionStorage.setItem('is_system_admin', 'true');
    else sessionStorage.removeItem('is_system_admin');
    window.dispatchEvent(new Event('adminStatusChanged'));
  }

  updateMatch(match: Match) {
    const matches = this.getMatches();
    const idx = matches.findIndex(m => m.id === match.id);
    if (idx !== -1) matches[idx] = match;
    else matches.push(match);
    this.setStorage('matches', matches);
  }

  deleteMatch(matchId: string) {
    const matches = this.getMatches();
    const filtered = matches.filter(m => m.id !== matchId);
    this.setStorage('matches', filtered);
  }

  completeMatch(matchId: string, results: { userId: string, kills: number, earnings: number }[]) {
    const matches = this.getMatches();
    const mIdx = matches.findIndex(m => m.id === matchId);
    if (mIdx === -1) return;

    matches[mIdx].isCompleted = true;
    this.setStorage('matches', matches);

    const users = this.getUsers();
    results.forEach(res => {
      const uIdx = users.findIndex(u => u.id === res.userId);
      if (uIdx !== -1) {
        users[uIdx].totalKills += res.kills;
        users[uIdx].totalEarnings += res.earnings;
        users[uIdx].winningBalance += res.earnings;
        users[uIdx].totalMatchesJoined += 1;
      }
    });
    
    this.setStorage('users', users);
    const current = this.getCurrentUser();
    if (current) {
      const updatedProfile = users.find(u => u.id === current.id);
      if (updatedProfile) this.setStorage('currentUser', updatedProfile);
    }
  }

  addTransaction(tx: Transaction) {
    const txs = this.getTransactions();
    txs.push(tx);
    this.setStorage('transactions', txs);
  }

  updateTransaction(txId: string, status: TransactionStatus) {
    const txs = this.getTransactions();
    const idx = txs.findIndex(t => t.id === txId);
    if (idx !== -1) {
      const tx = txs[idx];
      tx.status = status;
      this.setStorage('transactions', txs);

      if (status === TransactionStatus.COMPLETED) {
        const users = this.getUsers();
        const uIdx = users.findIndex(u => u.id === tx.userId);
        if (uIdx !== -1) {
          if (tx.type === 'Deposit') {
            users[uIdx].depositBalance += tx.amount;
          }
          this.setStorage('users', users);
          const current = this.getCurrentUser();
          if (current && current.id === users[uIdx].id) {
            this.setStorage('currentUser', users[uIdx]);
          }
        }
      }
    }
  }
}

export const db = new DBService();
