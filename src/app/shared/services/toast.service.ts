import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * ToastService - Wrapper around PrimeNG MessageService for backward compatibility
 * All existing toast calls will continue to work, but now use PrimeNG toasts
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly messageService = inject(MessageService);

  show(message: string, type: ToastType = 'info', duration: number = 3000): void {
    const severity =
      type === 'error'
        ? 'error'
        : type === 'warning'
          ? 'warn'
          : type === 'success'
            ? 'success'
            : 'info';
    const life = duration > 0 ? duration : undefined;

    this.messageService.add({
      severity,
      summary: this.getSummary(type),
      detail: message,
      life,
    });
  }

  success(message: string, duration?: number): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: duration,
    });
  }

  error(message: string, duration?: number): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: duration || 5000,
    });
  }

  info(message: string, duration?: number): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Information',
      detail: message,
      life: duration,
    });
  }

  warning(message: string, duration?: number): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: message,
      life: duration,
    });
  }

  // Legacy methods for backward compatibility (no-op since PrimeNG handles removal automatically)
  remove(id: string): void {
    // PrimeNG handles toast removal automatically
  }

  clear(): void {
    this.messageService.clear();
  }

  private getSummary(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
      default:
        return 'Information';
    }
  }
}
