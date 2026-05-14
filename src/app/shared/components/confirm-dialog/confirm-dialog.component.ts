import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  standalone: true,
  selector: 'app-confirm-dialog',
  imports: [CommonModule, ButtonModule, TranslateModule],
  template: `
    <div
      *ngIf="dialogData() as data"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      (click)="handleBackdropClick($event)"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'dialog-title'"
    >
      <div
        class="card p-6 max-w-md w-full mx-4 shadow-lg animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start gap-4 mb-6 rtl:flex-row-reverse">
          <div
            class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
            [ngClass]="iconShellClass()"
          >
            <i
              *ngIf="data.type === 'danger'"
              class="pi pi-exclamation-triangle text-xl text-danger"
            ></i>
            <i
              *ngIf="data.type === 'warning'"
              class="pi pi-exclamation-circle text-xl text-warning"
            ></i>
            <i
              *ngIf="data.type === 'info' || !data.type"
              class="pi pi-info-circle text-xl text-[rgb(var(--primary))]"
            ></i>
          </div>
          <div class="flex-1 min-w-0">
            <h3 id="dialog-title" class="text-lg font-semibold text-[rgb(var(--text))] mb-2">
              {{ data.title }}
            </h3>
            <p class="text-sm text-[rgb(var(--text-muted))] leading-relaxed">{{ data.message }}</p>
          </div>
        </div>
        <div class="flex gap-3 justify-end flex-wrap rtl:flex-row-reverse">
          <p-button
            [outlined]="true"
            (click)="cancel()"
            [label]="data.cancelText || ('actions.cancel' | translate)"
          ></p-button>
          <p-button
            [severity]="data.type === 'danger' ? 'danger' : 'primary'"
            (click)="confirm()"
            [label]="data.confirmText || ('actions.confirm' | translate)"
          ></p-button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes scale-in {
        from {
          opacity: 0;
          transform: scale(0.98);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      .animate-fade-in {
        animation: fade-in 0.2s ease-out;
      }
      .animate-scale-in {
        animation: scale-in 0.2s ease-out;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  private readonly confirmDialogService = inject(ConfirmDialogService);

  readonly dialogData = toSignal(this.confirmDialogService.getDialog(), { initialValue: null });

  readonly iconShellClass = computed(() => {
    const d = this.dialogData();
    const t = d?.type;
    if (t === 'danger') return 'bg-[rgb(var(--tint-danger-bg))]';
    if (t === 'warning') return 'bg-[rgb(var(--tint-warning-bg))]';
    return 'bg-[rgb(var(--surface-info))]';
  });

  confirm(): void {
    this.confirmDialogService.handleResult(true);
  }

  cancel(): void {
    this.confirmDialogService.handleResult(false);
  }

  handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }
}
