import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';

@Component({
  standalone: true,
  selector: 'app-case-detail',
  imports: [CommonModule, UIButtonComponent, UICardComponent],
  template: `
    <h2 class="mb-4">Case Detail</h2>
    <ui-card>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Case ID</label>
          <input type="text" [value]="id || ''" readonly />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Reference</label>
          <input type="text" value="PR-2025-001" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Title</label>
          <input type="text" value="Traffic accident claim" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Status</label>
          <select>
            <option>Open</option>
            <option>Hearing</option>
            <option>Closed</option>
            <option>On Hold</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Next Hearing</label>
          <input type="date" value="2025-12-05" />
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <ui-button variant="primary">Save</ui-button>
        <ui-button variant="ghost">Cancel</ui-button>
      </div>
    </ui-card>
  `,
})
export class CaseDetailComponent {
  id: string | null;
  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
  }
}
