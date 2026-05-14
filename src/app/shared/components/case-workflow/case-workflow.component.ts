import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, computed, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StepsModule } from 'primeng/steps';
import { LanguageService } from '../../../core/i18n/language.service';
import { CaseStage } from '../../services/cases.service';

interface MenuItem {
  label: string;
  command?: () => void;
}

@Component({
  selector: 'app-case-workflow',
  standalone: true,
  imports: [CommonModule, StepsModule],
  template: `
    <div
      class="case-workflow rounded-lg border border-[rgb(var(--border-light))] bg-[rgb(var(--surface))] p-4"
    >
      <p-steps [model]="stepsModel()" [activeIndex]="activeIndex()" [readonly]="true"></p-steps>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseWorkflowComponent {
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);

  @Input() currentStage: CaseStage = 'primary';
  @Input() mode: 'full' | 'compact' = 'full';

  private readonly stageOrder: CaseStage[] = [
    'primary',
    'appeal',
    'cassation',
    'execution',
    'settled',
  ];

  /** Label keys aligned with court levels + settled stage (reuses global i18n). */
  private static readonly stageLabelKeys = [
    'courts.level.primary',
    'courts.level.appeal',
    'courts.level.cassation',
    'courts.level.execution',
    'cases.stage.settled',
  ] as const;

  readonly stepsModel = computed((): MenuItem[] => {
    this.language.currentLang();
    return CaseWorkflowComponent.stageLabelKeys.map((key) => ({
      label: this.translate.instant(key),
    }));
  });

  activeIndex = computed(() => {
    const index = this.stageOrder.indexOf(this.currentStage);
    return index >= 0 ? index : 0;
  });
}
