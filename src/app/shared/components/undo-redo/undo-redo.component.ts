import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ToastService } from '../../services/toast.service';
import { UndoRedoService } from '../../services/undo-redo.service';

@Component({
  standalone: true,
  selector: 'app-undo-redo',
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="flex items-center gap-2" *ngIf="visible()">
      <p-button
        [outlined]="true"
        (click)="undo()"
        [disabled]="!canUndo()"
        [size]="'small'"
        aria-label="Undo last action"
        icon="pi pi-undo"
        label="Undo"
      ></p-button>
      <p-button
        [outlined]="true"
        (click)="redo()"
        [disabled]="!canRedo()"
        [size]="'small'"
        aria-label="Redo last action"
        icon="pi pi-refresh"
        label="Redo"
      ></p-button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UndoRedoComponent {
  private readonly undoRedoService = inject(UndoRedoService);
  private readonly toast = inject(ToastService);

  private readonly actions = toSignal(this.undoRedoService.getActions(), {
    initialValue: { canUndo: false, canRedo: false },
  });

  readonly canUndo = computed(() => this.actions().canUndo);
  readonly canRedo = computed(() => this.actions().canRedo);
  readonly visible = computed(() => this.canUndo() || this.canRedo());

  undo(): void {
    const action = this.undoRedoService.undo();
    if (action) {
      this.toast.info(`Undid: ${action.description}`);
    }
  }

  redo(): void {
    const action = this.undoRedoService.redo();
    if (action) {
      this.toast.info(`Redid: ${action.description}`);
    }
  }
}
