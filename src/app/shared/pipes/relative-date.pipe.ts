import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeDate',
  standalone: true,
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (Math.abs(diffDays) < 1) {
      if (Math.abs(diffHours) < 1) {
        if (Math.abs(diffMinutes) < 1) {
          return 'Just now';
        }
        return diffMinutes > 0
          ? `In ${diffMinutes} minutes`
          : `${Math.abs(diffMinutes)} minutes ago`;
      }
      return diffHours > 0 ? `In ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
    }

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

    // For dates more than a week away, show actual date
    return date.toLocaleDateString();
  }
}
