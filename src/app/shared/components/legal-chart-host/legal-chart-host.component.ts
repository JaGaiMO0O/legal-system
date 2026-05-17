import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { ChartModule } from 'primeng/chart';

export type LegalChartSize = 'md' | 'sm';

const PLOT_HEIGHT: Record<LegalChartSize, string> = {
  md: '240px',
  sm: '200px',
};

@Component({
  standalone: true,
  selector: 'app-legal-chart-host',
  imports: [ChartModule],
  template: `
    <div class="legal-chart-plot" [style.height]="plotHeight">
      <p-chart
        [type]="type"
        [data]="data"
        [options]="options"
        [height]="plotHeight"
        width="100%"
        [responsive]="true"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .legal-chart-plot {
        position: relative;
        width: 100%;
        overflow: hidden;
      }
      :host ::ng-deep p-chart {
        display: block;
        width: 100%;
        height: 100%;
      }
      :host ::ng-deep .p-chart {
        width: 100% !important;
        height: 100% !important;
        max-width: 100%;
        max-height: 100%;
      }
      :host ::ng-deep canvas {
        display: block;
        max-width: 100% !important;
        max-height: 100% !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalChartHostComponent {
  @Input({ required: true }) type!: 'bar' | 'line' | 'doughnut';
  @Input({ required: true }) data!: object;
  @Input({ required: true }) options!: ChartOptions;
  @Input() size: LegalChartSize = 'md';

  get plotHeight(): string {
    return PLOT_HEIGHT[this.size];
  }
}
