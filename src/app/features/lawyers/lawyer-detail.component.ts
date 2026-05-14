import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Lawyer, LawyersService } from '../../shared/services/lawyers.service';

@Component({
  standalone: true,
  selector: 'app-lawyer-detail',
  imports: [CommonModule, FormsModule, TranslateModule, ButtonModule, CardModule],
  template: `
    <div class="mb-6">
      <button
        (click)="cancel()"
        class="mb-4 flex items-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition"
      >
        <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {{ 'lawyers.detail.backToList' | translate }}
      </button>
      <h2 class="text-2xl font-bold">
        {{
          lawyer.id
            ? ('lawyers.detail.editTitle' | translate)
            : ('lawyers.detail.newTitle' | translate)
        }}
      </h2>
    </div>

    <div class="flex flex-col gap-8">
      <p-card>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'lawyers.detail.name' | translate
            }}</label>
            <input type="text" [(ngModel)]="lawyer.name" class="w-full" />
          </div>
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'lawyers.detail.phone' | translate
            }}</label>
            <input type="text" [(ngModel)]="lawyer.phone" class="w-full" />
          </div>
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'lawyers.detail.email' | translate
            }}</label>
            <input type="email" [(ngModel)]="lawyer.email" class="w-full" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'lawyers.detail.address' | translate
            }}</label>
            <textarea [(ngModel)]="lawyer.address" rows="2" class="w-full"></textarea>
          </div>
          <div class="md:col-span-2" *ngIf="lawyer.id">
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'lawyers.detail.lawyerNumber' | translate
            }}</label>
            <input
              type="text"
              [value]="lawyer.lawyerNumber"
              readonly
              class="w-full font-mono bg-[rgb(var(--surface-muted))]"
            />
          </div>
        </div>
      </p-card>

      <div class="flex gap-2">
        <p-button
          severity="primary"
          (click)="save()"
          [label]="'actions.save' | translate"
        ></p-button>
        <p-button
          [outlined]="true"
          (click)="cancel()"
          [label]="'actions.cancel' | translate"
        ></p-button>
      </div>
    </div>
  `,
})
export class LawyerDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly lawyersService = inject(LawyersService);

  protected lawyer: Lawyer;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.lawyersService.getById(id);
      if (existing) {
        this.lawyer = { ...existing };
      } else {
        this.lawyer = this.createEmpty();
      }
    } else {
      this.lawyer = this.createEmpty();
    }
  }

  private createEmpty(): Lawyer {
    const now = new Date().toISOString();
    return {
      id: '',
      lawyerNumber: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      createdAt: now,
      updatedAt: now,
    };
  }

  save(): void {
    if (!this.lawyer.name.trim()) return;
    if (this.lawyer.id) {
      this.lawyersService.update(this.lawyer.id, {
        name: this.lawyer.name,
        phone: this.lawyer.phone,
        email: this.lawyer.email,
        address: this.lawyer.address,
      });
    } else {
      const created = this.lawyersService.create({
        name: this.lawyer.name,
        phone: this.lawyer.phone,
        email: this.lawyer.email,
        address: this.lawyer.address,
      });
      this.lawyer = created;
    }
    this.router.navigate(['/lawyers']);
  }

  cancel(): void {
    this.router.navigate(['/lawyers']);
  }
}
