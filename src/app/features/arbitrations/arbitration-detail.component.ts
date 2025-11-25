import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import {
  ArbitrationsService,
  Arbitration,
  CompanyRepresentative,
  OppositionRepresentative,
  ArbitrationHearing,
} from '../../shared/services/arbitrations.service';

@Component({
  standalone: true,
  selector: 'app-arbitration-detail',
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
        Back to Arbitrations
      </button>
      <h2 class="text-2xl font-bold">Arbitration</h2>
    </div>

    <ui-card>
      <h3 class="font-semibold mb-4">Arbitration Info</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Appealability</label>
          <input type="text" [(ngModel)]="arbitration.appealability" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Filling Date</label>
          <input type="date" [(ngModel)]="fillingDate" class="w-full" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Case Description</label>
          <textarea [(ngModel)]="arbitration.caseDescription" rows="3" class="w-full"></textarea>
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Arbitration Room</label>
          <input type="text" [(ngModel)]="arbitration.arbitrationRoom" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Arbitration Fees</label>
          <input
            type="number"
            [(ngModel)]="arbitration.arbitrationFees"
            min="0"
            step="0.01"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Maximum Period</label>
          <input type="text" [(ngModel)]="arbitration.maximumPeriod" class="w-full" />
        </div>
      </div>
    </ui-card>

    <ui-card class="mt-6">
      <h3 class="font-semibold mb-4">Company Representative</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Lawyer Name</label>
          <input
            type="text"
            [(ngModel)]="arbitration.companyRepresentative.lawyerName"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Position</label>
          <input
            type="text"
            [(ngModel)]="arbitration.companyRepresentative.position"
            class="w-full"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Address</label>
          <textarea
            [(ngModel)]="arbitration.companyRepresentative.address"
            rows="2"
            class="w-full"
          ></textarea>
        </div>
      </div>
    </ui-card>

    <ui-card class="mt-6">
      <h3 class="font-semibold mb-4">Opposition Representative</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Lawyer Name</label>
          <input
            type="text"
            [(ngModel)]="arbitration.oppositionRepresentative.lawyerName"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Position</label>
          <input
            type="text"
            [(ngModel)]="arbitration.oppositionRepresentative.position"
            class="w-full"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Address</label>
          <textarea
            [(ngModel)]="arbitration.oppositionRepresentative.address"
            rows="2"
            class="w-full"
          ></textarea>
        </div>
      </div>
    </ui-card>

    <ui-card class="mt-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold">Hearings</h3>
        <div class="flex gap-2">
          <input
            type="date"
            [(ngModel)]="newHearingDate"
            class="border rounded px-2 py-1 text-sm"
          />
          <input
            type="text"
            [(ngModel)]="newHearingRemarks"
            placeholder="Remarks"
            class="border rounded px-2 py-1 text-sm"
          />
          <button class="px-2 py-1 border rounded text-sm" (click)="addHearing()">Add</button>
        </div>
      </div>
      <ul class="space-y-2">
        <li
          *ngFor="let hearing of arbitration.hearings"
          class="flex items-center justify-between border-b pb-2"
        >
          <div>
            <span class="font-medium">{{ hearing.date | date: 'short' }}</span>
            <span class="ml-2 text-sm text-[rgb(var(--text-muted))]">{{ hearing.remarks }}</span>
          </div>
          <button class="text-xs text-red-600" (click)="removeHearing(hearing.id)">Remove</button>
        </li>
        <li *ngIf="arbitration.hearings.length === 0" class="text-sm text-[rgb(var(--text-muted))]">
          No hearings scheduled
        </li>
      </ul>
    </ui-card>

    <div class="mt-6 flex gap-2">
      <ui-button variant="primary" (click)="save()">Save</ui-button>
      <ui-button variant="ghost" (click)="cancel()">Cancel</ui-button>
    </div>
  `,
})
export class ArbitrationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly arbitrationsService = inject(ArbitrationsService);

  protected arbitration: Arbitration;
  protected fillingDate: string = '';
  protected newHearingDate: string = '';
  protected newHearingRemarks: string = '';

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.arbitrationsService.getById(id);
      if (existing) {
        this.arbitration = { ...existing };
        this.fillingDate = existing.fillingDate ? existing.fillingDate.split('T')[0] : '';
      } else {
        this.arbitration = this.createEmptyArbitration();
      }
    } else {
      this.arbitration = this.createEmptyArbitration();
    }
  }

  private createEmptyArbitration(): Arbitration {
    return {
      id: '',
      appealability: '',
      fillingDate: '',
      caseDescription: '',
      arbitrationRoom: '',
      arbitrationFees: 0,
      maximumPeriod: '',
      companyRepresentative: { lawyerName: '', position: '', address: '' },
      oppositionRepresentative: { lawyerName: '', position: '', address: '' },
      hearings: [],
      createdAt: '',
      updatedAt: '',
    };
  }

  save(): void {
    this.arbitration.fillingDate = this.fillingDate ? new Date(this.fillingDate).toISOString() : '';

    if (this.arbitration.id) {
      this.arbitrationsService.update(this.arbitration.id, this.arbitration);
    } else {
      const created = this.arbitrationsService.create({
        appealability: this.arbitration.appealability,
        fillingDate: this.arbitration.fillingDate,
        caseDescription: this.arbitration.caseDescription,
        arbitrationRoom: this.arbitration.arbitrationRoom,
        arbitrationFees: this.arbitration.arbitrationFees,
        maximumPeriod: this.arbitration.maximumPeriod,
        companyRepresentative: this.arbitration.companyRepresentative,
        oppositionRepresentative: this.arbitration.oppositionRepresentative,
      });
      this.router.navigate(['/arbitrations', created.id]);
    }
  }

  cancel(): void {
    this.router.navigate(['/arbitrations']);
  }

  addHearing(): void {
    if (!this.newHearingDate) return;
    this.arbitrationsService.addHearing(this.arbitration.id, {
      date: new Date(this.newHearingDate).toISOString(),
      remarks: this.newHearingRemarks,
    });
    this.arbitration = this.arbitrationsService.getById(this.arbitration.id)!;
    this.newHearingDate = '';
    this.newHearingRemarks = '';
  }

  removeHearing(hearingId: string): void {
    this.arbitrationsService.removeHearing(this.arbitration.id, hearingId);
    this.arbitration = this.arbitrationsService.getById(this.arbitration.id)!;
  }
}
