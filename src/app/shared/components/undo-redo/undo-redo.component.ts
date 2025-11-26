import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UndoRedoService } from '../../services/undo-redo.service';
import { Subscription } from 'rxjs';
import { UIButtonComponent } from '../ui/button.component';
import { ToastService } from '../../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-undo-redo',
  imports: [CommonModule, UIButtonComponent],
  template: `
    <div class="flex items-center gap-2" *ngIf="canUndo || canRedo">
      <ui-button
        variant="ghost"
        (click)="undo()"
        [disabled]="!canUndo"
        class="text-sm"
        aria-label="Undo last action"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
        Undo
      </ui-button>
      <ui-button
        variant="ghost"
        (click)="redo()"
        [disabled]="!canRedo"
        class="text-sm"
        aria-label="Redo last action"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6-6m6 6l-6 6"
          />
        </svg>
        Redo
      </ui-button>
    </div>
  `,
})
export class UndoRedoComponent implements OnInit, OnDestroy {
  private readonly undoRedoService = inject(UndoRedoService);
  private readonly toast = inject(ToastService);
  protected canUndo = false;
  protected canRedo = false;
  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.undoRedoService.getActions().subscribe((state) => {
      this.canUndo = state.canUndo;
      this.canRedo = state.canRedo;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

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
