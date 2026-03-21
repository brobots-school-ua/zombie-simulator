// Leaderboard system using localStorage
export interface LeaderboardEntry {
  name: string;
  score: number;
  wave: number;
  date: string;
}

const LB_KEY = 'zombie-sim-leaderboard';
const BEST_KEY = 'zombie-sim-personal-best';
const NICK_KEY = 'zombie-sim-nickname';
const MAX_ENTRIES = 20; // Store more, display top 5

export class LeaderboardManager {
  // Get/set nickname
  getNickname(): string {
    return localStorage.getItem(NICK_KEY) || '';
  }

  setNickname(name: string) {
    localStorage.setItem(NICK_KEY, name.trim());
  }

  // Get personal best score (works even without nickname)
  getPersonalBest(): number {
    const val = localStorage.getItem(BEST_KEY);
    return val ? parseInt(val, 10) : 0;
  }

  private setPersonalBest(score: number) {
    localStorage.setItem(BEST_KEY, score.toString());
  }

  // Get top N leaderboard entries
  getTop(count: number = 5): LeaderboardEntry[] {
    const data = localStorage.getItem(LB_KEY);
    if (!data) return [];
    try {
      const entries: LeaderboardEntry[] = JSON.parse(data);
      return entries
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
    } catch {
      return [];
    }
  }

  // Save result after game over
  saveResult(score: number, wave: number) {
    // Always update personal best
    if (score > this.getPersonalBest()) {
      this.setPersonalBest(score);
    }

    // Only add to leaderboard if nickname is set
    const name = this.getNickname();
    if (!name) return;

    const entry: LeaderboardEntry = {
      name,
      score,
      wave,
      date: new Date().toISOString().split('T')[0],
    };

    let entries: LeaderboardEntry[] = [];
    const data = localStorage.getItem(LB_KEY);
    if (data) {
      try {
        entries = JSON.parse(data);
      } catch { /* reset */ }
    }

    // One entry per player — update only if new score is higher
    const existing = entries.findIndex(e => e.name === name);
    if (existing >= 0) {
      if (entries[existing].score >= score) return; // old score is better
      entries[existing] = entry; // replace with new best
    } else {
      entries.push(entry);
    }

    entries.sort((a, b) => b.score - a.score);
    entries = entries.slice(0, MAX_ENTRIES);
    localStorage.setItem(LB_KEY, JSON.stringify(entries));
  }

  // Admin: add entry directly
  adminAdd(name: string, score: number, wave: number) {
    const entry: LeaderboardEntry = {
      name: name.trim(),
      score,
      wave,
      date: new Date().toISOString().split('T')[0],
    };

    let entries: LeaderboardEntry[] = [];
    const data = localStorage.getItem(LB_KEY);
    if (data) {
      try { entries = JSON.parse(data); } catch { /* reset */ }
    }

    const existing = entries.findIndex(e => e.name === entry.name);
    if (existing >= 0) {
      if (entries[existing].score < score) entries[existing] = entry;
    } else {
      entries.push(entry);
    }

    entries.sort((a, b) => b.score - a.score);
    entries = entries.slice(0, MAX_ENTRIES);
    localStorage.setItem(LB_KEY, JSON.stringify(entries));
  }

  // Admin: clear all leaderboard data
  clearLeaderboard() {
    localStorage.removeItem(LB_KEY);
    localStorage.removeItem(BEST_KEY);
  }
}

// Singleton
export const leaderboard = new LeaderboardManager();
