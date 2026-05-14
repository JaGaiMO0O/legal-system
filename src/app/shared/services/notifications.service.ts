import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CasesService } from './cases.service';
import { MockStorageService } from './mock-storage.service';

export type NotificationType = 'deadline' | 'ruling' | 'settlement' | 'arbitration' | 'case';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  caseNumber?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'notifications';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly storage = inject(MockStorageService);
  private readonly casesService = inject(CasesService);
  private readonly notifications$ = new BehaviorSubject<Notification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    const notifications = this.storage.get<Notification[]>(STORAGE_KEY, []);
    if (notifications.length === 0) {
      this.seedData();
      const seeded = this.storage.get<Notification[]>(STORAGE_KEY, []);
      this.notifications$.next(seeded);
      this.updateUnreadCount(seeded);
    } else {
      this.notifications$.next(notifications);
      this.updateUnreadCount(notifications);
    }
  }

  list(): Notification[] {
    return this.notifications$.value;
  }

  watchNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  getUnreadCount(): number {
    return this.unreadCount$.value;
  }

  watchUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  getUnreadNotifications(): Notification[] {
    return this.list().filter((n) => !n.read);
  }

  markAsRead(id: string): void {
    const notifications = this.list();
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveNotifications(updated);
  }

  markAllAsRead(): void {
    const notifications = this.list().map((n) => ({ ...n, read: true }));
    this.saveNotifications(notifications);
  }

  delete(id: string): void {
    const notifications = this.list().filter((n) => n.id !== id);
    this.saveNotifications(notifications);
  }

  create(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const now = new Date().toISOString();
    const newNotification: Notification = {
      id: this.generateId(),
      ...notification,
      read: false,
      createdAt: now,
    };
    const notifications = [newNotification, ...this.list()];
    this.saveNotifications(notifications);
    return newNotification;
  }

  private saveNotifications(notifications: Notification[]): void {
    this.storage.set(STORAGE_KEY, notifications);
    this.notifications$.next(notifications);
    this.updateUnreadCount(notifications);
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const unread = notifications.filter((n) => !n.read).length;
    this.unreadCount$.next(unread);
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private seedData(): void {
    const now = new Date();
    const cases = this.casesService.list();
    const notifications: Notification[] = [];

    // Generate notifications based on cases
    cases.forEach((c, index) => {
      // Deadline approaching notifications
      c.deadlines.forEach((deadline) => {
        const deadlineDate = new Date(deadline.date);
        const daysUntil = Math.floor(
          (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysUntil >= 0 && daysUntil <= 7) {
          const when =
            daysUntil === 0 ? 'اليوم' : daysUntil === 1 ? 'غدًا' : `خلال ${daysUntil} أيام`;
          notifications.push({
            id: this.generateId(),
            type: 'deadline',
            title: 'موعد نهائي قريب',
            message: `الموعد «${deadline.title}» للقضية رقم ${c.caseNumber} ${when}.`,
            caseNumber: c.caseNumber,
            link: `/legal/case/${c.id}`,
            read: false,
            createdAt: new Date(
              now.getTime() - (7 - daysUntil) * 24 * 60 * 60 * 1000,
            ).toISOString(),
          });
        }
      });

      // Ruling required notifications
      if (c.stage !== 'settled' && c.stage !== 'execution') {
        const hasRuling = c.rulings?.some((r) => r.stage === c.stage);
        if (!hasRuling && c.stage !== 'primary') {
          notifications.push({
            id: this.generateId(),
            type: 'ruling',
            title: 'مطلوب تسجيل حكم',
            message: `القضية رقم ${c.caseNumber} في مرحلة لاحقة تحتاج حكمًا محكومًا قبل المتابعة.`,
            caseNumber: c.caseNumber,
            link: `/legal/case/${c.id}`,
            read: index % 3 !== 0, // Some are read
            createdAt: new Date(now.getTime() - index * 2 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }

      // Case settled notifications
      if (c.stage === 'settled' && c.settledStatus === 2) {
        const settledDate = new Date(c.updatedAt);
        const daysSince = Math.floor(
          (now.getTime() - settledDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSince <= 7) {
          notifications.push({
            id: this.generateId(),
            type: 'settlement',
            title: 'تم تسوية القضية',
            message: `اكتملت التسوية القانونية للقضية رقم ${c.caseNumber}.`,
            caseNumber: c.caseNumber,
            link: `/legal/case/${c.id}`,
            read: false,
            createdAt: c.updatedAt,
          });
        }
      }
    });

    // Add some general notifications
    notifications.push(
      {
        id: this.generateId(),
        type: 'case',
        title: 'قضية جديدة',
        message: 'تمت إضافة قضية جديدة إلى النظام.',
        read: false,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: this.generateId(),
        type: 'arbitration',
        title: 'جلسة تحكيم',
        message: 'تم جدولة جلسة تحكيم للأسبوع القادم.',
        read: true,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    );

    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.storage.set(STORAGE_KEY, notifications);
  }
}
