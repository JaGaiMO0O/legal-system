import { CommonModule, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { Chart, registerables } from 'chart.js';
import { LegalChartHostComponent } from '../../shared/components/legal-chart-host/legal-chart-host.component';
import { baseChartOptions } from '../../shared/config/chart-options';

Chart.register(...registerables);
import { LOCALE_CONFIG } from '../../shared/config/locale.config';
import {
  AnalyticsAggregationService,
  ChartDto,
} from '../../shared/services/analytics-aggregation.service';

interface ChartBlock {
  key: string;
  type: 'doughnut' | 'bar' | 'line';
  data: ChartDto;
  options: ReturnType<typeof baseChartOptions>;
  empty: boolean;
}

@Component({
  standalone: true,
  selector: 'app-analytics',
  imports: [CommonModule, TranslateModule, CardModule, DecimalPipe, LegalChartHostComponent],
  template: `
    <div class="mb-8">
      <h2 class="text-2xl md:text-3xl font-semibold text-[rgb(var(--text))] mb-2 tracking-tight">
        {{ 'analytics.title' | translate }}
      </h2>
      <p class="text-sm text-[rgb(var(--text-muted))]">{{ 'analytics.subtitle' | translate }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 legal-chart-card-grid">
      @for (block of charts; track block.key) {
        <p-card styleClass="h-full">
          <div class="legal-chart-card-inner">
            <h3 class="text-base font-semibold text-[rgb(var(--text))] mb-1">
              {{ 'analytics.charts.' + block.key + '.title' | translate }}
            </h3>
            <p class="text-xs text-[rgb(var(--text-muted))] legal-chart-card-desc">
              {{ 'analytics.charts.' + block.key + '.desc' | translate }}
            </p>
            @if (block.empty) {
              <div class="legal-chart-empty">
                <p class="text-sm text-[rgb(var(--text-muted))] text-center">
                  {{ 'analytics.empty' | translate }}
                </p>
              </div>
            } @else {
              <app-legal-chart-host
                [type]="block.type"
                [data]="toPrimeData(block)"
                [options]="block.options"
                size="md"
              />
            }
          </div>
        </p-card>
      }
    </div>

    <p-card styleClass="mt-6">
      <h3 class="text-base font-semibold mb-4">{{ 'analytics.exposure.title' | translate }}</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p class="text-[rgb(var(--text-muted))]">{{ 'analytics.exposure.ruled' | translate }}</p>
          <p class="text-lg font-semibold">{{ exposure.ruled | number: '1.0-0' }} {{ currency }}</p>
        </div>
        <div>
          <p class="text-[rgb(var(--text-muted))]">{{ 'analytics.exposure.paid' | translate }}</p>
          <p class="text-lg font-semibold">{{ exposure.paid | number: '1.0-0' }} {{ currency }}</p>
        </div>
        <div>
          <p class="text-[rgb(var(--text-muted))]">{{ 'analytics.exposure.gap' | translate }}</p>
          <p class="text-lg font-semibold">{{ exposure.gap | number: '1.0-0' }} {{ currency }}</p>
        </div>
        <div>
          <p class="text-[rgb(var(--text-muted))]">
            {{ 'analytics.exposure.settlements' | translate }}
          </p>
          <p class="text-lg font-semibold">
            {{ exposure.settlements | number: '1.0-0' }} {{ currency }}
          </p>
        </div>
      </div>
    </p-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent implements OnInit {
  private readonly agg = inject(AnalyticsAggregationService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly currency = LOCALE_CONFIG.currency;
  charts: ChartBlock[] = [];
  exposure = { ruled: 0, paid: 0, gap: 0, settlements: 0 };

  ngOnInit(): void {
    this.exposure = this.agg.financialExposureSummary();
    this.charts = [
      this.block('companySide', 'doughnut', this.agg.casesByCompanySide(), (d) =>
        this.labelCompanySide(d.labels),
      ),
      this.block('premiumsInOut', 'bar', this.agg.premiumsByInOut(), (d) =>
        this.labelPremiums(d.labels),
      ),
      this.block('matterType', 'bar', this.agg.casesByMatterType(), (d) =>
        this.labelMatterType(d.labels),
      ),
      this.block('stage', 'bar', this.agg.casesByStage(), (d) => this.labelStage(d.labels)),
      this.block('rulingOutcome', 'doughnut', this.agg.rulingsOutcomeSplit(), (d) =>
        this.labelRuling(d.labels),
      ),
      this.block('execution', 'bar', this.agg.executionRuledVsPaid(), (d) =>
        this.labelExecution(d.labels),
      ),
      this.block('settlements', 'bar', this.agg.settlementsTotal()),
      this.block('openedTrend', 'line', this.agg.casesOpenedPerMonth(12)),
      this.block('arbitrations', 'bar', this.agg.arbitrationsSummary(), (d) =>
        this.labelArbitrations(d.labels),
      ),
    ];
    this.cdr.markForCheck();
  }

  private block(
    key: string,
    type: ChartBlock['type'],
    data: ChartDto,
    labelFn?: (d: ChartDto) => string[],
  ): ChartBlock {
    const labels = labelFn ? labelFn(data) : data.labels;
    const dto = { ...data, labels };
    const empty = dto.datasets.every((ds) => ds.data.every((v) => v === 0));
    return {
      key,
      type,
      data: dto,
      options: baseChartOptions(type === 'line' ? 'line' : type),
      empty,
    };
  }

  toPrimeData(block: ChartBlock): { labels: string[]; datasets: ChartBlock['data']['datasets'] } {
    return { labels: block.data.labels, datasets: block.data.datasets };
  }

  private labelCompanySide(labels: string[]): string[] {
    return labels.map((l) => this.translate.instant(`analytics.side.${l}`));
  }

  private labelPremiums(labels: string[]): string[] {
    return labels.map((l) => this.translate.instant(`analytics.premiums.${l}`));
  }

  private labelMatterType(labels: string[]): string[] {
    return labels.map((l) =>
      l === 'unset'
        ? this.translate.instant('analytics.unknown')
        : this.translate.instant(`cases.matterType.${l}`),
    );
  }

  private labelStage(labels: string[]): string[] {
    return labels.map((l) => this.translate.instant(`cases.stage.${l}`));
  }

  private labelRuling(labels: string[]): string[] {
    return labels.map((l) => this.translate.instant(`analytics.ruling.${l}`));
  }

  private labelExecution(labels: string[]): string[] {
    return labels.map((l) => this.translate.instant(`analytics.execution.${l}`));
  }

  private labelArbitrations(labels: string[]): string[] {
    return labels.map((l) => this.translate.instant(`analytics.arbitrations.${l}`));
  }
}
