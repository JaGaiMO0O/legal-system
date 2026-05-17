import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../core/auth/auth.service';
import { AppLanguage, LanguageService } from '../core/i18n/language.service';
import { ThemeToggleComponent } from '../shared/components/theme-toggle.component';

export interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    TranslateModule,
    ButtonModule,
    ThemeToggleComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly language = inject(LanguageService);

  readonly sidebarOpen = signal(true);
  readonly isAdmin = computed(() => this.auth.role() === 'admin');
  readonly navSections = computed<{ titleKey: string; items: NavItem[] }[]>(() => {
    const sections: { titleKey: string; items: NavItem[] }[] = [
      {
        titleKey: 'nav.sectionMatters',
        items: [
          { path: '/legal/dashboard', labelKey: 'nav.dashboard', icon: 'pi pi-home', exact: true },
          { path: '/legal/cases', labelKey: 'nav.cases', icon: 'pi pi-file', exact: false },
          { path: '/legal/analytics', labelKey: 'nav.analytics', icon: 'pi pi-chart-bar' },
          { path: '/legal/documents', labelKey: 'nav.documents', icon: 'pi pi-folder-open' },
          { path: '/arbitrations', labelKey: 'nav.arbitrations', icon: 'pi pi-users' },
          { path: '/execution', labelKey: 'nav.execution', icon: 'pi pi-list' },
          { path: '/settlements', labelKey: 'nav.settlements', icon: 'pi pi-wallet' },
        ],
      },
    ];

    if (this.isAdmin()) {
      sections.push({
        titleKey: 'nav.sectionDirectory',
        items: [
          { path: '/lawyers', labelKey: 'nav.lawyers', icon: 'pi pi-id-card' },
          { path: '/courts', labelKey: 'nav.courts', icon: 'pi pi-building' },
        ],
      });
    }

    return sections;
  });

  protected sessionLabel(): string {
    const u = this.auth.username();
    const r = this.auth.role();
    if (!u || !r) return '';
    return `${u} (${r})`;
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  setLang(lang: AppLanguage): void {
    this.language.setLanguage(lang);
  }
}
