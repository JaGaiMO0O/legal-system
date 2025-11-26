import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private dialog$ = new BehaviorSubject<ConfirmDialogData | null>(null);
  private resolveCallback?: (confirmed: boolean) => void;

  getDialog(): Observable<ConfirmDialogData | null> {
    return this.dialog$.asObservable();
  }

  confirm(data: ConfirmDialogData): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.resolveCallback = resolve;
      this.dialog$.next(data);
    });
  }

  handleResult(confirmed: boolean): void {
    if (this.resolveCallback) {
      this.resolveCallback(confirmed);
      this.resolveCallback = undefined;
    }
    this.dialog$.next(null);
  }
}
