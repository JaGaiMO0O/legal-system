import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseStage } from '../../services/cases.service';

@Component({
  selector: 'app-case-workflow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="mode === 'compact' ? 'compact-workflow' : 'full-workflow'">
      <div
        class="flex items-center justify-between"
        [class.gap-2]="mode === 'compact'"
        [class.gap-4]="mode === 'full'"
      >
        <ng-container *ngFor="let stage of stages; let i = index; let isLast = last">
          <div class="flex items-center" [class.flex-1]="mode === 'full'">
            <!-- Stage Circle/Indicator -->
            <div
              class="flex flex-col items-center"
              [class.cursor-pointer]="mode === 'full'"
              [title]="getStageLabel(stage)"
            >
              <div
                class="rounded-full flex items-center justify-center font-semibold transition-all"
                [class]="getStageClasses(stage, i)"
              >
                <svg
                  *ngIf="isStageCompleted(stage)"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span *ngIf="!isStageCompleted(stage)" class="text-xs">{{ i + 1 }}</span>
              </div>
              <!-- Stage Label (full mode only) -->
              <span
                *ngIf="mode === 'full'"
                class="mt-2 text-xs font-medium text-center"
                [class.text-blue-600]="isCurrentStage(stage)"
                [class.text-gray-400]="isFutureStage(stage)"
                [class.text-gray-700]="isStageCompleted(stage)"
              >
                {{ getStageLabel(stage) }}
              </span>
            </div>
            <!-- Connector Line -->
            <div
              *ngIf="!isLast"
              class="flex-1 h-0.5 mx-2"
              [class.bg-blue-500]="isStageCompleted(stage)"
              [class.bg-gray-300]="!isStageCompleted(stage)"
            ></div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .full-workflow {
        padding: 1.5rem;
      }
      .compact-workflow {
        padding: 0.5rem 0;
      }
      .stage-circle {
        width: 2.5rem;
        height: 2.5rem;
      }
      .stage-circle-compact {
        width: 1.5rem;
        height: 1.5rem;
      }
      .stage-completed {
        background-color: rgb(34 197 94);
        color: white;
      }
      .stage-current {
        background-color: rgb(59 130 246);
        color: white;
        border: 2px solid rgb(147 197 253);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      .stage-future {
        background-color: rgb(243 244 246);
        color: rgb(156 163 175);
        border: 2px solid rgb(229 231 235);
      }
    `,
  ],
})
export class CaseWorkflowComponent {
  @Input() currentStage: CaseStage = 'primary';
  @Input() mode: 'full' | 'compact' = 'full';

  stages: CaseStage[] = ['primary', 'appeal', 'cassation', 'execution', 'settled'];

  getStageLabel(stage: CaseStage): string {
    const labels: Record<CaseStage, string> = {
      primary: 'Primary Court',
      appeal: 'Appeal Court',
      cassation: 'Cassation Court',
      execution: 'Execution Court',
      settled: 'Settled',
    };
    return labels[stage];
  }

  isStageCompleted(stage: CaseStage): boolean {
    const stageOrder: CaseStage[] = ['primary', 'appeal', 'cassation', 'execution', 'settled'];
    const currentIndex = stageOrder.indexOf(this.currentStage);
    const stageIndex = stageOrder.indexOf(stage);
    return stageIndex < currentIndex || this.currentStage === 'settled';
  }

  isCurrentStage(stage: CaseStage): boolean {
    return stage === this.currentStage && stage !== 'settled';
  }

  isFutureStage(stage: CaseStage): boolean {
    const stageOrder: CaseStage[] = ['primary', 'appeal', 'cassation', 'execution', 'settled'];
    const currentIndex = stageOrder.indexOf(this.currentStage);
    const stageIndex = stageOrder.indexOf(stage);
    return stageIndex > currentIndex && this.currentStage !== 'settled';
  }

  getStageClasses(stage: CaseStage, index: number): string {
    const baseClasses = this.mode === 'compact' ? 'stage-circle-compact' : 'stage-circle';

    if (this.isStageCompleted(stage)) {
      return `${baseClasses} stage-completed`;
    }
    if (this.isCurrentStage(stage)) {
      return `${baseClasses} stage-current`;
    }
    return `${baseClasses} stage-future`;
  }
}
