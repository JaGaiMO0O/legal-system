import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { UndoRedoService } from '../../services/undo-redo.service';

@Component({
  standalone: true,
  selector: 'app-undo-redo',
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="flex items-center gap-2" *ngIf="canUndo || canRedo">
      <p-button
        [outlined]="true"
        (click)="undo()"
        [disabled]="!canUndo"
        [size]="'small'"
        aria-label="Undo last action"
        icon="pi pi-undo"
        label="Undo"
      ></p-button>
      <p-button
        [outlined]="true"
        (click)="redo()"
        [disabled]="!canRedo"
        [size]="'small'"
        aria-label="Redo last action"
        icon="pi pi-refresh"
        label="Redo"
      ></p-button>
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
