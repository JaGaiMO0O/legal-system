import { Injectable, inject } from '@angular/core';
import { effectiveCompanySide } from '../utils/case-side.util';
import { ArbitrationsService } from './arbitrations.service';
import { BusinessSettlementService } from './business-settlement.service';
import { CaseItem, CaseMatterType, CaseStage, CasesService } from './cases.service';
import { ExecutionCasesService } from './execution-cases.service';
import { PremiumClaimsService } from './premium-claims.service';

export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartDto {
  labels: string[];
  datasets: ChartDataset[];
}

const PALETTE = [
  'rgb(59, 130, 246)',
  'rgb(16, 185, 129)',
  'rgb(245, 158, 11)',
  'rgb(239, 68, 68)',
  'rgb(139, 92, 246)',
  'rgb(236, 72, 153)',
  'rgb(20, 184, 166)',
  'rgb(107, 114, 128)',
];

@Injectable({ providedIn: 'root' })
export class AnalyticsAggregationService {
  private readonly cases = inject(CasesService);
  private readonly premiums = inject(PremiumClaimsService);
  private readonly execution = inject(ExecutionCasesService);
  private readonly settlements = inject(BusinessSettlementService);
  private readonly arbitrations = inject(ArbitrationsService);

  casesByCompanySide(): ChartDto {
    const buckets: Record<string, number> = { Plaintiff: 0, Defendant: 0, unknown: 0 };
    this.cases.list().forEach((c) => {
      const side = effectiveCompanySide(c);
      buckets[side] = (buckets[side] ?? 0) + 1;
    });
    return {
      labels: ['Plaintiff', 'Defendant', 'unknown'],
      datasets: [
        {
          data: [buckets['Plaintiff'], buckets['Defendant'], buckets['unknown']],
          backgroundColor: [PALETTE[0], PALETTE[1], PALETTE[7]],
        },
      ],
    };
  }

  premiumsByInOut(): ChartDto {
    const inCount = { count: 0, value: 0 };
    const outCount = { count: 0, value: 0 };
    this.premiums.list().forEach((p) => {
      if (p.companyRole === 'claimant') {
        inCount.count++;
        inCount.value += p.claimValue;
      } else {
        outCount.count++;
        outCount.value += p.claimValue;
      }
    });
    return {
      labels: ['in', 'out'],
      datasets: [
        {
          label: 'count',
          data: [inCount.count, outCount.count],
          backgroundColor: [PALETTE[0], PALETTE[3]],
        },
        {
          label: 'value',
          data: [inCount.value, outCount.value],
          backgroundColor: [PALETTE[2], PALETTE[4]],
        },
      ],
    };
  }

  casesByMatterType(): ChartDto {
    const counts = new Map<CaseMatterType | 'unset', number>();
    this.cases.list().forEach((c) => {
      const key = c.matterType ?? 'unset';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const labels = [...counts.keys()];
    return {
      labels: labels as string[],
      datasets: [
        {
          data: labels.map((l) => counts.get(l as CaseMatterType | 'unset') ?? 0),
          backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        },
      ],
    };
  }

  casesByStage(): ChartDto {
    const stages: CaseStage[] = ['primary', 'appeal', 'cassation', 'execution', 'settled'];
    const counts = stages.map((s) => this.cases.list().filter((c) => c.stage === s).length);
    return {
      labels: stages,
      datasets: [
        { data: counts, backgroundColor: stages.map((_, i) => PALETTE[i % PALETTE.length]) },
      ],
    };
  }

  rulingsOutcomeSplit(): ChartDto {
    let company = 0;
    let adversary = 0;
    this.cases.list().forEach((c) => {
      c.rulings?.forEach((r) => {
        if (r.rulingInFavorOf === 'Company') company++;
        else if (r.rulingInFavorOf === 'Adversary') adversary++;
      });
    });
    return {
      labels: ['Company', 'Adversary'],
      datasets: [{ data: [company, adversary], backgroundColor: [PALETTE[1], PALETTE[3]] }],
    };
  }

  executionRuledVsPaid(): ChartDto {
    let ruled = 0;
    let paid = 0;
    this.execution.list().forEach((e) => {
      ruled += e.amountRuled ?? 0;
      paid += e.amountPaid ?? 0;
    });
    return {
      labels: ['ruled', 'paid'],
      datasets: [{ data: [ruled, paid], backgroundColor: [PALETTE[0], PALETTE[1]] }],
    };
  }

  settlementsTotal(): ChartDto {
    const total = this.settlements
      .list()
      .reduce((sum, s) => sum + (s.amountOfAmicableAgreement ?? 0), 0);
    return {
      labels: ['total'],
      datasets: [{ data: [total], backgroundColor: [PALETTE[2]] }],
    };
  }

  casesOpenedPerMonth(months = 12): ChartDto {
    const now = new Date();
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      labels.push(key);
      data.push(0);
    }
    const indexByKey = new Map(labels.map((l, i) => [l, i]));
    this.cases.list().forEach((c: CaseItem) => {
      const created = new Date(c.createdAt);
      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
      const idx = indexByKey.get(key);
      if (idx !== undefined) data[idx]++;
    });
    return {
      labels,
      datasets: [
        {
          label: 'opened',
          data,
          fill: true,
          borderColor: PALETTE[0],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderWidth: 2,
        },
      ],
    };
  }

  arbitrationsSummary(): ChartDto {
    const items = this.arbitrations.list();
    const fees = items.reduce((s, a) => s + (a.arbitrationFees ?? 0), 0);
    return {
      labels: ['count', 'fees'],
      datasets: [{ data: [items.length, fees], backgroundColor: [PALETTE[5], PALETTE[6]] }],
    };
  }

  financialExposureSummary(): { ruled: number; paid: number; gap: number; settlements: number } {
    const exec = this.execution.list();
    const ruled = exec.reduce((s, e) => s + (e.amountRuled ?? 0), 0);
    const paid = exec.reduce((s, e) => s + (e.amountPaid ?? 0), 0);
    const settlements = this.settlements
      .list()
      .reduce((s, x) => s + (x.amountOfAmicableAgreement ?? 0), 0);
    return { ruled, paid, gap: ruled - paid, settlements };
  }
}
