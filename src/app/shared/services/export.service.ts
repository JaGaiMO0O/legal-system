import { Injectable } from '@angular/core';
import { CaseItem } from './cases.service';

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportCasesToCSV(cases: CaseItem[]): void {
    if (cases.length === 0) {
      return;
    }

    const headers = [
      'ID',
      'Title',
      'Client',
      'Status',
      'Stage',
      'Case Number',
      'Base Case Number',
      'Tasks Count',
      'Deadlines Count',
      'Rulings Count',
      'Created At',
      'Updated At',
    ];

    const rows = cases.map((c) => [
      c.id,
      c.title,
      c.client,
      c.status,
      c.stage || '',
      c.caseNumber || '',
      c.baseCaseNumber || '',
      c.tasks.length.toString(),
      c.deadlines.length.toString(),
      (c.rulings?.length || 0).toString(),
      new Date(c.createdAt).toLocaleDateString(),
      new Date(c.updatedAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    this.downloadFile(csvContent, 'cases-export.csv', 'text/csv');
  }

  exportCaseDetailsToCSV(caseItem: CaseItem): void {
    const lines: string[] = [];

    // Case Info
    lines.push('Case Information');
    lines.push(`ID,${caseItem.id}`);
    lines.push(`Title,${caseItem.title}`);
    lines.push(`Client,${caseItem.client}`);
    lines.push(`Status,${caseItem.status}`);
    lines.push(`Stage,${caseItem.stage || ''}`);
    lines.push(`Case Number,${caseItem.caseNumber || ''}`);
    lines.push(`Base Case Number,${caseItem.baseCaseNumber || ''}`);
    lines.push(`Created At,${new Date(caseItem.createdAt).toLocaleString()}`);
    lines.push(`Updated At,${new Date(caseItem.updatedAt).toLocaleString()}`);
    lines.push('');

    // Tasks
    if (caseItem.tasks.length > 0) {
      lines.push('Tasks');
      lines.push('ID,Title,Done');
      caseItem.tasks.forEach((t) => {
        lines.push(`${t.id},"${t.title}",${t.done ? 'Yes' : 'No'}`);
      });
      lines.push('');
    }

    // Deadlines
    if (caseItem.deadlines.length > 0) {
      lines.push('Deadlines');
      lines.push('ID,Title,Date');
      caseItem.deadlines.forEach((d) => {
        lines.push(`${d.id},"${d.title}",${d.date}`);
      });
      lines.push('');
    }

    // Developments
    if (caseItem.developments && caseItem.developments.length > 0) {
      lines.push('Developments');
      lines.push('ID,Date,Note');
      caseItem.developments.forEach((d) => {
        lines.push(`${d.id},${new Date(d.date).toLocaleString()},"${d.note.replace(/"/g, '""')}"`);
      });
      lines.push('');
    }

    // Rulings
    if (caseItem.rulings && caseItem.rulings.length > 0) {
      lines.push('Court Rulings');
      lines.push(
        'ID,Stage,Case No,Case Type,Court Type,Ruling Date,Ruling In Favor Of,Adversary Name,Indemnity Amount',
      );
      caseItem.rulings.forEach((r) => {
        lines.push(
          `${r.id},${r.stage},${r.caseNo},${r.caseType},${r.courtType},${r.rulingDate},${r.rulingInFavorOf},"${(r.adversaryName || '').replace(/"/g, '""')}",${r.indemnityByCourtAmount}`,
        );
      });
    }

    const csvContent = lines.join('\n');
    this.downloadFile(csvContent, `case-${caseItem.id}-export.csv`, 'text/csv');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
