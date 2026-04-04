import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CourtLevel, CourtsService, CourtType } from '../../shared/services/courts.service';

const LEVEL_OPTIONS: { value: CourtLevel; label: string }[] = [
  { value: 'primary', label: 'Primary Court' },
  { value: 'appeal', label: 'Appeal Court' },
  { value: 'cassation', label: 'Cassation Court' },
  { value: 'execution', label: 'Execution Court' },
];

@Component({
  standalone: true,
  selector: 'app-court-detail',
  imports: [CommonModule, FormsModule, TranslateModule, ButtonModule, CardModule],
  template: `
    <div class="mb-6">
      <button
        (click)="cancel()"
        class="mb-4 flex items-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Courts
      </button>
      <h2 class="text-2xl font-bold">{{ court.id ? 'Edit Court Type' : 'New Court Type' }}</h2>
    </div>

    <p-card>
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Name</label>
          <input
            type="text"
            [(ngModel)]="court.name"
            class="w-full"
            placeholder="e.g., Civil Court"
          />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-2"
            >Levels (order matters)</label
          >
          <div class="space-y-2">
            <label
              *ngFor="let opt of levelOptions"
              class="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-[rgb(var(--surface-muted))]"
            >
              <input
                type="checkbox"
                [checked]="isLevelSelected(opt.value)"
                (change)="toggleLevel(opt.value, $event)"
              />
              <span class="text-sm font-medium">{{ opt.label }}</span>
            </label>
          </div>
          <p class="text-xs text-[rgb(var(--text-muted))] mt-2">
            Selected in order of escalation: {{ court.levels.join(' → ') || 'None' }}
          </p>
        </div>
      </div>
    </p-card>

    <div class="mt-6 flex gap-2">
      <p-button severity="primary" (click)="save()" label="Save"></p-button>
      <p-button [outlined]="true" (click)="cancel()" label="Cancel"></p-button>
      <p-button *ngIf="court.id" [outlined]="true" class="text-red-600" (click)="remove()">
        Delete
      </p-button>
    </div>
  `,
})
export class CourtDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly courtsService = inject(CourtsService);

  protected court: CourtType = this.createEmpty();
  protected levelOptions = LEVEL_OPTIONS;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.courtsService.list().find((c) => c.id === id);
      if (existing) {
        this.court = { ...existing };
      }
    }
  }

  private createEmpty(): CourtType {
    const now = new Date().toISOString();
    return {
      id: '',
      name: '',
      levels: ['primary', 'appeal', 'cassation', 'execution'],
      createdAt: now,
      updatedAt: now,
    };
  }

  isLevelSelected(level: CourtLevel): boolean {
    return this.court.levels.includes(level);
  }

  toggleLevel(level: CourtLevel, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.court.levels.includes(level)) {
        this.court.levels = [...this.court.levels, level];
      }
    } else {
      this.court.levels = this.court.levels.filter((l) => l !== level);
    }
    // Preserve the intended escalation order based on LEVEL_OPTIONS
    this.court.levels = LEVEL_OPTIONS.map((opt) => opt.value).filter((lvl) =>
      this.court.levels.includes(lvl),
    );
  }

  save(): void {
    if (!this.court.name.trim()) return;
    if (this.court.levels.length === 0) return;
    if (this.court.id) {
      this.courtsService.update(this.court.id, {
        name: this.court.name.trim(),
        levels: [...this.court.levels],
      });
    } else {
      this.courtsService.create(this.court.name.trim(), [...this.court.levels]);
    }
    this.router.navigate(['/courts']);
  }

  remove(): void {
    if (!this.court.id) return;
    this.courtsService.remove(this.court.id);
    this.router.navigate(['/courts']);
  }

  cancel(): void {
    this.router.navigate(['/courts']);
  }
}
