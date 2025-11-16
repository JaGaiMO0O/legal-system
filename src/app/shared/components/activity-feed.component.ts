import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService, AuditRecord } from '../../shared/services/audit.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="border-l pl-3 max-h-96 overflow-auto">
      <div class="font-semibold mb-2">{{ 'activity.title' | translate }}</div>
      <div *ngFor="let r of items" class="text-sm py-1 border-b">
        <div class="text-gray-700">{{ r.action }}</div>
        <div class="text-gray-500 text-xs">{{ r.occurredAt | date: 'short' }}</div>
      </div>
      <div *ngIf="items.length === 0" class="text-xs text-gray-500">
        {{ 'activity.empty' | translate }}
      </div>
    </div>
  `,
})
export class ActivityFeedComponent {
  private readonly audit = inject(AuditService);
  @Input() limit = 30;

  get items(): AuditRecord[] {
    return this.audit.list(this.limit);
  }
}
