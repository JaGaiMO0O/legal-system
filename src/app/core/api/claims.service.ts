import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClaimSummary {
  id: string;
  policyNo: string;
  insured: string;
  lossDate: string;
}
export interface ClaimDetail extends ClaimSummary {
  status: string;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class ClaimsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/claims';

  list(params?: Record<string, string>): Observable<ClaimSummary[]> {
    return this.http.get<ClaimSummary[]>(this.baseUrl, { params });
  }

  get(id: string): Observable<ClaimDetail> {
    return this.http.get<ClaimDetail>(`${this.baseUrl}/${id}`);
  }
}
