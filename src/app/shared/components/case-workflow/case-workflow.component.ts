import { CommonModule } from '@angular/common';
import { Component, Input, computed } from '@angular/core';
import { StepsModule } from 'primeng/steps';
import { CaseStage } from '../../services/cases.service';

interface MenuItem {
  label: string;
  command?: () => void;
}

@Component({
  selector: 'app-case-workflow',
  standalone: true,
  imports: [CommonModule, StepsModule],
  template: ` <p-steps [model]="steps" [activeIndex]="activeIndex()" [readonly]="true"></p-steps> `,
})
export class CaseWorkflowComponent {
  @Input() currentStage: CaseStage = 'primary';
  @Input() mode: 'full' | 'compact' = 'full';

  private readonly stageOrder: CaseStage[] = [
    'primary',
    'appeal',
    'cassation',
    'execution',
    'settled',
  ];

  steps: MenuItem[] = [
    { label: 'Primary Court' },
    { label: 'Appeal Court' },
    { label: 'Cassation Court' },
    { label: 'Execution Court' },
    { label: 'Settled' },
  ];

  activeIndex = computed(() => {
    const index = this.stageOrder.indexOf(this.currentStage);
    return index >= 0 ? index : 0;
  });
}
