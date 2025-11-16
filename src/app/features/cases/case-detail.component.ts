import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-case-detail',
  imports: [CommonModule],
  template: `
    <h2 class="text-lg font-semibold mb-4">Case Detail</h2>
    <p>Case ID: {{ id }}</p>
  `,
})
export class CaseDetailComponent {
  id = this.route.snapshot.paramMap.get('id');
  constructor(private route: ActivatedRoute) {}
}
