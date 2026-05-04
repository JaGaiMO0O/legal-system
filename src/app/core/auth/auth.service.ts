import { Injectable, computed, signal } from '@angular/core';

const SESSION_KEY = 'legal-portal-auth-session';

export type AuthRole = 'admin' | 'lawyer';

export interface AuthSession {
  username: string;
  role: AuthRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionSignal = signal<AuthSession | null>(null);

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly role = computed(() => this.sessionSignal()?.role ?? null);
  readonly username = computed(() => this.sessionSignal()?.username ?? null);

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed?.username && (parsed.role === 'admin' || parsed.role === 'lawyer')) {
        this.sessionSignal.set(parsed);
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  login(username: string, password: string): boolean {
    const u = username.trim();
    const p = password;
    let session: AuthSession | null = null;
    if (u === 'admin' && p === 'admin') {
      session = { username: 'admin', role: 'admin' };
    } else if (u === 'lawyer' && p === 'lawyer') {
      session = { username: 'lawyer', role: 'lawyer' };
    }
    if (!session) return false;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.sessionSignal.set(null);
  }
}
