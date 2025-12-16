import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import { LawyersService, Lawyer } from '../../shared/services/lawyers.service';

@Component({
  standalone: true,
  selector: 'app-lawyer-detail',
  imports: [CommonModule, FormsModule, TranslateModule, UIButtonComponent, UICardComponent],
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
        Back to Lawyers
      </button>
      <h2 class="text-2xl font-bold">{{ lawyer.id ? 'Edit Lawyer' : 'New Lawyer' }}</h2>
    </div>

    <ui-card>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Name</label>
          <input type="text" [(ngModel)]="lawyer.name" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Phone</label>
          <input type="text" [(ngModel)]="lawyer.phone" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Email</label>
          <input type="email" [(ngModel)]="lawyer.email" class="w-full" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Address</label>
          <textarea [(ngModel)]="lawyer.address" rows="2" class="w-full"></textarea>
        </div>
        <div class="md:col-span-2" *ngIf="lawyer.id">
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Lawyer Number</label>
          <input
            type="text"
            [value]="lawyer.lawyerNumber"
            readonly
            class="w-full font-mono bg-[rgb(var(--surface-muted))]"
          />
        </div>
      </div>
    </ui-card>

    <div class="mt-6 flex gap-2">
      <ui-button variant="primary" (click)="save()">Save</ui-button>
      <ui-button variant="ghost" (click)="cancel()">Cancel</ui-button>
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
