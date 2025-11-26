import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UndoableAction {
  id: string;
  type: string;
  description: string;
  undo: () => void;
  redo: () => void;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class UndoRedoService {
  private undoStack: UndoableAction[] = [];
  private redoStack: UndoableAction[] = [];
  private maxStackSize = 10;
  private actions$ = new BehaviorSubject<{ canUndo: boolean; canRedo: boolean }>({
    canUndo: false,
    canRedo: false,
  });

  getActions(): Observable<{ canUndo: boolean; canRedo: boolean }> {
    return this.actions$.asObservable();
  }

  record(action: Omit<UndoableAction, 'id' | 'timestamp'>): void {
    const fullAction: UndoableAction = {
      ...action,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    // Add to undo stack
    this.undoStack.push(fullAction);
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }

    // Clear redo stack when new action is recorded
    this.redoStack = [];

    this.updateState();
  }

  undo(): UndoableAction | null {
    if (this.undoStack.length === 0) {
      return null;
    }

    const action = this.undoStack.pop()!;
    action.undo();
    this.redoStack.push(action);
    this.updateState();
    return action;
  }

  redo(): UndoableAction | null {
    if (this.redoStack.length === 0) {
      return null;
    }

    const action = this.redoStack.pop()!;
    action.redo();
    this.undoStack.push(action);
    this.updateState();
    return action;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.updateState();
  }

  private updateState(): void {
    this.actions$.next({
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });
  }

  private generateId(): string {
    return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
