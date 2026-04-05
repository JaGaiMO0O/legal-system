import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="p-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      (click)="toggle()"
      [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <i *ngIf="!isDark()" class="pi pi-moon text-lg" aria-hidden="true"></i>
      <i *ngIf="isDark()" class="pi pi-sun text-lg" aria-hidden="true"></i>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  private readonly storageKey = 'theme';
  readonly isDark = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem(this.storageKey);
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDark.set(saved ? saved === 'dark' : prefersDark);
    this.apply();
    effect(() => this.apply());
  }

  toggle(): void {
    this.isDark.update((v) => !v);
    localStorage.setItem(this.storageKey, this.isDark() ? 'dark' : 'light');
  }

  private apply(): void {
    document.documentElement.classList.toggle('dark', this.isDark());
  }
}
