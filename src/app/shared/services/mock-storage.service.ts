import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type StoreShape = Record<string, unknown>;

const NAMESPACE = 'legal-portal-store-v1';

@Injectable({ providedIn: 'root' })
export class MockStorageService {
  private memory: StoreShape = {};
  private subjects = new Map<string, BehaviorSubject<any>>();

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem(NAMESPACE);
      if (raw) {
        this.memory = JSON.parse(raw) as StoreShape;
      }
    } catch {
      this.memory = {};
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(NAMESPACE, JSON.stringify(this.memory));
    } catch {
      // ignore quota errors in mock
    }
  }

  get<T>(key: string, fallback: T): T {
    const value = this.memory[key];
    return (value as T) ?? fallback;
  }

  set<T>(key: string, value: T): void {
    this.memory[key] = value as unknown;
    this.persist();
    this.next(key);
  }

  update<T>(key: string, updater: (current: T) => T, fallback: T): T {
    const current = this.get<T>(key, fallback);
    const nextValue = updater(current);
    this.set<T>(key, nextValue);
    return nextValue;
  }

  watch<T>(key: string, initial: T): Observable<T> {
    let subject = this.subjects.get(key) as BehaviorSubject<T> | undefined;
    if (!subject) {
      subject = new BehaviorSubject<T>(this.get<T>(key, initial));
      this.subjects.set(key, subject as unknown as BehaviorSubject<any>);
    }
    return subject.asObservable();
  }

  private next(key: string): void {
    const subject = this.subjects.get(key);
    if (subject) {
      subject.next(this.memory[key]);
    }
  }
}
