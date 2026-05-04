import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';
import { ArbitrationsService } from '../../shared/services/arbitrations.service';
import { CaseItem, CasesService } from '../../shared/services/cases.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, TagModule, RelativeDatePipe],
  template: `
    <div class="mb-8">
      <h2 class="text-2xl md:text-3xl font-semibold text-[rgb(var(--text))] mb-2 tracking-tight">
        Dashboard
      </h2>
      <p class="text-sm text-[rgb(var(--text-muted))] leading-relaxed">
        Overview of your legal cases and activities
      </p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <p-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[rgb(var(--text-muted))] mb-1">Total Active Cases</p>
            <p class="text-3xl font-bold text-[rgb(var(--text))]">{{ stats.totalActiveCases }}</p>
          </div>
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center bg-[rgb(var(--tint-accent-bg))]"
          >
            <svg
              class="w-6 h-6 text-[rgb(var(--tint-accent-fg))]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </p-card>

      <p-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[rgb(var(--text-muted))] mb-1">Cases Pending Ruling</p>
            <p class="text-3xl font-bold text-[rgb(var(--text))]">{{ stats.casesPendingRuling }}</p>
          </div>
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center bg-[rgb(var(--tint-warning-bg))]"
          >
            <svg
              class="w-6 h-6 text-[rgb(var(--tint-warning-fg))]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </p-card>

      <p-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[rgb(var(--text-muted))] mb-1">Cases in Execution</p>
            <p class="text-3xl font-bold text-[rgb(var(--text))]">{{ stats.casesInExecution }}</p>
          </div>
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center bg-[rgb(var(--tint-neutral-bg))]"
          >
            <svg
              class="w-6 h-6 text-[rgb(var(--tint-neutral-fg))]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>
      </p-card>

      <p-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[rgb(var(--text-muted))] mb-1">Settled This Month</p>
            <p class="text-3xl font-bold text-[rgb(var(--text))]">{{ stats.settledThisMonth }}</p>
          </div>
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center bg-[rgb(var(--tint-success-bg))]"
          >
            <svg
              class="w-6 h-6 text-[rgb(var(--tint-success-fg))]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </p-card>

      <p-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[rgb(var(--text-muted))] mb-1">Upcoming Deadlines</p>
            <p class="text-3xl font-bold text-[rgb(var(--text))]">{{ stats.upcomingDeadlines }}</p>
          </div>
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center bg-[rgb(var(--tint-danger-bg))]"
          >
            <svg
              class="w-6 h-6 text-[rgb(var(--tint-danger-fg))]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </p-card>

      <p-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[rgb(var(--text-muted))] mb-1">Active Arbitrations</p>
            <p class="text-3xl font-bold text-[rgb(var(--text))]">{{ stats.activeArbitrations }}</p>
          </div>
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center bg-[rgb(var(--surface-info))]"
          >
            <svg
              class="w-6 h-6 text-[rgb(var(--primary))]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </div>
      </p-card>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Recent Cases -->
      <p-card>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-[rgb(var(--text))]">Recent Cases</h3>
          <p-button
            label="View All"
            [outlined]="true"
            [size]="'small'"
            routerLink="/legal/cases"
          ></p-button>
        </div>
        <div class="space-y-4">
          <div
            *ngFor="let case of recentCases; trackBy: trackByCaseId"
            class="p-4 bg-[rgb(var(--surface-muted))] rounded-lg hover:bg-[rgb(var(--surface))] transition-colors cursor-pointer"
            [routerLink]="['/legal/case', case.id]"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-semibold text-[rgb(var(--text))] mb-1">{{ case.title }}</h4>
                <p class="text-sm text-[rgb(var(--text-muted))] mb-2">Client: {{ case.client }}</p>
                <div class="flex items-center gap-2">
                  <p-tag
                    [value]="case.stage | titlecase"
                    [severity]="getStageSeverity(case.stage)"
                  ></p-tag>
                  <span class="text-xs text-[rgb(var(--text-muted))] font-mono">
                    #{{ case.caseNumber }}
                  </span>
                </div>
              </div>
              <span class="text-xs text-[rgb(var(--text-muted))]">
                {{ case.updatedAt | relativeDate }}
              </span>
            </div>
          </div>
          <div
            *ngIf="recentCases.length === 0"
            class="text-center py-8 text-[rgb(var(--text-muted))]"
          >
            No recent cases
          </div>
        </div>
      </p-card>

      <!-- Upcoming Deadlines -->
      <p-card>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-[rgb(var(--text))]">Upcoming Deadlines</h3>
          <p-button
            label="View All"
            [outlined]="true"
            [size]="'small'"
            routerLink="/legal/cases"
            [queryParams]="{ focus: 'deadlines' }"
          ></p-button>
        </div>
        <div class="space-y-4">
          <div
            *ngFor="let deadline of upcomingDeadlines; trackBy: trackByDeadline"
            class="p-4 bg-[rgb(var(--surface-muted))] rounded-lg"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-semibold text-[rgb(var(--text))] mb-1">{{ deadline.title }}</h4>
                <p class="text-sm text-[rgb(var(--text-muted))] mb-2">
                  Case: #{{ deadline.caseNumber }}
                </p>
                <div class="flex items-center gap-2">
                  <span
                    class="text-xs px-2 py-1 rounded font-medium"
                    [class.bg-[rgb(var(--tint-danger-bg))]]="deadline.daysUntil <= 1"
                    [class.text-[rgb(var(--tint-danger-fg))]]="deadline.daysUntil <= 1"
                    [class.bg-[rgb(var(--tint-warning-bg))]]="
                      deadline.daysUntil > 1 && deadline.daysUntil <= 3
                    "
                    [class.text-[rgb(var(--tint-warning-fg))]]="
                      deadline.daysUntil > 1 && deadline.daysUntil <= 3
                    "
                    [class.bg-[rgb(var(--surface-info))]]="deadline.daysUntil > 3"
                    [class.text-[rgb(var(--text-info))]]="deadline.daysUntil > 3"
                  >
                    {{
                      deadline.daysUntil === 0
                        ? 'Today'
                        : deadline.daysUntil === 1
                          ? 'Tomorrow'
                          : 'In ' + deadline.daysUntil + ' days'
                    }}
                  </span>
                  <span class="text-xs text-[rgb(var(--text-muted))]">
                    {{ deadline.date | date: 'shortDate' }}
                  </span>
                </div>
              </div>
              <p-button
                label="View"
                [outlined]="true"
                [size]="'small'"
                [routerLink]="['/legal/case', deadline.caseId]"
              ></p-button>
            </div>
          </div>
          <div
            *ngIf="upcomingDeadlines.length === 0"
            class="text-center py-8 text-[rgb(var(--text-muted))]"
          >
            No upcoming deadlines
          </div>
        </div>
      </p-card>
    </div>

    <!-- Pending Actions -->
    <p-card>
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-[rgb(var(--text))]">Pending Actions</h3>
      </div>
      <div class="space-y-3">
        <div
          *ngFor="let action of pendingActions; trackBy: trackByAction"
          class="p-4 bg-[rgb(var(--surface-muted))] rounded-lg flex items-center justify-between"
        >
          <div class="flex-1">
            <h4 class="font-semibold text-[rgb(var(--text))] mb-1">{{ action.title }}</h4>
            <p class="text-sm text-[rgb(var(--text-muted))]">{{ action.message }}</p>
            <span class="text-xs text-[rgb(var(--text-muted))] font-mono mt-1 block">
              Case #{{ action.caseNumber }}
            </span>
          </div>
          <p-button
            [label]="action.actionText"
            severity="primary"
            [size]="'small'"
            [routerLink]="action.link"
          ></p-button>
        </div>
        <div
          *ngIf="pendingActions.length === 0"
          class="text-center py-8 text-[rgb(var(--text-muted))]"
        >
          No pending actions
        </div>
      </div>
    </p-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly casesService = inject(CasesService);
  private readonly arbitrationsService = inject(ArbitrationsService);
  protected stats = {
    totalActiveCases: 0,
    casesPendingRuling: 0,
    casesInExecution: 0,
    settledThisMonth: 0,
    upcomingDeadlines: 0,
    activeArbitrations: 0,
  };

  protected recentCases: CaseItem[] = [];
  protected upcomingDeadlines: Array<{
    title: string;
    date: string;
    caseNumber: string;
    caseId: string;
    daysUntil: number;
  }> = [];
  protected pendingActions: Array<{
    title: string;
    message: string;
    caseNumber: string;
    link: string;
    actionText: string;
  }> = [];

  ngOnInit(): void {
    this.calculateStats();
    this.loadRecentCases();
    this.loadUpcomingDeadlines();
    this.loadPendingActions();
  }

  private calculateStats(): void {
    const cases = this.casesService.list();
    const arbitrations = this.arbitrationsService.list();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    this.stats.totalActiveCases = cases.filter(
      (c) => c.status !== 'closed' && c.stage !== 'settled',
    ).length;

    this.stats.casesPendingRuling = cases.filter((c) => {
      if (c.stage === 'settled' || c.stage === 'execution') return false;
      const hasRuling = c.rulings?.some((r) => r.stage === c.stage);
      return !hasRuling;
    }).length;

    this.stats.casesInExecution = cases.filter((c) => c.stage === 'execution').length;

    this.stats.settledThisMonth = cases.filter((c) => {
      if (c.stage !== 'settled') return false;
      const settledDate = new Date(c.updatedAt);
      return settledDate >= startOfMonth;
    }).length;

    // Calculate upcoming deadlines (next 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.stats.upcomingDeadlines = cases.reduce((count, c) => {
      return (
        count +
        c.deadlines.filter((d) => {
          const deadlineDate = new Date(d.date);
          return deadlineDate >= now && deadlineDate <= sevenDaysFromNow;
        }).length
      );
    }, 0);

    this.stats.activeArbitrations = arbitrations.length;
  }

  private loadRecentCases(): void {
    const cases = this.casesService.list();
    this.recentCases = cases
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }

  private loadUpcomingDeadlines(): void {
    const cases = this.casesService.list();
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const deadlines: typeof this.upcomingDeadlines = [];
    cases.forEach((c) => {
      c.deadlines.forEach((d) => {
        const deadlineDate = new Date(d.date);
        if (deadlineDate >= now && deadlineDate <= sevenDaysFromNow) {
          const daysUntil = Math.floor(
            (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );
          deadlines.push({
            title: d.title,
            date: d.date,
            caseNumber: c.caseNumber,
            caseId: c.id,
            daysUntil,
          });
        }
      });
    });

    this.upcomingDeadlines = deadlines.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 5);
  }

  private loadPendingActions(): void {
    const cases = this.casesService.list();
    const actions: typeof this.pendingActions = [];

    cases.forEach((c) => {
      // Cases needing rulings
      if (c.stage !== 'settled' && c.stage !== 'execution' && c.stage !== 'primary') {
        const hasRuling = c.rulings?.some((r) => r.stage === c.stage);
        if (!hasRuling) {
          actions.push({
            title: 'Ruling Required',
            message: `Case ${c.caseNumber} at ${c.stage} stage needs a court ruling`,
            caseNumber: c.caseNumber,
            link: `/legal/case/${c.id}`,
            actionText: 'Add Ruling',
          });
        }
      }
    });

    this.pendingActions = actions.slice(0, 5);
  }

  trackByCaseId(_index: number, c: CaseItem): string {
    return c.id;
  }

  trackByDeadline(_index: number, d: { caseId: string; date: string; title: string }): string {
    return `${d.caseId}-${d.date}-${d.title}`;
  }

  trackByAction(_index: number, a: { title: string; caseNumber: string }): string {
    return `${a.caseNumber}-${a.title}`;
  }

  getStageSeverity(
    stage: string,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (stage) {
      case 'primary':
        return 'info';
      case 'appeal':
        return undefined;
      case 'cassation':
        return undefined;
      case 'execution':
        return 'warn';
      case 'settled':
        return 'success';
      default:
        return undefined;
    }
  }
}
