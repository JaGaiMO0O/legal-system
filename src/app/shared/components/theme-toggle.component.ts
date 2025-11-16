import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="btn btn-ghost" (click)="toggle()">
      <span *ngIf="!isDark()">🌙</span>
      <span *ngIf="isDark()">☀️</span>
    </button>
  `,
})
export class ThemeToggleComponent {
  private storageKey = 'theme';
  isDark = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem(this.storageKey);
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDark.set(saved ? saved === 'dark' : prefersDark);
    this.apply();
    effect(() => this.apply());
  }

  toggle() {
    this.isDark.update((v) => !v);
    localStorage.setItem(this.storageKey, this.isDark() ? 'dark' : 'light');
  }

  private apply() {
    document.documentElement.classList.toggle('dark', this.isDark());
  }
}
