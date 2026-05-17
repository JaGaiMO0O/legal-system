import { Injectable, inject } from '@angular/core';
import { MockStorageService } from '../../shared/services/mock-storage.service';
import { CourtsService } from '../../shared/services/courts.service';
import { CasesService } from '../../shared/services/cases.service';
import { PremiumClaimsService } from '../../shared/services/premium-claims.service';
import { ExecutionCasesService } from '../../shared/services/execution-cases.service';
import { BusinessSettlementService } from '../../shared/services/business-settlement.service';
import { ArbitrationsService } from '../../shared/services/arbitrations.service';
import { LawyersService } from '../../shared/services/lawyers.service';
import { AuditService } from '../../shared/services/audit.service';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private readonly storage = inject(MockStorageService);
  private readonly courts = inject(CourtsService);
  private readonly cases = inject(CasesService);
  private readonly premiumClaims = inject(PremiumClaimsService);
  private readonly execution = inject(ExecutionCasesService);
  private readonly settlements = inject(BusinessSettlementService);
  private readonly arbitrations = inject(ArbitrationsService);
  private readonly lawyers = inject(LawyersService);
  private readonly audit = inject(AuditService);

  run(): void {
    const markKey = 'seeded-v5';
    const already = localStorage.getItem(markKey);
    if (already) return;

    this.storage.clearAll();
    localStorage.removeItem('seeded-v1');
    localStorage.removeItem('seeded-v2');
    localStorage.removeItem('seeded-v3');
    localStorage.removeItem('seeded-v4');

    if (this.courts.list().length === 0) {
      this.courts.create('محكمة مدنية عامة');
      this.courts.create('محكمة تجارية');
      this.courts.create('محكمة العمل');
    }

    this.lawyers.list();
    this.cases.list();
    this.premiumClaims.list();
    this.execution.list();
    this.settlements.list();
    this.arbitrations.list();

    this.audit.record('seed.completed', { version: 'v5' });
    localStorage.setItem(markKey, '1');
  }
}
