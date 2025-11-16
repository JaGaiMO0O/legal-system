import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CourtsService, CourtType, CourtLevel } from '../../shared/services/courts.service';

@Component({
  standalone: true,
  selector: 'app-courts-settings',
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <h3 class="text-md font-semibold mb-3">{{ 'courts.title' | translate }}</h3>
    <div class="flex items-center gap-2 mb-4">
      <input
        class="border rounded px-2 py-1 text-sm"
        [(ngModel)]="newName"
        [placeholder]="'courts.new.placeholder' | translate"
      />
      <button class="px-2 py-1 border rounded text-sm" (click)="add()">
        {{ 'courts.new.add' | translate }}
      </button>
    </div>
    <div class="space-y-3">
      <div *ngFor="let t of types" class="border rounded p-3">
        <div class="flex items-center justify-between">
          <input
            class="border rounded px-2 py-1 text-sm font-medium"
            [(ngModel)]="t.name"
            (blur)="saveName(t)"
          />
          <button class="text-xs text-red-600" (click)="remove(t.id)">
            {{ 'actions.delete' | translate }}
          </button>
        </div>
        <div class="mt-2 text-sm">
          <div class="font-medium mb-1">{{ 'courts.levels' | translate }}</div>
          <div class="flex flex-wrap gap-2">
            <label class="inline-flex items-center gap-1" *ngFor="let lvl of allLevels">
              <input
                type="checkbox"
                [checked]="hasLevel(t, lvl)"
                (change)="toggleLevel(t, lvl, $event)"
              />
              <span>{{ 'courts.level.' + lvl | translate }}</span>
            </label>
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ 'courts.levels.hint' | translate }}</div>
        </div>
      </div>
    </div>
  `,
})
export class CourtsSettingsComponent {
  private readonly courts = inject(CourtsService);
  protected newName = '';

  get types(): CourtType[] {
    return this.courts.list();
  }

  readonly allLevels: CourtLevel[] = ['primary', 'appeal', 'cassation', 'execution'];

  add(): void {
    const name = this.newName.trim();
    if (!name) return;
    this.courts.create(name);
    this.newName = '';
  }

  remove(id: string): void {
    this.courts.remove(id);
  }

  saveName(t: CourtType): void {
    const name = (t.name || '').trim();
    if (!name) return;
    this.courts.update(t.id, { name });
  }

  hasLevel(t: CourtType, lvl: CourtLevel): boolean {
    return t.levels.includes(lvl);
  }

  toggleLevel(t: CourtType, lvl: CourtLevel, ev: Event): void {
    const el = ev.target as HTMLInputElement | null;
    const set = new Set(t.levels);
    if (el && el.checked) set.add(lvl);
    else set.delete(lvl);
    // keep order by allLevels
    const next = this.allLevels.filter((l) => set.has(l));
    this.courts.update(t.id, { levels: next });
  }
}
