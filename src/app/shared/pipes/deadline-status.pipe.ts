import { Pipe, PipeTransform } from '@angular/core';

export type DeadlineStatus = 'overdue' | 'upcoming' | 'normal';

@Pipe({
  name: 'deadlineStatus',
  standalone: true,
})
export class DeadlineStatusPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): DeadlineStatus {
    if (!value) return 'normal';

    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return 'normal';

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const deadline = new Date(date);
    deadline.setHours(0, 0, 0, 0);

    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 7) return 'upcoming';
    return 'normal';
  }
}
